'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * History Tab - Placeholder for future particle search/filter functionality
 * Will allow users to search and filter all their particles
 */
export function HistoryTab() {
  const reducedMotion = prefersReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.gentle }}
      className="flex-1 flex items-center justify-center p-8"
      role="tabpanel"
      aria-label="History tab"
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tertiary/5 light:bg-tertiary-dark/5 flex items-center justify-center">
          <Search className="w-8 h-8 text-tertiary/40 light:text-tertiary-dark/40" />
        </div>
        <h3 className="text-lg font-medium text-primary light:text-primary-dark">
          Particle History
        </h3>
        <p className="text-sm text-tertiary light:text-tertiary-dark mt-2 max-w-xs mx-auto">
          Search and filter all your particles.
          <br />
          Coming in the next update.
        </p>
      </div>
    </motion.div>
  );
}
