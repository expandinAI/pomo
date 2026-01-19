'use client';

import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { prefersReducedMotion } from '@/lib/utils';

export type TimeRange = 'day' | 'week' | 'month' | 'all';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'day', label: 'D' },
  { value: 'week', label: 'W' },
  { value: 'month', label: 'M' },
  { value: 'all', label: 'All' },
];

/**
 * Time range selector tabs for filtering statistics
 * Tabs: [D] [W] [M] [All]
 */
export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const reducedMotion = prefersReducedMotion();

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-tertiary/5 light:bg-tertiary-dark/5">
      {RANGE_OPTIONS.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`relative px-2.5 py-1 text-xs font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isActive
                ? 'text-primary light:text-primary-dark'
                : 'text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark'
            }`}
            aria-pressed={isActive}
            aria-label={`Filter by ${option.value === 'day' ? 'today' : option.value === 'week' ? 'this week' : option.value === 'month' ? 'this month' : 'all time'}`}
          >
            {isActive && (
              <motion.div
                layoutId="time-range-indicator"
                className="absolute inset-0 bg-accent/10 light:bg-accent-dark/10 rounded-md"
                transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.gentle }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
