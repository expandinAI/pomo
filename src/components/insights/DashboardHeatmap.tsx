'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Grid3X3, Sparkles } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { buildHeatmap, type HeatmapData, type TimeRange } from '@/lib/session-analytics';
import { HeatmapGrid } from './HeatmapGrid';
import { prefersReducedMotion } from '@/lib/utils';
import { useFeature, useHasAccount } from '@/lib/tiers';

interface DashboardHeatmapProps {
  timeRange: TimeRange;
  refreshTrigger?: number;
}

// Map time range to number of days for heatmap analysis
const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  day: 1,
  week: 7,
  month: 30,
  all: 365, // Max 1 year for performance
};

// Human-readable labels for time ranges
const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  day: 'today',
  week: 'the last 7 days',
  month: 'the last 30 days',
  all: 'all time',
};

/**
 * Dashboard Heatmap Section - Inline heatmap that follows Time Range
 * Shows focus patterns based on the selected time period
 */
export function DashboardHeatmap({ timeRange, refreshTrigger }: DashboardHeatmapProps) {
  const [data, setData] = useState<HeatmapData | null>(null);
  const reducedMotion = prefersReducedMotion();
  const hasAdvancedStats = useFeature('advancedStats');
  const hasAccount = useHasAccount();

  // Build heatmap data based on time range
  useEffect(() => {
    const days = TIME_RANGE_DAYS[timeRange];
    setData(buildHeatmap(days));
  }, [timeRange, refreshTrigger]);

  const timeRangeLabel = useMemo(() => TIME_RANGE_LABELS[timeRange], [timeRange]);

  // Show compact upgrade prompt when feature is locked
  if (!hasAdvancedStats) {
    return (
      <motion.section
        initial={reducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : { delay: 0.15 }}
        className="bg-surface/50 light:bg-surface-dark/50 rounded-xl p-4"
      >
        <h3 className="text-sm font-medium text-secondary light:text-secondary-dark mb-3 text-center">
          Focus Patterns
        </h3>
        <div className="flex flex-col items-center py-4">
          <div className="w-10 h-10 rounded-full bg-accent/10 light:bg-accent-dark/10 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-accent light:text-accent-dark" />
          </div>
          <p className="text-sm text-tertiary light:text-tertiary-dark text-center mb-3">
            Discover your focus patterns
          </p>
          <button
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent(hasAccount ? 'particle:open-upgrade' : 'particle:open-auth')
              );
            }}
            className="text-xs text-accent light:text-accent-dark hover:underline"
          >
            {hasAccount ? 'Try Flow' : 'Create free account'}
          </button>
        </div>
      </motion.section>
    );
  }

  if (!data) return null;

  return (
    <motion.section
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0 } : { delay: 0.15 }}
      className="bg-surface/50 light:bg-surface-dark/50 rounded-xl p-4"
      aria-labelledby="heatmap-title"
    >
      {/* Header */}
      <h3
        id="heatmap-title"
        className="text-sm font-medium text-secondary light:text-secondary-dark mb-4 text-center"
      >
        Focus Patterns
      </h3>

      {data.isEmpty ? (
        /* Empty State */
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { delay: 0.1 }}
          className="text-center py-6"
        >
          <Grid3X3 className="w-10 h-10 mx-auto text-tertiary/30 light:text-tertiary-dark/30 mb-3" />
          <p className="text-sm text-tertiary light:text-tertiary-dark">
            No focus patterns {timeRangeLabel}
          </p>
          <p className="text-xs text-tertiary/60 light:text-tertiary-dark/60 mt-1">
            Complete sessions to discover your peak focus times
          </p>
        </motion.div>
      ) : (
        <>
          {/* Grid */}
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : { delay: 0.1 }}
            className="mb-4"
          >
            <HeatmapGrid data={data} />
          </motion.div>

          {/* Peak Info */}
          {data.peakLabel && (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.25 }}
              className="flex items-center justify-center gap-2 text-sm mb-3"
            >
              <Star className="w-4 h-4 text-accent light:text-accent-dark flex-shrink-0" />
              <span className="text-secondary light:text-secondary-dark">
                Peak focus:{' '}
                <span className="text-primary light:text-primary-dark font-medium">
                  {data.peakLabel}
                </span>
              </span>
            </motion.div>
          )}

          {/* Legend */}
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : { delay: 0.3 }}
            className="flex items-center justify-center gap-1.5 text-[10px] text-tertiary light:text-tertiary-dark"
          >
            <span>Less</span>
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded-sm bg-tertiary/5 light:bg-tertiary-dark/5" />
              <div className="w-3 h-3 rounded-sm bg-accent/20 light:bg-accent-dark/20" />
              <div className="w-3 h-3 rounded-sm bg-accent/40 light:bg-accent-dark/40" />
              <div className="w-3 h-3 rounded-sm bg-accent/70 light:bg-accent-dark/70" />
              <div className="w-3 h-3 rounded-sm bg-accent light:bg-accent-dark" />
            </div>
            <span>More</span>
          </motion.div>

          {/* Time Range Context */}
          <p className="text-[10px] text-tertiary/60 light:text-tertiary-dark/60 text-center mt-3">
            Based on {timeRangeLabel}
          </p>
        </>
      )}
    </motion.section>
  );
}
