import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TinkClient } from '../_shared/tink.ts'
import { TokenManager } from '../_shared/token-manager.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { tinkUserId, accountIds } = await req.json()

    console.log('Sync request received:', { tinkUserId, hasAccountIds: !!accountIds })

    if (!tinkUserId) {
      throw new Error('tinkUserId is required')
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
    const tokenManager = new TokenManager(supabaseUrl, supabaseKey)

    try {
      const clientAccessToken = await tokenManager.getValidAccessToken(client)
      client.setAccessToken(clientAccessToken)

      // Get user access token for this specific Tink user
      console.log('Getting user access token for:', tinkUserId)
      const userToken = await client.getUserAccessToken(tinkUserId)
      console.log('User token obtained, setting access token')
      client.setAccessToken(userToken.access_token)
    } catch (tokenError: any) {
      console.error('Error getting Tink tokens:', tokenError)
      throw new Error(`Failed to authenticate with Tink: ${tokenError.message}`)
    }

    // Fetch accounts first to ensure they're synced
    const accounts = await client.getUserAccounts(tinkUserId)
    console.log(`Found ${accounts.length} accounts for user ${tinkUserId}`)

    // Store/update accounts in database
    const supabase = createClient(supabaseUrl, supabaseKey)
    for (const account of accounts) {
      // Find or create requisition for this account
      let requisition: any = null

      if (account.credentialsId) {
        const { data: existingReq } = await supabase
          .from('bank_requisitions')
          .select('id')
          .eq('requisition_id', account.credentialsId)
          .single()

        requisition = existingReq

        if (!requisition) {
          const { data: newReq } = await supabase
            .from('bank_requisitions')
            .insert({
              user_id: user.id,
              requisition_id: account.credentialsId,
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
        }
      }

      if (requisition) {
        // Check if account already exists
        const { data: existingAccount } = await supabase
          .from('bank_accounts')
          .select('id')
          .eq('account_id', account.id)
          .single()

        if (!existingAccount) {
          await supabase.from('bank_accounts').insert({
            user_id: user.id,
            requisition_id: requisition.id,
            account_id: account.id,
            iban: account.accountNumber,
            account_name: account.name,
            current_balance: account.balance,
            currency: account.currencyCode,
            is_active: !account.closed,
          })
        } else {
          // Update balance
          await supabase
            .from('bank_accounts')
            .update({
              current_balance: account.balance,
              is_active: !account.closed,
            })
            .eq('id', existingAccount.id)
        }
      }
    }

    // Fetch transactions from Tink
    console.log('Fetching transactions...', { tinkUserId, accountIds })
    let transactions: any[] = []
    try {
      transactions = await client.getUserTransactions(tinkUserId, accountIds)
      console.log(`Fetched ${transactions.length} transactions from Tink`)
    } catch (transError: any) {
      console.error('Error fetching transactions from Tink:', transError)
      throw new Error(`Failed to fetch transactions: ${transError.message}`)
    }

    let syncedCount = 0
    let skippedCount = 0

    // Store each transaction
    for (const transaction of transactions) {
      // Get bank account from our database
      const { data: bankAccount } = await supabase
        .from('bank_accounts')
        .select('id')
        .eq('account_id', transaction.accountId)
        .single()

      if (!bankAccount) {
        skippedCount++
        continue
      }

      // Convert Tink timestamp (milliseconds) to date
      const bookingDate = new Date(transaction.date)

      // Determine merchant name and description
      const merchantName = transaction.description?.split(' - ')[0] || transaction.description
      const description = transaction.description

      // Check if transaction already exists
      const { data: existingTransaction } = await supabase
        .from('bank_transactions')
        .select('id')
        .eq('bank_account_id', bankAccount.id)
        .eq('transaction_id', transaction.id)
        .single()

      if (!existingTransaction) {
        const { error } = await supabase.from('bank_transactions').insert({
          user_id: user.id,
          bank_account_id: bankAccount.id,
          transaction_id: transaction.id,
          amount: transaction.amount,
          currency: transaction.currencyCode,
          booking_date: bookingDate.toISOString().split('T')[0],
          value_date: new Date(transaction.timestamp).toISOString().split('T')[0],
          merchant_name: merchantName,
          description: description,
          is_imported: false,
        })

        if (!error) {
          syncedCount++
        } else {
          console.error('Error inserting transaction:', error)
          skippedCount++
        }
      } else {
        skippedCount++
      }
    }

    // Log sync
    await supabase.from('bank_sync_logs').insert({
      user_id: user.id,
      sync_type: 'manual',
      status: 'success',
      transactions_fetched: syncedCount,
      error_message: null,
    })

    return new Response(JSON.stringify({
      success: true,
      accountsCount: accounts.length,
      transactionsFetched: transactions.length,
      transactionsSynced: syncedCount,
      transactionsSkipped: skippedCount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error syncing transactions:', error)
    console.error('Error stack:', error.stack)

    // Log failed sync
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      const authHeader = req.headers.get('Authorization')!
      const token = authHeader.replace('Bearer ', '')
      const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } },
      })
      const { data: { user } } = await supabaseClient.auth.getUser(token)

      if (user) {
        await supabase.from('bank_sync_logs').insert({
          user_id: user.id,
          sync_type: 'manual',
          status: 'failed',
          transactions_fetched: 0,
          error_message: error.message,
        })
      }
    } catch (logError) {
      console.error('Error logging sync failure:', logError)
    }

    // Return detailed error information
    const errorDetails = {
      error: error.message || 'Unknown error',
      details: error.toString(),
      type: error.constructor?.name || 'Error'
    }

    console.error('Returning error response:', errorDetails)

    return new Response(JSON.stringify(errorDetails), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
