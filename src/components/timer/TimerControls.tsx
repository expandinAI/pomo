'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Check, FastForward } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { KeyboardHint } from '@/components/ui/KeyboardHint';
import { SPRING, type SessionType, SESSION_LABELS } from '@/styles/design-tokens';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onComplete?: () => void;
  onContinue?: () => void;
  mode: SessionType;
  isOverflow?: boolean;
}

export function TimerControls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onComplete,
  onContinue,
  mode,
  isOverflow = false,
}: TimerControlsProps) {
  // Generate descriptive aria-labels
  const sessionLabel = SESSION_LABELS[mode].toLowerCase();
  const startLabel = isPaused ? 'Resume timer' : `Start ${sessionLabel}`;
  const pauseLabel = 'Pause timer';
  const continueLabel = 'Continue in flow (save and start new session)';

  // In overflow mode, main button becomes "Continue" instead of "Pause"
  const showContinueButton = isOverflow && isRunning;

  return (
    <motion.div
      className="relative flex items-center justify-center"
      role="group"
      aria-label="Timer controls"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', ...SPRING.gentle, delay: 0.1 }}
    >
      {/* Main action button - always centered */}
      {/* No focus ring - Space is a global shortcut, not a direct button interaction */}
      <Button
        variant="primary"
        size="lg"
        onClick={showContinueButton ? onContinue : (isRunning ? onPause : onStart)}
        className="group min-w-[140px] gap-2 focus-visible:ring-0 focus-visible:ring-offset-0"
        aria-label={showContinueButton ? continueLabel : (isRunning ? pauseLabel : startLabel)}
      >
        {showContinueButton ? (
          <>
            <FastForward className="w-5 h-5" aria-hidden="true" />
            Continue
            <KeyboardHint shortcut="Space" className="ml-1" />
          </>
        ) : isRunning ? (
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

      {/* Done button - appears to the right, doesn't shift main button */}
      <AnimatePresence>
        {isOverflow && isRunning && onComplete && (
          <motion.button
            onClick={onComplete}
            className="absolute left-full ml-4 flex items-center justify-center w-10 h-10 rounded-full bg-accent light:bg-accent-dark text-background light:text-background-light"
            aria-label="Complete session (Enter or Space)"
            title="Complete session · ↵ Done · Space Continue"
            initial={{ opacity: 0, scale: 0.9, x: 8 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
              boxShadow: [
                '0 0 0 0 rgba(255, 255, 255, 0)',
                '0 0 12px 2px rgba(255, 255, 255, 0.15)',
                '0 0 0 0 rgba(255, 255, 255, 0)',
              ],
            }}
            exit={{ opacity: 0, scale: 0.9, x: 8 }}
            transition={{
              type: 'spring',
              ...SPRING.gentle,
              // Faster exit than entrance
              exit: { duration: 0.15 },
              boxShadow: {
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <Check className="w-5 h-5" strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
