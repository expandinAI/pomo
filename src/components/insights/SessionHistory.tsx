'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, X, Coffee, Zap, Search } from 'lucide-react';
import { SPRING, SESSION_LABELS, type SessionType } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { prefersReducedMotion } from '@/lib/utils';
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

type TypeFilter = 'all' | 'work' | 'break';

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
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const reducedMotion = prefersReducedMotion();

  // Focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(modalRef, isOpen, { initialFocusRef: closeButtonRef });

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Load sessions on mount and when refreshTrigger changes
  useEffect(() => {
    setSessions(getSessionsFromDays(30));
  }, [refreshTrigger, isOpen]);

  // Reset filters when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTypeFilter('all');
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter sessions by type and search query
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Type filter
      if (typeFilter === 'work' && session.type !== 'work') return false;
      if (typeFilter === 'break' && session.type === 'work') return false;

      // Search filter (only for work sessions with tasks)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const task = session.task?.toLowerCase() || '';
        const label = SESSION_LABELS[session.type].toLowerCase();
        if (!task.includes(query) && !label.includes(query)) return false;
      }

      return true;
    });
  }, [sessions, typeFilter, searchQuery]);

  // Group filtered sessions by date
  const groupedSessions = useMemo(() => {
    return groupSessionsByDate(filteredSessions);
  }, [filteredSessions]);

  // Calculate total work time (all sessions)
  const totalWorkTime = useMemo(() => {
    const workSessions = sessions.filter((s) => s.type === 'work');
    return getTotalDuration(workSessions);
  }, [sessions]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    const workSessions = filteredSessions.filter((s) => s.type === 'work');
    const breakSessions = filteredSessions.filter((s) => s.type !== 'work');
    return {
      count: filteredSessions.length,
      workTime: getTotalDuration(workSessions),
      breakTime: getTotalDuration(breakSessions),
    };
  }, [filteredSessions]);

  // Check if filters are active
  const hasActiveFilters = typeFilter !== 'all' || searchQuery.trim() !== '';

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

  // Listen for external open event (G H navigation)
  useEffect(() => {
    function handleOpenHistory() {
      setIsOpen(true);
    }

    window.addEventListener('particle:open-history', handleOpenHistory);
    return () => window.removeEventListener('particle:open-history', handleOpenHistory);
  }, []);

  return (
    <div className="relative">
      <motion.button
        onClick={toggleOpen}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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
            {/* Modal Backdrop + Container */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, pointerEvents: 'auto' as const }}
              exit={{ opacity: 0, pointerEvents: 'none' as const }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 light:bg-black/40"
              onClick={() => setIsOpen(false)}
            >
              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: 'spring', ...SPRING.gentle }}
                className="w-[90vw] max-w-sm max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="session-history-title"
                className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden flex flex-col max-h-full"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-tertiary/10 light:border-tertiary-dark/10 flex-shrink-0">
                  <h2 id="session-history-title" className="text-base font-semibold text-primary light:text-primary-dark">
                    Particle History
                  </h2>
                  <button
                    ref={closeButtonRef}
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Close history"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Filters */}
                <div className="p-3 border-b border-tertiary/10 light:border-tertiary-dark/10 flex-shrink-0 space-y-2">
                  {/* Type Filter */}
                  <div className="flex gap-1" role="radiogroup" aria-label="Filter by type">
                    {(['all', 'work', 'break'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTypeFilter(filter)}
                        className={`
                          px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
                          ${typeFilter === filter
                            ? 'bg-accent/20 light:bg-accent-dark/20 text-accent light:text-accent-dark'
                            : 'text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
                          }
                        `}
                        role="radio"
                        aria-checked={typeFilter === filter}
                      >
                        {filter === 'all' ? 'All' : filter === 'work' ? 'Work' : 'Breaks'}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tertiary light:text-tertiary-dark pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md
                        bg-surface/50 light:bg-surface-dark/50
                        border border-tertiary/20 light:border-tertiary-dark/20
                        text-primary light:text-primary-dark
                        placeholder:text-tertiary light:placeholder:text-tertiary-dark
                        focus:outline-none focus:ring-2 focus:ring-accent/50
                        transition-colors"
                      aria-label="Search tasks"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 border-b border-tertiary/10 light:border-tertiary-dark/10 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-accent light:text-accent-dark">
                      {hasActiveFilters
                        ? formatDuration(typeFilter === 'break' ? filteredStats.breakTime : filteredStats.workTime)
                        : formatDuration(totalWorkTime)
                      }
                    </p>
                    <p className="text-sm text-tertiary light:text-tertiary-dark mt-1">
                      {hasActiveFilters
                        ? `${filteredStats.count} result${filteredStats.count !== 1 ? 's' : ''}`
                        : 'Focus time in the last 30 days'
                      }
                    </p>
                  </div>
                </div>

                {/* Session list */}
                <div className="flex-1 overflow-y-auto p-4">
                  {sessions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-tertiary light:text-tertiary-dark">
                        No Particles yet
                      </p>
                      <p className="text-sm text-tertiary light:text-tertiary-dark mt-1">
                        Collect a Particle to see it here
                      </p>
                    </div>
                  ) : filteredSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-tertiary light:text-tertiary-dark">
                        No matches found
                      </p>
                      <p className="text-sm text-tertiary light:text-tertiary-dark mt-1">
                        Try adjusting your filters
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
                              <h3 className="text-sm font-medium text-secondary light:text-secondary-dark">
                                {formatDate(daySessions[0].completedAt)}
                              </h3>
                              <span className="text-xs text-tertiary light:text-tertiary-dark">
                                {formatDuration(dayWorkTime)} focus
                              </span>
                            </div>

                            {/* Sessions */}
                            <div className="space-y-1.5">
                              {daySessions.map((session) => {
                                const Icon = SESSION_ICONS[session.type];
                                const isWork = session.type === 'work';
                                const displayName = isWork && session.task
                                  ? session.task
                                  : SESSION_LABELS[session.type];

                                return (
                                  <div
                                    key={session.id}
                                    className="flex items-center gap-3 py-1.5"
                                  >
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        isWork
                                          ? 'bg-accent/10 light:bg-accent-dark/10 text-accent light:text-accent-dark'
                                          : 'bg-tertiary/10 light:bg-tertiary-dark/10 text-tertiary light:text-tertiary-dark'
                                      }`}
                                    >
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-primary light:text-primary-dark truncate">
                                        {displayName}
                                      </p>
                                    </div>
                                    {session.estimatedPomodoros && (
                                      <span className="text-xs text-tertiary light:text-tertiary-dark">
                                        ~{session.estimatedPomodoros}
                                      </span>
                                    )}
                                    <span className="text-xs text-tertiary light:text-tertiary-dark tabular-nums">
                                      {formatDuration(session.duration)}
                                    </span>
                                    <span className="text-xs text-tertiary light:text-tertiary-dark tabular-nums w-16 text-right">
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
