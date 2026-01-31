'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ParticleBurst } from '@/components/effects/ParticleBurst';

interface FlowCelebrationProps {
  isOpen: boolean;
  onDismiss: () => void;
}

/**
 * FlowCelebration - Full-screen celebration overlay after successful purchase
 *
 * Features:
 * - Gold ParticleBurst (deluxe mode) with celebration sound
 * - "Welcome to Flow" message
 * - User-controlled dismiss (no auto-dismiss - let them enjoy the moment)
 * - Dismissable via Enter, Escape, or click anywhere
 * - Keyboard event isolation (capture phase)
 */
export function FlowCelebration({ isOpen, onDismiss }: FlowCelebrationProps) {
  const prefersReducedMotion = useReducedMotion();

  // Keyboard handling with event isolation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Dismiss on Enter or Escape
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onDismiss();
        return;
      }

      // Block all other keys from reaching timer
      if ([' ', 's', 'S', 'r', 'R'].includes(e.key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }

    // Capture phase to intercept before other handlers
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onDismiss]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer bg-background light:bg-background-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.5 }}
          onClick={onDismiss}
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to Flow celebration"
        >
          {/* ParticleBurst - Gold confetti with sound */}
          <ParticleBurst isActive={isOpen} intensity="deluxe" />

          {/* Content - positioned like other overlays */}
          <div className="relative z-10 flex flex-col items-center">
            {/* The Particle */}
            <motion.div
              className="w-3 h-3 rounded-full bg-primary light:bg-primary-dark mb-12"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.2, 1],
                opacity: 1,
              }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.8,
                delay: prefersReducedMotion ? 0 : 0.3,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            />

            {/* Welcome Message */}
            <motion.h1
              className="text-2xl sm:text-3xl font-medium text-primary light:text-primary-dark mb-3 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.6,
                delay: prefersReducedMotion ? 0 : 0.5,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              Welcome to Flow
            </motion.h1>

            {/* Subtext */}
            <motion.p
              className="text-sm text-secondary light:text-secondary-dark text-center max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.6,
                delay: prefersReducedMotion ? 0 : 0.8,
              }}
            >
              Your focus journey just got even better.
            </motion.p>

            {/* Dismiss hint */}
            <motion.p
              className="mt-12 text-xs text-tertiary light:text-tertiary-dark"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{
                duration: 0.4,
                delay: prefersReducedMotion ? 0.5 : 1.5,
              }}
            >
              Press Enter or click anywhere
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
