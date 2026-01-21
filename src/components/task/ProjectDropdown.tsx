'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import type { Project, ProjectWithStats } from '@/lib/projects';

interface ProjectDropdownProps {
  /** Currently selected project ID (null for "No Project") */
  projectId: string | null;
  /** Called when a project is selected */
  onSelect: (projectId: string | null) => void;
  /** List of projects to display */
  projects: (Project | ProjectWithStats)[];
  /** Recent project IDs for P 1-9 ordering */
  recentProjectIds?: string[];
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Whether the dropdown is currently open (controlled) */
  isOpen?: boolean;
  /** Called when dropdown open state changes */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Project dropdown for selecting a project
 *
 * Features:
 * - Badge trigger showing current project
 * - Dropdown with all active projects
 * - Keyboard shortcuts: 0-9 for quick selection when open
 * - Arrow key navigation
 */
export function ProjectDropdown({
  projectId,
  onSelect,
  projects,
  recentProjectIds = [],
  disabled = false,
  isOpen: controlledIsOpen,
  onOpenChange,
}: ProjectDropdownProps) {
  // Internal state for uncontrolled mode
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Use controlled or uncontrolled mode
  const isOpen = controlledIsOpen ?? internalIsOpen;
  const setIsOpen = useCallback(
    (value: boolean) => {
      if (onOpenChange) {
        onOpenChange(value);
      } else {
        setInternalIsOpen(value);
      }
    },
    [onOpenChange]
  );

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

  // Items for dropdown
  const items = useMemo(() => {
    const projectItems = sortedProjects.map((p, idx) => ({
      type: 'project' as const,
      id: p.id,
      name: p.name,
      brightness: p.brightness,
      shortcut: idx < 9 ? `${idx + 1}` : undefined,
    }));

    return [
      ...projectItems,
      { type: 'divider' as const },
      { type: 'noProject' as const, id: null, name: 'No Project', shortcut: '0' },
    ];
  }, [sortedProjects]);

  // Get selected project
  const selectedProject = projectId
    ? projects.find((p) => p.id === projectId)
    : null;

  // Handle opening
  const handleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setHighlightedIndex(0);
  }, [disabled, setIsOpen]);

  // Handle closing
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [setIsOpen]);

  // Handle selection
  const handleSelect = useCallback(
    (newProjectId: string | null) => {
      onSelect(newProjectId);
      handleClose();
    },
    [onSelect, handleClose]
  );

  // Handle keyboard navigation when open
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          handleClose();
          break;

        case 'ArrowDown':
        case 'j':
        case 'J':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            let next = prev + 1;
            while (next < items.length) {
              if (items[next].type !== 'divider') return next;
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
            let next = prev - 1;
            while (next >= 0) {
              if (items[next].type !== 'divider') return next;
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
            }
          }
          break;

        // Quick selection 0-9
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
    },
    [isOpen, highlightedIndex, items, sortedProjects, handleClose, handleSelect]
  );

  // Listen for keyboard events
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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

  // Listen for event to toggle (from Command Palette)
  useEffect(() => {
    function handleToggle() {
      if (!disabled) {
        if (isOpen) {
          handleClose();
        } else {
          handleOpen();
        }
      }
    }

    window.addEventListener('particle:toggle-project-selector', handleToggle);
    return () => window.removeEventListener('particle:toggle-project-selector', handleToggle);
  }, [disabled, isOpen, handleOpen, handleClose]);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Badge Trigger */}
      <motion.button
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        disabled={disabled}
        className={`
          bg-tertiary/10 light:bg-tertiary-dark/10
          hover:bg-tertiary/15 light:hover:bg-tertiary-dark/15
          rounded-lg px-2.5 py-1
          text-xs text-secondary light:text-secondary-dark
          flex items-center gap-1.5
          transition-colors
          shrink-0
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        `}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select project"
      >
        {selectedProject ? (
          <>
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: `rgba(255, 255, 255, ${selectedProject.brightness})` }}
            />
            <span className="truncate max-w-[100px] sm:max-w-[120px]">
              {selectedProject.name}
            </span>
          </>
        ) : (
          <span className="text-tertiary light:text-tertiary-dark">No Project</span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-tertiary light:text-tertiary-dark transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', ...SPRING.snappy, duration: 0.15 }}
            className="absolute right-0 z-50 min-w-[200px] mt-2 py-1 bg-surface light:bg-surface-dark rounded-xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden"
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
                  (item.type === 'project' && item.id === projectId) ||
                  (item.type === 'noProject' && projectId === null);

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
