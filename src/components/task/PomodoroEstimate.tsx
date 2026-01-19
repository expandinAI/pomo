'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';

interface PomodoroEstimateProps {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}

const ESTIMATE_OPTIONS = [1, 2, 3, 4] as const;

export function PomodoroEstimate({
  value,
  onChange,
  disabled = false,
}: PomodoroEstimateProps) {
  const handleClick = useCallback(
    (estimate: number) => {
      if (disabled) return;
      // Toggle off if clicking the same value
      onChange(value === estimate ? null : estimate);
    },
    [value, onChange, disabled]
  );

  return (
    <div
      className="flex items-center gap-0.5"
      role="group"
      aria-label="Estimated pomodoros"
    >
      <span className="text-xs text-tertiary light:text-tertiary-dark mr-1.5">~</span>
      {ESTIMATE_OPTIONS.map((estimate) => {
        const isSelected = value !== null && estimate <= value;
        const isExact = value === estimate;

        return (
          <motion.button
            key={estimate}
            type="button"
            onClick={() => handleClick(estimate)}
            disabled={disabled}
            className={`
              w-5 h-5 rounded-full flex items-center justify-center
              transition-colors duration-fast
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${
                isSelected
                  ? 'bg-accent/20 light:bg-accent-dark/20'
                  : 'bg-tertiary/10 light:bg-tertiary-dark/10 hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20'
              }
            `}
            whileHover={disabled ? {} : { scale: 1.1 }}
            whileTap={disabled ? {} : { scale: 0.9 }}
            transition={{ type: 'spring', ...SPRING.snappy }}
            aria-label={`${estimate} pomodoro${estimate > 1 ? 's' : ''}`}
            aria-pressed={isExact}
          >
            <span
              className={`
                w-2 h-2 rounded-full
                ${
                  isSelected
                    ? 'bg-accent light:bg-accent-dark'
                    : 'bg-tertiary/40 light:bg-tertiary-dark/40'
                }
              `}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
