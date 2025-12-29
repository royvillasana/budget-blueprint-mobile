// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno';
import { STRIPE_CONFIG, getPlanFromPriceId } from '../_shared/billing-config.ts';

const stripe = new Stripe(STRIPE_CONFIG.SECRET_KEY, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.WEBHOOK_SECRET
    );

    console.log(`Received Stripe webhook: ${event.type}`);

    // Log event for idempotency and auditing
    const { error: logError } = await supabase
      .from('billing_events')
      .insert({
        event_type: event.type,
        event_provider: 'stripe',
        event_id: event.id,
        event_data: {
          type: event.type,
          created: event.created,
        },
      });

    if (logError && !logError.message.includes('duplicate key')) {
      console.error('Error logging event:', logError);
      // Continue processing even if logging fails
    }

    // Handle event based on type
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(supabase, event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(supabase, event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabase, event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await supabase
      .from('billing_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq('event_id', event.id)
      .eq('event_provider', 'stripe');

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook error:', error.message);

    // Log error
    try {
      await supabase
        .from('billing_events')
        .update({
          processed: false,
          error_message: error.message,
        })
        .eq('event_id', (error as any).event?.id)
        .eq('event_provider', 'stripe');
    } catch (logError) {
      console.error('Error logging webhook error:', logError);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function handleCheckoutCompleted(
  supabase: any,
  session: Stripe.Checkout.Session
) {
  console.log('Processing checkout.session.completed');

  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error('No user_id in session metadata');
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Update subscription with Stripe IDs
  const { error } = await supabase
    .from('subscriptions')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating subscription after checkout:', error);
    throw error;
  }

  console.log(`Checkout completed for user ${userId}`);
}

async function handleSubscriptionUpdate(
  supabase: any,
  subscription: Stripe.Subscription
) {
  console.log('Processing subscription update');

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  // Get plan from price ID
  const priceId = subscription.items.data[0]?.price.id;
  const planInfo = priceId ? getPlanFromPriceId(priceId) : null;

  if (!planInfo) {
    console.error('Unknown price ID:', priceId);
    return;
  }

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    unpaid: 'unpaid',
  };

  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan: planInfo.plan,
      status: statusMap[subscription.status] || subscription.status,
      billing_interval: planInfo.interval,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  console.log(`Subscription updated for user ${userId}: ${planInfo.plan} (${subscription.status})`);
}

async function handleSubscriptionDeleted(
  supabase: any,
  subscription: Stripe.Subscription
) {
  console.log('Processing subscription deletion');

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  // Downgrade to free plan
  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'active',
      billing_interval: null,
      stripe_subscription_id: null,
      stripe_price_id: null,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 1000 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 1000 years
      cancel_at_period_end: false,
      canceled_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error downgrading to free plan:', error);
    throw error;
  }

  console.log(`Subscription deleted for user ${userId}, downgraded to free`);
}

async function handleInvoicePaid(
  supabase: any,
  invoice: Stripe.Invoice
) {
  console.log('Processing invoice.paid');

  // Log successful payment
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (sub) {
    await supabase
      .from('billing_events')
      .insert({
        user_id: sub.user_id,
        event_type: 'invoice.paid',
        event_provider: 'stripe',
        event_id: invoice.id,
        event_data: {
          amount_paid: invoice.amount_paid,
          currency: invoice.currency,
        },
      });
  }

  console.log('Invoice paid processed');
}

async function handleInvoicePaymentFailed(
  supabase: any,
  invoice: Stripe.Invoice
) {
  console.log('Processing invoice.payment_failed');

  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (sub) {
    // Update subscription status to past_due
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', subscriptionId);

    // Log failed payment
    await supabase
      .from('billing_events')
      .insert({
        user_id: sub.user_id,
        event_type: 'invoice.payment_failed',
        event_provider: 'stripe',
        event_id: invoice.id,
        event_data: {
          amount_due: invoice.amount_due,
          currency: invoice.currency,
          attempt_count: invoice.attempt_count,
        },
      });
  }

  console.log('Invoice payment failed processed');
}
