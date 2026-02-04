'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { type CompletedSession, formatSessionInfo, formatDuration, getTotalDuration } from '@/lib/session-storage';
import { useParticleOfWeek } from '@/hooks/useParticleOfWeek';
import { getParticleClasses } from '@/lib/intentions';
import type { IntentionAlignment } from '@/lib/db/types';

// Threshold for switching to compact view
const COMPACT_THRESHOLD = 9;

interface ParticleHoverInfo {
  displayText: string;
}

interface SessionCounterProps {
  count: number;
  sessionsUntilLong: number;
  onNextSlotPosition?: (position: { x: number; y: number } | null) => void;
  showGlow?: boolean;
  refreshPositionTrigger?: number;  // Increment to force position recalculation
  dailyGoal?: number | null;        // Daily goal (1-9), null = no goal
  todayCount?: number;              // Today's completed sessions
  onCounterClick?: () => void;      // Click handler for goal overlay
  todaySessions?: CompletedSession[];  // Today's sessions for hover info
  projectNameMap?: Map<string, string>;  // Map of projectId -> project name
  onParticleHover?: (info: ParticleHoverInfo | null) => void;  // Hover callback
  onParticleClick?: (sessionId: string) => void;  // Click handler for filled particles
  particleSelectMode?: boolean;  // Show particle numbers for keyboard selection
}

