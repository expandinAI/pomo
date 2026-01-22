'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type SessionType as SessionTypeValue, SESSION_LABELS, TIMER_DURATIONS } from '@/styles/design-tokens';

interface SessionTypeProps {
  currentMode: SessionTypeValue;
  onModeChange: (mode: SessionTypeValue) => void;
  disabled: boolean;
}

const modes: SessionTypeValue[] = ['work', 'shortBreak', 'longBreak'];

// Generate accessible labels with duration info
function getSessionAriaLabel(mode: SessionTypeValue): string {
  const minutes = Math.floor(TIMER_DURATIONS[mode] / 60);
  return `${SESSION_LABELS[mode]}, ${minutes} minutes`;
}

export function SessionType({ currentMode, onModeChange, disabled }: SessionTypeProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Session type"
      className="relative z-20 flex items-center gap-1 p-1 rounded-xl bg-surface/40 light:bg-surface-dark/40 backdrop-blur-sm border border-white/[0.08] light:border-black/[0.05] shadow-lg"
    >
      {modes.map((mode) => (
        <button
          key={mode}
          role="radio"
          aria-checked={currentMode === mode}
          aria-label={getSessionAriaLabel(mode)}
          onClick={() => onModeChange(mode)}
          disabled={disabled}
          className={cn(
            'relative px-4 py-2 text-sm font-medium rounded-md transition-colors duration-normal',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            currentMode === mode
              ? 'text-primary light:text-primary-dark'
              : 'text-secondary light:text-secondary-dark hover:text-primary light:hover:text-primary-dark'
          )}
        >
          {currentMode === mode && (
            <motion.div
              layoutId="activeSessionType"
              className="absolute inset-0 bg-tertiary/20 light:bg-tertiary-dark/20 rounded-md"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              aria-hidden="true"
            />
          )}
          <span className="relative z-10">{SESSION_LABELS[mode]}</span>
        </button>
      ))}
    </div>
  );
}
