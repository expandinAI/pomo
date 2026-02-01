'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useAIQuota, getQuotaPercentage } from '@/lib/ai-quota';

interface QuotaRingProps {
  /** Ring size in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * QuotaRing - Circular indicator for AI Coach quota usage
 *
 * A minimal ring that fills up as quota is used.
 * Hover to see exact numbers in a tooltip.
 *
 * States:
 * - Normal: Primary color
 * - Warning (90%+): Amber
 * - Limit reached: Red with pulse
 */
export function QuotaRing({
  size = 18,
  strokeWidth = 2,
  className = '',
}: QuotaRingProps) {
  const reducedMotion = useReducedMotion();
  const { quota, isLoading } = useAIQuota();

  // SVG calculations
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Get fill percentage (0-100)
  const percentage = quota ? getQuotaPercentage(quota) : 0;

  // Ring fills clockwise from 12 o'clock as usage increases
  const strokeDashoffset = useMemo(() => {
    const fillRatio = percentage / 100;
    // Negative offset makes the fill grow clockwise
    return -circumference * (1 - fillRatio);
  }, [percentage, circumference]);

  // Determine visual state
  const isWarning = quota?.isWarning ?? false;
  const isLimitReached = quota?.isLimitReached ?? false;

  // Color classes based on state
  const getStrokeColor = () => {
    if (isLimitReached) return 'text-red-500';
    if (isWarning) return 'text-amber-500';
    return 'text-primary light:text-primary-dark';
  };

  // Tooltip text
  const tooltipText = quota
    ? `${quota.used} of ${quota.limit} used`
    : 'Loading...';

  // Pulse animation for warning/limit states
  const pulseAnimation = {
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <Loader2
        className={`animate-spin text-tertiary light:text-tertiary-dark ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // No quota available (non-Flow user)
  if (!quota) {
    return null;
  }

  return (
    <div
      className={`relative cursor-default ${className}`}
      title={tooltipText}
      aria-label={tooltipText}
    >
      <motion.svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }} // Start from 12 o'clock
        animate={
          reducedMotion
            ? {}
            : isLimitReached || isWarning
              ? pulseAnimation
              : {}
        }
      >
        {/* Background ring (full circle, subtle) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-tertiary/20 light:text-tertiary-dark/20"
        />

        {/* Progress ring (fills as usage increases) */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.5, ease: 'easeOut' }
          }
          className={getStrokeColor()}
        />
      </motion.svg>
    </div>
  );
}
