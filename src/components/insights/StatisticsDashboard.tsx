'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { prefersReducedMotion } from '@/lib/utils';
import { loadSessions, type CompletedSession } from '@/lib/session-storage';
import {
  filterSessionsByTimeRange,
  calculateWeeklyStats,
  calculateFocusScore,
  getLifetimeStats,
  formatHoursMinutes,
  type TimeRange,
} from '@/lib/session-analytics';
import { DashboardTabs, type DashboardTab } from './DashboardTabs';
import { OverviewTab } from './OverviewTab';
import { HistoryTab } from './HistoryTab';
import { getProjectBreakdown } from '@/lib/projects';

interface StatisticsDashboardProps {
  refreshTrigger?: number;
}

/**
 * Statistics Dashboard Modal
 * Container for all statistics components with time range filtering and tabs
 */
export function StatisticsDashboard({ refreshTrigger }: StatisticsDashboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [sessions, setSessions] = useState<CompletedSession[]>([]);

  const reducedMotion = prefersReducedMotion();

  // Focus management
  const modalRef = useRef<HTMLDivElement>(null);
  // Focus the modal container itself to avoid visible ring on close button
  useFocusTrap(modalRef, isOpen, { initialFocusRef: modalRef });

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

  // Calculate particle count (work sessions only)
  const particleCount = useMemo(() => {
    return filteredSessions.filter(s => s.type === 'work').length;
  }, [filteredSessions]);

  // Calculate focus score (uses filtered sessions)
  const focusScore = useMemo(() => {
    return calculateFocusScore(filteredSessions);
  }, [filteredSessions]);

  // Get lifetime total hours (all-time, not filtered)
  const totalHours = useMemo(() => {
    const stats = getLifetimeStats();
    return formatHoursMinutes(stats.totalSeconds);
  }, [sessions]); // Recalculate when sessions change

  // Calculate weekly stats for the chart (always show current week)
  const weeklyStats = useMemo(() => {
    if (!isOpen) return null;
    return calculateWeeklyStats(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, refreshTrigger]);

  // Calculate project breakdown based on time range
  const projectBreakdown = useMemo(() => {
    if (!isOpen) return [];
    return getProjectBreakdown(timeRange);
  }, [isOpen, timeRange, refreshTrigger]);

  // Close on Escape - stopImmediatePropagation prevents Timer from receiving the event
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
    function handleOpenDashboard() {
      setActiveTab('overview');
      setIsOpen(true);
    }

    function handleOpenHistory() {
      setActiveTab('history');
      setIsOpen(true);
    }

    window.addEventListener('particle:open-dashboard', handleOpenDashboard);
    window.addEventListener('particle:open-history', handleOpenHistory);
    // Also listen to the old event for backwards compatibility
    window.addEventListener('particle:open-stats', handleOpenDashboard);
    return () => {
      window.removeEventListener('particle:open-dashboard', handleOpenDashboard);
      window.removeEventListener('particle:open-history', handleOpenHistory);
      window.removeEventListener('particle:open-stats', handleOpenDashboard);
    };
  }, []);

  // Handle project click - close dashboard and open project detail
  const handleProjectClick = (projectId: string | null) => {
    // Only handle clicks on actual projects, not "No Project"
    if (projectId === null) return;

    setIsOpen(false);
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('particle:open-project-detail', {
          detail: { projectId },
        })
      );
    }, 150); // Small delay to let modal close animation complete
  };

  return (
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
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="statistics-dashboard-title"
                className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden flex flex-col min-h-0 max-h-full focus:outline-none"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-tertiary/10 light:border-tertiary-dark/10 flex-shrink-0">
                  <h2
                    id="statistics-dashboard-title"
                    className="text-base font-semibold text-primary light:text-primary-dark"
                  >
                    Statistics
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Close statistics"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content area - flex-1 + min-h-0 required for nested scrolling */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Tab Navigation */}
                  <DashboardTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />

                {/* Tab Content */}
                {activeTab === 'overview' ? (
                  <OverviewTab
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                    refreshTrigger={refreshTrigger}
                    totalHours={totalHours}
                    particleCount={particleCount}
                    focusScore={focusScore}
                    weeklyStats={weeklyStats}
                    projectBreakdown={projectBreakdown}
                    onProjectClick={handleProjectClick}
                  />
                ) : (
                  <HistoryTab
                    sessions={sessions}
                    onSessionUpdate={() => setSessions(loadSessions())}
                  />
                )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
