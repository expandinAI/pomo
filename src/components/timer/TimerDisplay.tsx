'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '@/lib/utils';
import { SPRING } from '@/styles/design-tokens';

interface TimerDisplayProps {
  timeRemaining: number;
  isRunning: boolean;
  showCelebration: boolean;
}

export function TimerDisplay({ timeRemaining, isRunning, showCelebration }: TimerDisplayProps) {
  const formattedTime = formatTime(timeRemaining);

  return (
    <div className="relative flex items-center justify-center">
      {/* Celebration glow effect */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute inset-0 rounded-full bg-accent/20 dark:bg-accent-dark/20 blur-3xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      {/* Timer circle background */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full flex items-center justify-center bg-surface dark:bg-surface-dark shadow-large">
        {/* Pulse effect when running */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-accent/30 dark:border-accent-dark/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [0.98, 1, 0.98],
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </AnimatePresence>

        {/* Time display */}
        <motion.span
          className="timer-display text-timer sm:text-timer-lg font-light text-primary dark:text-primary-dark"
          animate={showCelebration ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', ...SPRING.gentle }}
        >
          {formattedTime}
        </motion.span>
      </div>
    </div>
  );
}
