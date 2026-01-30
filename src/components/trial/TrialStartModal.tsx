'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, Check, X } from 'lucide-react';
import { useStartTrial, useCanStartTrial, TRIAL_DURATION_DAYS } from '@/lib/trial';
import { FEATURE_INFO } from '@/lib/tiers';
import { SPRING } from '@/styles/design-tokens';

interface TrialStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * TrialStartModal - Modal to start the 14-day Flow trial
 *
 * Shows:
 * - List of Flow features
 * - "Start Trial" button
 * - Success confirmation after starting
 */
export function TrialStartModal({ isOpen, onClose }: TrialStartModalProps) {
  const { startTrial, isLoading, error, success } = useStartTrial();
  const canStartTrial = useCanStartTrial();
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  // Auto-close after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  // Focus modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleStart = useCallback(async () => {
    await startTrial();
  }, [startTrial]);

  // Flow features to highlight
  const features = [
    FEATURE_INFO.yearView,
    FEATURE_INFO.advancedStats,
    FEATURE_INFO.unlimitedProjects,
    FEATURE_INFO.allAmbientSounds,
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
            aria-labelledby="trial-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-sm bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden"
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

              <AnimatePresence mode="wait">
                {success ? (
                  /* Success State */
                  <motion.div
                    key="success"
                    className="p-8 flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', ...SPRING.default }}
                  >
                    <motion.div
                      className="w-14 h-14 rounded-full bg-accent/10 light:bg-accent-dark/10 flex items-center justify-center mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', ...SPRING.bouncy, delay: 0.1 }}
                    >
                      <Check className="w-7 h-7 text-accent light:text-accent-dark" />
                    </motion.div>

                    <motion.h2
                      className="text-lg font-semibold text-primary light:text-primary-dark mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Trial started!
                    </motion.h2>

                    <motion.p
                      className="text-sm text-secondary light:text-secondary-dark text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      You have {TRIAL_DURATION_DAYS} days to explore Flow.
                    </motion.p>
                  </motion.div>
                ) : (
                  /* Default State */
                  <motion.div
                    key="default"
                    className="p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-accent/10 light:bg-accent-dark/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-accent light:text-accent-dark" />
                      </div>
                      <div>
                        <h2
                          id="trial-modal-title"
                          className="text-base font-semibold text-primary light:text-primary-dark"
                        >
                          Try Flow for free
                        </h2>
                        <p className="text-sm text-tertiary light:text-tertiary-dark">
                          {TRIAL_DURATION_DAYS} days, no credit card
                        </p>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-3 mb-6">
                      {features.map((feature, index) => (
                        <motion.div
                          key={feature.name}
                          className="flex items-start gap-3"
                          initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 + 0.1 }}
                        >
                          <div className="w-5 h-5 rounded-full bg-accent/10 light:bg-accent-dark/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-accent light:text-accent-dark" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary light:text-primary-dark">
                              {feature.name}
                            </p>
                            <p className="text-xs text-tertiary light:text-tertiary-dark">
                              {feature.description}
                            </p>
                          </div>
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

                    {/* Cannot start trial message */}
                    {!canStartTrial && !error && (
                      <motion.p
                        className="text-sm text-tertiary light:text-tertiary-dark mb-4 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        You have already used your free trial.
                      </motion.p>
                    )}

                    {/* CTA Button */}
                    <button
                      onClick={handleStart}
                      disabled={isLoading || !canStartTrial}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-accent light:bg-accent-dark text-background light:text-background-dark text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      {isLoading ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Start {TRIAL_DURATION_DAYS}-Day Trial</span>
                        </>
                      )}
                    </button>

                    {/* Skip link */}
                    <button
                      onClick={onClose}
                      className="w-full mt-3 text-sm text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors py-2"
                    >
                      Maybe later
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
