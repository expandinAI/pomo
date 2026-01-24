'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParticleListItem } from '@/components/insights/ParticleListItem';
import { getTotalDuration, formatDuration, formatDate, type CompletedSession } from '@/lib/session-storage';

interface ProjectSessionListProps {
  /** Sessions to display */
  sessions: CompletedSession[];
  /** Maximum number of sessions to show (default: 20) */
  maxItems?: number;
  /** Called when a session is clicked for editing */
  onEdit?: (session: CompletedSession) => void;
}

/**
 * List of recent sessions grouped by date
 * Uses ParticleListItem for consistent UX with History view
 */
export function ProjectSessionList({
  sessions,
  maxItems = 20,
  onEdit,
}: ProjectSessionListProps) {
  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const visibleSessions = sessions.slice(0, maxItems);
    const groups = new Map<string, CompletedSession[]>();

    for (const session of visibleSessions) {
      const dateKey = formatDate(session.completedAt);
      const existing = groups.get(dateKey) ?? [];
      existing.push(session);
      groups.set(dateKey, existing);
    }

    return Array.from(groups.entries()).map(([dateKey, dateSessions]) => ({
      date: dateKey,
      sessions: dateSessions,
    }));
  }, [sessions, maxItems]);

  const hasMore = sessions.length > maxItems;

  // Handle edit click
  const handleEdit = (session: CompletedSession) => {
    onEdit?.(session);
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-tertiary light:text-tertiary-dark">
        No sessions yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-secondary light:text-secondary-dark">
        Recent Sessions
      </h3>

      <div className="space-y-5">
        {groupedSessions.map((group, groupIdx) => {
          const dayWorkTime = getTotalDuration(
            group.sessions.filter((s) => s.type === 'work')
          );

          return (
            <motion.div
              key={group.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + groupIdx * 0.05 }}
            >
              {/* Date Header with focus time */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-tertiary light:text-tertiary-dark">
                  {group.date}
                </span>
                <span className="text-xs text-tertiary light:text-tertiary-dark">
                  {formatDuration(dayWorkTime)} focus
                </span>
              </div>

              {/* Sessions - using ParticleListItem for consistency */}
              <div className="space-y-0.5">
                {group.sessions.map((session) => (
                  <ParticleListItem
                    key={session.id}
                    session={session}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {hasMore && (
        <div className="text-center pt-2">
          <span className="text-xs text-tertiary light:text-tertiary-dark">
            +{sessions.length - maxItems} more sessions
          </span>
        </div>
      )}
    </div>
  );
}
