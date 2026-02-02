'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';

interface TimelineHeaderProps {
  date: Date;
  isToday: boolean;
  canGoForward: boolean;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

/**
 * Format date for display
 */
function formatHeaderDate(date: Date, isToday: boolean): string {
  if (isToday) return 'Today';

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * TimelineHeader
 *
 * Navigation header for the timeline.
 * Shows current date with left/right navigation arrows.
 */
export function TimelineHeader({
  date,
  isToday,
  canGoForward,
  onPreviousDay,
  onNextDay,
  onToday,
}: TimelineHeaderProps) {
  const dateLabel = formatHeaderDate(date, isToday);

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Navigation arrows + date */}
      <div className="flex items-center gap-2">
        {/* Previous day */}
        <button
          onClick={onPreviousDay}
          className="w-11 h-11 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-6 h-6 sm:w-5 sm:h-5" />
        </button>

        {/* Date label with subtle fade */}
        <motion.button
          key={dateLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          onClick={onToday}
          disabled={isToday}
          className="min-w-[100px] text-lg font-medium text-primary light:text-primary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors disabled:cursor-default disabled:hover:text-primary disabled:light:hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg px-2"
          title={isToday ? '' : 'Go to today'}
        >
          {dateLabel}
        </motion.button>

        {/* Next day */}
        <button
          onClick={onNextDay}
          disabled={!canGoForward}
          className="w-11 h-11 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next day"
        >
          <ChevronRight className="w-6 h-6 sm:w-5 sm:h-5" />
        </button>
      </div>

    </div>
  );
}
