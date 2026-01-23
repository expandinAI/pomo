'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';

// Threshold for switching to compact view
const COMPACT_THRESHOLD = 9;

interface SessionCounterProps {
  count: number;
  sessionsUntilLong: number;
  onNextSlotPosition?: (position: { x: number; y: number } | null) => void;
  showGlow?: boolean;
  refreshPositionTrigger?: number;  // Increment to force position recalculation
  dailyGoal?: number | null;        // Daily goal (1-9), null = no goal
  todayCount?: number;              // Today's completed sessions
  onCounterClick?: () => void;      // Click handler for goal overlay
}

// Standard dot-based view (under threshold)
function StandardView({
  totalDots,
  filledCount,
  nextSlotIndex,
  showGlow,
  slotRefs,
}: {
  totalDots: number;
  filledCount: number;
  nextSlotIndex: number;
  showGlow: boolean;
  slotRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  return (
    <>
      {Array.from({ length: totalDots }).map((_, index) => {
        const isCompleted = index < filledCount;
        // The next slot is the first empty one (at index = filledCount)
        const isNextSlot = index === nextSlotIndex;
        const shouldGlow = showGlow && isNextSlot;

        return (
          <motion.div
            key={index}
            ref={(el) => { slotRefs.current[index] = el; }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', ...SPRING.gentle, delay: index * 0.05 }}
            className={shouldGlow ? 'animate-slot-glow rounded-full' : ''}
          >
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div
                  key="completed"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', ...SPRING.bouncy }}
                  className="relative w-5 h-5 rounded-full bg-primary light:bg-primary-dark flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-background light:text-background-dark" strokeWidth={3} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="w-5 h-5 rounded-full border border-tertiary/50 light:border-tertiary-dark/50"
                />
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </>
  );
}

// Compact view (at or above threshold): "N ● ○"
function CompactView({
  completedCount,
  showGlow,
  slotRef,
  isSlotFilled,
}: {
  completedCount: number;
  showGlow: boolean;
  slotRef: (el: HTMLDivElement | null) => void;
  isSlotFilled: boolean;
}) {
  return (
    <>
      {/* Count number with animation */}
      <motion.span
        key={completedCount}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', ...SPRING.bouncy }}
        className="text-lg font-semibold text-primary light:text-primary-dark tabular-nums min-w-[1.5rem] text-right"
      >
        {completedCount}
      </motion.span>

      {/* Filled particle symbol */}
      <div className="w-5 h-5 rounded-full bg-primary light:bg-primary-dark flex items-center justify-center">
        <Check className="w-3 h-3 text-background light:text-background-dark" strokeWidth={3} />
      </div>

      {/* Active slot (target for convergence animation) */}
      <motion.div
        ref={slotRef}
        className={showGlow ? 'animate-slot-glow rounded-full' : ''}
      >
        <AnimatePresence mode="wait">
          {isSlotFilled ? (
            <motion.div
              key="filled"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0, x: -20 }}
              transition={{ type: 'spring', ...SPRING.bouncy }}
              className="w-5 h-5 rounded-full bg-primary light:bg-primary-dark flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-background light:text-background-dark" strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ scale: 0.5, opacity: 0, x: 10 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', ...SPRING.gentle }}
              className="w-5 h-5 rounded-full border border-tertiary/50 light:border-tertiary-dark/50"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

export function SessionCounter({
  count,
  sessionsUntilLong,
  onNextSlotPosition,
  showGlow = false,
  refreshPositionTrigger = 0,
  dailyGoal = null,
  todayCount = 0,
  onCounterClick,
}: SessionCounterProps) {
  // Goal mode: show daily goal progress
  // Non-goal mode: show cycle progress (sessions until long break)
  const showGoalMode = dailyGoal !== null;

  // Determine the actual count to use for compact threshold
  const actualCount = showGoalMode ? todayCount : count;

  // Should we show compact view?
  const showCompact = actualCount >= COMPACT_THRESHOLD;

  // Calculate filled count (completed particles)
  const filledCount = showGoalMode ? todayCount : (count % sessionsUntilLong);

  // Calculate total dots to display:
  // - In goal mode: show at least dailyGoal dots, but always have one empty slot for next session
  // - In cycle mode: show sessionsUntilLong dots
  // The key insight: we ALWAYS need one empty slot (unless in compact mode)
  const totalDots = showGoalMode
    ? Math.max(dailyGoal, filledCount + 1)  // +1 ensures there's always a next empty slot
    : sessionsUntilLong;

  // The next empty slot is always at index = filledCount (first empty from left)
  // This is the target for the convergence animation
  const nextSlotIndex = filledCount;

  // Refs for slot elements to calculate position
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const compactSlotRef = useRef<HTMLDivElement | null>(null);

  // Track if we're in "just completed" state (for compact view animation)
  const [isSlotFilled, setIsSlotFilled] = useState(false);
  const prevCountRef = useRef(actualCount);

  // Detect when a session completes in compact mode
  useEffect(() => {
    if (showCompact && actualCount > prevCountRef.current) {
      // Session just completed - fill the slot temporarily
      setIsSlotFilled(true);

      // After animation, clear the slot
      const timeout = setTimeout(() => {
        setIsSlotFilled(false);
      }, 400); // Match animation timing

      return () => clearTimeout(timeout);
    }
    prevCountRef.current = actualCount;
  }, [actualCount, showCompact]);

  // Get center position of the next empty slot
  const getNextSlotPosition = useCallback((): { x: number; y: number } | null => {
    if (showCompact) {
      // In compact mode, use the single slot ref
      const slotElement = compactSlotRef.current;
      if (!slotElement) return null;

      const rect = slotElement.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    // Standard mode - target the first empty slot
    if (nextSlotIndex >= totalDots) return null;

    const slotElement = slotRefs.current[nextSlotIndex];
    if (!slotElement) return null;

    const rect = slotElement.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, [nextSlotIndex, totalDots, showCompact]);

  // Report position when count changes, on mount, or when refresh is triggered
  useEffect(() => {
    if (onNextSlotPosition) {
      requestAnimationFrame(() => {
        const position = getNextSlotPosition();
        onNextSlotPosition(position);
      });
    }
  }, [count, todayCount, refreshPositionTrigger, onNextSlotPosition, getNextSlotPosition, showCompact]);

  // Update position on resize
  useEffect(() => {
    if (!onNextSlotPosition) return;

    const handleResize = () => {
      requestAnimationFrame(() => {
        const position = getNextSlotPosition();
        onNextSlotPosition(position);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onNextSlotPosition, getNextSlotPosition]);

  // Compact slot ref callback
  const setCompactSlotRef = useCallback((el: HTMLDivElement | null) => {
    compactSlotRef.current = el;
  }, []);

  return (
    <div
      className={`flex items-center gap-3 ${onCounterClick ? 'cursor-pointer' : ''}`}
      onClick={onCounterClick}
      onKeyDown={onCounterClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCounterClick();
        }
      } : undefined}
      role={onCounterClick ? 'button' : undefined}
      tabIndex={onCounterClick ? 0 : undefined}
      aria-label={onCounterClick ? (
        dailyGoal
          ? `Daily goal: ${todayCount} of ${dailyGoal} particles. Click to change goal.`
          : `${actualCount} particles completed. Click to set daily goal.`
      ) : undefined}
    >
      <AnimatePresence mode="wait">
        {showCompact ? (
          <motion.div
            key="compact"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', ...SPRING.gentle }}
            className="flex items-center gap-3"
          >
            <CompactView
              completedCount={actualCount}
              showGlow={showGlow}
              slotRef={setCompactSlotRef}
              isSlotFilled={isSlotFilled}
            />
          </motion.div>
        ) : (
          <motion.div
            key="standard"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', ...SPRING.gentle }}
            className="flex items-center gap-3"
          >
            <StandardView
              totalDots={totalDots}
              filledCount={filledCount}
              nextSlotIndex={nextSlotIndex}
              showGlow={showGlow}
              slotRefs={slotRefs}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
