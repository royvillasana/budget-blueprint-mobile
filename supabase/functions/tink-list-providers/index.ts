import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { TinkClient } from '../_shared/tink.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Common Spanish banks for testing (sandbox fallback)
const SPANISH_BANKS_FALLBACK = [
  { name: 'bbva-es', displayName: 'BBVA', market: 'ES', logo: '' },
  { name: 'santander-es', displayName: 'Santander', market: 'ES', logo: '' },
  { name: 'caixabank-es', displayName: 'CaixaBank', market: 'ES', logo: '' },
  { name: 'sabadell-es', displayName: 'Banco Sabadell', market: 'ES', logo: '' },
  { name: 'bankinter-es', displayName: 'Bankinter', market: 'ES', logo: '' },
  { name: 'ing-es', displayName: 'ING', market: 'ES', logo: '' },
]

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { market = 'ES' } = await req.json().catch(() => ({}))
    const clientId = Deno.env.get('TINK_CLIENT_ID')!
    const clientSecret = Deno.env.get('TINK_CLIENT_SECRET')!

    if (!clientId || !clientSecret) throw new Error('Tink credentials not configured')

    const client = new TinkClient({ clientId, clientSecret })

    try {
      // Try to get providers from Tink API
      const clientToken = await client.getClientAccessToken()
      client.setAccessToken(clientToken.access_token)

      const tempUserId = `temp_${Date.now()}`
      const userResponse = await client.createUser(tempUserId, market, 'es_ES')
      const userToken = await client.getUserAccessToken(userResponse.user_id)
      client.setAccessToken(userToken.access_token)

      const providers = await client.listProviders(market, 'CHECKING_ACCOUNTS')

      return new Response(JSON.stringify({ providers, source: 'tink_api' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (apiError: any) {
      // Fallback to hardcoded list for sandbox testing
      console.log('Tink API error, using fallback list:', apiError.message)

      return new Response(JSON.stringify({
        providers: SPANISH_BANKS_FALLBACK,
        source: 'fallback',
        note: 'Using fallback bank list. Tink sandbox may have limited API access.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error: any) {
    console.error('Error listing providers:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
