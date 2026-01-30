'use client';

import { motion } from 'framer-motion';
import type { LocalDataSummary } from '@/lib/sync';

interface DataSummaryProps {
  summary: LocalDataSummary;
}

/**
 * DataSummary - Displays a summary of local data to be synced
 *
 * Shows particles count, projects count, and settings status
 * in a clean, minimal list format.
 */
export function DataSummary({ summary }: DataSummaryProps) {
  const items = [
    {
      label: 'Particles',
      value: summary.sessionCount,
      show: summary.sessionCount > 0,
    },
    {
      label: 'Projects',
      value: summary.projectCount,
      show: summary.projectCount > 0,
    },
    {
      label: 'Settings',
      value: '\u2713', // Checkmark
      show: summary.hasSettings,
    },
  ].filter(item => item.show);

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="border border-tertiary/10 light:border-tertiary-dark/10 rounded-lg overflow-hidden">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            className="flex items-center justify-between px-4 py-3 border-b border-tertiary/10 light:border-tertiary-dark/10 last:border-b-0"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <span className="text-sm text-secondary light:text-secondary-dark">
              {item.label}
            </span>
            <span className="text-sm font-medium text-primary light:text-primary-dark">
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
