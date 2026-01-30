'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { MigrationProgress as MigrationProgressType } from '@/lib/db/migrations';

interface MigrationProgressProps {
  progress: MigrationProgressType;
}

/**
 * Migration progress display
 *
 * Shows:
 * - Pulsing Particle
 * - Title text
 * - Progress bar
 * - Current phase label
 */
export function MigrationProgress({ progress }: MigrationProgressProps) {
  const prefersReducedMotion = useReducedMotion();

  // Calculate progress percentage
  const percentage = (progress.completed / progress.total) * 100;

  // Particle animation - gentle breathing
  const particleAnimation = prefersReducedMotion
    ? { opacity: 1 }
    : {
        scale: [1, 1.15, 1],
        opacity: [0.7, 1, 0.7],
      };

  const particleTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <div className="flex flex-col items-center">
      {/* Particle */}
      <motion.div
        className="w-3 h-3 rounded-full bg-primary light:bg-primary-dark mb-12"
        animate={particleAnimation}
        transition={particleTransition}
      />

      {/* Title */}
      <motion.h1
        className="text-lg font-medium text-primary light:text-primary-dark mb-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        Optimizing your data
      </motion.h1>

      {/* Progress bar container */}
      <div className="w-64 h-1 bg-tertiary/20 light:bg-tertiary-dark/20 rounded-full overflow-hidden mb-6">
        {/* Progress bar fill */}
        <motion.div
          className="h-full bg-primary light:bg-primary-dark rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.4,
            ease: 'easeOut',
          }}
        />
      </div>

      {/* Phase label */}
      <motion.p
        key={progress.currentLabel}
        className="text-sm text-tertiary light:text-tertiary-dark text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {progress.currentLabel}
      </motion.p>
    </div>
  );
}
