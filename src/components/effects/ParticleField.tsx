'use client';

import { useMemo } from 'react';
import { prefersReducedMotion } from '@/lib/utils';
import type { ResolvedParticleStyle } from '@/hooks/useParticleStyle';

interface ParticleFieldProps {
  isActive: boolean;
  isPaused?: boolean;
  mode?: 'work' | 'break';
  particleCount?: number;
  style?: ResolvedParticleStyle;
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
  angleX: number;  // For Shine & Gather: -1 to 1
  angleY: number;  // For Shine & Gather: -1 to 1
  orbitRadius: number;  // For Orbit & Drift: orbit radius in px
  driftX: number;  // For Orbit & Drift (break): drift direction X
  driftY: number;  // For Orbit & Drift (break): drift direction Y
}

/**
 * ParticleField - Floating particles that drift upward
 *
 * Uses CSS-only animation for performance.
 * Each particle has unique duration, delay, and drift via CSS variables.
 * GPU-accelerated via transform and opacity only.
 */
export function ParticleField({ isActive, isPaused = false, mode = 'work', particleCount = 20, style = 'rise-fall' }: ParticleFieldProps) {
  const reducedMotion = prefersReducedMotion();

  // Generate particles with random properties (memoized for stability)
  const particles = useMemo<Particle[]>(() => {
    const config = getParticleConfig(mode);
    const opacityRange = config.opacityMax - config.opacityMin;

    return Array.from({ length: particleCount }, (_, i) => {
      // Calculate random angle for Shine & Gather style
      const angle = Math.random() * Math.PI * 2; // 0 to 2π
      const angleX = Math.cos(angle);
      const angleY = Math.sin(angle);

      // Orbit & Drift properties
      const orbitRadius = 80 + Math.random() * 200; // 80-280px orbit radius
      const driftX = (Math.random() - 0.5) * 2; // -1 to 1
      const driftY = (Math.random() - 0.5) * 2; // -1 to 1

      return {
        id: i,
        left: `${Math.random() * 100}%`,
        duration: config.baseDuration + Math.random() * config.durationVariance,
        delay: Math.random() * 5, // Stagger start times (0-5s positive delay)
        drift: (Math.random() - 0.5) * config.driftRange * 2, // ±driftRange horizontal drift
        opacity: config.opacityMin + Math.random() * opacityRange,
        size: 3 + Math.random() * 4, // 3-7px (larger)
        blur: Math.random() > 0.5 ? 1 : 0, // Some particles have blur for depth
        angleX,
        angleY,
        orbitRadius,
        driftX,
        driftY,
      };
    });
  }, [particleCount, mode]);

  // Don't render if reduced motion is preferred or not active
  if (reducedMotion || !isActive) {
    return null;
  }

  // Determine animation class based on style and mode
  const getAnimationClass = (): string => {
    if (style === 'shine-gather') {
      return mode === 'break' ? 'animate-particle-gather' : 'animate-particle-shine';
    }
    if (style === 'orbit-drift') {
      return mode === 'break' ? 'animate-particle-drift-break' : 'animate-particle-orbit';
    }
    // Default: rise-fall
    return mode === 'break' ? 'animate-particle-sink' : 'animate-particle';
  };

  const animationClass = getAnimationClass();
  const usesCenterPosition = style === 'shine-gather' || style === 'orbit-drift';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden light:opacity-0"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`rounded-full bg-white ${animationClass} will-change-[transform,opacity] ${usesCenterPosition ? '' : 'absolute'}`}
          style={{
            // Position based on style
            ...(usesCenterPosition
              ? {} // Center-based styles use fixed positioning from CSS class
              : {
                  left: particle.left,
                  top: mode === 'break' ? '-10px' : undefined,
                  bottom: mode === 'work' ? '-10px' : undefined,
                }),
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px rgba(255, 255, 255, 0.3)`,
            filter: particle.blur ? 'blur(1px)' : 'none',
            animationPlayState: isPaused ? 'paused' : 'running',
            '--particle-duration': `${particle.duration}s`,
            '--particle-delay': `${particle.delay}s`,
            '--particle-drift': `${particle.drift}px`,
            '--particle-opacity': particle.opacity,
            '--particle-angle-x': particle.angleX,
            '--particle-angle-y': particle.angleY,
            '--orbit-radius': `${particle.orbitRadius}px`,
            '--drift-x': particle.driftX,
            '--drift-y': particle.driftY,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
