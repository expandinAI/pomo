'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

/**
 * Lifetime Purchase Landing Page
 *
 * Promo link: /upgrade/lifetime
 * One-time €99 payment → permanent Flow access
 *
 * Design: Minimal, exclusive feeling
 * - The Particle
 * - Price prominence
 * - Feature list
 * - Single CTA
 */
export default function LifetimePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to main app if already signed in and has lifetime
  // (This would be checked via Clerk metadata in a real implementation)

  const handleCheckout = async () => {
    if (!isSignedIn) {
      // The SignInButton component handles this case
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_FLOW_LIFETIME;

      if (!priceId) {
        throw new Error('Lifetime pricing not configured');
      }

      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('[Lifetime] Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  const features = [
    'AI Coach (300 insights/month)',
    'Year View',
    'All future features',
  ];

  return (
    <div className="min-h-screen bg-background light:bg-background-dark flex flex-col items-center justify-center px-4">
      {/* The Particle */}
      <motion.div
        className="w-3 h-3 rounded-full bg-primary light:bg-primary-dark mb-12"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        }
      />

      {/* Content */}
      <motion.div
        className="flex flex-col items-center max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.2 }}
      >
        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl font-medium text-primary light:text-primary-dark mb-4">
          Lifetime Access
        </h1>

        {/* Price */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-5xl sm:text-6xl font-semibold text-primary light:text-primary-dark">
            €99
          </span>
          <span className="text-sm text-tertiary light:text-tertiary-dark mt-1">
            one-time
          </span>
        </motion.div>

        {/* Features */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-secondary light:text-secondary-dark mb-4">
            Pay once and get forever access to:
          </p>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <motion.li
                key={feature}
                className="flex items-center gap-3 text-sm text-primary light:text-primary-dark"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: prefersReducedMotion ? 0 : 0.6 + index * 0.1,
                }}
              >
                <Check className="w-4 h-4 text-primary/60 light:text-primary-dark/60 flex-shrink-0" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="w-full max-w-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.8 }}
        >
          {!isLoaded ? (
            // Loading state while Clerk initializes
            <div className="flex items-center justify-center py-3">
              <Loader2 className="w-5 h-5 text-tertiary light:text-tertiary-dark animate-spin" />
            </div>
          ) : isSignedIn ? (
            // Signed in - show checkout button
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary light:bg-primary-dark text-background light:text-background-dark font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Get Lifetime Access</span>
                </>
              )}
            </button>
          ) : (
            // Not signed in - show sign in button
            <SignInButton mode="modal" forceRedirectUrl="/upgrade/lifetime">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary light:bg-primary-dark text-background light:text-background-dark font-medium hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent">
                <Sparkles className="w-4 h-4" />
                <span>Get Lifetime Access</span>
              </button>
            </SignInButton>
          )}
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.p
            className="mt-4 text-sm text-red-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* Limited time notice */}
        <motion.p
          className="mt-8 text-xs text-tertiary light:text-tertiary-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: prefersReducedMotion ? 0 : 1 }}
        >
          This offer is available for a limited time
        </motion.p>

        {/* Back to app link */}
        <motion.button
          onClick={() => router.push('/')}
          className="mt-6 text-sm text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 1.1 }}
        >
          Back to Particle
        </motion.button>
      </motion.div>
    </div>
  );
}
