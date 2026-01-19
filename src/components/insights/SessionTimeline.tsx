'use client';

import { useMemo } from 'react';
import { Coffee, Zap } from 'lucide-react';
import { SESSION_LABELS, type SessionType } from '@/styles/design-tokens';
import {
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

interface SessionTimelineProps {
  sessions: CompletedSession[];
  emptyMessage?: string;
  emptyDescription?: string;
  maxHeight?: string;
}

/**
 * Session timeline showing grouped sessions by date
 * Extracted from SessionHistory for reuse in StatisticsDashboard
 */
export function SessionTimeline({
  sessions,
  emptyMessage = 'No sessions yet',
  emptyDescription = 'Complete a focus session to see it here',
  maxHeight = 'max-h-[40vh]',
}: SessionTimelineProps) {
  // Group sessions by date
  const groupedSessions = useMemo(() => {
    return groupSessionsByDate(sessions);
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-tertiary light:text-tertiary-dark">
          {emptyMessage}
        </p>
        <p className="text-sm text-tertiary light:text-tertiary-dark mt-1">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className={`${maxHeight} overflow-y-auto pr-1`}>
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
    </div>
  );
}
