'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ANIMATION } from '@/styles/design-tokens';
import { prefersReducedMotion } from '@/lib/utils';

interface BreathingAnimationProps {
  onComplete: () => void;
}

export function BreathingAnimation({ onComplete }: BreathingAnimationProps) {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    // If reduced motion, skip animation
    if (reducedMotion) {
      onComplete();
      return;
    }

    // Inhale phase
    const exhaleTimeout = setTimeout(() => {
      setPhase('exhale');
    }, ANIMATION.breath);

    // Complete after full breath cycle
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, ANIMATION.breath * 2);

    return () => {
      clearTimeout(exhaleTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete, reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onComplete}
      className="flex flex-col items-center justify-center gap-6 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-3xl p-4 -m-4"
      aria-label="Skip breathing exercise"
    >
      {/* Breathing circle */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-accent/20 dark:bg-accent-dark/20"
          initial={{ scale: 1, opacity: 0.3 }}
          animate={{
            scale: phase === 'inhale' ? 1.3 : 1,
            opacity: phase === 'inhale' ? 0.6 : 0.3,
          }}
          transition={{
            duration: ANIMATION.breath / 1000,
            ease: phase === 'inhale' ? 'easeOut' : 'easeIn',
          }}
        />

        <motion.div
          className="absolute inset-8 rounded-full bg-accent/30 dark:bg-accent-dark/30"
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{
            scale: phase === 'inhale' ? 1.25 : 1,
            opacity: phase === 'inhale' ? 0.7 : 0.4,
          }}
          transition={{
            duration: ANIMATION.breath / 1000,
            ease: phase === 'inhale' ? 'easeOut' : 'easeIn',
            delay: 0.05,
          }}
        />

        <motion.div
          className="w-32 h-32 rounded-full bg-accent dark:bg-accent-dark flex items-center justify-center"
          initial={{ scale: 1 }}
          animate={{
            scale: phase === 'inhale' ? 1.2 : 1,
          }}
          transition={{
            duration: ANIMATION.breath / 1000,
            ease: phase === 'inhale' ? 'easeOut' : 'easeIn',
            delay: 0.1,
          }}
        />
      </div>

      {/* Instruction text */}
      <motion.p
        className="text-lg font-medium text-primary dark:text-primary-dark"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        key={phase}
      >
        {phase === 'inhale' ? 'Breathe in...' : 'Breathe out...'}
      </motion.p>

      {/* Skip hint */}
      <motion.span
        className="text-sm text-tertiary dark:text-tertiary-dark"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        Tap to skip
      </motion.span>
    </button>
  );
}
