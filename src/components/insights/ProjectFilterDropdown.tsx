'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import type { Project } from '@/lib/projects';

interface ProjectFilterDropdownProps {
  value: string | null;
  onChange: (projectId: string | null) => void;
  projects: Project[];
}

/**
 * Simple project filter dropdown for History tab
 * Shows "All Projects" as default, lists active projects
 */
export function ProjectFilterDropdown({
  value,
  onChange,
  projects,
}: ProjectFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProject = value ? projects.find((p) => p.id === value) : null;

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      const itemCount = projects.length + 1; // +1 for "All Projects"

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(false);
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, itemCount - 1));
          break;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex === 0) {
            onChange(null);
          } else if (highlightedIndex > 0 && highlightedIndex <= projects.length) {
            onChange(projects[highlightedIndex - 1].id);
          }
          setIsOpen(false);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, projects, onChange]);

  const handleSelect = useCallback(
    (projectId: string | null) => {
      onChange(projectId);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    // Highlight current selection
    if (value === null) {
      setHighlightedIndex(0);
    } else {
      const idx = projects.findIndex((p) => p.id === value);
      setHighlightedIndex(idx >= 0 ? idx + 1 : 0);
    }
  }, [value, projects]);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-tertiary/5 light:bg-tertiary-dark/5 border border-tertiary/10 light:border-tertiary-dark/10 text-secondary light:text-secondary-dark hover:border-tertiary/20 light:hover:border-tertiary-dark/20 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedProject ? (
          <>
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: `rgba(255, 255, 255, ${selectedProject.brightness})` }}
            />
            <span className="truncate max-w-[80px]">{selectedProject.name}</span>
          </>
        ) : (
          <span>All Projects</span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-tertiary light:text-tertiary-dark transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', ...SPRING.snappy, duration: 0.12 }}
            className="absolute left-0 z-50 min-w-[160px] mt-1 py-1 bg-surface light:bg-surface-dark rounded-lg shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden"
          >
            <div role="listbox" className="max-h-48 overflow-y-auto">
              {/* All Projects */}
              <button
                role="option"
                aria-selected={value === null}
                onClick={() => handleSelect(null)}
                onMouseEnter={() => setHighlightedIndex(0)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                  highlightedIndex === 0 ? 'bg-tertiary/10 light:bg-tertiary-dark/10' : ''
                } ${value === null ? 'text-primary light:text-primary-dark' : 'text-secondary light:text-secondary-dark'}`}
              >
                <span className="w-4 flex justify-center">
                  {value === null && <Check className="w-3 h-3" />}
                </span>
                <span>All Projects</span>
              </button>

              {/* Divider */}
              {projects.length > 0 && (
                <div className="my-1 border-t border-tertiary/10 light:border-tertiary-dark/10" />
              )}

              {/* Projects */}
              {projects.map((project, idx) => {
                const itemIndex = idx + 1;
                const isSelected = value === project.id;
                const isHighlighted = highlightedIndex === itemIndex;

                return (
                  <button
                    key={project.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(project.id)}
                    onMouseEnter={() => setHighlightedIndex(itemIndex)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                      isHighlighted ? 'bg-tertiary/10 light:bg-tertiary-dark/10' : ''
                    } ${isSelected ? 'text-primary light:text-primary-dark' : 'text-secondary light:text-secondary-dark'}`}
                  >
                    <span className="w-4 flex justify-center">
                      {isSelected && <Check className="w-3 h-3" />}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: `rgba(255, 255, 255, ${project.brightness})` }}
                    />
                    <span className="truncate">{project.name}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
