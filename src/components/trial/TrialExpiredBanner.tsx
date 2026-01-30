'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useTrial } from '@/lib/trial';
import { useParticleAuth } from '@/lib/auth';
import { SPRING } from '@/styles/design-tokens';

const DISMISSED_KEY = 'particle:trial-expired-dismissed';

/**
 * TrialExpiredBanner - Banner shown when trial has just expired
 *
 * Shows a dismissible banner at the top of the screen when:
 * - User has used a trial (hasUsed: true)
 * - Trial is no longer active (isActive: false)
 * - User is still authenticated
 * - Banner hasn't been dismissed
 */
export function TrialExpiredBanner() {
  const auth = useParticleAuth();
  const trial = useTrial();
  const [isDismissed, setIsDismissed] = useState(true); // Start dismissed to avoid flash

  // Check dismissed state on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY) === 'true';
    setIsDismissed(dismissed);
  }, []);

  // Reset dismissed state if trial ends date changes (new trial started and expired again)
  useEffect(() => {
    if (trial.endsAt) {
      const storedEndsAt = localStorage.getItem(`${DISMISSED_KEY}:date`);
      if (storedEndsAt !== trial.endsAt) {
        // New trial expiration date, reset dismissed state
        localStorage.removeItem(DISMISSED_KEY);
        setIsDismissed(false);
      }
    }
  }, [trial.endsAt]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(DISMISSED_KEY, 'true');
    if (trial.endsAt) {
      localStorage.setItem(`${DISMISSED_KEY}:date`, trial.endsAt);
    }
  };

  const handleUpgrade = () => {
    // Open upgrade flow (will be connected to Stripe later)
    window.dispatchEvent(new CustomEvent('particle:open-upgrade'));
    handleDismiss();
  };

  // Only show when:
  // - User is authenticated
  // - User has used a trial
  // - Trial is NOT active (expired)
  // - Not dismissed
  const shouldShow =
    auth.status === 'authenticated' &&
    trial.hasUsed &&
    !trial.isActive &&
    !isDismissed;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', ...SPRING.gentle }}
          className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-tertiary/20 via-surface to-tertiary/20 light:from-tertiary-dark/20 light:via-surface-dark light:to-tertiary-dark/20 border-b border-tertiary/10 light:border-tertiary-dark/10 backdrop-blur-sm"
        >
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 light:bg-accent-dark/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent light:text-accent-dark" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary light:text-primary-dark">
                  Your Flow trial has ended
                </p>
                <p className="text-xs text-tertiary light:text-tertiary-dark">
                  Upgrade to keep all premium features
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleUpgrade}
                className="px-4 py-1.5 rounded-full bg-accent light:bg-accent-dark text-background light:text-background-dark text-xs font-medium hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Upgrade
              </button>

              <button
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
