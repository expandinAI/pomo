'use client';

import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';

interface RhythmDotsProps {
  /** Ratio of actual/estimated (1.0 = perfect match) */
  ratio: number;
  /** Number of dots to display (default: 12) */
  maxDots?: number;
}

/**
 * Visual representation of rhythm using dots
 * - Outline dots = estimated time
 * - Filled dots = actual time
 *
 * Example:
 * ratio = 1.2 (20% more time): ○○○○○●●●●●●● (5 outline, 7 filled)
 * ratio = 0.8 (20% less time): ●●●●●●●○○○○○ (7 filled, 5 outline)
 * ratio = 1.0 (exact match): ●●●●●●●●●●●● (all filled)
 */
export function RhythmDots({ ratio, maxDots = 12 }: RhythmDotsProps) {
  // Calculate how many dots are "estimated" vs "actual"
  // At ratio 1.0, all dots are filled
  // At ratio > 1.0, fewer outline dots (took more time than planned)
  // At ratio < 1.0, more outline dots (took less time than planned)

  // Normalize ratio to determine split
  // We visualize using a baseline of half the dots as "estimated"
  const baseDots = Math.floor(maxDots / 2);

  let estimatedDots: number;
  let actualDots: number;

  if (ratio >= 1) {
    // Took more time than planned (flow)
    // Show more filled dots, fewer outline dots
    estimatedDots = Math.max(2, Math.floor(baseDots / ratio));
    actualDots = maxDots - estimatedDots;
  } else {
    // Took less time than planned (structure)
    // Show more outline dots, fewer filled dots
    actualDots = Math.max(2, Math.floor(baseDots * ratio));
    estimatedDots = maxDots - actualDots;
  }

  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`Rhythm visualization: ${Math.round(ratio * 100)}% of estimated time`}>
      {/* Estimated dots (outline) */}
      {Array.from({ length: estimatedDots }).map((_, i) => (
        <motion.div
          key={`estimated-${i}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            ...SPRING.default,
            delay: i * 0.03,
          }}
          className="w-2 h-2 rounded-full border border-tertiary/40 light:border-tertiary-dark/40"
          aria-hidden="true"
        />
      ))}

      {/* Actual dots (filled) */}
      {Array.from({ length: actualDots }).map((_, i) => (
        <motion.div
          key={`actual-${i}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            ...SPRING.default,
            delay: (estimatedDots + i) * 0.03,
          }}
          className="w-2 h-2 rounded-full bg-primary light:bg-primary-dark"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
