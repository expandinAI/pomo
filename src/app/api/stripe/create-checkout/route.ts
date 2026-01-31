import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe, STRIPE_PRICES, isValidPriceId, getAppUrl } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

interface CreateCheckoutRequest {
  priceId: string;
}

/**
 * POST /api/stripe/create-checkout
 *
 * Creates a Stripe Checkout session for subscription purchase.
 * Returns the checkout URL to redirect the user to.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request
    const body: CreateCheckoutRequest = await request.json();
    const { priceId } = body;

    if (!priceId || !isValidPriceId(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // 3. Get user data
    const user = await currentUser();
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    const email = user.emailAddresses[0].emailAddress;

    // 4. Get or create Stripe customer
    const { data: dbUser } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .eq('clerk_id', userId)
      .single();

    let stripeCustomerId = dbUser?.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          clerk_id: userId,
          supabase_id: dbUser?.id || '',
        },
      });
      stripeCustomerId = customer.id;

      // Save to database
      if (dbUser?.id) {
        await supabase
          .from('users')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', dbUser.id);
      }
    }

    // 5. Determine if this is a subscription or one-time payment
    const isLifetime = priceId === STRIPE_PRICES.FLOW_LIFETIME;
    const appUrl = getAppUrl();

    // 6. Create Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: isLifetime ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}?checkout=cancelled`,
      metadata: {
        clerk_id: userId,
        supabase_id: dbUser?.id || '',
        is_lifetime: isLifetime ? 'true' : 'false',
      },
      // For subscriptions, allow plan changes later
      ...(isLifetime
        ? {}
        : {
            subscription_data: {
              metadata: {
                clerk_id: userId,
                supabase_id: dbUser?.id || '',
              },
            },
          }),
      // Collect billing address for invoices
      billing_address_collection: 'auto',
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('[Stripe] Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
