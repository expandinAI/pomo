'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { RhythmContent } from '@/lib/content/learn-content';

interface RhythmCardProps {
  rhythm: RhythmContent;
  isActive: boolean;
  onTry: () => void;
}

export function RhythmCard({ rhythm, isActive, onTry }: RhythmCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-xl',
        'border',
        isActive
          ? 'border-accent/30 light:border-accent-dark/30 bg-accent/5 light:bg-accent-dark/5'
          : 'border-tertiary/10 light:border-tertiary-dark/10 bg-tertiary/5 light:bg-tertiary-dark/5'
      )}
    >
      {/* Header with radio indicator */}
      <div className="flex items-start gap-3 mb-3">
        {/* Radio indicator */}
        <div
          className={cn(
            'w-4 h-4 rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center',
            'border-2',
            isActive
              ? 'border-primary light:border-primary-dark'
              : 'border-tertiary/40 light:border-tertiary-dark/40'
          )}
        >
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-primary light:bg-primary-dark" />
          )}
        </div>

        {/* Title and duration */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="font-medium text-primary light:text-primary-dark">
              {rhythm.title}
            </h3>
            <span className="text-sm text-tertiary light:text-tertiary-dark">
              {rhythm.duration}
            </span>
          </div>
        </div>
      </div>

      {/* Paragraphs */}
      <div className="pl-7 space-y-2 mb-4">
        {rhythm.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="text-sm text-secondary light:text-secondary-dark leading-relaxed"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Action button */}
      <div className="pl-7">
        <button
          onClick={onTry}
          disabled={isActive}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            isActive
              ? 'bg-tertiary/10 light:bg-tertiary-dark/10 text-tertiary light:text-tertiary-dark cursor-default'
              : 'bg-accent/10 light:bg-accent-dark/10 text-primary light:text-primary-dark hover:bg-accent/20 light:hover:bg-accent-dark/20'
          )}
        >
          {isActive ? 'Active' : 'Try this rhythm'}
        </button>
      </div>
    </motion.div>
  );
}
