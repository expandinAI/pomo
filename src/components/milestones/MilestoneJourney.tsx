'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  type MilestoneDefinition,
  type EarnedMilestone,
  MILESTONES,
  loadMilestones,
  unlockAllMilestones,
  clearMilestones,
} from '@/lib/milestones';
import { MilestonePoint } from './MilestonePoint';

interface MilestoneJourneyProps {
  /** Whether the journey modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when user wants to relive a milestone */
  onRelive: (milestone: MilestoneDefinition) => void;
  /** Callback to refresh milestones in parent context */
  onRefresh?: () => void;
}

/**
 * MilestoneJourney
 *
 * "The Journey" - A timeline view of all milestones.
 * Shows earned milestones as filled dots, unearned as empty.
 * Users can click on earned milestones to relive the moment.
 *
 * Keyboard navigation:
 * - ↑/↓ or J/K: Navigate milestones
 * - Enter: Relive selected milestone
 * - Escape: Close modal
 */
export function MilestoneJourney({ isOpen, onClose, onRelive, onRefresh }: MilestoneJourneyProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Load earned milestones
  const [earnedMilestones, setEarnedMilestones] = useState<EarnedMilestone[]>([]);

  // Focused milestone index for keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // Build milestone list with earned status
  // Sort: earned milestones first (oldest → newest), then unearned
  const milestoneList = useMemo(() => {
    const earnedMap = new Map(earnedMilestones.map((m) => [m.id, m]));

    const allMilestones = MILESTONES.map((milestone) => ({
      milestone,
      earned: earnedMap.get(milestone.id) ?? null,
    }));

    // Separate earned and unearned
    const earned = allMilestones.filter((m) => m.earned !== null);
    const unearned = allMilestones.filter((m) => m.earned === null);

    // Sort earned by date (oldest first)
    earned.sort((a, b) => {
      const dateA = new Date(a.earned!.earnedAt).getTime();
      const dateB = new Date(b.earned!.earnedAt).getTime();
      return dateA - dateB;
    });

    // Combine: earned first (oldest → newest), then unearned
    return [...earned, ...unearned];
  }, [earnedMilestones]);

  // Get only earned milestones for navigation
  const earnedList = useMemo(() => {
    return milestoneList.filter((item) => item.earned !== null);
  }, [milestoneList]);

  // Check if this is the last item
  const isLastIndex = (index: number) => index === milestoneList.length - 1;

  // Focus trap
  useFocusTrap(modalRef, isOpen, { initialFocusRef: closeButtonRef });

  // Load milestones when opening
  useEffect(() => {
    if (isOpen) {
      const earned = loadMilestones();
      setEarnedMilestones(earned);
      setFocusedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(milestoneList.length - 1, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          const focused = milestoneList[focusedIndex];
          if (focused?.earned) {
            onRelive(focused.milestone);
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onRelive, focusedIndex, milestoneList]);

  // Scroll focused milestone into view
  useEffect(() => {
    if (!isOpen) return;
    const element = document.querySelector(`[data-milestone-index="${focusedIndex}"]`);
    element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [isOpen, focusedIndex]);

  const handleRelive = useCallback(
    (milestone: MilestoneDefinition) => {
      onRelive(milestone);
    },
    [onRelive]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 light:bg-black/40"
            onClick={onClose}
          />

          {/* Modal - using flex centering instead of transform to avoid animation conflict */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="journey-title"
            className="fixed inset-4 sm:inset-0 sm:m-auto sm:w-full sm:max-w-md sm:max-h-[80vh] sm:h-fit z-50 flex flex-col bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', ...SPRING.gentle }}
          >
            {/* Header - clean, no icon for consistency with other modals */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-tertiary/10 light:border-tertiary-dark/10">
              <div>
                <h2
                  id="journey-title"
                  className="text-base font-semibold text-primary light:text-primary-dark leading-tight"
                >
                  Milestones
                </h2>
                <p className="text-xs text-tertiary light:text-tertiary-dark mt-0.5">
                  Your journey of focus
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Demo button - for testing all milestones */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={() => {
                      const allUnlocked = earnedList.length === MILESTONES.length;
                      if (allUnlocked) {
                        // Reset: clear storage and state
                        clearMilestones();
                        setEarnedMilestones([]);
                        onRefresh?.();
                      } else {
                        // Unlock all: create earned data directly
                        const now = new Date();
                        const newEarned: EarnedMilestone[] = MILESTONES.map((m, index) => {
                          const daysAgo = Math.floor((MILESTONES.length - index) * 30);
                          const earnedDate = new Date(now);
                          earnedDate.setDate(earnedDate.getDate() - daysAgo);
                          return {
                            id: m.id,
                            earnedAt: earnedDate.toISOString(),
                            particleCount: (index + 1) * 100,
                            totalHours: (index + 1) * 10,
                          };
                        });
                        // Save to storage and update state directly
                        unlockAllMilestones(MILESTONES.map(m => m.id));
                        setEarnedMilestones(newEarned);
                        // Also refresh parent context so relive works
                        onRefresh?.();
                      }
                    }}
                    className="px-2.5 py-1 text-xs text-tertiary light:text-tertiary-dark hover:text-primary light:hover:text-primary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors rounded-lg border border-tertiary/20 light:border-tertiary-dark/20"
                  >
                    {earnedList.length === MILESTONES.length ? 'Reset' : 'Demo'}
                  </button>
                )}
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="p-2 -mr-1 text-tertiary light:text-tertiary-dark hover:text-primary light:hover:text-primary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Close milestones"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Milestone list - no horizontal padding, items handle their own */}
            <div className="flex-1 overflow-y-auto py-2">
              {earnedList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-tertiary/5 light:bg-tertiary-dark/5 flex items-center justify-center mb-5">
                    <Award className="w-8 h-8 text-tertiary/30 light:text-tertiary-dark/30" />
                  </div>
                  <p className="text-primary/80 light:text-primary-dark/80 font-medium mb-2">
                    Your journey begins
                  </p>
                  <p className="text-sm text-tertiary light:text-tertiary-dark max-w-[240px]">
                    Complete focus sessions to earn milestones and build your legacy
                  </p>
                </div>
              ) : (
                <div>
                  {milestoneList.map((item, index) => {
                    // Check if this is the first unearned milestone (separator point)
                    const isFirstUnearned = item.earned === null &&
                      (index === 0 || milestoneList[index - 1].earned !== null);

                    return (
                      <div key={item.milestone.id}>
                        {/* Separator between earned and unearned */}
                        {isFirstUnearned && earnedList.length > 0 && (
                          <div className="flex items-center gap-3 px-5 py-4 my-2">
                            <div className="flex-1 h-px bg-tertiary/20 light:bg-tertiary-dark/20" />
                            <span className="text-xs text-tertiary/50 light:text-tertiary-dark/50 whitespace-nowrap">
                              ahead of you
                            </span>
                            <div className="flex-1 h-px bg-tertiary/20 light:bg-tertiary-dark/20" />
                          </div>
                        )}
                        <div data-milestone-index={index}>
                          <MilestonePoint
                            milestone={item.milestone}
                            earned={item.earned}
                            isFocused={index === focusedIndex}
                            isLast={isLastIndex(index)}
                            onRelive={() => handleRelive(item.milestone)}
                            index={index}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with progress */}
            <div className="px-5 py-4 border-t border-tertiary/10 light:border-tertiary-dark/10">
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-1 bg-tertiary/10 light:bg-tertiary-dark/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 light:bg-primary-dark/60 rounded-full transition-all duration-500"
                    style={{ width: `${(earnedList.length / MILESTONES.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-tertiary light:text-tertiary-dark tabular-nums min-w-[3.5rem] text-right">
                  {earnedList.length} / {MILESTONES.length}
                </span>
              </div>

              {/* Keyboard hints */}
              {earnedList.length > 0 && (
                <div className="flex justify-center gap-4 text-[11px] text-tertiary/60 light:text-tertiary-dark/60">
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-tertiary/8 light:bg-tertiary-dark/8 rounded mr-1">↑↓</kbd>
                    navigate
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-tertiary/8 light:bg-tertiary-dark/8 rounded mr-1">↵</kbd>
                    relive
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
