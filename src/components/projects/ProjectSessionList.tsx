'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { CompletedSession } from '@/lib/session-storage';

interface ProjectSessionListProps {
  /** Sessions to display */
  sessions: CompletedSession[];
  /** Maximum number of sessions to show (default: 20) */
  maxItems?: number;
}

/**
 * List of recent sessions grouped by date
 */
export function ProjectSessionList({
  sessions,
  maxItems = 20,
}: ProjectSessionListProps) {
  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const visibleSessions = sessions.slice(0, maxItems);
    const groups = new Map<string, CompletedSession[]>();

    for (const session of visibleSessions) {
      const dateKey = formatDateKey(session.completedAt);
      const existing = groups.get(dateKey) ?? [];
      existing.push(session);
      groups.set(dateKey, existing);
    }

    return Array.from(groups.entries()).map(([dateKey, sessions]) => ({
      date: dateKey,
      sessions,
    }));
  }, [sessions, maxItems]);

  const hasMore = sessions.length > maxItems;

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

      <div className="space-y-6">
        {groupedSessions.map((group, groupIdx) => (
          <motion.div
            key={group.date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + groupIdx * 0.05 }}
          >
            {/* Date Header */}
            <div className="text-xs font-medium text-tertiary light:text-tertiary-dark mb-2">
              {group.date}
            </div>

            {/* Sessions */}
            <div className="space-y-1">
              {group.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-tertiary/5 light:hover:bg-tertiary-dark/5 transition-colors"
                >
                  {/* Time */}
                  <span className="text-xs text-tertiary light:text-tertiary-dark tabular-nums w-14 shrink-0">
                    {formatTime(session.completedAt)}
                  </span>

                  {/* Duration */}
                  <span className="text-sm text-secondary light:text-secondary-dark tabular-nums w-14 shrink-0">
                    {formatDuration(session.duration)}
                  </span>

                  {/* Task */}
                  <span className="text-sm text-primary light:text-primary-dark truncate flex-1">
                    {session.task || (
                      <span className="text-tertiary light:text-tertiary-dark italic">
                        No task
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
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

function formatDateKey(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const sessionDate = new Date(date);
  sessionDate.setHours(0, 0, 0, 0);

  if (sessionDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (sessionDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  }
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  return `${minutes}min`;
}
