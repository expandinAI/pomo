'use client';

import { motion } from 'framer-motion';
import type { IntroPhase } from '@/hooks/useIntro';
import { usePrefersReducedMotion } from '@/hooks/useIntro';

// ============================================================================
// Types
// ============================================================================

interface GenesisParticleProps {
  /** Current phase of the intro */
  phase: IntroPhase;
}

// ============================================================================
// Component
// ============================================================================

/**
 * GenesisParticle - The single white particle that emerges from darkness
 *
 * Visible during phases: genesis, truth1, truth2
 * Features a subtle "breathing" animation (scale oscillation)
 *
 * The particle represents the core of Particle's philosophy:
 * "Great works are born from many small moments"
 */
export function GenesisParticle({ phase }: GenesisParticleProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Visible from genesis until truth1 (ParticleSystem takes over at truth2)
  const isVisible = ['genesis', 'truth1'].includes(phase);

  if (!isVisible) return null;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                 w-1 h-1 md:w-[5px] md:h-[5px] lg:w-1.5 lg:h-1.5
                 bg-white rounded-full"
      style={{ filter: 'blur(0.5px)' }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: prefersReducedMotion ? 1 : [1, 1.02, 1, 0.98, 1],
      }}
      transition={{
        opacity: { duration: 1.5, ease: [0.33, 1, 0.68, 1] },
        scale: prefersReducedMotion
          ? { duration: 0 }
          : { duration: 4, repeat: Infinity, ease: 'easeInOut' },
      }}
      aria-hidden="true"
    />
  );
}
