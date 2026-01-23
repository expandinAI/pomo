'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { KeyboardHint } from '@/components/ui/KeyboardHint';
import { SPRING, type SessionType, SESSION_LABELS } from '@/styles/design-tokens';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onComplete?: () => void;
  mode: SessionType;
  isOverflow?: boolean;
}

export function TimerControls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onReset,
  onComplete,
  mode,
  isOverflow = false,
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
        size="md"
      >
        <RotateCcw className="w-full h-full" />
      </IconButton>

      {/* Main action button */}
      <Button
        variant="primary"
        size="lg"
        onClick={isRunning ? onPause : onStart}
        className="group min-w-[140px] gap-2"
        aria-label={isRunning ? pauseLabel : startLabel}
      >
        {isRunning ? (
          <>
            <Pause className="w-5 h-5" aria-hidden="true" />
            Pause
            <KeyboardHint shortcut="Space" className="ml-1" />
          </>
        ) : (
          <>
            <Play className="w-5 h-5" aria-hidden="true" />
            {isPaused ? 'Resume' : mode === 'work' ? 'Start Focus' : 'Start Break'}
            <KeyboardHint shortcut="Space" className="ml-1" />
          </>
        )}
      </Button>

      {/* Done button - morphs out when in overflow */}
      <AnimatePresence>
        {isOverflow && isRunning && onComplete && (
          <motion.button
            onClick={onComplete}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-accent light:bg-accent-dark text-background light:text-background-light"
            aria-label="Complete session"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              boxShadow: [
                '0 0 0 0 rgba(255, 255, 255, 0.4)',
                '0 0 20px 4px rgba(255, 255, 255, 0.2)',
                '0 0 0 0 rgba(255, 255, 255, 0.4)',
              ],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              ...SPRING.gentle,
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Check className="w-5 h-5" strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Spacer for visual balance (only when not in overflow) */}
      {!(isOverflow && isRunning) && (
        <div className="w-10 h-10" aria-hidden="true" />
      )}
    </motion.div>
  );
}
