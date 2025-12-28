import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TinkClient, TINK_LINK_BASE } from '../_shared/tink.ts'
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
    const { redirectUrl, market = 'ES', locale = 'es_ES' } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const clientId = Deno.env.get('TINK_CLIENT_ID')!
    const clientSecret = Deno.env.get('TINK_CLIENT_SECRET')!
    // Use test mode by default (sandbox). Set to 'false' for production.
    const isTestMode = Deno.env.get('TINK_TEST_MODE') !== 'false'

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) throw new Error('Unauthorized')

    const client = new TinkClient({ clientId, clientSecret })
    const tokenManager = new TokenManager(supabaseUrl, supabaseKey)
    const accessToken = await tokenManager.getValidAccessToken(client)
    client.setAccessToken(accessToken)

    // Check if Tink user already exists for this Supabase user
    const supabase = createClient(supabaseUrl, supabaseKey)
    let { data: existingConnection } = await supabase
      .from('bank_requisitions')
      .select('*')
      .eq('user_id', user.id)
      .eq('institution_id', 'tink') // We'll use 'tink' as a special marker
      .single()

    let tinkUserId: string

    if (existingConnection && existingConnection.requisition_id) {
      // Use existing Tink user
      tinkUserId = existingConnection.requisition_id
      console.log('Using existing Tink user:', tinkUserId)
    } else {
      // Create new Tink user or handle if already exists
      const externalUserId = user.id
      try {
        const tinkUserResponse = await client.createUser(externalUserId, market, locale)
        tinkUserId = tinkUserResponse.user_id
        console.log('Created new Tink user:', tinkUserId)

        // Store Tink user ID
        await supabase.from('bank_requisitions').insert({
          user_id: user.id,
          requisition_id: tinkUserId, // Store Tink user ID here
          institution_id: 'tink',
          institution_name: 'Tink User',
          status: 'CR',
          reference: `tink_user_${user.id}`,
          redirect_url: redirectUrl || `${req.headers.get('origin')}/banking/callback`,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        })
      } catch (createError: any) {
        // If user already exists in Tink, parse the error to get the user_id
        const errorMessage = createError.message || ''
        console.log('Error creating Tink user:', errorMessage)

        if (errorMessage.includes('user_with_external_user_id_already_exists')) {
          console.log('Tink user already exists, attempting to get user access token with external user ID')
          // When a user with external_user_id already exists, we can try to use the external_user_id
          // to get a user access token, which will work if the user exists
          // Tink's user_id format for external users is typically the external_user_id itself
          // or we need to query for it. For now, we'll try using the external_user_id directly
          // and let the getUserAccessToken call below validate it.

          // Try to get user token to verify the user exists and get the actual user_id
          try {
            const testToken = await client.getUserAccessToken(externalUserId)
            tinkUserId = externalUserId // Use external user ID as tink user ID
            console.log('Verified existing Tink user, using external_user_id as tinkUserId:', tinkUserId)

            // Check if we already have this record in the database
            const { data: existingTinkUser } = await supabase
              .from('bank_requisitions')
              .select('id')
              .eq('user_id', user.id)
              .eq('institution_id', 'tink')
              .single()

            if (existingTinkUser) {
              // Update existing record
              console.log('Updating existing Tink user record')
              await supabase
                .from('bank_requisitions')
                .update({
                  requisition_id: tinkUserId,
                  status: 'CR',
                  redirect_url: redirectUrl || `${req.headers.get('origin')}/banking/callback`,
                  expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingTinkUser.id)
            } else {
              // Insert new record
              console.log('Inserting new Tink user record')
              await supabase.from('bank_requisitions').insert({
                user_id: user.id,
                requisition_id: tinkUserId,
                institution_id: 'tink',
                institution_name: 'Tink User',
                status: 'CR',
                reference: `tink_user_${user.id}`,
                redirect_url: redirectUrl || `${req.headers.get('origin')}/banking/callback`,
                expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              })
            }
          } catch (tokenError: any) {
            console.error('Failed to get user token for existing user:', tokenError)
            throw createError // Re-throw the original error if we can't verify the user
          }
        } else {
          throw createError // Re-throw if it's a different error
        }
      }
    }

    // Get user access token for Tink Link
    const userToken = await client.getUserAccessToken(tinkUserId)

    // Build Tink Link URL for transactions flow
    // Note: /transactions/connect-accounts automatically includes transaction and account scopes
    const tinkLinkUrl = new URL(`${TINK_LINK_BASE}/transactions/connect-accounts`)
    tinkLinkUrl.searchParams.set('client_id', clientId)
    tinkLinkUrl.searchParams.set('redirect_uri', redirectUrl || `${req.headers.get('origin')}/banking/callback`)
    tinkLinkUrl.searchParams.set('market', market)
    tinkLinkUrl.searchParams.set('locale', locale)
    tinkLinkUrl.searchParams.set('test', isTestMode ? 'true' : 'false')
    tinkLinkUrl.searchParams.set('authorization_code', userToken.access_token)

    console.log(`Tink Link mode: ${isTestMode ? 'SANDBOX (test=true)' : 'PRODUCTION (test=false)'}`)

    return new Response(JSON.stringify({
      tinkUserId,
      authorizationLink: tinkLinkUrl.toString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error creating Tink connection:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
