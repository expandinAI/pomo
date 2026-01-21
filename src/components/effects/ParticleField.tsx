'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/utils';
import type { ResolvedParticleStyle } from '@/hooks/useParticleStyle';

interface ParticleFieldProps {
  isActive: boolean;
  isPaused?: boolean;
  mode?: 'work' | 'break';
  particleCount?: number;
  style?: ResolvedParticleStyle;
  parallaxEnabled?: boolean;
  paceMultiplier?: number;
  isConverging?: boolean;
  convergenceTarget?: { x: number; y: number } | null;
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
  depth: number;  // For Parallax: 0 (far) to 1 (near)
  wobbleX: number;  // For slowing animation: stable random wobble X
  wobbleY: number;  // For slowing animation: stable random wobble Y
  convergenceDelay: number;  // For convergence: stable random delay
  rotationDirection: number;  // For convergence: 1 or -1 (clockwise/counter-clockwise)
  rotationSpeed: number;  // For convergence: 0.5-1.5 multiplier
}

/**
 * ParticleField - Floating particles that drift upward
 *
 * Uses CSS-only animation for performance.
 * Each particle has unique duration, delay, and drift via CSS variables.
 * GPU-accelerated via transform and opacity only.
 */
// Position tracking for convergence animation
interface TrackedPosition {
  x: number;
  y: number;
  scale: number;
}

