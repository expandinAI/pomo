'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface ProjectEmptyStateProps {
  /** Called when "New Project" button is clicked */
  onCreateNew: () => void;
}

/**
 * Empty state shown when no projects exist
 *
 * Displays a message encouraging the user to create their first project,
 * with a prominent CTA button.
 */
export function ProjectEmptyState({ onCreateNew }: ProjectEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      {/* Particle icon */}
      <div className="w-16 h-16 mb-6 rounded-full bg-accent/10 light:bg-accent-dark/10 flex items-center justify-center">
        <span className="w-3 h-3 rounded-full bg-accent light:bg-accent-dark" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-primary light:text-primary-dark mb-2">
        Your life's work has many chapters.
      </h3>

      {/* Description */}
      <p className="text-sm text-tertiary light:text-tertiary-dark max-w-xs mb-8">
        Create your first project to group your particles and visualize your focus.
      </p>

      {/* CTA Button */}
      <button
        onClick={onCreateNew}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-accent light:bg-accent-dark text-background light:text-background-light hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <Plus className="w-5 h-5" />
        New Project
      </button>

      {/* Keyboard hint */}
      <p className="mt-4 text-xs text-tertiary light:text-tertiary-dark">
        or press <kbd className="px-1.5 py-0.5 rounded bg-tertiary/10 light:bg-tertiary-dark/10">N</kbd>
      </p>
    </motion.div>
  );
}
