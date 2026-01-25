'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

interface ProgressRingProps {
  progress: number; // 0-1 (1=full, 0=empty)
  size?: number; // default: 200px
  strokeWidth?: number; // default: 6px
  isRunning?: boolean;
  isPaused?: boolean;
  isOverflow?: boolean;
  timeRemaining?: number; // for intensification logic
  children?: React.ReactNode; // countdown in center
  isBreak?: boolean;
  breakBreathingEnabled?: boolean;
}

// Intensification logic for final minutes
// NOTE: strokeWidth is intentionally NOT changed dynamically to prevent jump bugs
// when Framer Motion animates strokeDashoffset while strokeWidth changes
function getRingIntensity(timeRemaining: number): {
  opacity: number;
  glow: boolean;
  pulsing: boolean;
} {
  if (timeRemaining <= 60) {
    // Final minute: glow, pulsing
    return { opacity: 1, glow: true, pulsing: true };
  }
  if (timeRemaining <= 120) {
    // Final 2 minutes: glow, no pulse
    return { opacity: 1, glow: true, pulsing: false };
  }
  if (timeRemaining <= 300) {
    // Final 5 minutes
    return { opacity: 1, glow: false, pulsing: false };
  }
  // Default state
  return { opacity: 1, glow: false, pulsing: false };
}

export function ProgressRing({
  progress,
  size = 200,
  strokeWidth: baseStrokeWidth = 6,
  isRunning = false,
  isPaused = false,
  isOverflow = false,
  timeRemaining = Infinity,
  children,
  isBreak = false,
  breakBreathingEnabled = false,
}: ProgressRingProps) {
  const reducedMotion = useReducedMotion();

  // Get intensification state (no strokeWidth - kept constant to prevent jump bugs)
  const intensity = useMemo(
    () => (isOverflow
      ? { opacity: 1, glow: false, pulsing: true }
      : getRingIntensity(timeRemaining)),
    [timeRemaining, isOverflow]
  );

  // SVG calculations
  const center = size / 2;
  const radius = center - baseStrokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Progress ring depletes clockwise from 12 o'clock
  // Negative offset makes the gap grow clockwise (default SVG is counter-clockwise)
  const strokeDashoffset = -circumference * (1 - Math.max(0, Math.min(1, progress)));

  // Milestone positions (25%, 50%, 75%) as small dots
  const milestonePositions = useMemo(() => {
    const milestones = [0.25, 0.5, 0.75];
    return milestones.map((milestone) => {
      // Angle from 12 o'clock (top), clockwise
      // At 0 progress (full), we're at 12 o'clock = -90 degrees
      // At 0.25 (25% done), angle = -90 + 90 = 0 (3 o'clock position)
      const angle = -90 + milestone * 360;
      const rad = (angle * Math.PI) / 180;
      return {
        x: center + radius * Math.cos(rad),
        y: center + radius * Math.sin(rad),
        milestone,
      };
    });
  }, [center, radius]);

  // Animation variants
  // NOTE: No scale animation - scaling a rotated SVG causes visual jumps
  const pulseAnimation = {
    opacity: [0.9, 1, 0.9],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  const breatheAnimation = {
    opacity: [0.85, 1, 0.85],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  // Box Breathing animation for breaks: 4s expand → 4s hold → 4s contract → 4s hold = 16s cycle
  const breakBreathingAnimation = {
    scale: [1.00, 1.08, 1.08, 1.00, 1.00],
    transition: {
      duration: 16,
      repeat: Infinity,
      ease: 'easeInOut',
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  };

  // Determine container animation (for break breathing)
  const getContainerAnimation = () => {
    if (reducedMotion) return {};
    if (isBreak && breakBreathingEnabled && isRunning) return breakBreathingAnimation;
    return {};
  };

  // Determine animation state
  const getAnimation = () => {
    if (reducedMotion) return {};
    if (isPaused && !isOverflow) return breatheAnimation;
    if (intensity.pulsing && isRunning) return pulseAnimation;
    return {};
  };

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={getContainerAnimation()}
    >
      {/* SVG Ring */}
      <motion.svg
        width={size}
        height={size}
        className="absolute inset-0"
        style={{ transform: 'rotate(-90deg)' }} // Start from 12 o'clock
        animate={getAnimation()}
      >
        {/* Background ring (full circle, subtle) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={baseStrokeWidth}
          className="text-tertiary/10 light:text-tertiary-dark/10"
        />

        {/* Progress ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={baseStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{
            strokeDashoffset,
            opacity: intensity.opacity,
          }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 1, ease: 'linear' }
          }
          className={`text-primary light:text-primary-dark ${
            intensity.glow ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] light:drop-shadow-[0_0_8px_rgba(0,0,0,0.3)]' : ''
          }`}
          style={{
            filter: intensity.glow
              ? 'drop-shadow(0 0 6px currentColor)'
              : undefined,
          }}
        />

        {/* Milestone markers */}
        {milestonePositions.map(({ x, y, milestone }) => (
          <motion.circle
            key={milestone}
            cx={x}
            cy={y}
            r={2.5}
            fill="currentColor"
            className="text-tertiary/30 light:text-tertiary-dark/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: progress < milestone ? 0.5 : 0.2 }}
            transition={{ duration: 0.3 }}
            style={{ transform: 'rotate(90deg)', transformOrigin: `${center}px ${center}px` }}
          />
        ))}
      </motion.svg>

      {/* Center content (countdown) */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center"
        animate={
          reducedMotion
            ? {}
            : isPaused && !isOverflow
              ? breatheAnimation
              : {}
        }
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
