'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Clock, Flame } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { prefersReducedMotion } from '@/lib/utils';
import { loadSessions, type CompletedSession } from '@/lib/session-storage';
import {
  filterSessionsByTimeRange,
  calculateDeepWorkMinutes,
  calculateWeeklyStats,
  formatHoursDecimal,
  formatTrendMessage,
  type TimeRange,
} from '@/lib/session-analytics';
import { TimeRangeSelector } from './TimeRangeSelector';
import { MetricCard } from './MetricCard';
import { SessionTimeline } from './SessionTimeline';
import { WeeklyBarChart } from './WeeklyBarChart';

interface StatisticsDashboardProps {
  refreshTrigger?: number;
}

/**
 * Format minutes as hours and minutes (e.g., "2h 30m" or "45m")
 */
function formatDeepWorkTime(minutes: number): string {
  if (minutes === 0) return '0m';

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Statistics Dashboard Modal
 * Container for all statistics components with time range filtering
 */
export function StatisticsDashboard({ refreshTrigger }: StatisticsDashboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [sessions, setSessions] = useState<CompletedSession[]>([]);

  const reducedMotion = prefersReducedMotion();

  // Focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(modalRef, isOpen, { initialFocusRef: closeButtonRef });

  // Load sessions when modal opens or refresh triggers
  useEffect(() => {
    if (isOpen) {
      setSessions(loadSessions());
    }
  }, [isOpen, refreshTrigger]);

  // Filter sessions by time range
  const filteredSessions = useMemo(() => {
    return filterSessionsByTimeRange(sessions, timeRange);
  }, [sessions, timeRange]);

  // Calculate metrics
  const deepWorkMinutes = useMemo(() => {
    return calculateDeepWorkMinutes(filteredSessions);
  }, [filteredSessions]);

  const workSessionsCount = useMemo(() => {
    return filteredSessions.filter(s => s.type === 'work').length;
  }, [filteredSessions]);

  // Calculate weekly stats for the chart (always show current week)
  // Note: calculateWeeklyStats loads sessions internally from localStorage
  const weeklyStats = useMemo(() => {
    if (!isOpen) return null;
    return calculateWeeklyStats(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, refreshTrigger]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Listen for external open event (G S navigation)
  useEffect(() => {
    function handleOpenDashboard() {
      setIsOpen(true);
    }

    window.addEventListener('pomo:open-dashboard', handleOpenDashboard);
    // Also listen to the old event for backwards compatibility during transition
    window.addEventListener('pomo:open-stats', handleOpenDashboard);
    return () => {
      window.removeEventListener('pomo:open-dashboard', handleOpenDashboard);
      window.removeEventListener('pomo:open-stats', handleOpenDashboard);
    };
  }, []);

  // Get time range label for accessibility
  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case 'day': return 'today';
      case 'week': return 'this week';
      case 'month': return 'this month';
      case 'all': return 'all time';
    }
  }, [timeRange]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal Backdrop + Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 light:bg-black/40"
            onClick={() => setIsOpen(false)}
          >
            {/* Modal Content */}
            <motion.div
              initial={reducedMotion ? { opacity: 1 } : { scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { scale: 0.95, y: 20 }}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.gentle }}
              className="w-[90vw] max-w-lg max-h-[85vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="statistics-dashboard-title"
                className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden flex flex-col max-h-full"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-tertiary/10 light:border-tertiary-dark/10 flex-shrink-0">
                  <h2
                    id="statistics-dashboard-title"
                    className="text-base font-semibold text-primary light:text-primary-dark"
                  >
                    Statistics
                  </h2>
                  <div className="flex items-center gap-3">
                    <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
                    <button
                      ref={closeButtonRef}
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="Close statistics"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <MetricCard
                      title="Focus Score"
                      value="--"
                      subtitle="Coming soon"
                      icon={<Zap className="w-4 h-4" />}
                    />
                    <MetricCard
                      title="Deep Work"
                      value={formatDeepWorkTime(deepWorkMinutes)}
                      subtitle={`${workSessionsCount} session${workSessionsCount !== 1 ? 's' : ''}`}
                      icon={<Clock className="w-4 h-4" />}
                    />
                    <MetricCard
                      title="Streak"
                      value="--"
                      subtitle="Coming soon"
                      icon={<Flame className="w-4 h-4" />}
                    />
                  </div>

                  {/* Weekly Chart */}
                  <motion.div
                    initial={reducedMotion ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={reducedMotion ? { duration: 0 } : { delay: 0.1 }}
                    className="bg-surface/50 light:bg-surface-dark/50 rounded-xl p-4 mb-4"
                  >
                    <h3 className="text-sm font-medium text-secondary light:text-secondary-dark mb-3 text-center">
                      This Week
                    </h3>
                    {weeklyStats && (
                      <>
                        <WeeklyBarChart
                          dailyStats={weeklyStats.dailyStats}
                          bestDay={weeklyStats.bestDay}
                          showGoal={true}
                          goalHours={4}
                        />
                        {/* Week summary */}
                        <div className="mt-4 pt-3 border-t border-tertiary/10 light:border-tertiary-dark/10 flex items-center justify-center gap-4 text-xs">
                          <span className="text-secondary light:text-secondary-dark">
                            <span className="font-medium text-primary light:text-primary-dark">
                              {formatHoursDecimal(weeklyStats.totalSeconds)}h
                            </span>
                            {' '}this week
                          </span>
                          {formatTrendMessage(weeklyStats) && (
                            <span className={`${weeklyStats.trend === 'up' ? 'text-accent light:text-accent-dark' : 'text-tertiary light:text-tertiary-dark'}`}>
                              {formatTrendMessage(weeklyStats)}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>

                  {/* Session Timeline */}
                  <motion.div
                    initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reducedMotion ? { duration: 0 } : { delay: 0.15 }}
                  >
                    <h3 className="text-sm font-medium text-secondary light:text-secondary-dark mb-3">
                      Recent Sessions
                    </h3>
                    <SessionTimeline
                      sessions={filteredSessions}
                      emptyMessage={`No sessions ${timeRangeLabel}`}
                      emptyDescription="Complete a focus session to see it here"
                      maxHeight="max-h-[30vh]"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
