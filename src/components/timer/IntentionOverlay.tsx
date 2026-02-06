'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Check } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useIntentionInsight } from '@/hooks/useIntentionInsight';

interface IntentionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentIntention: { text: string; particleGoal: number | null } | null;
  todayCount: number;
  deferredSuggestion?: { text: string; date: string; particleGoal?: number } | null;
  onSave: (text: string, particleGoal: number | null) => void;
  onClear: () => void;
}

const MIN_GOAL = 1;
const MAX_GOAL = 9;

/**
 * Intention Overlay
 * Unified interface for setting daily intention text + particle goal (1-9)
 *
 * Keyboard-first:
 * - Tab: Navigate between text input and goal selector
 * - 1-9: Set goal directly (when not in text input)
 * - 0: Clear goal (when not in text input)
 * - Enter: Save and close
 * - Esc: Cancel
 *
 * Philosophy: Intention = Compass, not Whip
 */
export function IntentionOverlay({
  isOpen,
  onClose,
  currentIntention,
  todayCount,
  deferredSuggestion,
  onSave,
  onClear,
}: IntentionOverlayProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const noIntentionButtonRef = useRef<HTMLButtonElement>(null);

  // Local state for preview (before saving)
  const [intentionText, setIntentionText] = useState('');
  const [previewGoal, setPreviewGoal] = useState<number | null>(null);

  // Morning context insight
  const { insight: morningInsight } = useIntentionInsight(intentionText);

  // Sync state with current intention when opening
  useEffect(() => {
    if (isOpen) {
      setIntentionText(currentIntention?.text ?? '');
      setPreviewGoal(currentIntention?.particleGoal ?? 4); // Default to 4 when no goal set
      // Focus the text input after a short delay for animation
      setTimeout(() => {
        textInputRef.current?.focus();
        textInputRef.current?.select();
      }, 100);
    }
  }, [isOpen, currentIntention]);

  // Focus trap - don't auto-focus a specific element since we handle it manually
  useFocusTrap(modalRef, isOpen, { initialFocusRef: modalRef });

  // Handle keyboard shortcuts within modal - capture phase + stopImmediatePropagation prevents Timer interference
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      const isInTextInput = e.target === textInputRef.current;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        // Enter saves (Shift+Enter for newline in text area)
        e.preventDefault();
        e.stopImmediatePropagation();
        handleSave();
      } else if (!isInTextInput) {
        // These shortcuts only work when not typing in the text input
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
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
          setPreviewGoal(null);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  const handleIncrement = () => {
    setPreviewGoal(prev => {
      const current = prev ?? MIN_GOAL;
      return Math.min(MAX_GOAL, current + 1);
    });
  };

  const handleDecrement = () => {
    setPreviewGoal(prev => {
      if (prev === null) return null;
      if (prev <= MIN_GOAL) return null; // Go to "no goal" state
      return prev - 1;
    });
  };

  const handleNoIntention = () => {
    onClear();
    onClose();
  };

  const handleSave = () => {
    const trimmedText = intentionText.trim();
    if (trimmedText) {
      onSave(trimmedText, previewGoal);
    } else {
      // If no text but there's a goal, still save it
      // If no text and no goal, clear
      if (previewGoal !== null) {
        onSave('', previewGoal);
      }
    }
    onClose();
  };

  // For preview dots
  const displayGoal = previewGoal ?? 0;

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
              className="w-[90vw] max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={modalRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="intention-title"
                className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden focus:outline-none"
              >
                {/* Content */}
                <div className="p-6">
                  <h2
                    id="intention-title"
                    className="text-lg font-semibold text-primary light:text-primary-dark mb-4 text-center"
                  >
                    What&apos;s your focus today?
                  </h2>

                  {/* Deferred Suggestion Banner */}
                  {deferredSuggestion && !currentIntention && (
                    <motion.button
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', ...SPRING.gentle }}
                      onClick={() => {
                        setIntentionText(deferredSuggestion.text);
                        if (deferredSuggestion.particleGoal) {
                          setPreviewGoal(deferredSuggestion.particleGoal);
                        }
                        setTimeout(() => {
                          textInputRef.current?.focus();
                          textInputRef.current?.setSelectionRange(
                            deferredSuggestion.text.length,
                            deferredSuggestion.text.length
                          );
                        }, 50);
                      }}
                      className="w-full mb-4 px-4 py-3 rounded-xl bg-tertiary/10 light:bg-tertiary-dark/10 text-left text-sm text-secondary light:text-secondary-dark hover:bg-tertiary/15 light:hover:bg-tertiary-dark/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span className="text-tertiary light:text-tertiary-dark text-xs">
                        Continue from yesterday?
                      </span>
                      <span className="block mt-0.5 text-primary light:text-primary-dark truncate">
                        &ldquo;{deferredSuggestion.text}&rdquo;
                      </span>
                    </motion.button>
                  )}

                  {/* Intention Text Input */}
                  <div className="mb-6">
                    <textarea
                      ref={textInputRef}
                      value={intentionText}
                      onChange={(e) => setIntentionText(e.target.value)}
                      placeholder="What matters most today?"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-tertiary/10 light:bg-tertiary-dark/10 text-primary light:text-primary-dark placeholder:text-tertiary light:placeholder:text-tertiary-dark border border-transparent focus:border-accent/50 focus:outline-none resize-none transition-colors"
                    />
                  </div>

                  {/* Morning Context */}
                  <AnimatePresence>
                    {morningInsight && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs text-tertiary light:text-tertiary-dark mb-4 px-1 -mt-4"
                      >
                        {morningInsight}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Particle Goal Section */}
                  <div className="mb-6">
                    <p className="text-xs text-tertiary light:text-tertiary-dark mb-3 text-center">
                      Daily particle goal (optional)
                    </p>

                    {/* Live Preview Dots */}
                    {displayGoal > 0 && (
                      <div className="flex items-center justify-center gap-2 mb-4">
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
                                <div className="w-4 h-4 rounded-full bg-primary light:bg-primary-dark flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-background light:text-background-dark" strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-tertiary/50 light:border-tertiary-dark/50" />
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {/* Stepper */}
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={handleDecrement}
                        className="w-9 h-9 rounded-full bg-tertiary/10 light:bg-tertiary-dark/10 flex items-center justify-center text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        aria-label="Decrease goal"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="text-lg font-semibold text-primary light:text-primary-dark min-w-[70px] text-center">
                        {displayGoal > 0 ? `${displayGoal} / day` : 'No goal'}
                      </span>

                      <button
                        onClick={handleIncrement}
                        disabled={displayGoal >= MAX_GOAL}
                        className="w-9 h-9 rounded-full bg-tertiary/10 light:bg-tertiary-dark/10 flex items-center justify-center text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Increase goal"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleSave}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-accent light:bg-accent-dark text-background light:text-background-light hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      Set Intention
                      <kbd className="ml-2 text-xs opacity-70">Enter</kbd>
                    </button>

                    <button
                      ref={noIntentionButtonRef}
                      onClick={handleNoIntention}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      No intention
                    </button>
                  </div>

                  {/* Hint */}
                  <p className="text-xs text-tertiary light:text-tertiary-dark mt-4 text-center">
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