// Standard dot-based view (under threshold)
function StandardView({
  totalDots,
  filledCount,
  nextSlotIndex,
  showGlow,
  slotRefs,
  onParticleHover,
  getSessionForIndex,
  onParticleClick,
  getSessionIdForIndex,
  particleSelectMode,
  getParticleNumber,
  isPOTW,
  getSessionColorClass,
}: {
  totalDots: number;
  filledCount: number;
  nextSlotIndex: number;
  showGlow: boolean;
  slotRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onParticleHover?: (info: ParticleHoverInfo | null) => void;
  getSessionForIndex?: (index: number) => string | null;
  onParticleClick?: (sessionId: string) => void;
  getSessionIdForIndex?: (index: number) => string | null;
  particleSelectMode?: boolean;
  getParticleNumber?: (index: number) => number | null;
  isPOTW?: (sessionId: string) => boolean;
  getSessionColorClass?: (index: number) => string;
}) {
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback((index: number) => {
    if (!onParticleHover || !getSessionForIndex) return;
    // Clear any pending hide timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    const displayText = getSessionForIndex(index);
    if (displayText) {
      onParticleHover({ displayText });
    }
  }, [onParticleHover, getSessionForIndex]);

  const handleMouseLeave = useCallback(() => {
    if (!onParticleHover) return;
    // 100ms debounce to prevent flicker when moving between particles
    hoverTimeoutRef.current = setTimeout(() => {
      onParticleHover(null);
    }, 100);
  }, [onParticleHover]);

  const handleTouchStart = useCallback((index: number) => {
    if (!onParticleHover || !getSessionForIndex) return;
    const displayText = getSessionForIndex(index);
    if (displayText) {
      onParticleHover({ displayText });
      // Auto-hide after 3 seconds on touch
      setTimeout(() => {
        onParticleHover(null);
      }, 3000);
    }
  }, [onParticleHover, getSessionForIndex]);

  // Hover handlers for empty particles (show goal hint)
  const handleEmptyEnter = useCallback(() => {
    window.dispatchEvent(new CustomEvent('particle:ui-hint', {
      detail: { hint: 'Set Goal · G O' }
    }));
  }, []);

  const handleEmptyLeave = useCallback(() => {
    window.dispatchEvent(new CustomEvent('particle:ui-hint', { detail: { hint: null } }));
  }, []);

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
            onMouseEnter={isCompleted ? () => handleMouseEnter(index) : handleEmptyEnter}
            onMouseLeave={isCompleted ? handleMouseLeave : handleEmptyLeave}
            onTouchStart={isCompleted ? () => handleTouchStart(index) : undefined}
          >
            <AnimatePresence mode="wait">
              {isCompleted ? (
                (() => {
                  // Check if this particle is the POTW (gold styling)
                  const sessionId = getSessionIdForIndex ? getSessionIdForIndex(index) : null;
                  const isGold = sessionId && isPOTW ? isPOTW(sessionId) : false;

                  return (
                    <motion.div
                      key="completed"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        boxShadow: isGold
                          ? [
                              '0 0 4px rgba(255, 215, 0, 0.3)',
                              '0 0 12px rgba(255, 215, 0, 0.5)',
                              '0 0 4px rgba(255, 215, 0, 0.3)',
                            ]
                          : undefined,
                      }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        ...SPRING.bouncy,
                        boxShadow: isGold
                          ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                          : undefined,
                      }}
                      className={`w-5 h-5 rounded-full cursor-pointer relative flex items-center justify-center ${
                        isGold
                          ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500]'
                          : getSessionColorClass ? getSessionColorClass(index) : 'bg-primary light:bg-primary-dark'
                      }`}
                      style={isGold ? { boxShadow: '0 0 8px rgba(255, 215, 0, 0.4)' } : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onParticleClick && getSessionIdForIndex) {
                          const clickedSessionId = getSessionIdForIndex(index);
                          if (clickedSessionId) onParticleClick(clickedSessionId);
                        }
                      }}
                    >
                      {/* Particle number overlay in select mode */}
                      <AnimatePresence>
                        {particleSelectMode && getParticleNumber && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', ...SPRING.bouncy, delay: index * 0.03 }}
                            className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-background light:text-background-light select-none"
                          >
                            {getParticleNumber(index)}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })()
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
  onParticleHover,
  getCompactSummary,
  onParticleClick,
  getMostRecentSessionId,
  mostRecentColorClass,
}: {
  completedCount: number;
  showGlow: boolean;
  slotRef: (el: HTMLDivElement | null) => void;
  isSlotFilled: boolean;
  onParticleHover?: (info: ParticleHoverInfo | null) => void;
  getCompactSummary?: () => string | null;
  onParticleClick?: (sessionId: string) => void;
  getMostRecentSessionId?: () => string | null;
  mostRecentColorClass?: string;
}) {
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (!onParticleHover || !getCompactSummary) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    const displayText = getCompactSummary();
    if (displayText) {
      onParticleHover({ displayText });
    }
  }, [onParticleHover, getCompactSummary]);

  const handleMouseLeave = useCallback(() => {
    if (!onParticleHover) return;
    hoverTimeoutRef.current = setTimeout(() => {
      onParticleHover(null);
    }, 100);
  }, [onParticleHover]);

  const handleTouchStart = useCallback(() => {
    if (!onParticleHover || !getCompactSummary) return;
    const displayText = getCompactSummary();
    if (displayText) {
      onParticleHover({ displayText });
      setTimeout(() => {
        onParticleHover(null);
      }, 3000);
    }
  }, [onParticleHover, getCompactSummary]);

  return (
    <div
      className="flex items-center gap-3 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
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
      <div
        className={`w-5 h-5 rounded-full cursor-pointer ${mostRecentColorClass || 'bg-primary light:bg-primary-dark'}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onParticleClick && getMostRecentSessionId) {
            const sessionId = getMostRecentSessionId();
            if (sessionId) onParticleClick(sessionId);
          }
        }}
      />

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
              className="w-5 h-5 rounded-full bg-primary light:bg-primary-dark"
            />
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
    </div>
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
  todaySessions = [],
  projectNameMap,
  onParticleHover,
  onParticleClick,
  particleSelectMode = false,
}: SessionCounterProps) {
  // Particle of the Week (gold styling)
  const { isPOTW } = useParticleOfWeek();

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

  // Get session info for a given particle index (for hover display)
  // Sessions are stored newest-first, but displayed left-to-right (oldest-first)
  const getSessionForIndex = useCallback((index: number): string | null => {
    if (!todaySessions || todaySessions.length === 0) return null;
    // Reverse index: index 0 (leftmost) = oldest session
    const sessionIndex = todaySessions.length - 1 - index;
    if (sessionIndex < 0 || sessionIndex >= todaySessions.length) return null;
    const session = todaySessions[sessionIndex];
    const projectName = session.projectId && projectNameMap?.get(session.projectId);
    const baseInfo = formatSessionInfo(session, projectName || undefined);

    // Add alignment status to hover info
    const alignment = 'intentionAlignment' in session
      ? (session.intentionAlignment as IntentionAlignment | undefined)
      : undefined;
    if (alignment === 'aligned') {
      return `${baseInfo} · Aligned`;
    } else if (alignment === 'reactive') {
      return `${baseInfo} · Reactive`;
    }
    return baseInfo;
  }, [todaySessions, projectNameMap]);

  // Get session ID for a given particle index (for click handler)
  const getSessionIdForIndex = useCallback((index: number): string | null => {
    if (!todaySessions || todaySessions.length === 0) return null;
    // Reverse index: index 0 (leftmost) = oldest session
    const sessionIndex = todaySessions.length - 1 - index;
    if (sessionIndex < 0 || sessionIndex >= todaySessions.length) return null;
    return todaySessions[sessionIndex].id;
  }, [todaySessions]);

  // Get most recent session ID (for compact view click)
  const getMostRecentSessionId = useCallback((): string | null => {
    if (!todaySessions || todaySessions.length === 0) return null;
    return todaySessions[0].id;
  }, [todaySessions]);

  // Get particle number for a given index (1-9, only for filled particles)
  // Returns null if the particle shouldn't show a number
  const getParticleNumber = useCallback((index: number): number | null => {
    if (!todaySessions || todaySessions.length === 0) return null;
    // Particles are displayed oldest-first (left to right)
    // index 0 = oldest = particle 1, index 1 = particle 2, etc.
    // Only show numbers for filled particles
    if (index >= todaySessions.length) return null;
    const particleNumber = index + 1;
    // Only show 1-9 (single digit)
    if (particleNumber > 9) return null;
    return particleNumber;
  }, [todaySessions]);

  // Get compact view summary (for hover display)
  const getCompactSummary = useCallback((): string | null => {
    if (!todaySessions || todaySessions.length === 0) return null;
    const totalSeconds = getTotalDuration(todaySessions);
    const particleWord = todaySessions.length === 1 ? 'particle' : 'particles';
    return `${todaySessions.length} ${particleWord} · ${formatDuration(totalSeconds)} today`;
  }, [todaySessions]);

  // Get color class for a session at the given display index (for alignment-based coloring)
  const getSessionColorClass = useCallback((index: number): string => {
    if (!todaySessions || todaySessions.length === 0) {
      return 'bg-primary light:bg-primary-dark'; // Default white
    }
    // Reverse index: index 0 (leftmost) = oldest session
    const sessionIndex = todaySessions.length - 1 - index;
    if (sessionIndex < 0 || sessionIndex >= todaySessions.length) {
      return 'bg-primary light:bg-primary-dark';
    }
    const session = todaySessions[sessionIndex];
    // Check if session has intentionAlignment (DBSession type)
    const alignment = 'intentionAlignment' in session
      ? (session.intentionAlignment as IntentionAlignment | undefined)
      : undefined;
    return getParticleClasses(alignment);
  }, [todaySessions]);

  // Get color class for the most recent session (for compact view)
  const getMostRecentColorClass = useCallback((): string => {
    if (!todaySessions || todaySessions.length === 0) {
      return 'bg-primary light:bg-primary-dark';
    }
    const session = todaySessions[0]; // Most recent
    const alignment = 'intentionAlignment' in session
      ? (session.intentionAlignment as IntentionAlignment | undefined)
      : undefined;
    return getParticleClasses(alignment);
  }, [todaySessions]);

  return (
    <div
      className={`flex items-center gap-3 focus:outline-none focus-visible:ring-0 ${onCounterClick ? 'cursor-pointer' : ''}`}
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
              onParticleHover={onParticleHover}
              getCompactSummary={getCompactSummary}
              onParticleClick={onParticleClick}
              getMostRecentSessionId={getMostRecentSessionId}
              mostRecentColorClass={getMostRecentColorClass()}
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
              onParticleHover={onParticleHover}
              getSessionForIndex={getSessionForIndex}
              onParticleClick={onParticleClick}
              getSessionIdForIndex={getSessionIdForIndex}
              particleSelectMode={particleSelectMode}
              getParticleNumber={getParticleNumber}
              isPOTW={isPOTW}
              getSessionColorClass={getSessionColorClass}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
