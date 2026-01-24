'use client';

import { motion } from 'framer-motion';
import { formatDuration, formatTime24h } from '@/lib/session-storage';
import { SPRING } from '@/styles/design-tokens';

interface TimelineStatsProps {
  particleCount: number;
  totalFocusSeconds: number;
  firstStart: Date | null;
  lastEnd: Date | null;
}

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', ...SPRING.gentle },
  },
};

/**
 * TimelineStats
 *
 * Footer statistics for the timeline.
 * Shows particle count, total focus time, and active hours.
 */
export function TimelineStats({
  particleCount,
  totalFocusSeconds,
  firstStart,
  lastEnd,
}: TimelineStatsProps) {
  // Format active hours range
  const activeHours = firstStart && lastEnd
    ? `${formatTime24h(firstStart.toISOString())} - ${formatTime24h(lastEnd.toISOString())}`
    : null;

  // Empty state - breathing dot with inviting message
  if (particleCount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center justify-center pt-4 min-h-[72px]"
      >
        {/* Breathing dot */}
        <motion.div
          className="w-3 h-3 rounded-full bg-primary/40 light:bg-primary-dark/40 mb-3"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <p className="text-tertiary light:text-tertiary-dark text-xs">
          A blank canvas
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex items-center justify-center gap-16 pt-6 min-h-[72px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Particle count - fixed width */}
      <motion.div variants={itemVariants} className="text-center min-w-[80px]">
        <p className="text-2xl font-light text-primary light:text-primary-dark tabular-nums">
          {particleCount}
        </p>
        <p className="text-xs text-tertiary light:text-tertiary-dark">
          {particleCount === 1 ? 'particle' : 'particles'}
        </p>
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={itemVariants}
        className="w-px h-10 bg-tertiary/20 light:bg-tertiary-dark/20"
      />

      {/* Total focus time - fixed width for values like "1h 30m" */}
      <motion.div variants={itemVariants} className="text-center min-w-[100px]">
        <p className="text-2xl font-light text-primary light:text-primary-dark tabular-nums">
          {formatDuration(totalFocusSeconds)}
        </p>
        <p className="text-xs text-tertiary light:text-tertiary-dark">
          focus time
        </p>
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={itemVariants}
        className="w-px h-10 bg-tertiary/20 light:bg-tertiary-dark/20"
      />

      {/* Active hours - fixed width for "00:00 - 00:00" format, always shown */}
      <motion.div variants={itemVariants} className="text-center min-w-[140px]">
        <p className="text-2xl font-light text-primary light:text-primary-dark tabular-nums">
          {activeHours ?? '—'}
        </p>
        <p className="text-xs text-tertiary light:text-tertiary-dark">
          active hours
        </p>
      </motion.div>
    </motion.div>
  );
}
