'use client';

import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { groupSessionsByDate, getTotalDuration, formatDuration, formatDate, type CompletedSession } from '@/lib/session-storage';
import { ParticleListItem } from './ParticleListItem';

interface ParticleListProps {
  sessions: CompletedSession[];
  visibleCount: number;
  onLoadMore: () => void;
  onEdit: (session: CompletedSession) => void;
  emptyMessage?: string;
  emptyDescription?: string;
}

const LOAD_MORE_INCREMENT = 50;

/**
 * Particle list with date grouping and load more functionality
 */
export function ParticleList({
  sessions,
  visibleCount,
  onLoadMore,
  onEdit,
  emptyMessage = 'No particles found',
  emptyDescription = 'Try adjusting your search or filters',
}: ParticleListProps) {
  // Get visible sessions
  const visibleSessions = useMemo(() => {
    return sessions.slice(0, visibleCount);
  }, [sessions, visibleCount]);

  // Group visible sessions by date
  const groupedSessions = useMemo(() => {
    return groupSessionsByDate(visibleSessions);
  }, [visibleSessions]);

  const hasMore = sessions.length > visibleCount;
  const remainingCount = sessions.length - visibleCount;

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 mb-4 rounded-full bg-tertiary/5 light:bg-tertiary-dark/5 flex items-center justify-center">
          <Search className="w-6 h-6 text-tertiary/40 light:text-tertiary-dark/40" />
        </div>
        <p className="text-sm text-secondary light:text-secondary-dark">
          {emptyMessage}
        </p>
        <p className="text-xs text-tertiary light:text-tertiary-dark mt-1">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Counter */}
      <div className="text-xs text-tertiary light:text-tertiary-dark">
        Showing {Math.min(visibleCount, sessions.length)} of {sessions.length} particles
      </div>

      {/* Grouped List */}
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
              <div className="space-y-0.5">
                {daySessions.map((session) => (
                  <ParticleListItem
                    key={session.id}
                    session={session}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm font-medium text-secondary light:text-secondary-dark bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Load more ({Math.min(remainingCount, LOAD_MORE_INCREMENT)} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
