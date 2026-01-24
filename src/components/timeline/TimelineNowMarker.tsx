'use client';

import { motion } from 'framer-motion';

interface TimelineNowMarkerProps {
  /** Current position on the timeline (0-100%) */
  position: number;
}

/**
 * TimelineNowMarker
 *
 * A subtle pulsing vertical line that shows the current time on the timeline.
 * The line spans the full track height with a "now" label at the top.
 * Only displayed when viewing today's timeline.
 */
export function TimelineNowMarker({ position }: TimelineNowMarkerProps) {
  // Don't render if position is out of bounds
  if (position < 0 || position > 100) return null;

  return (
    <motion.div
      className="absolute inset-y-0 z-10 flex flex-col items-center pointer-events-none"
      style={{ left: `${position}%` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* "now" label at top */}
      <motion.span
        className="text-[10px] text-tertiary light:text-tertiary-dark font-medium tracking-wide mb-1"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        now
      </motion.span>

      {/* The pulsing vertical line */}
      <motion.div
        className="w-px flex-1 bg-primary/40 light:bg-primary-dark/40"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}
