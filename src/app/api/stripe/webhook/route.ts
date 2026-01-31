import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for payment processing.
 * Events handled:
 * - checkout.session.completed: User completed payment
 * - customer.subscription.deleted: Subscription cancelled
 * - customer.subscription.updated: Plan changed
 * - invoice.payment_failed: Payment failed, start grace period
 * - invoice.paid: Payment succeeded, end grace period
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('[Stripe Webhook] Missing signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.paid':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout - upgrade user to Flow
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clerkId = session.metadata?.clerk_id;
  const supabaseId = session.metadata?.supabase_id;
  const isLifetime = session.metadata?.is_lifetime === 'true';

  if (!clerkId) {
    console.error('[Stripe Webhook] No clerk_id in session metadata');
    return;
  }

  console.log(`[Stripe Webhook] Checkout completed for user ${clerkId}, lifetime: ${isLifetime}`);

  const updateData: Record<string, unknown> = {
    tier: 'flow',
    subscription_status: isLifetime ? 'active' : 'active',
    is_lifetime: isLifetime,
    stripe_customer_id: session.customer as string,
    // Reset AI query counter on new subscription
    ai_queries_this_month: 0,
    ai_queries_reset_at: new Date().toISOString(),
  };

  // For subscriptions, store the subscription ID
  if (!isLifetime && session.subscription) {
    updateData.subscription_id = session.subscription as string;
  }

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('clerk_id', clerkId);

  if (error) {
    console.error('[Stripe Webhook] Failed to update user:', error);
    throw error;
  }

  // Update Clerk metadata to reflect paid status (clears trial display)
  try {
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        tier: 'flow',
        subscriptionStatus: 'active',
        isLifetime: isLifetime,
        // Clear trial fields - user is now a paying customer
        trialEndsAt: null,
      },
    });
    console.log(`[Stripe Webhook] Updated Clerk metadata for ${clerkId}`);
  } catch (clerkError) {
    console.error('[Stripe Webhook] Failed to update Clerk metadata:', clerkError);
    // Don't throw - Supabase update succeeded, Clerk is secondary
  }

  console.log(`[Stripe Webhook] User ${clerkId} upgraded to Flow`);
}

/**
 * Handle subscription cancellation - downgrade to Plus
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  console.log(`[Stripe Webhook] Subscription deleted for customer ${customerId}`);

  // Find user by Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id, clerk_id, is_lifetime')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) {
    console.error('[Stripe Webhook] User not found for customer:', customerId);
    return;
  }

  // Don't downgrade lifetime users
  if (user.is_lifetime) {
    console.log('[Stripe Webhook] Skipping downgrade for lifetime user');
    return;
  }

  const { error } = await supabase
    .from('users')
    .update({
      tier: 'free', // Downgrade to free (keeps Plus features via account)
      subscription_status: 'cancelled',
      subscription_id: null,
    })
    .eq('id', user.id);

  if (error) {
    console.error('[Stripe Webhook] Failed to downgrade user:', error);
    throw error;
  }

  console.log(`[Stripe Webhook] User ${user.clerk_id} downgraded to free`);
}

/**
 * Handle subscription update (plan change)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  console.log(`[Stripe Webhook] Subscription updated for customer ${customerId}`);

  // Find user by Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) {
    console.error('[Stripe Webhook] User not found for customer:', customerId);
    return;
  }

  // Update subscription status
  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: subscription.status === 'active' ? 'active' : 'past_due',
      subscription_id: subscription.id,
    })
    .eq('id', user.id);

  if (error) {
    console.error('[Stripe Webhook] Failed to update subscription:', error);
    throw error;
  }
}

/**
 * Handle failed payment - start grace period
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  console.log(`[Stripe Webhook] Payment failed for customer ${customerId}`);

  const { data: user } = await supabase
    .from('users')
    .select('id, is_lifetime')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user || user.is_lifetime) return;

  // Set to past_due - user has 7 days grace period (handled by Stripe)
  const { error } = await supabase
    .from('users')
    .update({ subscription_status: 'past_due' })
    .eq('id', user.id);

  if (error) {
    console.error('[Stripe Webhook] Failed to set past_due:', error);
  }
}

/**
 * Handle successful payment - end grace period
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Only handle subscription invoices
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const subscriptionId = invoiceAny.subscription;
  if (!subscriptionId) return;

  console.log(`[Stripe Webhook] Payment succeeded for customer ${customerId}`);

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) return;

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'active',
      // Reset AI counter on successful payment (monthly reset)
      ai_queries_this_month: 0,
      ai_queries_reset_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('[Stripe Webhook] Failed to update after payment:', error);
  }
}
