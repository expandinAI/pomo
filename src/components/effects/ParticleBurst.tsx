'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/utils';

interface ParticleBurstProps {
  isActive: boolean;
  particleCount?: number;
}

interface BurstParticle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

/**
 * ParticleBurst - Celebration burst when session completes
 *
 * 30 particles expand outward from center using Framer Motion.
 * Auto-cleanup after 1s animation completes.
 * Respects prefers-reduced-motion for accessibility.
 */
export function ParticleBurst({ isActive, particleCount = 30 }: ParticleBurstProps) {
  const reducedMotion = prefersReducedMotion();
  const [showBurst, setShowBurst] = useState(false);

  // Generate burst particles (memoized for stability)
  const particles = useMemo<BurstParticle[]>(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (i / particleCount) * 360 + Math.random() * 30, // Even distribution with variance
      distance: 100 + Math.random() * 150, // 100-250px from center
      size: 3 + Math.random() * 4, // 3-7px
      delay: Math.random() * 0.1, // 0-0.1s stagger
    }));
  }, [particleCount]);

  // Trigger burst when isActive becomes true
  useEffect(() => {
    if (isActive && !reducedMotion) {
      setShowBurst(true);
      // Auto-cleanup after animation
      const timeout = setTimeout(() => {
        setShowBurst(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isActive, reducedMotion]);

  // Don't render if reduced motion is preferred
  if (reducedMotion) {
    return null;
  }

  return (
    <AnimatePresence>
      {showBurst && (
        <div
          className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center light:opacity-0"
          aria-hidden="true"
        >
          {particles.map((particle) => {
            const radians = (particle.angle * Math.PI) / 180;
            const x = Math.cos(radians) * particle.distance;
            const y = Math.sin(radians) * particle.distance;

            return (
              <motion.div
                key={particle.id}
                className="absolute rounded-full bg-accent light:bg-accent-dark"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                }}
                initial={{ x: 0, y: 0, opacity: 0.8, scale: 1 }}
                animate={{
                  x,
                  y,
                  opacity: 0,
                  scale: 0.5,
                }}
                transition={{
                  duration: 0.8,
                  delay: particle.delay,
                  ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
