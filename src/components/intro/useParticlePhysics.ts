'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { IntroPhase } from '@/hooks/useIntro';

// ============================================================================
// Types
// ============================================================================

export interface Particle {
  id: number;
  x: number;      // Position relative to center
  y: number;
  targetX: number; // Target position in line
  scale: number;
  opacity: number;
}

interface UseParticlePhysicsOptions {
  phase: IntroPhase;
  isActive: boolean;
  prefersReducedMotion: boolean;
}

export interface ParticlePhysicsResult {
  particles: Particle[];
  /** 0-1 progress of convergence (for scaling the final point) */
  convergenceProgress: number;
}

// ============================================================================
// Constants
// ============================================================================

const PARTICLE_COUNT = 7;
const LINE_SPACING = 14;  // Space between particles in line
const EXPANSION_DURATION = 4500;   // Match truth2 phase
const CONVERGENCE_DURATION = 2500; // Match invitation phase

// ============================================================================
// Easing Functions
// ============================================================================

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

// ============================================================================
// Hook
// ============================================================================

/**
 * useParticlePhysics - Linear expansion and convergence
 *
 * Animation flow:
 * 1. truth2 (3s): "...many small ones" - particles expand into line
 * 2. invitation (2.5s): "Ready?" - particles converge back to center
 *
 * Symbolism: One → many moments (line) → greater whole
 */
export function useParticlePhysics({
  phase,
  isActive,
  prefersReducedMotion,
}: UseParticlePhysicsOptions): ParticlePhysicsResult {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [convergenceProgress, setConvergenceProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const phaseStartTime = useRef<number>(0);
  const hasInitialized = useRef(false);

  // Calculate target X position for each particle (centered line)
  const getTargetX = useCallback((index: number): number => {
    const offset = ((PARTICLE_COUNT - 1) / 2) * LINE_SPACING;
    return index * LINE_SPACING - offset;
  }, []);

  // Initialize particles when division phase starts
  const initializeParticles = useCallback(() => {
    const initial: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      initial.push({
        id: i,
        x: 0,  // All start at center
        y: 0,
        targetX: getTargetX(i),
        scale: 1,
        opacity: 0,
      });
    }
    return initial;
  }, [getTargetX]);

  // Reset when becoming active (truth2 phase)
  useEffect(() => {
    if (isActive && phase === 'truth2' && !hasInitialized.current) {
      hasInitialized.current = true;
      setParticles(initializeParticles());
      phaseStartTime.current = performance.now();
      setConvergenceProgress(0);
    }

    if (!isActive) {
      hasInitialized.current = false;
      setParticles([]);
      setConvergenceProgress(0);
    }
  }, [isActive, phase, initializeParticles]);

  // Track phase changes for convergence timing
  useEffect(() => {
    if (phase === 'invitation') {
      phaseStartTime.current = performance.now();
    }
  }, [phase]);

  // Animation loop
  useEffect(() => {
    if (!isActive || prefersReducedMotion || particles.length === 0) {
      return;
    }

    const animate = (timestamp: number) => {
      const elapsed = timestamp - phaseStartTime.current;

      setParticles((prev) =>
        prev.map((p) => {
          let { x, y, targetX, opacity, scale } = p;

          if (phase === 'truth2') {
            // Expansion: "...many small ones" - particles spread into line
            const progress = Math.min(elapsed / EXPANSION_DURATION, 1);
            const easedProgress = easeOutCubic(progress);

            // Fade in during first 30%
            opacity = Math.min(progress / 0.3, 1);

            // Move to target position
            x = targetX * easedProgress;
            y = 0;

            // Subtle scale variation
            scale = 0.9 + easedProgress * 0.1;

          } else if (phase === 'invitation') {
            // Convergence: "Ready?" - particles gather back to center
            const progress = Math.min(elapsed / CONVERGENCE_DURATION, 1);
            const easedProgress = easeInOutCubic(progress);

            setConvergenceProgress(progress);

            // Move from line position back to center
            x = targetX * (1 - easedProgress);
            y = 0;

            // Scale down as they merge
            scale = 1 - easedProgress * 0.3;

            // Gentle fade out in the last 50%
            if (progress > 0.5) {
              opacity = 1 - easeOutQuart((progress - 0.5) / 0.5);
            }
          }

          return { ...p, x, y, opacity, scale };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, phase, prefersReducedMotion, particles.length]);

  return { particles, convergenceProgress };
}
