'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface ProjectListItemProps {
  /** Project ID (null for "No Project") */
  id: string | null;
  /** Project name */
  name: string;
  /** Brightness value (0.3-1.0) */
  brightness: number;
  /** Total particle count */
  particleCount: number;
  /** Particles this week */
  weekParticleCount: number;
  /** Whether this project is archived */
  isArchived?: boolean;
  /** Whether this item is focused */
  isFocused: boolean;
  /** Animation delay index */
  index: number;
  /** Click handler */
  onClick: () => void;
  /** Edit handler (E key) */
  onEdit?: () => void;
  /** Archive handler (A key) */
  onArchive?: () => void;
}

/**
 * Individual project item in the list
 *
 * Shows name, brightness indicator, particle count, and week count.
 * Supports keyboard focus state and click navigation.
 */
export const ProjectListItem = forwardRef<HTMLButtonElement, ProjectListItemProps>(
  function ProjectListItem(
    {
      id,
      name,
      brightness,
      particleCount,
      weekParticleCount,
      isArchived = false,
      isFocused,
      index,
      onClick,
    },
    ref
  ) {
    const isNoProject = id === null;

    return (
      <motion.button
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.15 }}
        onClick={onClick}
        className={`
          w-full flex items-center justify-between gap-4 px-4 py-3
          rounded-xl text-left transition-colors
          ${isFocused
            ? 'bg-tertiary/15 light:bg-tertiary-dark/15 ring-1 ring-accent/30 light:ring-accent-dark/30'
            : 'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
          }
          ${isArchived ? 'opacity-50' : ''}
          focus:outline-none
        `}
        aria-current={isFocused ? 'true' : undefined}
      >
        {/* Left side: brightness dot + name + week count */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Brightness indicator */}
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${isNoProject ? 'border border-tertiary/30' : ''}`}
            style={{
              backgroundColor: isNoProject
                ? 'transparent'
                : `rgba(255, 255, 255, ${brightness})`,
            }}
          />

          {/* Name and week count */}
          <div className="min-w-0 flex-1">
            <div className={`font-medium truncate ${
              isNoProject
                ? 'text-tertiary light:text-tertiary-dark'
                : 'text-primary light:text-primary-dark'
            }`}>
              {name}
              {isArchived && (
                <span className="ml-2 text-xs text-tertiary light:text-tertiary-dark">(archived)</span>
              )}
            </div>
            <div className="text-xs text-tertiary light:text-tertiary-dark">
              {isNoProject
                ? 'Particles without assignment'
                : `This week: ${weekParticleCount}`
              }
            </div>
          </div>
        </div>

        {/* Right side: particle count + arrow */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-secondary light:text-secondary-dark tabular-nums">
            {particleCount} {particleCount === 1 ? 'Particle' : 'Particles'}
          </span>
          <ChevronRight
            className={`w-4 h-4 transition-opacity ${
              isFocused
                ? 'opacity-100 text-secondary light:text-secondary-dark'
                : 'opacity-0'
            }`}
          />
        </div>
      </motion.button>
    );
  }
);
