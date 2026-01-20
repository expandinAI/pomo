'use client';

import { useMemo } from 'react';
import { prefersReducedMotion } from '@/lib/utils';

interface ParticleFieldProps {
  isActive: boolean;
  isPaused?: boolean;
  mode?: 'work' | 'break';
  particleCount?: number;
}

interface ParticleConfig {
  baseDuration: number;
  durationVariance: number;
  opacityMin: number;
  opacityMax: number;
  driftRange: number;
}

/**
 * Returns particle configuration based on timer mode.
 * Break mode: slower, softer, more dreamlike - like breathing out
 * Work mode: focused, energetic - like concentrated energy rising
 */
function getParticleConfig(mode: 'work' | 'break'): ParticleConfig {
  if (mode === 'break') {
    return {
      baseDuration: 50,       // Much slower (was 25)
      durationVariance: 15,
      opacityMin: 0.2,        // Softer (was 0.4)
      opacityMax: 0.4,        // (was 0.8)
      driftRange: 30,         // Gentler drift (was 50)
    };
  }
  return {
    baseDuration: 25,
    durationVariance: 10,
    opacityMin: 0.4,
    opacityMax: 0.8,
    driftRange: 50,
  };
}

interface Particle {
  id: number;
  left: string;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  size: number;
  blur: number;
}

/**
 * ParticleField - Floating particles that drift upward
 *
 * Uses CSS-only animation for performance.
 * Each particle has unique duration, delay, and drift via CSS variables.
 * GPU-accelerated via transform and opacity only.
 */
export function ParticleField({ isActive, isPaused = false, mode = 'work', particleCount = 20 }: ParticleFieldProps) {
  const reducedMotion = prefersReducedMotion();

  // Generate particles with random properties (memoized for stability)
  const particles = useMemo<Particle[]>(() => {
    const config = getParticleConfig(mode);
    const opacityRange = config.opacityMax - config.opacityMin;

    return Array.from({ length: particleCount }, (_, i) => {
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        duration: config.baseDuration + Math.random() * config.durationVariance,
        delay: Math.random() * 5, // Stagger start times (0-5s positive delay)
        drift: (Math.random() - 0.5) * config.driftRange * 2, // ±driftRange horizontal drift
        opacity: config.opacityMin + Math.random() * opacityRange,
        size: 3 + Math.random() * 4, // 3-7px (larger)
        blur: Math.random() > 0.5 ? 1 : 0, // Some particles have blur for depth
      };
    });
  }, [particleCount, mode]);

  // Don't render if reduced motion is preferred or not active
  if (reducedMotion || !isActive) {
    return null;
  }

  // Break mode: particles sink from top, Work mode: particles rise from bottom
  const animationClass = mode === 'break' ? 'animate-particle-sink' : 'animate-particle';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden light:opacity-0"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full bg-white ${animationClass} will-change-[transform,opacity]`}
          style={{
            left: particle.left,
            top: mode === 'break' ? '-10px' : undefined,
            bottom: mode === 'work' ? '-10px' : undefined,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px rgba(255, 255, 255, 0.3)`,
            filter: particle.blur ? 'blur(1px)' : 'none',
            animationPlayState: isPaused ? 'paused' : 'running',
            '--particle-duration': `${particle.duration}s`,
            '--particle-delay': `${particle.delay}s`,
            '--particle-drift': `${particle.drift}px`,
            '--particle-opacity': particle.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
