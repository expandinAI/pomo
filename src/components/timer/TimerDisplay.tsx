'use client';

import { useRef, useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, prefersReducedMotion } from '@/lib/utils';
import { SPRING, ANIMATION, MICRO_ANIMATION } from '@/styles/design-tokens';

interface TimerDisplayProps {
  timeRemaining: number;
  isRunning: boolean;
  showCelebration: boolean;
}

// Animated digit component for smooth number transitions
const AnimatedDigit = memo(function AnimatedDigit({
  char,
  index,
  isRunning,
}: {
  char: string;
  index: number;
  isRunning: boolean;
}) {
  const isColon = char === ':';
  const reducedMotion = prefersReducedMotion();

  // Animate the colon with a subtle blink when running
  if (isColon) {
    return (
      <motion.span
        className="inline-block"
        style={{ width: '0.3em' }}
        animate={
          isRunning && !reducedMotion
            ? MICRO_ANIMATION.colonBlink
            : { opacity: 1 }
        }
      >
        {char}
      </motion.span>
    );
  }

  return (
    <span className="inline-block overflow-hidden relative" style={{ width: '0.6em' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`${index}-${char}`}
          className="inline-block"
          initial={reducedMotion ? { opacity: 1 } : { y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { y: '-100%', opacity: 0 }}
          transition={{
            type: 'spring',
            ...SPRING.gentle,
            duration: ANIMATION.fast / 1000,
          }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
});

export function TimerDisplay({ timeRemaining, isRunning, showCelebration }: TimerDisplayProps) {
  const formattedTime = formatTime(timeRemaining);
  const prevIsRunning = useRef(isRunning);
  const [justStarted, setJustStarted] = useState(false);
  const reducedMotion = prefersReducedMotion();

  // Generate accessible time label
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const ariaTimeLabel = minutes > 0
    ? `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''} remaining`
    : `${seconds} second${seconds !== 1 ? 's' : ''} remaining`;

  // Detect when timer starts and trigger scale animation
  useEffect(() => {
    if (isRunning && !prevIsRunning.current) {
      setJustStarted(true);
      const timeout = setTimeout(() => setJustStarted(false), ANIMATION.normal);
      return () => clearTimeout(timeout);
    }
    prevIsRunning.current = isRunning;
  }, [isRunning]);

  // Split time into individual characters for animation
  const characters = formattedTime.split('');

  return (
    <div
      className="relative flex items-center justify-center"
      role="timer"
      aria-label={ariaTimeLabel}
      aria-live="off"
    >
      {/* Celebration glow effect */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute inset-0 rounded-full bg-accent/20 dark:bg-accent-dark/20 blur-3xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.6 }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Timer circle background with scale on start */}
      <motion.div
        className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full flex items-center justify-center bg-surface dark:bg-surface-dark shadow-large"
        animate={
          reducedMotion
            ? {}
            : justStarted
              ? { scale: [1, 1.03, 1] }
              : showCelebration
                ? { scale: [1, 1.02, 1] }
                : { scale: 1 }
        }
        transition={{ type: 'spring', ...SPRING.gentle }}
      >
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
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Time display with animated digits */}
        <motion.div
          className="timer-display text-timer sm:text-timer-lg font-light text-primary dark:text-primary-dark flex items-center justify-center"
          animate={showCelebration && !reducedMotion ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', ...SPRING.gentle }}
        >
          {characters.map((char, index) => (
            <AnimatedDigit key={index} char={char} index={index} isRunning={isRunning} />
          ))}
        </motion.div>

        {/* Well done message during celebration */}
        <AnimatePresence>
          {showCelebration && (
            <motion.p
              className="absolute bottom-8 sm:bottom-12 text-lg font-medium text-accent dark:text-accent-dark"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', ...SPRING.gentle, delay: 0.2 }}
            >
              Well done!
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
