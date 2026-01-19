'use client';

import { useMemo } from 'react';
import { prefersReducedMotion } from '@/lib/utils';

interface ParticleFieldProps {
  isActive: boolean;
  speed?: 'normal' | 'slow';
  particleCount?: number;
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
export function ParticleField({ isActive, speed = 'normal', particleCount = 20 }: ParticleFieldProps) {
  const reducedMotion = prefersReducedMotion();

  // Generate particles with random properties (memoized for stability)
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const baseDuration = speed === 'slow' ? 35 : 25;
      const durationVariance = speed === 'slow' ? 15 : 10;

      return {
        id: i,
        left: `${Math.random() * 100}%`,
        duration: baseDuration + Math.random() * durationVariance, // 25-35s or 35-50s
        delay: Math.random() * 5, // Stagger start times (0-5s positive delay)
        drift: (Math.random() - 0.5) * 100, // -50px to +50px horizontal drift
        opacity: 0.4 + Math.random() * 0.4, // 0.4 to 0.8 (much more visible)
        size: 3 + Math.random() * 4, // 3-7px (larger)
        blur: Math.random() > 0.5 ? 1 : 0, // Some particles have blur for depth
      };
    });
  }, [particleCount, speed]);

  // Don't render if reduced motion is preferred or not active
  if (reducedMotion || !isActive) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden light:opacity-0"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white animate-particle will-change-[transform,opacity]"
          style={{
            left: particle.left,
            bottom: '-10px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px rgba(255, 255, 255, 0.3)`,
            filter: particle.blur ? 'blur(1px)' : 'none',
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
