'use client';

import { motion } from 'framer-motion';
import { formatDuration } from '@/lib/session-storage';
import type { NarrativeStats } from '@/lib/coach/weekly-narrative';

interface WeeklyNarrativeProps {
  narrative: string | null;
  stats: NarrativeStats | null;
  weekLabel: string;
  isLoading: boolean;
}

/**
 * @deprecated Use CoachBriefing instead. Will be removed in a future cleanup.
 *
 * WeeklyNarrative — 3-sentence story about the last completed week
 *
 * Displayed in CoachView above the Particle of the Week.
 * Shows a skeleton while loading, nothing if no narrative.
 */
export function WeeklyNarrative({ narrative, stats, weekLabel, isLoading }: WeeklyNarrativeProps) {
  // Skeleton state
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="h-3 w-20 bg-tertiary/10 light:bg-tertiary-dark/10 rounded mb-3 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-tertiary/10 light:bg-tertiary-dark/10 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-tertiary/10 light:bg-tertiary-dark/10 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-tertiary/10 light:bg-tertiary-dark/10 rounded animate-pulse" />
        </div>
        <div className="h-3 w-48 bg-tertiary/10 light:bg-tertiary-dark/10 rounded mt-3 animate-pulse" />
      </div>
    );
  }

  if (!narrative) return null;

  const projectLabel = stats
    ? stats.projectCount === 1
      ? '1 project'
      : `${stats.projectCount} projects`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Section header */}
      <h3 className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider mb-2">
        {weekLabel}
      </h3>

      {/* Narrative text */}
      <p className="text-sm text-secondary light:text-secondary-dark leading-relaxed">
        {narrative}
      </p>

      {/* Stats line */}
      {stats && stats.totalParticles > 0 && (
        <p className="text-xs text-tertiary light:text-tertiary-dark mt-2">
          {stats.totalParticles} particles · {formatDuration(stats.totalMinutes * 60)}
          {projectLabel && ` · ${projectLabel}`}
        </p>
      )}
    </motion.div>
  );
}
