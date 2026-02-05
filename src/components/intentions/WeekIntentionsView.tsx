'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, prefersReducedMotion } from '@/lib/utils';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useWeekIntentions } from '@/hooks/useWeekIntentions';
import { WeekIntentionRow } from './WeekIntentionRow';
import { WeekIntentionsSummary } from './WeekIntentionsSummary';

export function WeekIntentionsView() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const reduced = prefersReducedMotion();

  const {
    data,
    isLoading,
    weekOffset,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    refresh,
  } = useWeekIntentions();

  // Self-managed open/close via CustomEvent
  useEffect(() => {
    function handleOpen() {
      setIsOpen(true);
      setSelectedIndex(0);
    }
    window.addEventListener('particle:open-week-intentions', handleOpen);
    return () => window.removeEventListener('particle:open-week-intentions', handleOpen);
  }, []);

  // Refresh data when modal opens
  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

  // Reset selection to today when switching to current week
  useEffect(() => {
    if (data?.isCurrentWeek) {
      const todayIdx = data.days.findIndex(d => d.isToday);
      if (todayIdx >= 0) {
        setSelectedIndex(todayIdx);
      }
    } else {
      setSelectedIndex(0);
    }
  }, [data?.isCurrentWeek, data?.days]);

  // Focus management
  useFocusTrap(modalRef, isOpen, { initialFocusRef: modalRef });

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Keyboard handling - capture phase to isolate from timer
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          e.stopImmediatePropagation();
          handleClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          e.stopImmediatePropagation();
          goToPreviousWeek();
          break;
        case 'ArrowRight':
          e.preventDefault();
          e.stopImmediatePropagation();
          goToNextWeek();
          break;
        case 'ArrowDown':
        case 'j':
        case 'J':
          e.preventDefault();
          e.stopImmediatePropagation();
          setSelectedIndex(i => Math.min(i + 1, 6));
          break;
        case 'ArrowUp':
        case 'k':
        case 'K':
          e.preventDefault();
          e.stopImmediatePropagation();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case '0':
          e.preventDefault();
          e.stopImmediatePropagation();
          goToCurrentWeek();
          break;
        case 'Enter': {
          e.preventDefault();
          e.stopImmediatePropagation();
          const day = data?.days[selectedIndex];
          if (day?.isToday) {
            handleClose();
            window.dispatchEvent(new CustomEvent('particle:open-intentions'));
          }
          break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, handleClose, goToPreviousWeek, goToNextWeek, goToCurrentWeek, data, selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/20 light:bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-[90vw] max-w-lg max-h-[85vh] flex flex-col pointer-events-auto"
              initial={{ scale: reduced ? 1 : 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: reduced ? 1 : 0.96, opacity: 0 }}
              transition={reduced ? { duration: 0 } : { type: 'spring', ...SPRING.gentle }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={modalRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="week-intentions-title"
                className={cn(
                  'flex flex-col overflow-hidden focus:outline-none',
                  'bg-surface light:bg-surface-dark',
                  'rounded-2xl shadow-xl',
                  'border border-tertiary/10 light:border-tertiary-dark/10'
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-tertiary/10 light:border-tertiary-dark/10 flex-shrink-0">
                  <h2
                    id="week-intentions-title"
                    className="text-base font-semibold text-primary light:text-primary-dark"
                  >
                    Week Intentions
                  </h2>

                  {/* Week navigation */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousWeek}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="Previous week"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={goToCurrentWeek}
                      className={cn(
                        'text-xs font-mono px-2 py-1 rounded transition-colors',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                        weekOffset === 0
                          ? 'text-secondary light:text-secondary-dark'
                          : 'text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
                      )}
                    >
                      {data?.weekLabel ?? '…'}
                    </button>

                    <button
                      onClick={goToNextWeek}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="Next week"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Close button */}
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ml-1"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto px-3 py-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <span className="text-sm text-tertiary light:text-tertiary-dark">Loading…</span>
                      </div>
                    ) : data ? (
                      <div className="space-y-0.5">
                        {data.days.map((day, index) => (
                          <WeekIntentionRow
                            key={day.date}
                            day={day}
                            isSelected={index === selectedIndex}
                            onSelect={() => setSelectedIndex(index)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-5 py-3 border-t border-tertiary/10 light:border-tertiary-dark/10">
                  {data && (
                    <WeekIntentionsSummary
                      totalParticles={data.totalParticles}
                      intentionalPercentage={data.intentionalPercentage}
                      daysWithIntention={data.daysWithIntention}
                    />
                  )}
                  <div className="flex items-center justify-end mt-2">
                    <span className="text-[10px] text-tertiary/40 light:text-tertiary-dark/40 font-mono">
                      ↑/↓ ←/→
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
