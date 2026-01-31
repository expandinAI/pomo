import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

/**
 * Stripe client singleton for server-side usage.
 *
 * Usage:
 * ```ts
 * import { stripe } from '@/lib/stripe';
 * const session = await stripe.checkout.sessions.create({...});
 * ```
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
});

/**
 * Price IDs from Stripe Dashboard.
 * These are configured in the Stripe Dashboard under Products.
 *
 * Test mode: price_test_xxx
 * Live mode: price_xxx
 */
export const STRIPE_PRICES = {
  FLOW_MONTHLY: process.env.STRIPE_PRICE_FLOW_MONTHLY!,
  FLOW_YEARLY: process.env.STRIPE_PRICE_FLOW_YEARLY!,
  FLOW_LIFETIME: process.env.STRIPE_PRICE_FLOW_LIFETIME,
} as const;

export type StripePriceId = keyof typeof STRIPE_PRICES;

/**
 * Validates that a price ID is valid.
 */
export function isValidPriceId(priceId: string): priceId is string {
  return Object.values(STRIPE_PRICES).includes(priceId);
}

/**
 * Get the app URL for redirects.
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}
