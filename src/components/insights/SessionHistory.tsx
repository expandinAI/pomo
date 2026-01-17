'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, X, Coffee, Zap } from 'lucide-react';
import { SPRING, SESSION_LABELS, type SessionType } from '@/styles/design-tokens';
import {
  loadSessions,
  getSessionsFromDays,
  groupSessionsByDate,
  getTotalDuration,
  formatDuration,
  formatDate,
  formatTime,
  type CompletedSession,
} from '@/lib/session-storage';

const SESSION_ICONS: Record<SessionType, typeof Zap> = {
  work: Zap,
  shortBreak: Coffee,
  longBreak: Coffee,
};

interface SessionHistoryProps {
  refreshTrigger?: number; // Increment to refresh
}

export function SessionHistory({ refreshTrigger }: SessionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<CompletedSession[]>([]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Load sessions on mount and when refreshTrigger changes
  useEffect(() => {
    setSessions(getSessionsFromDays(30));
  }, [refreshTrigger, isOpen]);

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    return groupSessionsByDate(sessions);
  }, [sessions]);

  // Calculate total work time
  const totalWorkTime = useMemo(() => {
    const workSessions = sessions.filter((s) => s.type === 'work');
    return getTotalDuration(workSessions);
  }, [sessions]);

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

  return (
    <div className="relative">
      <motion.button
        onClick={toggleOpen}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-tertiary dark:text-tertiary-dark hover:text-secondary dark:hover:text-secondary-dark hover:bg-tertiary/10 dark:hover:bg-tertiary-dark/10 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        aria-label="Session history"
        aria-expanded={isOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <BarChart3 className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', ...SPRING.gentle }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm max-h-[80vh] flex flex-col"
            >
              <div className="bg-surface dark:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 dark:border-tertiary-dark/10 overflow-hidden flex flex-col max-h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-tertiary/10 dark:border-tertiary-dark/10 flex-shrink-0">
                  <h2 className="text-base font-semibold text-primary dark:text-primary-dark">
                    Session History
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary dark:text-tertiary-dark hover:text-secondary dark:hover:text-secondary-dark hover:bg-tertiary/10 dark:hover:bg-tertiary-dark/10 transition-colors"
                    aria-label="Close history"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Summary */}
                <div className="p-4 border-b border-tertiary/10 dark:border-tertiary-dark/10 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-accent dark:text-accent-dark">
                      {formatDuration(totalWorkTime)}
                    </p>
                    <p className="text-sm text-tertiary dark:text-tertiary-dark mt-1">
                      Focus time in the last 30 days
                    </p>
                  </div>
                </div>

                {/* Session list */}
                <div className="flex-1 overflow-y-auto p-4">
                  {sessions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-tertiary dark:text-tertiary-dark">
                        No sessions yet
                      </p>
                      <p className="text-sm text-tertiary dark:text-tertiary-dark mt-1">
                        Complete a focus session to see it here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Array.from(groupedSessions.entries()).map(([date, daySessions]) => {
                        const dayWorkTime = getTotalDuration(
                          daySessions.filter((s) => s.type === 'work')
                        );

                        return (
                          <div key={date}>
                            {/* Date header */}
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-secondary dark:text-secondary-dark">
                                {formatDate(daySessions[0].completedAt)}
                              </h3>
                              <span className="text-xs text-tertiary dark:text-tertiary-dark">
                                {formatDuration(dayWorkTime)} focus
                              </span>
                            </div>

                            {/* Sessions */}
                            <div className="space-y-1.5">
                              {daySessions.map((session) => {
                                const Icon = SESSION_ICONS[session.type];
                                const isWork = session.type === 'work';

                                return (
                                  <div
                                    key={session.id}
                                    className="flex items-center gap-3 py-1.5"
                                  >
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        isWork
                                          ? 'bg-accent/10 dark:bg-accent-dark/10 text-accent dark:text-accent-dark'
                                          : 'bg-tertiary/10 dark:bg-tertiary-dark/10 text-tertiary dark:text-tertiary-dark'
                                      }`}
                                    >
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-primary dark:text-primary-dark truncate">
                                        {SESSION_LABELS[session.type]}
                                      </p>
                                    </div>
                                    <span className="text-xs text-tertiary dark:text-tertiary-dark tabular-nums">
                                      {formatDuration(session.duration)}
                                    </span>
                                    <span className="text-xs text-tertiary dark:text-tertiary-dark tabular-nums w-16 text-right">
                                      {formatTime(session.completedAt)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
