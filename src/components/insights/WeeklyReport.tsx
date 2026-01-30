'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, X, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  calculateWeeklyStats,
  formatHoursDecimal,
  formatTrendMessage,
  type WeeklyStats,
} from '@/lib/session-analytics';
import { formatDuration, type CompletedSession } from '@/lib/session-storage';
import { WeeklyBarChart } from './WeeklyBarChart';
import { prefersReducedMotion } from '@/lib/utils';
import { useSessionStore } from '@/contexts/SessionContext';

interface WeeklyReportProps {
  refreshTrigger?: number;
}

/**
 * Weekly Focus Report - Premium analytics view
 * Linia-inspired: Data as art, positive reinforcement, calm aesthetic
 */
export function WeeklyReport({ refreshTrigger }: WeeklyReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<WeeklyStats | null>(null);

  const { sessions } = useSessionStore();
  const reducedMotion = prefersReducedMotion();

  // Focus management
  const modalRef = useRef<HTMLDivElement>(null);
  // Focus the modal container itself to avoid visible ring on close button
  useFocusTrap(modalRef, isOpen, { initialFocusRef: modalRef });

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Load stats when modal opens, refresh triggers, or sessions change
  useEffect(() => {
    if (isOpen) {
      setStats(calculateWeeklyStats(0, sessions as CompletedSession[]));
    }
  }, [isOpen, refreshTrigger, sessions]);

  // Close on Escape - capture phase + stopImmediatePropagation prevents Timer interference
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  // Listen for external open event (G S navigation)
  useEffect(() => {
    function handleOpenStats() {
      setIsOpen(true);
    }

    window.addEventListener('pomo:open-stats', handleOpenStats);
    return () => window.removeEventListener('pomo:open-stats', handleOpenStats);
  }, []);

  // Computed values
  const heroNumber = useMemo(() => {
    if (!stats) return '0';
    return formatHoursDecimal(stats.totalSeconds);
  }, [stats]);

  const trendMessage = useMemo(() => {
    if (!stats) return null;
    return formatTrendMessage(stats);
  }, [stats]);

  const bestDayMessage = useMemo(() => {
    if (!stats?.bestDay) return null;
    const hours = formatHoursDecimal(stats.bestDay.totalSeconds);
    // Full day name for display
    const dayNames: Record<string, string> = {
      Mon: 'Monday',
      Tue: 'Tuesday',
      Wed: 'Wednesday',
      Thu: 'Thursday',
      Fri: 'Friday',
      Sat: 'Saturday',
      Sun: 'Sunday',
    };
    const fullDayName = dayNames[stats.bestDay.dayName] || stats.bestDay.dayName;
    return `${fullDayName} (${hours}h)`;
  }, [stats]);

  const isEmpty = !stats || stats.totalSeconds === 0;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={toggleOpen}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-light hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        aria-label="Weekly focus report"
        aria-expanded={isOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <CalendarDays className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Modal Backdrop + Container */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, pointerEvents: 'auto' as const }}
              exit={{ opacity: 0, pointerEvents: 'none' as const }}
              transition={{ duration: reducedMotion ? 0 : 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 light:bg-black/40"
              onClick={() => setIsOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="weekly-report-title"
            >
              {/* Modal Content */}
              <motion.div
                initial={reducedMotion ? { opacity: 1 } : { scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { scale: 0.95, y: 20 }}
                transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.gentle }}
                className="w-[90vw] max-w-sm"
                onClick={e => e.stopPropagation()}
              >
                <div
                  ref={modalRef}
                  tabIndex={-1}
                  className="bg-surface light:bg-surface-light rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden focus:outline-none"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-tertiary/10 light:border-tertiary-dark/10">
                    <h2
                      id="weekly-report-title"
                      className="text-base font-semibold text-primary light:text-primary-light"
                    >
                      Your Week in Focus
                    </h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-light hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="Close report"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {isEmpty ? (
                      /* Empty State */
                      <motion.div
                        initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={reducedMotion ? { duration: 0 } : { delay: 0.1 }}
                        className="text-center py-8"
                      >
                        <CalendarDays className="w-12 h-12 mx-auto text-tertiary/40 light:text-tertiary-light/40 mb-4" />
                        <p className="text-secondary light:text-secondary-light font-medium">
                          No focus time this week yet
                        </p>
                        <p className="text-sm text-tertiary light:text-tertiary-light mt-2">
                          Complete a focus session to see your progress
                        </p>
                      </motion.div>
                    ) : (
                      /* Stats Display */
                      <>
                        {/* Hero Number */}
                        <motion.div
                          initial={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.gentle }}
                          className="text-center mb-8"
                          aria-label={`${heroNumber} hours of focus time this week`}
                        >
                          <p className="text-5xl font-bold text-accent light:text-accent-dark tracking-tight">
                            {heroNumber}
                          </p>
                          <p className="text-sm text-tertiary light:text-tertiary-light mt-1">
                            hours of deep work
                          </p>
                        </motion.div>

                        {/* Bar Chart */}
                        <motion.div
                          initial={reducedMotion ? {} : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={reducedMotion ? { duration: 0 } : { delay: 0.1 }}
                          className="mb-6"
                        >
                          <WeeklyBarChart
                            dailyStats={stats!.dailyStats}
                            bestDay={stats!.bestDay}
                          />
                        </motion.div>

                        {/* Insights */}
                        <motion.div
                          initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={reducedMotion ? { duration: 0 } : { delay: 0.2 }}
                          className="space-y-2"
                        >
                          {/* Best Day */}
                          {bestDayMessage && (
                            <div className="flex items-center gap-2 text-sm">
                              <Star className="w-4 h-4 text-accent light:text-accent-dark flex-shrink-0" />
                              <span className="text-secondary light:text-secondary-light">
                                Best day:{' '}
                                <span className="text-primary light:text-primary-light font-medium">
                                  {bestDayMessage}
                                </span>
                              </span>
                            </div>
                          )}

                          {/* Trend */}
                          {trendMessage && (
                            <div className="flex items-center gap-2 text-sm">
                              {stats!.trend === 'up' ? (
                                <TrendingUp className="w-4 h-4 text-accent light:text-accent-dark flex-shrink-0" />
                              ) : stats!.trend === 'down' ? (
                                <TrendingDown className="w-4 h-4 text-tertiary light:text-tertiary-light flex-shrink-0" />
                              ) : null}
                              <span className="text-secondary light:text-secondary-light">
                                {trendMessage}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
