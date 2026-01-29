'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { IntroPhase } from '@/hooks/useIntro';
import { usePrefersReducedMotion } from '@/hooks/useIntro';
import type { DailyIntention } from '@/lib/content/daily-intentions';
import { GenesisParticle } from './GenesisParticle';
import { IntroTypography } from './IntroTypography';
import { ParticleSystem } from './ParticleSystem';

// ============================================================================
// Types
// ============================================================================

export interface IntroExperienceProps {
  /** Current phase of the intro */
  phase: IntroPhase;
  /** The intention/text to display */
  intention: DailyIntention;
  /** Callback when user skips the intro */
  onSkip: () => void;
  /** Callback when intro is complete */
  onComplete: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function IntroExperience({ phase, intention, onSkip, onComplete }: IntroExperienceProps) {
  // Reduced motion support
  const prefersReducedMotion = usePrefersReducedMotion();

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
      transition={{
        duration: prefersReducedMotion ? 0.2 : 1.2,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="fixed inset-0 bg-black z-[100] flex items-center justify-center cursor-default select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Particle intro"
    >
      {/* Single particle - appears and breathes throughout */}
      <GenesisParticle phase={phase} />

      {/* ParticleSystem disabled - keeping it minimal with just one particle */}
      {/* <ParticleSystem phase={phase} /> */}

      {/* POMO-172: Typography/text reveals */}
      <IntroTypography phase={phase} intention={intention} />


      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {phase === 'silence' && 'Loading Particle...'}
        {phase === 'genesis' && 'A particle appears...'}
        {phase === 'truth1' && intention.text}
        {phase === 'truth2' && '...'}
        {phase === 'invitation' && (intention.subtext || '')}
        {phase === 'transition' && 'Welcome to Particle.'}
      </div>
    </motion.div>
  );
}
