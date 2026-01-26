'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Check } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface DailyGoalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: number | null;
  todayCount: number;
  onGoalChange: (goal: number | null) => void;
}

const MIN_GOAL = 1;
const MAX_GOAL = 9;

/**
 * Daily Goal Overlay
 * Allows users to set a daily particle goal (1-9)
 *
 * Keyboard-first: Press 1-9 to set goal directly, 0 for no goal
 * Philosophy: Goal = Compass, not Whip
 */
export function DailyGoalOverlay({
  isOpen,
  onClose,
  currentGoal,
  todayCount,
  onGoalChange,
}: DailyGoalOverlayProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const noGoalButtonRef = useRef<HTMLButtonElement>(null);

  // Local state for preview (before saving)
  const [previewGoal, setPreviewGoal] = useState<number | null>(currentGoal);

  // Sync preview with current goal when opening
  useEffect(() => {
    if (isOpen) {
      setPreviewGoal(currentGoal ?? 4); // Default to 4 when no goal set
    }
  }, [isOpen, currentGoal]);

  // Focus trap
  useFocusTrap(modalRef, isOpen, { initialFocusRef: noGoalButtonRef });

  // Handle keyboard shortcuts within modal - capture phase + stopImmediatePropagation prevents Timer interference
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopImmediatePropagation();
        // Save and close
        onGoalChange(previewGoal);
        onClose();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setPreviewGoal(prev => {
          const current = prev ?? MIN_GOAL;
          return Math.min(MAX_GOAL, current + 1);
        });
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setPreviewGoal(prev => {
          const current = prev ?? MIN_GOAL;
          return Math.max(MIN_GOAL, current - 1);
        });
      } else if (e.key >= '1' && e.key <= '9') {
        // Direct number input (1-9)
        e.preventDefault();
        e.stopImmediatePropagation();
        setPreviewGoal(parseInt(e.key, 10));
      } else if (e.key === '0') {
        // 0 = No Goal
        e.preventDefault();
        e.stopImmediatePropagation();
        onGoalChange(null);
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose, onGoalChange, previewGoal]);

  const handleIncrement = () => {
    setPreviewGoal(prev => {
      const current = prev ?? MIN_GOAL;
      return Math.min(MAX_GOAL, current + 1);
    });
  };

  const handleDecrement = () => {
    setPreviewGoal(prev => {
      const current = prev ?? MIN_GOAL;
      return Math.max(MIN_GOAL, current - 1);
    });
  };

  const handleNoGoal = () => {
    onGoalChange(null);
    onClose();
  };

  const handleSave = () => {
    onGoalChange(previewGoal);
    onClose();
  };

  // For preview dots
  const displayGoal = previewGoal ?? 4;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: 'auto' as const }}
            exit={{ opacity: 0, pointerEvents: 'none' as const }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 light:bg-black/40"
            onClick={onClose}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', ...SPRING.gentle }}
              className="w-[90vw] max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="daily-goal-title"
                className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden"
              >
                {/* Content */}
                <div className="p-6 text-center">
                  <h2
                    id="daily-goal-title"
                    className="text-lg font-semibold text-primary light:text-primary-dark mb-6"
                  >
                    Daily Goal
                  </h2>

                  {/* Live Preview Dots */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    {Array.from({ length: displayGoal }).map((_, index) => {
                      const isFilled = index < todayCount;
                      return (
                        <motion.div
                          key={index}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: 'spring',
                            ...SPRING.gentle,
                            delay: index * 0.03,
                          }}
                        >
                          {isFilled ? (
                            <div className="w-5 h-5 rounded-full bg-primary light:bg-primary-dark flex items-center justify-center">
                              <Check className="w-3 h-3 text-background light:text-background-dark" strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-tertiary/50 light:border-tertiary-dark/50" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <button
                      onClick={handleDecrement}
                      disabled={displayGoal <= MIN_GOAL}
                      className="w-10 h-10 rounded-full bg-tertiary/10 light:bg-tertiary-dark/10 flex items-center justify-center text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Decrease goal"
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    <span className="text-2xl font-semibold text-primary light:text-primary-dark min-w-[80px]">
                      {displayGoal} / day
                    </span>

                    <button
                      onClick={handleIncrement}
                      disabled={displayGoal >= MAX_GOAL}
                      className="w-10 h-10 rounded-full bg-tertiary/10 light:bg-tertiary-dark/10 flex items-center justify-center text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Increase goal"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleSave}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-accent light:bg-accent-dark text-background light:text-background-light hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      Set Goal
                      <kbd className="ml-2 text-xs opacity-70">Enter</kbd>
                    </button>

                    <button
                      ref={noGoalButtonRef}
                      onClick={handleNoGoal}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      No Goal
                    </button>
                  </div>

                  {/* Hint */}
                  <p className="text-xs text-tertiary light:text-tertiary-dark mt-4">
                    Resets daily at midnight
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
