'use client';

import { useMemo } from 'react';
import { getActiveProjects } from '@/lib/projects';
import { ProjectFilterDropdown } from './ProjectFilterDropdown';

type TypeFilter = 'all' | 'work' | 'break';

interface ParticleFilterBarProps {
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  projectFilter: string | null;
  onProjectFilterChange: (value: string | null) => void;
}

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'work', label: 'Focus' },
  { value: 'break', label: 'Break' },
];

/**
 * Filter bar with type toggle (All/Work/Break) and project dropdown
 */
export function ParticleFilterBar({
  typeFilter,
  onTypeFilterChange,
  projectFilter,
  onProjectFilterChange,
}: ParticleFilterBarProps) {
  const projects = useMemo(() => getActiveProjects(), []);

  return (
    <div className="flex items-center gap-3">
      {/* Type Toggle */}
      <div className="flex rounded-lg bg-tertiary/5 light:bg-tertiary-dark/5 p-0.5">
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onTypeFilterChange(option.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              typeFilter === option.value
                ? 'bg-surface light:bg-surface-dark text-primary light:text-primary-dark shadow-sm'
                : 'text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark'
            }`}
            aria-pressed={typeFilter === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Project Dropdown */}
      {projects.length > 0 && (
        <ProjectFilterDropdown
          value={projectFilter}
          onChange={onProjectFilterChange}
          projects={projects}
        />
      )}

      {/* Active filter indicator */}
      {(typeFilter !== 'all' || projectFilter) && (
        <button
          onClick={() => {
            onTypeFilterChange('all');
            onProjectFilterChange(null);
          }}
          className="text-xs text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
