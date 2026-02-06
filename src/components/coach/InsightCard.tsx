'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';
import type { CoachInsight } from './types';

interface InsightCardProps {
  insight: CoachInsight | null;
  isLoading?: boolean;
}

/**
 * @deprecated Use CoachBriefing instead. Will be removed in a future cleanup.
 *
 * InsightCard - Displays the current AI Coach insight
 *
 * States:
 * - Loading: Skeleton animation
 * - Empty: "No insights yet" with subtle prompt
 * - With data: Title + Content + Highlights list
 */
export function InsightCard({ insight, isLoading = false }: InsightCardProps) {
  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="p-5 rounded-xl bg-tertiary/5 light:bg-tertiary-dark/5 border border-tertiary/10 light:border-tertiary-dark/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded bg-tertiary/20 light:bg-tertiary-dark/20 animate-pulse" />
          <div className="h-4 w-24 rounded bg-tertiary/20 light:bg-tertiary-dark/20 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-tertiary/15 light:bg-tertiary-dark/15 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-tertiary/15 light:bg-tertiary-dark/15 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-tertiary/15 light:bg-tertiary-dark/15 animate-pulse" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-1/2 rounded bg-tertiary/10 light:bg-tertiary-dark/10 animate-pulse" />
          <div className="h-3 w-2/3 rounded bg-tertiary/10 light:bg-tertiary-dark/10 animate-pulse" />
        </div>
      </div>
    );
  }

  // Empty state
  if (!insight) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-tertiary/5 light:bg-tertiary-dark/5 border border-dashed border-tertiary/20 light:border-tertiary-dark/20 text-center"
      >
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-full bg-tertiary/10 light:bg-tertiary-dark/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-tertiary light:text-tertiary-dark" />
          </div>
        </div>
        <p className="text-sm text-secondary light:text-secondary-dark mb-1">
          No insights yet
        </p>
        <p className="text-xs text-tertiary light:text-tertiary-dark">
          Complete a few focus sessions and I&apos;ll start noticing patterns
        </p>
      </motion.div>
    );
  }

  // Insight display
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl bg-tertiary/5 light:bg-tertiary-dark/5 border border-tertiary/10 light:border-tertiary-dark/10"
    >
      {/* Header with icon and title */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-secondary light:text-secondary-dark" />
        <h3 className="text-sm font-medium text-primary light:text-primary-dark">
          {insight.title}
        </h3>
      </div>

      {/* Main content */}
      <p className="text-sm text-secondary light:text-secondary-dark leading-relaxed">
        {insight.content}
      </p>

      {/* Highlights list */}
      {insight.highlights && insight.highlights.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {insight.highlights.map((highlight, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-xs text-tertiary light:text-tertiary-dark"
            >
              <span className="mt-1.5 w-1 h-1 rounded-full bg-tertiary light:bg-tertiary-dark flex-shrink-0" />
              {highlight}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
