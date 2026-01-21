'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { TaskSuggestions } from './TaskSuggestions';
import { ProjectDropdown } from './ProjectDropdown';
import { getRecentTasks, filterTasks, type RecentTask } from '@/lib/task-storage';
import type { Project, ProjectWithStats } from '@/lib/projects';

interface UnifiedTaskInputProps {
  // Task
  taskText: string;
  onTaskChange: (text: string) => void;
  onEnter?: () => void;

  // Project
  projectId: string | null;
  onProjectSelect: (projectId: string | null) => void;
  projects: (Project | ProjectWithStats)[];
  recentProjectIds?: string[];

  // General
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const MAX_TASK_LENGTH = 100;

/**
 * Unified task and project input component
 *
 * Combines task input with project selection in a single elegant container.
 * Clean, minimal design following Particle philosophy.
 */
export function UnifiedTaskInput({
  taskText,
  onTaskChange,
  onEnter,
  projectId,
  onProjectSelect,
  projects,
  recentProjectIds = [],
  disabled = false,
  inputRef: externalRef,
}: UnifiedTaskInputProps) {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = externalRef || internalRef;
  const containerRef = useRef<HTMLDivElement>(null);

  // Task state
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  // Project dropdown state
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Load recent tasks on focus
  useEffect(() => {
    if (isFocused) {
      setRecentTasks(getRecentTasks());
    }
  }, [isFocused]);

  // Filter task suggestions
  const filteredTasks = filterTasks(recentTasks, taskText);
  const hasSuggestions = filteredTasks.length > 0 && !disabled;

  // Show suggestions when focused and has suggestions (but not when project dropdown is open)
  useEffect(() => {
    setShowSuggestions(isFocused && hasSuggestions && !showProjectDropdown);
    setSuggestionIndex(-1);
  }, [isFocused, hasSuggestions, showProjectDropdown]);

  // Handle task input change
  const handleTaskChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.slice(0, MAX_TASK_LENGTH);
      onTaskChange(newValue);
    },
    [onTaskChange]
  );

  // Handle task selection from suggestions
  const handleSelectTask = useCallback(
    (task: RecentTask) => {
      onTaskChange(task.text);
      setShowSuggestions(false);
      inputRef.current?.focus();
    },
    [onTaskChange, inputRef]
  );

  // Handle project selection
  const handleProjectSelect = useCallback(
    (newProjectId: string | null) => {
      onProjectSelect(newProjectId);
      setShowProjectDropdown(false);
      // Don't refocus input - let user use keyboard shortcuts
    },
    [onProjectSelect]
  );

  // Handle input keyboard navigation
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Task suggestion navigation
      if (showSuggestions && filteredTasks.length > 0) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSuggestionIndex((prev) =>
              prev < filteredTasks.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
            break;
          case 'Enter':
            if (suggestionIndex >= 0 && suggestionIndex < filteredTasks.length) {
              e.preventDefault();
              handleSelectTask(filteredTasks[suggestionIndex]);
            } else {
              // Blur input to release focus for keyboard shortcuts
              inputRef.current?.blur();
              onEnter?.();
            }
            break;
          case 'Escape':
            e.preventDefault();
            setShowSuggestions(false);
            setSuggestionIndex(-1);
            break;
        }
      } else if (e.key === 'Enter') {
        // Blur input to release focus for keyboard shortcuts
        inputRef.current?.blur();
        onEnter?.();
      }
    },
    [showSuggestions, filteredTasks, suggestionIndex, handleSelectTask, onEnter, inputRef]
  );

  // Global keyboard shortcuts for P key
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      // Ignore if typing in inputs (except our own)
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // P key to open project dropdown
      if (!showProjectDropdown && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setShowProjectDropdown(true);
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showProjectDropdown]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <motion.div
        className={`
          relative z-20 px-4 py-3
          bg-surface/70 light:bg-surface-dark/70
          backdrop-blur-md
          border border-white/[0.08] light:border-black/[0.05]
          rounded-xl shadow-lg
          transition-colors duration-fast
          ${isFocused ? 'border-accent/30 light:border-accent-dark/30' : ''}
          ${disabled ? 'opacity-60' : ''}
        `}
        animate={{
          scale: isFocused && !disabled ? 1.01 : 1,
        }}
        transition={{ type: 'spring', ...SPRING.gentle }}
      >
        {/* Single row: Input + Project Badge */}
        <div className="flex items-center gap-3">
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={taskText}
            onChange={handleTaskChange}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            disabled={disabled}
            placeholder="What are you working on?"
            maxLength={MAX_TASK_LENGTH}
            className={`
              flex-1 bg-transparent
              text-primary light:text-primary-dark
              placeholder:text-tertiary/60 light:placeholder:text-tertiary-dark/60
              text-sm
              focus:outline-none
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
            aria-label="Task description"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          <ProjectDropdown
            projectId={projectId}
            onSelect={handleProjectSelect}
            projects={projects}
            recentProjectIds={recentProjectIds}
            disabled={disabled}
            isOpen={showProjectDropdown}
            onOpenChange={setShowProjectDropdown}
          />
        </div>
      </motion.div>

      {/* Task Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && !showProjectDropdown && (
          <TaskSuggestions
            tasks={filteredTasks}
            selectedIndex={suggestionIndex}
            onSelect={handleSelectTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
