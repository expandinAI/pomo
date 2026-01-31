import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, getAppUrl } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

/**
 * POST /api/stripe/create-portal-session
 *
 * Creates a Stripe Billing Portal session for subscription management.
 * Returns the portal URL to redirect the user to.
 *
 * Features available in the portal:
 * - View/download invoices
 * - Update payment method
 * - Cancel subscription
 * - Change plan (if configured)
 */
export async function POST() {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Look up the user's Stripe customer ID
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('clerk_id', userId)
      .single();

    if (dbError || !dbUser?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // 3. Create Billing Portal session
    const appUrl = getAppUrl();
    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripe_customer_id,
      return_url: appUrl,
    });

    return NextResponse.json({
      portalUrl: session.url,
    });
  } catch (error) {
    console.error('[Stripe] Portal session error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
