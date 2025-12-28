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
    const { country = 'ES' } = await req.json().catch(() => ({}))
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const secretId = Deno.env.get('GOCARDLESS_SECRET_ID')!
    const secretKey = Deno.env.get('GOCARDLESS_SECRET_KEY')!

    if (!secretId || !secretKey) throw new Error('GoCardless credentials not configured')

    const client = new GoCardlessClient({ secretId, secretKey })
    const tokenManager = new TokenManager(supabaseUrl, supabaseKey)
    const accessToken = await tokenManager.getValidAccessToken(client)
    client.setAccessToken(accessToken)

    const institutions = await client.listInstitutions(country)
    return new Response(JSON.stringify({ institutions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
