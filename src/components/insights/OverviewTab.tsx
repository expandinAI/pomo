'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { prefersReducedMotion } from '@/lib/utils';
import {
  type TimeRange,
  type WeeklyStats,
  formatHoursDecimal,
  formatTrendMessage,
} from '@/lib/session-analytics';
import type { CompletedSession } from '@/lib/session-storage';
import type { ProjectBreakdown } from '@/lib/projects';
import { DashboardHeroMetrics } from './DashboardHeroMetrics';
import { DashboardHeatmap } from './DashboardHeatmap';
import { WeeklyBarChart } from './WeeklyBarChart';
import { StatsProjectBreakdown } from './StatsProjectBreakdown';
import { SessionTimeline } from './SessionTimeline';
import { ExportButton } from './ExportButton';

interface OverviewTabProps {
  // Core data
  sessions: CompletedSession[];
  filteredSessions: CompletedSession[];
  timeRange: TimeRange;
  refreshTrigger?: number;

  // Computed metrics
  totalHours: string;
  particleCount: number;
  focusScore: number;
  weeklyStats: WeeklyStats | null;
  projectBreakdown: ProjectBreakdown[];

  // Callbacks
  onSwitchToHistory: () => void;
  onProjectClick: (projectId: string | null) => void;
}

// Maximum particles to show in recent list
const MAX_RECENT_PARTICLES = 25;

/**
 * Overview Tab - Main dashboard view with all statistics
 * Contains: Hero Metrics, Heatmap, Weekly Chart, Projects, Recent Particles
 */
export function OverviewTab({
  filteredSessions,
  timeRange,
  refreshTrigger,
  totalHours,
  particleCount,
  focusScore,
  weeklyStats,
  projectBreakdown,
  onSwitchToHistory,
  onProjectClick,
}: OverviewTabProps) {
  const reducedMotion = prefersReducedMotion();

  // Get time range label for empty state message
  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case 'day': return 'today';
      case 'week': return 'this week';
      case 'month': return 'this month';
      case 'all': return 'all time';
    }
  }, [timeRange]);

  // Limit particles for the recent list
  const recentParticles = useMemo(() => {
    return filteredSessions.slice(0, MAX_RECENT_PARTICLES);
  }, [filteredSessions]);

  const hasMoreParticles = filteredSessions.length > MAX_RECENT_PARTICLES;

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4"
      role="tabpanel"
      aria-label="Overview tab"
    >
      {/* Hero Metrics */}
      <DashboardHeroMetrics
        totalHours={totalHours}
        particleCount={particleCount}
        focusScore={focusScore}
      />

      {/* Focus Patterns Heatmap */}
      <DashboardHeatmap
        timeRange={timeRange}
        refreshTrigger={refreshTrigger}
      />

      {/* Weekly Chart */}
      {weeklyStats && (
        <motion.section
          initial={reducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : { delay: 0.2 }}
          className="bg-surface/50 light:bg-surface-dark/50 rounded-xl p-4"
        >
          <h3 className="text-sm font-medium text-secondary light:text-secondary-dark mb-3 text-center">
            This Week
          </h3>
          <WeeklyBarChart
            dailyStats={weeklyStats.dailyStats}
            bestDay={weeklyStats.bestDay}
            showGoal={true}
            goalHours={4}
          />
          {/* Week summary */}
          <div className="mt-4 pt-3 border-t border-tertiary/10 light:border-tertiary-dark/10 flex items-center justify-center gap-4 text-xs">
            <span className="text-secondary light:text-secondary-dark">
              <span className="font-medium text-primary light:text-primary-dark">
                {formatHoursDecimal(weeklyStats.totalSeconds)}h
              </span>
              {' '}this week
            </span>
            {formatTrendMessage(weeklyStats) && (
              <span className={`${weeklyStats.trend === 'up' ? 'text-accent light:text-accent-dark' : 'text-tertiary light:text-tertiary-dark'}`}>
                {formatTrendMessage(weeklyStats)}
              </span>
            )}
          </div>
        </motion.section>
      )}

      {/* Projects Breakdown */}
      {projectBreakdown.length > 0 && (
        <motion.section
          initial={reducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : { delay: 0.25 }}
          className="border-t border-tertiary/10 light:border-tertiary-dark/10"
        >
          <StatsProjectBreakdown
            breakdown={projectBreakdown}
            onProjectClick={onProjectClick}
          />
        </motion.section>
      )}

      {/* Recent Particles */}
      <motion.section
        initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { delay: 0.3 }}
      >
        <h3 className="text-sm font-medium text-secondary light:text-secondary-dark mb-3">
          Recent Particles
        </h3>
        <SessionTimeline
          sessions={recentParticles}
          emptyMessage={`No Particles ${timeRangeLabel}`}
          emptyDescription="Collect a Particle to see it here"
          maxHeight="max-h-[25vh]"
        />

        {/* Show "View all" link if there are more particles */}
        {hasMoreParticles && (
          <button
            onClick={onSwitchToHistory}
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 text-xs text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
          >
            <span>View all {filteredSessions.length} particles</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </motion.section>

      {/* Export Button */}
      <div className="pt-2 border-t border-tertiary/10 light:border-tertiary-dark/10">
        <ExportButton />
      </div>
    </div>
  );
}
