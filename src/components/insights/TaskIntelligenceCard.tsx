'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/utils';
import { formatDuration } from '@/lib/session-storage';
import { getTopTasks } from '@/lib/task-intelligence';
import type { CompletedSession } from '@/lib/session-storage';

interface TaskIntelligenceCardProps {
  sessions: CompletedSession[];
}

function truncateTask(name: string, max: number = 30): string {
  if (name.length <= max) return name;
  return name.slice(0, max - 3) + '...';
}

/**
 * Dashboard card showing most frequently recurring tasks.
 * Hidden when no recurring tasks exist (returns null).
 */
export function TaskIntelligenceCard({ sessions }: TaskIntelligenceCardProps) {
  const reducedMotion = prefersReducedMotion();

  const topTasks = useMemo(() => getTopTasks(sessions), [sessions]);

  if (topTasks.length === 0) return null;

  return (
    <motion.section
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0 } : { delay: 0.25 }}
      className="bg-surface/50 light:bg-surface-dark/50 rounded-xl p-4"
    >
      <h3 className="text-sm font-medium text-secondary light:text-secondary-dark mb-3">
        Your recurring work
      </h3>
      <div className="space-y-2">
        {topTasks.map((task) => (
          <div
            key={task.name}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-primary light:text-primary-dark truncate mr-3">
              {truncateTask(task.name)}
            </span>
            <span className="text-tertiary light:text-tertiary-dark whitespace-nowrap">
              {task.count}x{' '}
              <span className="ml-1">
                &Oslash; {formatDuration(task.avgDuration)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
