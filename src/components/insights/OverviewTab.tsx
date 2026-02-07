'use client';

import { motion } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/utils';
import {
  type TimeRange,
  type WeeklyStats,
  formatHoursDecimal,
  formatTrendMessage,
} from '@/lib/session-analytics';
import type { ProjectBreakdown } from '@/lib/projects';
import type { CompletedSession } from '@/lib/session-storage';
import { DashboardHeroMetrics } from './DashboardHeroMetrics';
import { DashboardHeatmap } from './DashboardHeatmap';
import { WeeklyBarChart } from './WeeklyBarChart';
import { StatsProjectBreakdown } from './StatsProjectBreakdown';
import { TaskIntelligenceCard } from './TaskIntelligenceCard';
import { TimeRangeSelector } from './TimeRangeSelector';
import { ExportButton } from './ExportButton';

interface OverviewTabProps {
  // Core data
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  refreshTrigger?: number;
  filteredSessions: CompletedSession[];

  // Computed metrics
  totalHours: string;
  particleCount: number;
  focusScore: number;
  weeklyStats: WeeklyStats | null;
  projectBreakdown: ProjectBreakdown[];

  // Callbacks
  onProjectClick: (projectId: string | null) => void;
}

/**
 * Overview Tab - Main dashboard view with all statistics
 * Contains: Hero Metrics, Heatmap, Weekly Chart, Projects
 */
export function OverviewTab({
  timeRange,
  onTimeRangeChange,
  refreshTrigger,
  filteredSessions,
  totalHours,
  particleCount,
  focusScore,
  weeklyStats,
  projectBreakdown,
  onProjectClick,
}: OverviewTabProps) {
  const reducedMotion = prefersReducedMotion();

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4"
      role="tabpanel"
      aria-label="Overview tab"
    >
      {/* Time Range Filter */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-tertiary light:text-tertiary-dark">Time Range</span>
        <TimeRangeSelector value={timeRange} onChange={onTimeRangeChange} />
      </div>

      {/* Hero Metrics */}
      <DashboardHeroMetrics
        totalHours={totalHours}
        particleCount={particleCount}
        focusScore={focusScore}
      />

      {/* Focus Patterns Heatmap */}
      <DashboardHeatmap
        timeRange={timeRange}
        sessions={filteredSessions}
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

      {/* Task Intelligence */}
      <TaskIntelligenceCard sessions={filteredSessions} />

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

      {/* Export Button */}
      <div className="pt-2 border-t border-tertiary/10 light:border-tertiary-dark/10">
        <ExportButton />
      </div>
    </div>
  );
}