export function ParticleField({
  isActive,
  isPaused = false,
  mode = 'work',
  particleCount = 20,
  style = 'rise-fall',
  parallaxEnabled = true,
  paceMultiplier = 1.0,
  isConverging = false,
  convergenceTarget = null,
}: ParticleFieldProps) {
  const reducedMotion = prefersReducedMotion();

  // Refs for tracking particle positions
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Tracked positions for slowing/convergence animation
  const [trackedPositions, setTrackedPositions] = useState<TrackedPosition[]>([]);

  // Track if we've captured positions for slowing/convergence
  const [hasSnapshotted, setHasSnapshotted] = useState(false);

  // Capture particle positions when convergence animation starts
  useEffect(() => {
    // Snapshot when converging starts
    if (isConverging && convergenceTarget && !hasSnapshotted) {
      const positions: TrackedPosition[] = [];

      particleRefs.current.forEach((el, index) => {
        if (el) {
          const rect = el.getBoundingClientRect();
          positions[index] = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            scale: 1,
          };
        }
      });

      setTrackedPositions(positions);
      setHasSnapshotted(true);
    }

    // Reset snapshot state when not converging
    if (!isConverging) {
      setHasSnapshotted(false);
      setTrackedPositions([]);
    }
  }, [isConverging, convergenceTarget, hasSnapshotted]);

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

      // Parallax depth: 0 (far) to 1 (near)
      const depth = Math.random();

      // Size: depth-correlated when parallax enabled, random otherwise
      const size = parallaxEnabled
        ? 2 + depth * 6  // 2-8px based on depth (near = larger)
        : 3 + Math.random() * 4;  // Original: 3-7px random

      // Duration: near particles move faster (shorter duration)
      // Parallax affects depth perception, pace affects overall speed
      const depthMultiplier = parallaxEnabled
        ? 1.5 - (depth * 0.9)  // 0.6x (near) to 1.5x (far)
        : 1;
      const duration = (config.baseDuration + Math.random() * config.durationVariance) * depthMultiplier * paceMultiplier;

      // Opacity: depth-correlated when parallax enabled
      const opacity = parallaxEnabled
        ? config.opacityMin + depth * opacityRange  // Near = more opaque
        : config.opacityMin + Math.random() * opacityRange;

      // Blur: far particles are blurry (depth of field effect)
      const blur = parallaxEnabled
        ? (1 - depth) * 2  // 0px (near) to 2px (far)
        : (Math.random() > 0.5 ? 1 : 0);

      return {
        id: i,
        left: `${Math.random() * 100}%`,
        duration,
        delay: Math.random() * 5, // Stagger start times (0-5s positive delay)
        drift: (Math.random() - 0.5) * config.driftRange * 2, // ±driftRange horizontal drift
        opacity,
        size,
        blur,
        angleX,
        angleY,
        orbitRadius,
        driftX,
        driftY,
        depth,
        // Stable random values for slowing/convergence animations
        wobbleX: (Math.random() - 0.5) * 12,
        wobbleY: (Math.random() - 0.5) * 12,
        convergenceDelay: Math.random() * 0.12,
        // Rotation: random direction and speed for organic feel
        rotationDirection: Math.random() > 0.5 ? 1 : -1,
        rotationSpeed: 0.5 + Math.random(),  // 0.5-1.5x
      };
    });
  }, [particleCount, mode, parallaxEnabled, paceMultiplier]);

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

  // Render converging particles with Framer Motion
  // Single continuous 3-second animation: slowing (0-40%) → convergence (40-100%)
  if (isConverging && convergenceTarget && hasSnapshotted && trackedPositions.length > 0) {
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;

    return (
      <div
        className="pointer-events-none fixed inset-0 z-10 overflow-hidden light:opacity-0"
        aria-hidden="true"
      >
        {particles.map((particle, index) => {
          const startPos = trackedPositions[index];
          if (!startPos) return null;

          // === PHASE 1: Slowing (0-40% of animation) ===
          // Calculate gravitational pull toward center
          const dxCenter = centerX - startPos.x;
          const dyCenter = centerY - startPos.y;
          const pullStrength = 0.20 + (particle.depth * 0.1);

          // Position after slowing phase (40% mark)
          const slowedX = startPos.x + (dxCenter * pullStrength) + particle.wobbleX;
          const slowedY = startPos.y + (dyCenter * pullStrength) + particle.wobbleY;

          // === PHASE 2: Convergence (40-100% of animation) ===
          // Calculate curved path from slowed position to target
          const toTargetX = convergenceTarget.x - slowedX;
          const toTargetY = convergenceTarget.y - slowedY;
          const distance = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);

          // Arc control point (perpendicular offset)
          const curveDirection = slowedX < convergenceTarget.x ? 1 : -1;
          const curveMagnitude = Math.max(distance * 0.12 * (0.5 + particle.depth * 0.5), 20);
          const perpX = distance > 0 ? (-toTargetY / distance) * curveMagnitude * curveDirection : 0;
          const perpY = distance > 0 ? (toTargetX / distance) * curveMagnitude * curveDirection : 0;

          // Arc midpoint (at 70% of the way, for the curve feel)
          const arcX = slowedX + toTargetX * 0.5 + perpX;
          const arcY = slowedY + toTargetY * 0.5 + perpY;

          // === TIMING ===
          const baseScale = particle.depth || 1;
          // Depth-dependent delay: closer particles arrive slightly earlier
          const depthDelay = (1 - (particle.depth || 0.5)) * 0.15;
          const totalDelay = particle.convergenceDelay + depthDelay;

          // === KEYFRAME VALUES ===
          // Position: start → slowed (with wobble) → arc → target
          const positionKeyframes = {
            left: [startPos.x, slowedX, arcX, convergenceTarget.x],
            top: [startPos.y, slowedY, arcY, convergenceTarget.y],
          };

          // Scale: breathing during slow, then shrink to target
          const scaleKeyframes = [
            baseScale,           // 0%: start
            baseScale * 0.96,    // 20%: breath in
            baseScale * 0.88,    // 35%: breath out
            baseScale * 0.6,     // 70%: shrinking
            0.15,                // 100%: tiny at target
          ];

          // Opacity: brighten during journey
          const opacityKeyframes = [
            particle.opacity,                    // 0%
            Math.min(particle.opacity * 1.1, 1), // 40%
            1,                                   // 70%
            1,                                   // 100%
          ];

          // Glow: subtle → intense
          const glowKeyframes = [
            `0 0 ${particle.size * 2}px ${particle.size}px rgba(255, 255, 255, 0.3)`,
            `0 0 ${particle.size * 2.5}px ${particle.size * 1.2}px rgba(255, 255, 255, 0.4)`,
            `0 0 ${particle.size * 3}px ${particle.size * 1.5}px rgba(255, 255, 255, 0.6)`,
            `0 0 ${particle.size * 4}px ${particle.size * 2}px rgba(255, 255, 255, 0.95)`,
          ];

          // Rotation: gentle wobble → accelerating spin → fast spin at arrival
          const rotationAmount = 180 * particle.rotationSpeed * particle.rotationDirection;
          const rotationKeyframes = [
            0,                           // 0%: start
            rotationAmount * 0.05,       // 40%: slight wobble during slow phase
            rotationAmount * 0.4,        // 70%: picking up speed
            rotationAmount,              // 100%: full rotation at arrival
          ];

          return (
            <motion.div
              key={particle.id}
              className="rounded-full bg-white fixed will-change-transform"
              initial={{
                left: startPos.x,
                top: startPos.y,
                x: '-50%',
                y: '-50%',
                scale: baseScale,
                opacity: particle.opacity,
                rotate: 0,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px rgba(255, 255, 255, 0.3)`,
              }}
              animate={{
                left: positionKeyframes.left,
                top: positionKeyframes.top,
                x: '-50%',
                y: '-50%',
                scale: scaleKeyframes,
                opacity: opacityKeyframes,
                rotate: rotationKeyframes,
                boxShadow: glowKeyframes,
              }}
              transition={{
                duration: 3,
                ease: [0.4, 0.0, 0.1, 1], // Smooth throughout
                delay: totalDelay,
                // Position: slow drift (0-40%), then accelerate to target
                left: { duration: 3, times: [0, 0.4, 0.7, 1], ease: [0.4, 0.0, 0.05, 1] },
                top: { duration: 3, times: [0, 0.4, 0.7, 1], ease: [0.4, 0.0, 0.05, 1] },
                // Scale: breathing then shrink
                scale: { duration: 3, times: [0, 0.2, 0.35, 0.7, 1], ease: [0.4, 0.0, 0.1, 1] },
                // Opacity: gradual brighten
                opacity: { duration: 3, times: [0, 0.4, 0.7, 1], ease: 'easeOut' },
                // Rotation: accelerates toward end (like being sucked in)
                rotate: { duration: 3, times: [0, 0.4, 0.7, 1], ease: [0.2, 0.0, 0.0, 1] },
                // Glow: intensifies toward end
                boxShadow: { duration: 3, times: [0, 0.4, 0.75, 1], ease: 'easeIn' },
              }}
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                filter: particle.blur > 0 ? `blur(${Math.max(0, particle.blur * 0.5)}px)` : 'none',
              }}
            />
          );
        })}
      </div>
    );
  }

  // Regular CSS animation mode
  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden light:opacity-0"
      aria-hidden="true"
    >
      {particles.map((particle, index) => (
        <div
          key={particle.id}
          ref={(el) => { particleRefs.current[index] = el; }}
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
            filter: particle.blur > 0 ? `blur(${particle.blur}px)` : 'none',
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
