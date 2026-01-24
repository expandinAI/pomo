'use client';

import { useMemo } from 'react';
import { Coffee, Zap, MoreHorizontal } from 'lucide-react';
import { SESSION_LABELS, type SessionType } from '@/styles/design-tokens';
import { formatDuration, formatTime, type CompletedSession } from '@/lib/session-storage';
import { getProject } from '@/lib/projects';

const SESSION_ICONS: Record<SessionType, typeof Zap> = {
  work: Zap,
  shortBreak: Coffee,
  longBreak: Coffee,
};

interface ParticleListItemProps {
  session: CompletedSession;
  onEdit: (session: CompletedSession) => void;
}

/**
 * Single particle list item with icon, task name, project, duration, and menu button
 */
export function ParticleListItem({ session, onEdit }: ParticleListItemProps) {
  const isWork = session.type === 'work';
  const Icon = SESSION_ICONS[session.type];

  const displayName = isWork && session.task ? session.task : SESSION_LABELS[session.type];

  const project = useMemo(() => {
    if (!session.projectId) return null;
    return getProject(session.projectId);
  }, [session.projectId]);

  return (
    <div className="group flex items-center gap-3 py-2 px-1 -mx-1 rounded-lg hover:bg-tertiary/5 light:hover:bg-tertiary-dark/5 transition-colors">
      {/* Icon */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isWork
            ? 'bg-accent/10 light:bg-accent-dark/10 text-accent light:text-accent-dark'
            : 'bg-tertiary/10 light:bg-tertiary-dark/10 text-tertiary light:text-tertiary-dark'
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-primary light:text-primary-dark truncate">
          {displayName}
        </p>
        {project && (
          <p className="text-xs text-tertiary light:text-tertiary-dark truncate">
            {project.name}
          </p>
        )}
      </div>

      {/* Duration */}
      <span className="text-xs text-tertiary light:text-tertiary-dark tabular-nums flex-shrink-0">
        {formatDuration(session.duration)}
      </span>

      {/* Time */}
      <span className="text-xs text-tertiary light:text-tertiary-dark tabular-nums w-16 text-right flex-shrink-0">
        {formatTime(session.completedAt)}
      </span>

      {/* Menu Button */}
      <button
        onClick={() => onEdit(session)}
        className="w-7 h-7 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark opacity-0 group-hover:opacity-100 hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-all focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label={`Edit ${displayName}`}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
