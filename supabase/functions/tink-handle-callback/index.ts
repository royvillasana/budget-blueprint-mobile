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
    const { tinkUserId } = await req.json()

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
    const clientAccessToken = await tokenManager.getValidAccessToken(client)
    client.setAccessToken(clientAccessToken)

    // Get user access token for this specific Tink user
    const userToken = await client.getUserAccessToken(tinkUserId)
    console.log('User token obtained:', {
      scope: userToken.scope,
      expires_in: userToken.expires_in,
      tinkUserId,
    })
    client.setAccessToken(userToken.access_token)

    // Get user's credentials (connected banks)
    // Note: Tink sandbox has limited access to credentials endpoint, so we handle errors gracefully
    let credentials: any[] = []
    try {
      credentials = await client.getUserCredentials(tinkUserId)
      console.log('Credentials fetched:', credentials.length)
    } catch (error: any) {
      console.log('Could not fetch credentials (sandbox limitation):', error.message)
      // Continue without credentials - we'll use accounts directly
    }

    // Get user's accounts
    console.log('Fetching accounts for user:', tinkUserId)
    const accounts = await client.getUserAccounts(tinkUserId)
    console.log('Accounts fetched successfully:', accounts.length)

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Store each credential as a connection (if available)
    if (credentials.length > 0) {
      for (const credential of credentials) {
        // Check if credential already exists
        const { data: existingCred } = await supabase
          .from('bank_requisitions')
          .select('id')
          .eq('requisition_id', credential.id)
          .single()

        if (!existingCred) {
          await supabase.from('bank_requisitions').insert({
            user_id: user.id,
            requisition_id: credential.id,
            institution_id: credential.providerName,
            institution_name: credential.providerName,
            status: credential.status,
            reference: `tink_cred_${credential.id}`,
            accounts: JSON.stringify(accounts.filter(a => a.credentialsId === credential.id).map(a => a.id)),
            expires_at: credential.sessionExpiryDate
              ? new Date(credential.sessionExpiryDate).toISOString()
              : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          })
        }
      }
    }

    // Store accounts
    for (const account of accounts) {
      // Find or create requisition for this credential
      let requisition: any = null

      if (account.credentialsId) {
        const { data: existingReq } = await supabase
          .from('bank_requisitions')
          .select('id')
          .eq('requisition_id', account.credentialsId)
          .single()

        requisition = existingReq

        // If no requisition exists for this credential, create a fallback one
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
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      credentialsCount: credentials.length,
      accountsCount: accounts.length,
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
    console.error('Error handling Tink callback:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
