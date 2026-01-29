'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { IntroPhase } from '@/hooks/useIntro';
import { GenesisParticle } from './GenesisParticle';
import { IntroTypography } from './IntroTypography';
import { ParticleSystem } from './ParticleSystem';

// ============================================================================
// Types
// ============================================================================

export interface IntroExperienceProps {
  /** Current phase of the intro */
  phase: IntroPhase;
  /** Callback when user skips the intro */
  onSkip: () => void;
  /** Callback when intro is complete */
  onComplete: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function IntroExperience({ phase, onSkip, onComplete }: IntroExperienceProps) {
  // Handle skip events (click, tap, keyboard)
  const handleSkip = useCallback(
    (e: KeyboardEvent | MouseEvent | TouchEvent) => {
      // For keyboard events, only respond to Space, Enter, Escape
      if (e instanceof KeyboardEvent) {
        if (!['Space', 'Enter', 'Escape'].includes(e.code)) {
          return;
        }
        e.preventDefault();
      }

      // Prevent double-firing from touch + click
      if (e instanceof TouchEvent) {
        e.preventDefault();
      }

      onSkip();
    },
    [onSkip]
  );

  // Set up event listeners for skip
  useEffect(() => {
    // Use capture phase to ensure we get the event first
    window.addEventListener('keydown', handleSkip as EventListener, true);
    window.addEventListener('click', handleSkip as EventListener);
    window.addEventListener('touchstart', handleSkip as EventListener, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleSkip as EventListener, true);
      window.removeEventListener('click', handleSkip as EventListener);
      window.removeEventListener('touchstart', handleSkip as EventListener);
    };
  }, [handleSkip]);

  // Call onComplete when phase reaches 'complete'
  useEffect(() => {
    if (phase === 'complete') {
      onComplete();
    }
  }, [phase, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'transition' ? 0 : 1 }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 bg-black z-[100] flex items-center justify-center cursor-default select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Particle intro"
    >
      {/* POMO-171: Genesis particle - appears and breathes */}
      <GenesisParticle phase={phase} />

      {/* POMO-173: Particle system - division, drift, convergence */}
      <ParticleSystem phase={phase} />

      {/* POMO-172: Typography/text reveals */}
      <IntroTypography phase={phase} />

      {/*
        Visual content will be added in subsequent stories:
        - POMO-174: Transition to app
      */}

      {/* Dev mode: Show current phase */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 text-white/30 text-xs font-mono">
          Phase: {phase}
        </div>
      )}

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {phase === 'silence' && 'Loading Particle...'}
        {phase === 'genesis' && 'A particle appears...'}
        {phase === 'truth1' && 'Great works are not born from great moments.'}
        {phase === 'truth2' && 'They are born from many small ones.'}
        {phase === 'invitation' && 'Ready?'}
        {phase === 'transition' && 'Welcome to Particle.'}
      </div>
    </motion.div>
  );
}
