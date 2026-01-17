'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Circle, CircleCheck } from 'lucide-react';
import { LONG_BREAK_INTERVAL, SPRING } from '@/styles/design-tokens';

interface SessionCounterProps {
  count: number;
}

export function SessionCounter({ count }: SessionCounterProps) {
  // Show up to LONG_BREAK_INTERVAL indicators, then reset
  const displayCount = count % LONG_BREAK_INTERVAL;
  const completedSets = Math.floor(count / LONG_BREAK_INTERVAL);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Pomodoro indicators */}
      <div className="flex items-center gap-2">
        {Array.from({ length: LONG_BREAK_INTERVAL }).map((_, index) => {
          const isCompleted = index < displayCount;
          return (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', ...SPRING.gentle, delay: index * 0.05 }}
            >
              <AnimatePresence mode="wait">
                {isCompleted ? (
                  <motion.div
                    key="completed"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', ...SPRING.bouncy }}
                  >
                    <CircleCheck className="w-5 h-5 text-accent dark:text-accent-dark" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Circle className="w-5 h-5 text-tertiary dark:text-tertiary-dark" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Total count */}
      <p className="text-sm text-secondary dark:text-secondary-dark">
        {count === 0 ? (
          'Start your first focus session'
        ) : (
          <>
            <span className="font-medium text-primary dark:text-primary-dark">{count}</span>
            {count === 1 ? ' session' : ' sessions'} completed
            {completedSets > 0 && (
              <span className="text-tertiary dark:text-tertiary-dark">
                {' '}
                ({completedSets} {completedSets === 1 ? 'set' : 'sets'})
              </span>
            )}
          </>
        )}
      </p>
    </div>
  );
}
