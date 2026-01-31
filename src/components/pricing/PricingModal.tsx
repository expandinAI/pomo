'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, Check, X } from 'lucide-react';
import { PricingCard } from './PricingCard';
import { FEATURE_INFO } from '@/lib/tiers';
import { SPRING } from '@/styles/design-tokens';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PlanType = 'monthly' | 'yearly';

// Pricing configuration
const PRICING = {
  monthly: {
    price: '4.99',
    period: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FLOW_MONTHLY,
  },
  yearly: {
    price: '39',
    period: '/year',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FLOW_YEARLY,
    badge: 'Save 35%',
  },
} as const;

/**
 * PricingModal - Modal to upgrade to Flow subscription
 *
 * Shows:
 * - Monthly/Yearly plan selection
 * - List of Flow features
 * - "Continue to Checkout" button → Stripe
 */
export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);

  // Checkout handler - defined before useEffects that reference it
  const handleCheckout = useCallback(async () => {
    const priceId = PRICING[selectedPlan].priceId;

    if (!priceId) {
      setError('Price configuration missing. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  }, [selectedPlan]);

  // Handle keyboard events (capture phase for isolation)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
        return;
      }

      // Arrow keys to switch plans
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setSelectedPlan(prev => prev === 'monthly' ? 'yearly' : 'monthly');
        return;
      }

      // Enter to proceed to checkout
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopImmediatePropagation();
        handleCheckout();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose, handleCheckout]);

  // Focus modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan('yearly');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Flow features to highlight
  const features = [
    { name: 'AI Coach', description: '300 insights/month' },
    FEATURE_INFO.yearView,
    FEATURE_INFO.advancedStats,
    FEATURE_INFO.unlimitedProjects,
    { name: 'Premium Sounds & Themes', description: 'Access all ambient soundscapes and themes' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pricing-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', ...SPRING.gentle }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent/10 light:bg-accent-dark/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-accent light:text-accent-dark" />
                  </div>
                  <h2
                    id="pricing-modal-title"
                    className="text-xl font-semibold text-primary light:text-primary-dark"
                  >
                    Upgrade to Flow
                  </h2>
                  <p className="text-sm text-secondary light:text-secondary-dark mt-1">
                    Unlock the full experience
                  </p>
                </div>

                {/* Plan Selection */}
                <div className="flex gap-3 mb-6">
                  <PricingCard
                    plan="monthly"
                    price={`€${PRICING.monthly.price}`}
                    period={PRICING.monthly.period}
                    isSelected={selectedPlan === 'monthly'}
                    onSelect={() => setSelectedPlan('monthly')}
                  />
                  <PricingCard
                    plan="yearly"
                    price={`€${PRICING.yearly.price}`}
                    period={PRICING.yearly.period}
                    badge={PRICING.yearly.badge}
                    isSelected={selectedPlan === 'yearly'}
                    onSelect={() => setSelectedPlan('yearly')}
                  />
                </div>

                {/* Features list */}
                <div className="space-y-2.5 mb-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.name}
                      className="flex items-center gap-3"
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 + 0.1 }}
                    >
                      <div className="w-5 h-5 rounded-full bg-accent/10 light:bg-accent-dark/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-accent light:text-accent-dark" />
                      </div>
                      <p className="text-sm text-primary light:text-primary-dark">
                        {feature.name}
                        {feature.description && (
                          <span className="text-tertiary light:text-tertiary-dark ml-1">
                            ({feature.description})
                          </span>
                        )}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Error message */}
                {error && (
                  <motion.p
                    className="text-sm text-red-400 mb-4 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {error}
                  </motion.p>
                )}

                {/* CTA Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white light:bg-neutral-900 text-black light:text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                >
                  {isLoading ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <span>Continue to Checkout</span>
                  )}
                </button>

                {/* Skip link */}
                <button
                  onClick={onClose}
                  className="w-full mt-3 text-sm text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors py-2"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
