'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Particle {
  id: number;
  startX: number;
  startY: number;
  delay: number;
  size: 'sm' | 'md' | 'lg';
  duration: number;
}

interface MilestoneParticlesProps {
  /** Whether the particles should be visible and animating */
  isActive: boolean;
  /** Number of particles to render (default: 32) */
  count?: number;
}

/**
 * MilestoneParticles
 *
 * A meditative convergence animation for milestone moments.
 * Particles drift from the edges of consciousness toward a single point of focus.
 *
 * Animation philosophy:
 * - Slow, deliberate movement (not rushed)
 * - Varied particle sizes create depth
 * - Gravity-like easing as particles approach center
 * - Gentle glow pulses like a heartbeat
 * - The moment of convergence feels like arrival, not impact
 */
export function MilestoneParticles({
  isActive,
  count = 32,
}: MilestoneParticlesProps) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<'converging' | 'glowing' | 'breathing'>('converging');

  // Generate particles with varied properties
  const particles = useMemo(() => {
    const result: Particle[] = [];
    const edges = ['top', 'right', 'bottom', 'left'] as const;
    const sizes: ('sm' | 'md' | 'lg')[] = ['sm', 'sm', 'sm', 'md', 'md', 'lg'];

    for (let i = 0; i < count; i++) {
      const edge = edges[i % 4];
      let startX: number;
      let startY: number;

      // Position at screen edges - spread wider for more dramatic entrance
      switch (edge) {
        case 'top':
          startX = -30 + Math.random() * 160;
          startY = -15 - Math.random() * 25;
          break;
        case 'right':
          startX = 115 + Math.random() * 25;
          startY = -30 + Math.random() * 160;
          break;
        case 'bottom':
          startX = -30 + Math.random() * 160;
          startY = 115 + Math.random() * 25;
          break;
        case 'left':
          startX = -15 - Math.random() * 25;
          startY = -30 + Math.random() * 160;
          break;
      }

      result.push({
        id: i,
        startX,
        startY,
        delay: Math.random() * 0.6, // More staggered (0-0.6s)
        size: sizes[Math.floor(Math.random() * sizes.length)],
        duration: 1.8 + Math.random() * 0.6, // 1.8-2.4s for varied arrival
      });
    }

    return result;
  }, [count]);

  // Animation phase progression
  useEffect(() => {
    if (!isActive) {
      setPhase('converging');
      return;
    }

    // After particles converge, start glowing
    const glowTimer = setTimeout(() => {
      setPhase('glowing');
    }, 2200);

    // After initial glow, start breathing
    const breatheTimer = setTimeout(() => {
      setPhase('breathing');
    }, 3000);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(breatheTimer);
    };
  }, [isActive]);

  if (!isActive || prefersReducedMotion) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  };

  const sizeOffsets = {
    sm: -2,  // 4px / 2
    md: -3,  // 6px / 2
    lg: -4,  // 8px / 2
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute ${sizeClasses[particle.size]} rounded-full bg-primary light:bg-primary-dark`}
          style={{
            left: '50%',
            top: '35%',
            marginLeft: sizeOffsets[particle.size],
            marginTop: sizeOffsets[particle.size],
            boxShadow: particle.size === 'lg'
              ? '0 0 8px rgba(255,255,255,0.3)'
              : particle.size === 'md'
                ? '0 0 4px rgba(255,255,255,0.2)'
                : 'none',
          }}
          initial={{
            x: `${particle.startX - 50}vw`,
            y: `${particle.startY - 35}vh`,
            opacity: 0,
            scale: 0.3,
          }}
          animate={{
            x: 0,
            y: 0,
            opacity: [0, 0.8, 1, 1, 0],
            scale: [0.3, 0.8, 1, 1.1, 0.6],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: [0.16, 1, 0.3, 1], // Smooth deceleration - like gravity pulling in
            opacity: {
              times: [0, 0.3, 0.6, 0.85, 1],
              duration: particle.duration + 0.5,
            },
            scale: {
              times: [0, 0.4, 0.7, 0.9, 1],
              duration: particle.duration + 0.3,
            },
          }}
        />
      ))}

      {/* Center point - appears after particles converge */}
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-primary light:bg-primary-dark"
        style={{
          left: '50%',
          top: '35%',
          marginLeft: -6,
          marginTop: -6,
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={
          phase !== 'converging'
            ? {
                opacity: 1,
                scale: [0, 1.2, 1],
              }
            : { opacity: 0, scale: 0 }
        }
        transition={{
          duration: 0.4,
          ease: 'easeOut',
        }}
      />

      {/* Inner glow - soft, immediate */}
      <motion.div
        className="absolute w-24 h-24 rounded-full"
        style={{
          left: '50%',
          top: '35%',
          marginLeft: -48,
          marginTop: -48,
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={
          phase !== 'converging'
            ? {
                opacity: [0, 0.6, 0.3],
                scale: [0.5, 1.2, 1],
              }
            : { opacity: 0, scale: 0.5 }
        }
        transition={{
          duration: 0.8,
          ease: 'easeOut',
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
      </motion.div>

      {/* Outer glow - expands outward */}
      <motion.div
        className="absolute w-48 h-48 rounded-full"
        style={{
          left: '50%',
          top: '35%',
          marginLeft: -96,
          marginTop: -96,
        }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={
          phase !== 'converging'
            ? {
                opacity: [0, 0.3, 0.15],
                scale: [0.3, 1.3, 1],
              }
            : { opacity: 0, scale: 0.3 }
        }
        transition={{
          duration: 1.2,
          delay: 0.2,
          ease: 'easeOut',
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)',
          }}
        />
      </motion.div>

      {/* Breathing glow - gentle pulsing */}
      <motion.div
        className="absolute w-32 h-32 rounded-full"
        style={{
          left: '50%',
          top: '35%',
          marginLeft: -64,
          marginTop: -64,
        }}
        initial={{ opacity: 0 }}
        animate={
          phase === 'breathing'
            ? {
                opacity: [0.2, 0.35, 0.2],
                scale: [1, 1.1, 1],
              }
            : { opacity: 0 }
        }
        transition={{
          duration: 3,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
      </motion.div>
    </div>
  );
}
