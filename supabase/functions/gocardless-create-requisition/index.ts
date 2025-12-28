import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoCardlessClient } from '../_shared/gocardless.ts'
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
    const { institutionId, institutionName, redirectUrl } = await req.json()

    if (!institutionId || !institutionName) {
      throw new Error('institutionId and institutionName are required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const secretId = Deno.env.get('GOCARDLESS_SECRET_ID')!
    const secretKey = Deno.env.get('GOCARDLESS_SECRET_KEY')!

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) throw new Error('Unauthorized')

    const client = new GoCardlessClient({ secretId, secretKey })
    const tokenManager = new TokenManager(supabaseUrl, supabaseKey)
    const accessToken = await tokenManager.getValidAccessToken(client)
    client.setAccessToken(accessToken)

    const reference = `user_${user.id}_${Date.now()}`
    const requisition = await client.createRequisition({
      institutionId,
      redirect: redirectUrl || `${req.headers.get('origin')}/banking/callback`,
      reference,
      userLanguage: 'ES',
    })

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.from('bank_requisitions').insert({
      user_id: user.id,
      requisition_id: requisition.id,
      institution_id: institutionId,
      institution_name: institutionName,
      status: requisition.status,
      reference,
      redirect_url: requisition.redirect,
      agreement_id: requisition.agreement,
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    }).select().single()

    if (error) throw error

    return new Response(JSON.stringify({ requisition: data, authorizationLink: requisition.link }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
