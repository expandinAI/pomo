'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import type { Project, ProjectWithStats } from '@/lib/projects';

interface ProjectSelectorProps {
  /** List of projects to display */
  projects: (Project | ProjectWithStats)[];
  /** Currently selected project ID (null for "No Project") */
  selectedProjectId: string | null;
  /** Called when a project is selected */
  onSelect: (projectId: string | null) => void;
  /** Recent project IDs for P 1-9 ordering */
  recentProjectIds?: string[];
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Called when "New Project" is clicked */
  onCreateNew?: () => void;
}

/**
 * Project selector dropdown for the Timer
 *
 * Features:
 * - Displays current project or "No Project"
 * - Dropdown with all active projects
 * - Keyboard shortcuts: P to open, P 0-9 for quick selection
 * - Arrow key navigation and Enter to select
 * - Brightness indicator for each project
 */
export function ProjectSelector({
  projects,
  selectedProjectId,
  onSelect,
  recentProjectIds = [],
  disabled = false,
  onCreateNew,
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Sort projects by recent usage
  const sortedProjects = useMemo(() => {
    const recentOrder = new Map(recentProjectIds.map((id, idx) => [id, idx]));
    return [...projects].sort((a, b) => {
      const aOrder = recentOrder.get(a.id) ?? 999;
      const bOrder = recentOrder.get(b.id) ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    });
  }, [projects, recentProjectIds]);

  // Items for dropdown: projects + "No Project" + "New Project"
  const items = useMemo(() => {
    const projectItems = sortedProjects.map((p, idx) => ({
      type: 'project' as const,
      id: p.id,
      name: p.name,
      brightness: p.brightness,
      shortcut: idx < 9 ? `P ${idx + 1}` : undefined,
    }));

    return [
      ...projectItems,
      { type: 'divider' as const },
      { type: 'noProject' as const, id: null, name: 'No Project', shortcut: 'P 0' },
      ...(onCreateNew ? [{ type: 'newProject' as const, name: 'New Project...' }] : []),
    ];
  }, [sortedProjects, onCreateNew]);

  // Get selected project
  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : null;

  // Handle opening dropdown
  const handleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setHighlightedIndex(0);
  }, [disabled]);

  // Handle closing dropdown
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  // Handle selection
  const handleSelect = useCallback(
    (projectId: string | null) => {
      onSelect(projectId);
      handleClose();
    },
    [onSelect, handleClose]
  );

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // P key to toggle dropdown (when not open)
      if (!isOpen && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handleOpen();
        return;
      }

      // When open, handle navigation
      if (isOpen) {
        switch (e.key) {
          case 'Escape':
            e.preventDefault();
            handleClose();
            break;

          case 'ArrowDown':
          case 'j':
          case 'J':
            e.preventDefault();
            setHighlightedIndex((prev) => {
              // Find next selectable item
              let next = prev + 1;
              while (next < items.length) {
                const item = items[next];
                if (item.type !== 'divider') return next;
                next++;
              }
              return prev;
            });
            break;

          case 'ArrowUp':
          case 'k':
          case 'K':
            e.preventDefault();
            setHighlightedIndex((prev) => {
              // Find previous selectable item
              let next = prev - 1;
              while (next >= 0) {
                const item = items[next];
                if (item.type !== 'divider') return next;
                next--;
              }
              return prev;
            });
            break;

          case 'Enter':
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < items.length) {
              const item = items[highlightedIndex];
              if (item.type === 'project' || item.type === 'noProject') {
                handleSelect('id' in item ? item.id : null);
              } else if (item.type === 'newProject') {
                onCreateNew?.();
                handleClose();
              }
            }
            break;

          // Quick selection P 0-9
          case '0':
            e.preventDefault();
            handleSelect(null);
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9': {
            const idx = parseInt(e.key) - 1;
            if (idx < sortedProjects.length) {
              e.preventDefault();
              handleSelect(sortedProjects[idx].id);
            }
            break;
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, items, sortedProjects, handleOpen, handleClose, handleSelect, onCreateNew]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex] as HTMLElement;
      highlightedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex]);

  // Listen for event to open selector (from Command Palette)
  useEffect(() => {
    function handleToggle() {
      if (!disabled) {
        setIsOpen((prev) => !prev);
        if (!isOpen) {
          setHighlightedIndex(0);
        }
      }
    }

    window.addEventListener('particle:toggle-project-selector', handleToggle);
    return () => window.removeEventListener('particle:toggle-project-selector', handleToggle);
  }, [disabled, isOpen]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        disabled={disabled}
        className={`
          relative z-20 w-full flex items-center justify-between gap-2 px-4 py-3
          rounded-xl text-sm text-left
          bg-surface/70 light:bg-surface-dark/70
          backdrop-blur-md
          border border-white/[0.08] light:border-black/[0.05]
          shadow-lg
          transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface/80 light:hover:bg-surface-dark/80'}
          focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select project"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-tertiary light:text-tertiary-dark shrink-0">Project:</span>
          {selectedProject ? (
            <>
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: `rgba(255, 255, 255, ${selectedProject.brightness})` }}
              />
              <span className="text-secondary light:text-secondary-dark truncate">
                {selectedProject.name}
              </span>
            </>
          ) : (
            <span className="text-tertiary light:text-tertiary-dark">No Project</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <kbd className="text-xs text-tertiary light:text-tertiary-dark">P</kbd>
          <ChevronDown
            className={`w-4 h-4 text-tertiary light:text-tertiary-dark transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', ...SPRING.snappy, duration: 0.15 }}
            className="absolute z-50 w-full mt-2 py-1 bg-surface light:bg-surface-dark rounded-xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden"
          >
            <div
              ref={listRef}
              role="listbox"
              className="max-h-64 overflow-y-auto"
            >
              {items.map((item, idx) => {
                if (item.type === 'divider') {
                  return (
                    <div
                      key="divider"
                      className="my-1 border-t border-tertiary/10 light:border-tertiary-dark/10"
                    />
                  );
                }

                const isHighlighted = idx === highlightedIndex;
                const isSelected =
                  (item.type === 'project' && item.id === selectedProjectId) ||
                  (item.type === 'noProject' && selectedProjectId === null);

                if (item.type === 'newProject') {
                  return (
                    <button
                      key="new"
                      onClick={() => {
                        onCreateNew?.();
                        handleClose();
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`
                        w-full flex items-center gap-2 px-4 py-2 text-sm text-left
                        ${isHighlighted ? 'bg-tertiary/10 light:bg-tertiary-dark/10' : ''}
                        text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark
                        transition-colors
                      `}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id ?? 'no-project'}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect('id' in item ? item.id : null)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`
                      w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-left
                      ${isHighlighted ? 'bg-tertiary/10 light:bg-tertiary-dark/10' : ''}
                      ${isSelected ? 'text-primary light:text-primary-dark' : 'text-secondary light:text-secondary-dark'}
                      transition-colors
                    `}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isSelected ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent light:bg-accent-dark shrink-0" />
                      ) : (
                        <span className="w-1.5 shrink-0" />
                      )}
                      {item.type === 'project' && 'brightness' in item && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: `rgba(255, 255, 255, ${item.brightness})` }}
                        />
                      )}
                      <span className="truncate">{item.name}</span>
                    </div>
                    {'shortcut' in item && item.shortcut && (
                      <kbd className="text-xs text-tertiary light:text-tertiary-dark shrink-0">
                        {item.shortcut}
                      </kbd>
                    )}
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
