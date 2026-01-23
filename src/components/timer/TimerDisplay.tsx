'use client';

import { useRef, useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, prefersReducedMotion } from '@/lib/utils';
import { SPRING, ANIMATION, MICRO_ANIMATION } from '@/styles/design-tokens';

interface TimerDisplayProps {
  timeRemaining: number;
  isRunning: boolean;
  showCelebration: boolean;
  isOverflow?: boolean;
  overflowSeconds?: number;
  sessionDuration?: number; // Original session duration for overflow display
}

// Custom colon component with two stacked dots for better vertical alignment
const TimerColon = memo(function TimerColon({ isRunning }: { isRunning: boolean }) {
  const reducedMotion = prefersReducedMotion();

  return (
    <motion.span
      className="flex flex-col items-center justify-center gap-3 mx-2 sm:mx-3"
      animate={
        isRunning && !reducedMotion
          ? MICRO_ANIMATION.colonBlink
          : { opacity: 1 }
      }
    >
      <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-current" />
      <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-current" />
    </motion.span>
  );
});

// Animated digit component for smooth number transitions
const AnimatedDigit = memo(function AnimatedDigit({
  char,
  index,
}: {
  char: string;
  index: number;
}) {
  const reducedMotion = prefersReducedMotion();

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

export function TimerDisplay({
  timeRemaining,
  isRunning,
  showCelebration,
  isOverflow = false,
  overflowSeconds = 0,
  sessionDuration = 0,
}: TimerDisplayProps) {
  // In overflow: show total worked time (session duration + overflow)
  // Normal: show remaining time
  const displayTime = isOverflow ? (sessionDuration + overflowSeconds) : timeRemaining;
  const formattedTime = formatTime(displayTime);
  const prevIsRunning = useRef(isRunning);
  const [justStarted, setJustStarted] = useState(false);
  const reducedMotion = prefersReducedMotion();

  // Generate accessible time label
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const ariaTimeLabel = isOverflow
    ? `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''} worked`
    : minutes > 0
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

  // Split time into minutes and seconds for rendering with custom colon
  const [minutePart, secondPart] = formattedTime.split(':');
  const minuteChars = minutePart.split('');
  const secondChars = secondPart.split('');

  // Overflow pulse animation
  const overflowPulse = {
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      role="timer"
      aria-label={ariaTimeLabel}
      aria-live="off"
    >
      {/* Floating timer display (no circle) */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={
          reducedMotion
            ? {}
            : isOverflow && isRunning
              ? overflowPulse
              : justStarted
                ? { scale: [1, 1.03, 1] }
                : { scale: 1, opacity: 1 }
        }
        transition={{ type: 'spring', ...SPRING.gentle }}
      >
        {/* Time display with animated digits and custom colon */}
        <div
          className="timer-display font-mono font-semibold tabular-nums text-timer sm:text-timer-lg text-primary light:text-primary-light flex items-center justify-center"
        >
          {/* Minutes */}
          {minuteChars.map((char, index) => (
            <AnimatedDigit key={`m-${index}`} char={char} index={index} />
          ))}

          {/* Custom Colon */}
          <TimerColon isRunning={isRunning} />

          {/* Seconds */}
          {secondChars.map((char, index) => (
            <AnimatedDigit key={`s-${index}`} char={char} index={minuteChars.length + index} />
          ))}
        </div>
      </motion.div>

    </div>
  );
}
