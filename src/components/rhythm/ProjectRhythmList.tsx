'use client';

import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { ProjectRhythmItem } from './ProjectRhythmItem';
import type { ProjectRhythm } from '@/lib/rhythm';

interface ProjectRhythmListProps {
  projectRhythms: ProjectRhythm[];
}

/**
 * List of projects with their individual rhythms
 */
export function ProjectRhythmList({ projectRhythms }: ProjectRhythmListProps) {
  if (projectRhythms.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'spring', ...SPRING.gentle }}
        className="text-sm text-tertiary light:text-tertiary-dark text-center py-4"
      >
        Noch keine Projekte mit genügend Daten.
      </motion.p>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'spring', ...SPRING.gentle }}
        className="pb-2 mb-2 border-b border-tertiary/10 light:border-tertiary-dark/10"
      >
        <p className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wide">
          Pro Projekt
        </p>
      </motion.div>

      {/* Project items */}
      <div className="divide-y divide-tertiary/5 light:divide-tertiary-dark/5">
        {projectRhythms.map((projectRhythm, index) => (
          <ProjectRhythmItem
            key={projectRhythm.projectId}
            projectRhythm={projectRhythm}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
