// supabase/functions/billing-info/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError) {
      console.error('Error fetching subscription:', subError);
      throw new Error('Failed to fetch subscription');
    }

    // Get entitlements
    const { data: entitlements, error: entError } = await supabase
      .from('user_entitlements')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (entError) {
      console.error('Error fetching entitlements:', entError);
    }

    // Get usage for chat messages
    const { data: usageData, error: usageError } = await supabase
      .rpc('check_usage_limit', {
        p_user_id: user.id,
        p_metric_name: 'chat_messages',
      });

    if (usageError) {
      console.error('Error fetching usage:', usageError);
    }

    return new Response(JSON.stringify({
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        billing_interval: subscription.billing_interval,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        trial_end: subscription.trial_end,
      },
      entitlements: entitlements || {},
      usage: {
        chat_messages: usageData || {
          count: 0,
          limit: entitlements?.chat_message_limit,
          has_exceeded: false,
          remaining: entitlements?.chat_message_limit || 0,
        },
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error getting billing info:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
