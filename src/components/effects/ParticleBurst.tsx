'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/utils';
import { useSound } from '@/hooks/useSound';
import type { CelebrationIntensity } from '@/contexts/TimerSettingsContext';

interface ParticleBurstProps {
  isActive: boolean;
  particleCount?: number;
  position?: { x: number; y: number } | null;
  intensity?: CelebrationIntensity;
}

interface BurstParticle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

interface GoldParticle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
  color: string;
}

// Gold color palette for deluxe mode
const GOLD_COLORS = [
  '#FFD700', // Gold
  '#FFC125', // Goldenrod
  '#FFEC8B', // Light goldenrod
  '#FFB90F', // Dark goldenrod
  '#FFF8DC', // Cornsilk (light accent)
  '#FFFFFF', // White sparkle
];

// Configuration for different intensity levels
const INTENSITY_CONFIG = {
  subtle: { count: 12, duration: 0.8, distance: 80 },
  full: { count: 80, duration: 2.0, distance: 200 },
  deluxe: { count: 100, duration: 3.0, distance: 280 },
};

/**
 * ParticleBurst - Celebration burst when session completes
 *
 * Three modes:
 * - subtle: Simple white particles expanding outward
 * - full: More particles, longer duration
 * - deluxe: Gold confetti with gravity, glow flash, and sound
 *
 * Respects prefers-reduced-motion for accessibility.
 */
export function ParticleBurst({
  isActive,
  particleCount,
  position = null,
  intensity = 'subtle',
}: ParticleBurstProps) {
  const reducedMotion = prefersReducedMotion();
  const [showBurst, setShowBurst] = useState(false);
  const { play: playSound } = useSound();

  // Get configuration based on intensity
  const config = INTENSITY_CONFIG[intensity] || INTENSITY_CONFIG.subtle;
  const effectiveCount = particleCount ?? config.count;
  const isDeluxe = intensity === 'deluxe';

  // Generate gold particles for deluxe mode - like Full but with gold & glow
  const goldParticles = useMemo<GoldParticle[]>(() => {
    if (!isDeluxe) return [];
    return Array.from({ length: effectiveCount }, (_, i) => ({
      id: i,
      angle: (i / effectiveCount) * 360 + Math.random() * 20,
      distance: config.distance * (0.6 + Math.random() * 0.5),
      size: 3 + Math.random() * 5, // 3-8px
      delay: Math.random() * 0.1,
      color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
    }));
  }, [isDeluxe, effectiveCount, config.distance]);

  // Generate simple particles for subtle/full mode
  const simpleParticles = useMemo<BurstParticle[]>(() => {
    if (isDeluxe) return [];
    return Array.from({ length: effectiveCount }, (_, i) => ({
      id: i,
      angle: (i / effectiveCount) * 360 + Math.random() * 30,
      distance: config.distance + Math.random() * (config.distance * 0.5),
      size: 3 + Math.random() * 4,
      delay: Math.random() * 0.1,
    }));
  }, [isDeluxe, effectiveCount, config.distance]);

  // Trigger burst when isActive becomes true
  useEffect(() => {
    if (isActive) {
      setShowBurst(true);

      // Play celebration sound for deluxe mode
      if (isDeluxe) {
        playSound('celebration');
      }

      // Auto-cleanup after animation
      const timeout = setTimeout(() => {
        setShowBurst(false);
      }, (config.duration + 0.5) * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isActive, config.duration, isDeluxe, playSound]);

  // Reduced motion: show gentle fade instead of burst
  if (reducedMotion && isActive) {
    return (
      <AnimatePresence>
        {showBurst && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.6 }}
            aria-hidden="true"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: isDeluxe ? '#FFD700' : undefined }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (reducedMotion) {
    return null;
  }

  // Deluxe mode: Gold confetti with gravity and glow
  if (isDeluxe) {
    return (
      <AnimatePresence>
        {showBurst && (
          <div
            className="pointer-events-none fixed z-50"
            style={{ inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-hidden="true"
          >
            {/* Central glow - simple soft pulse */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 120,
                height: 120,
                background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2], opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />

            {/* Gold particles - pure expansion outward like sparks/fire */}
            {goldParticles.map((particle) => {
              const radians = (particle.angle * Math.PI) / 180;
              const endX = Math.cos(radians) * particle.distance;
              const endY = Math.sin(radians) * particle.distance;

              return (
                <motion.div
                  key={particle.id}
                  className="absolute rounded-full"
                  style={{
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    boxShadow: `0 0 ${particle.size * 1.5}px ${particle.color}80`,
                  }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{
                    x: endX,
                    y: endY,
                    opacity: [0, 1, 0.8, 0],
                    scale: [0, 1.3, 0.8, 0],
                  }}
                  transition={{
                    duration: config.duration,
                    delay: particle.delay,
                    ease: [0.22, 0.61, 0.36, 1],
                    times: [0, 0.3, 0.7, 1],
                  }}
                />
              );
            })}

          </div>
        )}
      </AnimatePresence>
    );
  }

  // Standard mode: Simple expanding particles
  return (
    <AnimatePresence>
      {showBurst && (
        <div
          className="pointer-events-none fixed z-10"
          style={
            position
              ? { left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }
              : { inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }
          }
          aria-hidden="true"
        >
          {simpleParticles.map((particle) => {
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
                  duration: config.duration,
                  delay: particle.delay,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
