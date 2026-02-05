'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/utils';
import type { YearViewDay } from '@/lib/year-view';

export interface YearHighlight {
  label: string;
  value: string;
}

interface YearHighlightsProps {
  days: YearViewDay[];
  isProjectFiltered: boolean;
  gridAnimationComplete: boolean;
}

export function computeHighlights(
  days: YearViewDay[],
  isProjectFiltered: boolean,
): YearHighlight[] {
  const highlights: YearHighlight[] = [];

  // Top Project (skip if project filter is active)
  if (!isProjectFiltered) {
    const projectTotals = new Map<string, number>();
    for (const day of days) {
      if (day.topProject) {
        const current = projectTotals.get(day.topProject.name) ?? 0;
        projectTotals.set(day.topProject.name, current + day.particleCount);
      }
    }
    if (projectTotals.size > 0) {
      let topName = '';
      let topCount = 0;
      projectTotals.forEach((count, name) => {
        if (count > topCount) {
          topName = name;
          topCount = count;
        }
      });
      highlights.push({
        label: 'Most focused project',
        value: `${topName} — ${topCount} particles`,
      });
    }
  }

  return highlights;
}

export function YearHighlights({
  days,
  isProjectFiltered,
  gridAnimationComplete,
}: YearHighlightsProps) {
  const reducedMotion = prefersReducedMotion();

  const highlights = useMemo(
    () => computeHighlights(days, isProjectFiltered),
    [days, isProjectFiltered],
  );

  if (highlights.length === 0) return null;

  return (
    <div className="border-t border-tertiary/10 light:border-tertiary-dark/10 pt-4 mt-4">
      <div className="flex flex-col gap-2">
        {highlights.map((highlight, i) => (
          <motion.div
            key={highlight.label}
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            animate={
              gridAnimationComplete
                ? { opacity: 1, y: 0 }
                : reducedMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 6 }
            }
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 0.2, delay: i * 0.08, ease: 'easeOut' }
            }
            className="flex items-baseline gap-3 text-sm"
          >
            <span className="text-tertiary light:text-tertiary-dark w-[160px] flex-shrink-0">
              {highlight.label}
            </span>
            <span className="text-secondary light:text-secondary-dark">
              {highlight.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
