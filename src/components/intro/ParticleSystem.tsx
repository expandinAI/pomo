'use client';

import { motion } from 'framer-motion';
import type { IntroPhase } from '@/hooks/useIntro';
import { usePrefersReducedMotion } from '@/hooks/useIntro';
import { useParticlePhysics } from './useParticlePhysics';

// ============================================================================
// Types
// ============================================================================

interface ParticleSystemProps {
  /** Current phase of the intro */
  phase: IntroPhase;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ParticleSystem - The 7 particles that emerge, drift, and converge
 *
 * Visible during phases: division, invitation, convergence
 *
 * Animation flow:
 * - Division: 1 particle becomes 7, spreading outward slowly
 * - Invitation: Particles drift meditatively within a boundary
 * - Convergence: Particles gather back to center, forming a larger whole
 *
 * Symbolism: Small particle → many small moments → greater work
 */
export function ParticleSystem({ phase }: ParticleSystemProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  // Active during truth2 (division) and invitation (convergence)
  const isActive = ['truth2', 'invitation'].includes(phase);

  const { particles, convergenceProgress } = useParticlePhysics({
    phase,
    isActive,
    prefersReducedMotion,
  });

  if (!isActive) return null;

  // Reduced Motion: Show static larger particle immediately
  if (prefersReducedMotion) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="w-3 h-3 bg-white rounded-full"
          style={{ filter: 'blur(0.5px)' }}
        />
      </div>
    );
  }

  // Calculate the "resulting particle" that grows during convergence (invitation phase)
  // It starts invisible and grows as particles converge
  const showResultParticle = phase === 'invitation' && convergenceProgress > 0.4;
  const resultScale = showResultParticle
    ? Math.min((convergenceProgress - 0.4) / 0.6, 1) // 0 to 1 over last 60%
    : 0;
  const resultOpacity = showResultParticle
    ? Math.min((convergenceProgress - 0.4) / 0.4, 1) // Fade in smoothly
    : 0;

  // The final particle is ~2x the size of individual particles (12px vs 6px)
  const finalSize = 12;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      {/* Individual drifting particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1.5 h-1.5 bg-white rounded-full"
          style={{
            left: '50%',
            top: '50%',
            x: p.x,
            y: p.y,
            scale: p.scale,
            opacity: p.opacity,
            translateX: '-50%',
            translateY: '-50%',
            filter: 'blur(0.5px)',
          }}
        />
      ))}

      {/* The resulting larger particle - emerges during convergence */}
      {showResultParticle && (
        <motion.div
          className="absolute bg-white rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: finalSize,
            height: finalSize,
            translateX: '-50%',
            translateY: '-50%',
            scale: resultScale,
            opacity: resultOpacity,
            filter: 'blur(0.5px)',
          }}
          initial={false}
        />
      )}
    </div>
  );
}
