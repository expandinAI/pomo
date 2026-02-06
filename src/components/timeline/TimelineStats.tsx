'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatDuration, formatTime24h } from '@/lib/session-storage';
import { SPRING } from '@/styles/design-tokens';
import { getSmartEmptyState } from '@/lib/coach/silent-intelligence';
import { useSessionStore } from '@/contexts/SessionContext';

interface TimelineStatsProps {
  particleCount: number;
  totalFocusSeconds: number;
  firstStart: Date | null;
  lastEnd: Date | null;
  averagePerDay?: number | null;
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
  averagePerDay,
}: TimelineStatsProps) {
  // Format active hours range
  const activeHours = firstStart && lastEnd
    ? `${formatTime24h(firstStart.toISOString())} - ${formatTime24h(lastEnd.toISOString())}`
    : null;

  // Smart empty state message
  const { sessions } = useSessionStore();
  const emptyMessage = useMemo(() => {
    const now = new Date();
    return getSmartEmptyState(sessions, now.getDay(), now.getHours());
  }, [sessions]);

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
          {emptyMessage}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-16 pt-6 min-h-[72px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Particle count */}
      <motion.div variants={itemVariants} className="flex sm:block items-center justify-between w-full sm:w-auto sm:text-center sm:min-w-[80px] px-2 sm:px-0">
        <p className="text-xs text-tertiary light:text-tertiary-dark sm:hidden">
          {particleCount === 1 ? 'particle' : 'particles'}
        </p>
        <p className="text-2xl font-light text-primary light:text-primary-dark tabular-nums">
          {particleCount}
        </p>
        <p className="text-xs text-tertiary light:text-tertiary-dark hidden sm:block">
          {particleCount === 1 ? 'particle' : 'particles'}
        </p>
      </motion.div>

      {/* Divider - hidden on mobile */}
      <motion.div
        variants={itemVariants}
        className="hidden sm:block w-px h-10 bg-tertiary/20 light:bg-tertiary-dark/20"
      />

      {/* Total focus time */}
      <motion.div variants={itemVariants} className="flex sm:block items-center justify-between w-full sm:w-auto sm:text-center sm:min-w-[100px] px-2 sm:px-0">
        <p className="text-xs text-tertiary light:text-tertiary-dark sm:hidden">
          focus time
        </p>
        <p className="text-2xl font-light text-primary light:text-primary-dark tabular-nums">
          {formatDuration(totalFocusSeconds)}
        </p>
        <p className="text-xs text-tertiary light:text-tertiary-dark hidden sm:block">
          focus time
        </p>
      </motion.div>

      {/* Divider - hidden on mobile */}
      <motion.div
        variants={itemVariants}
        className="hidden sm:block w-px h-10 bg-tertiary/20 light:bg-tertiary-dark/20"
      />

      {/* Active hours */}
      <motion.div variants={itemVariants} className="flex sm:block items-center justify-between w-full sm:w-auto sm:text-center sm:min-w-[140px] px-2 sm:px-0">
        <p className="text-xs text-tertiary light:text-tertiary-dark sm:hidden">
          active hours
        </p>
        <p className="text-2xl font-light text-primary light:text-primary-dark tabular-nums">
          {activeHours ?? '—'}
        </p>
        <p className="text-xs text-tertiary light:text-tertiary-dark hidden sm:block">
          active hours
        </p>
      </motion.div>

      {/* Average context */}
      {averagePerDay != null && (
        <>
          <motion.div
            variants={itemVariants}
            className="hidden sm:block w-px h-10 bg-tertiary/20 light:bg-tertiary-dark/20"
          />
          <motion.div variants={itemVariants} className="flex sm:block items-center justify-between w-full sm:w-auto sm:text-center px-2 sm:px-0">
            <p className="text-xs text-tertiary light:text-tertiary-dark sm:hidden">
              avg/day
            </p>
            <p className="text-2xl font-light text-primary light:text-primary-dark tabular-nums">
              ~{Number.isInteger(averagePerDay) ? averagePerDay : averagePerDay.toFixed(1)}
            </p>
            <p className="text-xs text-tertiary light:text-tertiary-dark hidden sm:block">
              avg/day
            </p>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
