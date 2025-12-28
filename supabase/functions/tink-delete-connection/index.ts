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
    const { credentialsId } = await req.json()

    if (!credentialsId) {
      throw new Error('credentialsId is required')
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

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify this credential belongs to the user
    const { data: requisition } = await supabase
      .from('bank_requisitions')
      .select('*')
      .eq('requisition_id', credentialsId)
      .eq('user_id', user.id)
      .single()

    if (!requisition) {
      throw new Error('Connection not found or unauthorized')
    }

    // Delete from Tink
    const client = new TinkClient({ clientId, clientSecret })
    const tokenManager = new TokenManager(supabaseUrl, supabaseKey)
    const accessToken = await tokenManager.getValidAccessToken(client)
    client.setAccessToken(accessToken)

    try {
      await client.deleteCredentials(credentialsId)
    } catch (error: any) {
      console.error('Error deleting from Tink:', error)
      // Continue with database deletion even if Tink deletion fails
    }

    // Delete from database (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('bank_requisitions')
      .delete()
      .eq('id', requisition.id)

    if (deleteError) throw deleteError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error deleting connection:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
