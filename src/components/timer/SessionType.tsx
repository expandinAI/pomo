'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type SessionType as SessionTypeValue, SESSION_LABELS } from '@/styles/design-tokens';

interface SessionTypeProps {
  currentMode: SessionTypeValue;
  onModeChange: (mode: SessionTypeValue) => void;
  disabled: boolean;
}

const modes: SessionTypeValue[] = ['work', 'shortBreak', 'longBreak'];

export function SessionType({ currentMode, onModeChange, disabled }: SessionTypeProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-surface dark:bg-surface-dark shadow-soft">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          disabled={disabled}
          className={cn(
            'relative px-4 py-2 text-sm font-medium rounded-md transition-colors duration-normal',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed',
            currentMode === mode
              ? 'text-primary dark:text-primary-dark'
              : 'text-secondary dark:text-secondary-dark hover:text-primary dark:hover:text-primary-dark'
          )}
        >
          {currentMode === mode && (
            <motion.div
              layoutId="activeSessionType"
              className="absolute inset-0 bg-tertiary/20 dark:bg-tertiary-dark/20 rounded-md"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10">{SESSION_LABELS[mode]}</span>
        </button>
      ))}
    </div>
  );
}
