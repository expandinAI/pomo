'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { getRhythmLabel } from '@/lib/rhythm-texts';
import type { ProjectRhythm } from '@/lib/rhythm';

interface ProjectRhythmItemProps {
  projectRhythm: ProjectRhythm;
  index: number;
}

function formatMiniMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)}`;
}

/**
 * Single project rhythm row
 * Shows: Project name | Mini numbers (25 → 29 min) | Rhythm type
 */
export function ProjectRhythmItem({ projectRhythm, index }: ProjectRhythmItemProps) {
  const { projectName, rhythm } = projectRhythm;
  const label = getRhythmLabel(rhythm.type);

  const estimatedMin = formatMiniMinutes(rhythm.averageEstimated);
  const actualMin = formatMiniMinutes(rhythm.averageActual);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: 'spring',
        ...SPRING.gentle,
        delay: index * 0.05,
      }}
      className="flex items-center gap-3 py-3"
    >
      {/* Project name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary light:text-primary-dark truncate">
          {projectName}
        </p>
      </div>

      {/* Mini numbers: 25 → 29 min */}
      <div className="flex items-center gap-1.5 text-xs tabular-nums">
        <span className="text-tertiary/60 light:text-tertiary-dark/60">
          {estimatedMin}
        </span>
        <ArrowRight className="w-3 h-3 text-tertiary/30 light:text-tertiary-dark/30" />
        <span className="text-primary light:text-primary-dark font-medium">
          {actualMin}
        </span>
        <span className="text-tertiary/40 light:text-tertiary-dark/40 ml-0.5">
          min
        </span>
      </div>

      {/* Rhythm label */}
      <div className="flex-shrink-0 w-16 text-right">
        <span className="text-xs text-tertiary light:text-tertiary-dark">
          {label}
        </span>
      </div>
    </motion.div>
  );
}
