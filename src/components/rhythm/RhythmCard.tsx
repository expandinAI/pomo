'use client';

import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { RhythmVisualizer } from './RhythmVisualizer';
import { getRhythmDescription } from '@/lib/rhythm-texts';
import type { RhythmResult } from '@/lib/rhythm';

interface RhythmCardProps {
  rhythm: RhythmResult;
}

/**
 * Global rhythm card showing average stats and description
 */
export function RhythmCard({ rhythm }: RhythmCardProps) {
  const description = getRhythmDescription(rhythm.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', ...SPRING.gentle }}
      className="py-6 px-6 rounded-xl bg-tertiary/5 light:bg-tertiary-dark/5 border border-tertiary/10 light:border-tertiary-dark/10"
    >
      {/* Visualizer */}
      <div className="mb-6">
        <RhythmVisualizer
          estimatedSeconds={rhythm.averageEstimated}
          actualSeconds={rhythm.averageActual}
          variant="numbers"
        />
      </div>

      {/* Rhythm description - centered */}
      <p className="text-sm text-secondary light:text-secondary-dark leading-relaxed text-center max-w-[280px] mx-auto">
        {description}
      </p>
    </motion.div>
  );
}
