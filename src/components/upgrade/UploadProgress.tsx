'use client';

import { motion } from 'framer-motion';
import type { UploadProgress as UploadProgressType } from '@/lib/sync';

interface UploadProgressProps {
  progress: UploadProgressType;
}

/**
 * UploadProgress - Visual progress indicator for data upload
 *
 * Shows a progress bar with percentage and current item count.
 */
export function UploadProgress({ progress }: UploadProgressProps) {
  const percentage = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="w-full max-w-xs mx-auto space-y-4">
      {/* Progress bar */}
      <div className="relative h-1 bg-tertiary/10 light:bg-tertiary-dark/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary light:bg-primary-dark rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Percentage */}
      <div className="flex items-center justify-center">
        <motion.span
          key={percentage}
          className="text-2xl font-medium text-primary light:text-primary-dark tabular-nums"
          initial={{ opacity: 0.5, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {percentage}%
        </motion.span>
      </div>

      {/* Status message */}
      <motion.p
        key={progress.message}
        className="text-sm text-tertiary light:text-tertiary-dark text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {progress.message}
      </motion.p>
    </div>
  );
}
