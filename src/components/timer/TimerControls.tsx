'use client';

import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { SPRING, type SessionType, SESSION_LABELS } from '@/styles/design-tokens';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  mode: SessionType;
}

export function TimerControls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onReset,
  mode,
}: TimerControlsProps) {
  // Generate descriptive aria-labels
  const sessionLabel = SESSION_LABELS[mode].toLowerCase();
  const startLabel = isPaused ? 'Resume timer' : `Start ${sessionLabel}`;
  const pauseLabel = 'Pause timer';

  return (
    <motion.div
      className="flex items-center gap-4"
      role="group"
      aria-label="Timer controls"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', ...SPRING.gentle, delay: 0.1 }}
    >
      {/* Reset button */}
      <IconButton
        label="Reset timer to beginning"
        onClick={onReset}
        size="lg"
      >
        <RotateCcw className="w-full h-full" />
      </IconButton>

      {/* Main action button */}
      <Button
        variant="primary"
        size="lg"
        onClick={isRunning ? onPause : onStart}
        className="min-w-[120px] gap-2"
        aria-label={isRunning ? pauseLabel : startLabel}
      >
        {isRunning ? (
          <>
            <Pause className="w-5 h-5" aria-hidden="true" />
            Pause
          </>
        ) : (
          <>
            <Play className="w-5 h-5" aria-hidden="true" />
            {isPaused ? 'Resume' : 'Start'}
          </>
        )}
      </Button>

      {/* Spacer for visual balance */}
      <div className="w-12 h-12" aria-hidden="true" />
    </motion.div>
  );
}
