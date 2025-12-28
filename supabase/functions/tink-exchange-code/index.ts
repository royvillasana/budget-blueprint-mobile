import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TinkClient } from '../_shared/tink.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { code, credentialsId } = await req.json()

    if (!code) {
      throw new Error('code is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const clientId = Deno.env.get('TINK_CLIENT_ID')!
    const clientSecret = Deno.env.get('TINK_CLIENT_SECRET')!

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) throw new Error('Unauthorized')

    const client = new TinkClient({ clientId, clientSecret })

    // Exchange the authorization code for an access token
    console.log('Exchanging code for access token...')
    const userToken = await client.exchangeCodeForToken(code)
    console.log('Token obtained:', {
      scope: userToken.scope,
      expires_in: userToken.expires_in,
      token_type: userToken.token_type
    })

    // Verify we have the necessary scopes
    if (!userToken.scope || !userToken.scope.includes('transactions:read')) {
      console.error('WARNING: Token does not include transactions:read scope. Scopes:', userToken.scope)
    }

    client.setAccessToken(userToken.access_token)

    // Get user's accounts with the new token
    console.log('Fetching accounts...')
    const accounts = await client.getUserAccounts('')
    console.log(`Found ${accounts.length} accounts`)

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Clean up old requisitions that don't have any active bank accounts
    // This happens when a user disconnects and reconnects their bank
    const { data: allReqs } = await supabase
      .from('bank_requisitions')
      .select('id, institution_id')
      .eq('user_id', user.id)
      .eq('institution_id', 'tink-bank')

    if (allReqs && allReqs.length > 0) {
      for (const req of allReqs) {
        const { data: accountsCount } = await supabase
          .from('bank_accounts')
          .select('id', { count: 'exact', head: true })
          .eq('requisition_id', req.id)

        // If no accounts reference this requisition, delete it
        if (accountsCount === null || (accountsCount as any) === 0) {
          console.log(`Cleaning up orphaned requisition: ${req.id}`)
          await supabase
            .from('bank_requisitions')
            .delete()
            .eq('id', req.id)
        }
      }
    }

    // First, check which accounts already exist to prevent duplicate connections
    const existingAccountIds = new Set<string>()
    if (accounts.length > 0) {
      const accountIds = accounts.map(a => a.id)
      const { data: existingAccounts } = await supabase
        .from('bank_accounts')
        .select('account_id, account_name')
        .eq('user_id', user.id)
        .in('account_id', accountIds)

      if (existingAccounts && existingAccounts.length > 0) {
        existingAccounts.forEach(acc => existingAccountIds.add(acc.account_id))
        console.log(`Found ${existingAccounts.length} existing accounts:`, existingAccounts.map(a => a.account_name))
      }
    }

    // Store accounts in database
    const accountDbIds: string[] = []
    const newAccounts: string[] = []
    const updatedAccounts: string[] = []

    for (const account of accounts) {
      // Find or create requisition for this account
      let requisition: any = null

      if (account.credentialsId || credentialsId) {
        const reqId = account.credentialsId || credentialsId
        // Check for existing requisition by both requisition_id AND user_id to prevent cross-user issues
        const { data: existingReq } = await supabase
          .from('bank_requisitions')
          .select('id')
          .eq('requisition_id', reqId)
          .eq('user_id', user.id)
          .single()

        requisition = existingReq

        if (!requisition) {
          const { data: newReq } = await supabase
            .from('bank_requisitions')
            .insert({
              user_id: user.id,
              requisition_id: reqId,
              institution_id: 'tink-bank',
              institution_name: 'Connected Bank',
              status: 'APPROVED',
              reference: `tink_account_${account.id}`,
              accounts: JSON.stringify([account.id]),
              expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .select('id')
            .single()

          requisition = newReq
          console.log('Created new bank_requisition:', newReq?.id)
        } else {
          console.log('Found existing bank_requisition:', existingReq.id)
        }
      }

      if (requisition) {
        // Check if account already exists for this user
        const { data: existingAccount } = await supabase
          .from('bank_accounts')
          .select('id, account_id')
          .eq('account_id', account.id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (!existingAccount) {
          const { data: newAccount } = await supabase.from('bank_accounts').insert({
            user_id: user.id,
            requisition_id: requisition.id,
            account_id: account.id,
            iban: account.accountNumber,
            account_name: account.name,
            current_balance: account.balance,
            currency: account.currencyCode,
            is_active: !account.closed,
          }).select('id').single()

          if (newAccount) {
            accountDbIds.push(newAccount.id)
            newAccounts.push(account.name)
            console.log('Created new bank_account:', newAccount.id, account.name)
          }
        } else {
          // Update balance and status
          await supabase
            .from('bank_accounts')
            .update({
              current_balance: account.balance,
              is_active: !account.closed,
              account_name: account.name,
              requisition_id: requisition.id, // Update requisition reference
            })
            .eq('id', existingAccount.id)

          accountDbIds.push(existingAccount.id)
          updatedAccounts.push(account.name)
          console.log('Updated existing bank_account:', existingAccount.id, account.name)
        }
      }
    }

    // Collect account IDs to filter transactions
    const accountIdsToFetch = accounts.map(a => a.id)

    // Now get ALL transactions for these accounts and auto-import them
    // NOTE: When using authorization code token, we don't need to pass userId
    // The token already contains the user context
    console.log('Fetching transactions for accounts...', {
      accountIdsToFetch,
      tokenScope: userToken.scope
    })

    let transactions: any[] = []
    try {
      // Pass empty string for userId when using authorization code token
      transactions = await client.getUserTransactions('', accountIdsToFetch)
      console.log(`Found ${transactions.length} transactions`)
    } catch (transError: any) {
      console.error('Error fetching transactions:', {
        error: transError.message,
        accountIds: accountIdsToFetch,
        tokenScope: userToken.scope
      })

      // Return success with accounts but no transactions
      return new Response(JSON.stringify({
        success: true,
        accountsCount: accounts.length,
        accountsNew: newAccounts.length,
        accountsUpdated: updatedAccounts.length,
        transactionsImported: 0,
        transactionsSkipped: 0,
        error: `Could not fetch transactions: ${transError.message}`,
        newAccountNames: newAccounts,
        updatedAccountNames: updatedAccounts,
        accounts: accounts.map(a => ({
          id: a.id,
          name: a.name,
          balance: a.balance,
          currency: a.currencyCode,
        })),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let importedCount = 0
    let skippedCount = 0

    for (const transaction of transactions) {
      try {
        // Find the bank account in our database
        const { data: bankAccount } = await supabase
          .from('bank_accounts')
          .select('id')
          .eq('account_id', transaction.accountId)
          .single()

        if (!bankAccount) {
          skippedCount++
          continue
        }

        // Extract year and month from transaction date
        const transactionDate = new Date(transaction.date)
        const year = transactionDate.getFullYear()
        const month = transactionDate.getMonth() + 1

        // Determine if income or expense
        const isIncome = transaction.amount > 0
        const amount = Math.abs(transaction.amount)

        // Get month suffix for table name
        const monthSuffixes = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        const monthSuffix = monthSuffixes[month - 1]
        const tableName = isIncome ? `monthly_income_${monthSuffix}` : `monthly_transactions_${monthSuffix}`

        // Get merchant name and full description
        const merchantName = transaction.description?.split(' - ')[0] || transaction.description || 'Transacción bancaria'
        const fullDescription = transaction.description || ''

        // Auto-categorize using the SQL function
        const { data: category, error: categoryError } = await supabase
          .rpc('auto_categorize_transaction', {
            merchant_name: merchantName,
            description: fullDescription,
            amount: amount
          })

        if (categoryError) {
          console.error('Error categorizing transaction:', categoryError, { merchantName, fullDescription, amount })
          skippedCount++
          continue
        }

        if (!category) {
          console.log('Could not categorize transaction (no category returned):', merchantName)
          skippedCount++
          continue
        }

        console.log('Transaction categorized:', { merchantName, category, isIncome, tableName })

        // Check if transaction already exists (by date, amount, and description/source)
        const descriptionField = isIncome ? 'source' : 'description'
        const { data: existingTransactions } = await supabase
          .from(tableName)
          .select('id')
          .eq('user_id', user.id)
          .eq('date', transactionDate.toISOString().split('T')[0])
          .eq('amount', amount)
          .eq(descriptionField, `[BANCO] ${merchantName}`)

        if (existingTransactions && existingTransactions.length > 0) {
          console.log('Duplicate transaction skipped:', { merchantName, date: transactionDate.toISOString().split('T')[0], amount })
          skippedCount++
          continue
        }

        // Insert into the appropriate monthly table
        let insertData: any
        if (isIncome) {
          // For monthly_income_* tables
          insertData = {
            user_id: user.id,
            month_id: month,
            date: transactionDate.toISOString().split('T')[0],
            source: `[BANCO] ${merchantName}`,
            amount,
            currency_code: transaction.currencyCode || 'EUR',
          }
        } else {
          // For monthly_transactions_* tables (expenses)
          insertData = {
            user_id: user.id,
            month_id: month,
            date: transactionDate.toISOString().split('T')[0],
            description: `[BANCO] ${merchantName}`,
            category_id: category,
            amount,
            direction: 'EXPENSE',
            currency_code: transaction.currencyCode || 'EUR',
          }
        }

        const { error: insertError } = await supabase
          .from(tableName)
          .insert(insertData)

        if (insertError) {
          console.error('Error inserting transaction:', insertError, { merchantName, amount, isIncome, tableName })
          skippedCount++
        } else {
          console.log('Transaction imported successfully:', { merchantName, amount, isIncome, year, month, tableName })
          importedCount++
        }
      } catch (error) {
        console.error('Error processing transaction:', error)
        skippedCount++
      }
    }

    console.log(`Import complete: ${importedCount} imported, ${skippedCount} skipped`)
    console.log(`Accounts: ${newAccounts.length} new, ${updatedAccounts.length} updated`)

    return new Response(JSON.stringify({
      success: true,
      accountsCount: accounts.length,
      accountsNew: newAccounts.length,
      accountsUpdated: updatedAccounts.length,
      transactionsImported: importedCount,
      transactionsSkipped: skippedCount,
      newAccountNames: newAccounts,
      updatedAccountNames: updatedAccounts,
      accounts: accounts.map(a => ({
        id: a.id,
        name: a.name,
        balance: a.balance,
        currency: a.currencyCode,
      })),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error exchanging code:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
