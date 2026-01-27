'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { TaskSuggestions } from './TaskSuggestions';
import { ProjectDropdown } from './ProjectDropdown';
import { KeyboardHint } from '@/components/ui/KeyboardHint';
import { getRecentTasks, filterTasks, type RecentTask } from '@/lib/task-storage';
import { parseSmartInput, formatDurationPreview, parseMultiLineInput, formatTotalTime } from '@/lib/smart-input-parser';
import type { Project, ProjectWithStats } from '@/lib/projects';

interface UnifiedTaskInputProps {
  // Task
  taskText: string;
  onTaskChange: (text: string) => void;
  onEnter?: () => void;
  /** Called when user submits with smart duration (e.g., "Meeting 30") */
  onSubmitWithDuration?: (task: string | null, durationSeconds: number, wasLimited: boolean) => void;

  // Project
  projectId: string | null;
  onProjectSelect: (projectId: string | null) => void;
  projects: (Project | ProjectWithStats)[];
  recentProjectIds?: string[];

  // General
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  /** If true, session is running - Enter will just recalculate, not start */
  isSessionRunning?: boolean;
  /** Index of the randomly picked task (Shift+R feature) */
  pickedTaskIndex?: number | null;
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
  onSubmitWithDuration,
  projectId,
  onProjectSelect,
  projects,
  recentProjectIds = [],
  disabled = false,
  inputRef: externalRef,
  isSessionRunning = false,
  pickedTaskIndex = null,
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

  // Parse smart input for duration detection (comma-separated tasks)
  const parsedTasks = useMemo(() => parseMultiLineInput(taskText), [taskText]);
  const hasMultipleTasks = parsedTasks.tasks.length > 1;
  const totalMinutes = parsedTasks.totalMinutes;

  // For single task, show smart preview
  const singleLineParsed = useMemo(() => {
    if (hasMultipleTasks) return null;
    return parseSmartInput(taskText);
  }, [taskText, hasMultipleTasks]);

  const showSmartPreview = !hasMultipleTasks && singleLineParsed?.durationSeconds !== null;
  const showTotalTime = hasMultipleTasks && totalMinutes > 0;

  // Count pending (uncompleted) tasks for Random Pick hint
  const pendingTaskCount = useMemo(() => {
    return parsedTasks.tasks.filter(t => !t.completed).length;
  }, [parsedTasks.tasks]);

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
      const newValue = e.target.value.slice(0, MAX_TASK_LENGTH * 10);
      onTaskChange(newValue);
    },
    [onTaskChange]
  );

  // Focus input when switching from compact view to edit mode
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused, inputRef]);

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
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Escape = close
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        setSuggestionIndex(-1);
        inputRef.current?.blur();
        return;
      }

      // Arrow navigation for suggestions
      if (showSuggestions && filteredTasks.length > 0) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSuggestionIndex((prev) =>
              prev < filteredTasks.length - 1 ? prev + 1 : prev
            );
            return;
          case 'ArrowUp':
            e.preventDefault();
            setSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
            return;
        }
      }

      // Enter = Submit (start session or recalculate if running)
      if (e.key === 'Enter') {
        e.preventDefault();

        // If suggestion is selected, use it instead
        if (showSuggestions && suggestionIndex >= 0) {
          handleSelectTask(filteredTasks[suggestionIndex]);
          return;
        }

        // If session is already running, just blur (recalculate happens via state)
        if (isSessionRunning) {
          inputRef.current?.blur();
          return;
        }

        // Start session
        inputRef.current?.blur();

        if (totalMinutes > 0 && onSubmitWithDuration) {
          onSubmitWithDuration(taskText, totalMinutes * 60, false);
        } else if (singleLineParsed?.durationSeconds && onSubmitWithDuration) {
          onSubmitWithDuration(taskText, singleLineParsed.durationSeconds, singleLineParsed.wasLimited);
        } else {
          onEnter?.();
        }
      }
    },
    [showSuggestions, filteredTasks, suggestionIndex, handleSelectTask, onEnter, onSubmitWithDuration, singleLineParsed, inputRef, totalMinutes, taskText, isSessionRunning]
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
          bg-surface/40 light:bg-surface-dark/40
          backdrop-blur-sm
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
        {/* Input + Project Badge */}
        <div className="flex items-center gap-3">
          {/* Unfocused with tasks: Show compact styled display */}
          {!isFocused && totalMinutes > 0 ? (
            <div
              onClick={() => setIsFocused(true)}
              className="flex-1 flex items-center gap-2 text-sm leading-relaxed cursor-text"
            >
              <div className="truncate">
                <AnimatePresence mode="popLayout">
                  {(() => {
                    // Add metadata for sorting
                    const tasksWithMeta = parsedTasks.tasks.map((task, i) => ({
                      ...task,
                      originalIndex: i,
                      isPicked: i === pickedTaskIndex,
                    }));

                    // Picked task first, then original order
                    const sorted = [...tasksWithMeta].sort((a, b) => {
                      if (a.isPicked) return -1;
                      if (b.isPicked) return 1;
                      return a.originalIndex - b.originalIndex;
                    });

                    return sorted.map((task, displayIndex) => (
                      <motion.span
                        key={task.originalIndex}
                        layout
                        animate={{
                          opacity: task.isPicked ? 1 : (pickedTaskIndex !== null ? 0.5 : 1),
                          scale: task.isPicked ? 1.02 : 1,
                        }}
                        transition={{ type: 'spring', ...SPRING.gentle }}
                      >
                        {displayIndex > 0 && <span className="mx-1.5 text-tertiary/50 light:text-tertiary-dark/50">·</span>}
                        {task.isPicked && (
                          <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-accent light:text-accent-dark mr-1"
                          >→</motion.span>
                        )}
                        <span className={task.completed ? 'line-through opacity-50' : 'text-primary light:text-primary-dark'}>
                          {task.text}
                        </span>
                        {task.duration > 0 && (
                          <span className={`ml-1 ${task.completed ? 'line-through opacity-50' : 'text-tertiary light:text-tertiary-dark'}`}>
                            {task.duration}
                          </span>
                        )}
                      </motion.span>
                    ));
                  })()}
                </AnimatePresence>
              </div>
              {/* Random Pick hint - shows when 2+ pending tasks and none picked yet */}
              {pendingTaskCount >= 2 && pickedTaskIndex === null && (
                <KeyboardHint
                  shortcut="R"
                  className="ml-auto flex-shrink-0 !opacity-50 hover:!opacity-80 !text-secondary light:!text-secondary-dark !border-white/[0.08] light:!border-black/[0.05]"
                />
              )}
            </div>
          ) : (
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
              maxLength={MAX_TASK_LENGTH * 10}
              className={`
                flex-1 bg-transparent
                text-primary light:text-primary-dark
                placeholder:text-tertiary/60 light:placeholder:text-tertiary-dark/60
                text-sm leading-relaxed
                focus:outline-none
                ${disabled ? 'cursor-not-allowed' : ''}
              `}
              aria-label="Task description"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          )}

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

      {/* Smart Input Preview - shows detected duration (single-line) */}
      <AnimatePresence>
        {showSmartPreview && isFocused && !showSuggestions && !showProjectDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', ...SPRING.gentle }}
            className="
              absolute left-0 right-0 top-full mt-1 z-10
              px-4 py-2.5
              bg-surface/60 light:bg-surface-dark/60
              backdrop-blur-sm
              border border-white/[0.08] light:border-black/[0.05]
              rounded-lg
              flex items-center justify-between
            "
          >
            <span className="text-sm text-secondary light:text-secondary-dark">
              {singleLineParsed?.taskName ? (
                <>
                  <span className="text-primary light:text-primary-dark">{singleLineParsed.taskName}</span>
                  <span className="mx-2 text-tertiary light:text-tertiary-dark">·</span>
                  <span>{formatDurationPreview(singleLineParsed.durationSeconds!)}</span>
                </>
              ) : (
                <span>{formatDurationPreview(singleLineParsed!.durationSeconds!)}</span>
              )}
            </span>
            <span className="text-tertiary light:text-tertiary-dark text-xs">↵</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-Line Total Time - Compact Preview */}
      <AnimatePresence>
        {showTotalTime && isFocused && !showSuggestions && !showProjectDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', ...SPRING.gentle }}
            className="
              absolute left-0 right-0 top-full mt-1 z-10
              px-4 py-2.5
              bg-surface/60 light:bg-surface-dark/60
              backdrop-blur-sm
              border border-white/[0.08] light:border-black/[0.05]
              rounded-lg
              flex flex-col gap-1.5
            "
          >
            {/* Compact task list */}
            <div className="text-sm text-secondary light:text-secondary-dark truncate">
              {parsedTasks.tasks.map((task, i) => (
                <span key={i}>
                  {i > 0 && <span className="mx-1.5 text-tertiary/50 light:text-tertiary-dark/50">·</span>}
                  <span className={task.completed ? 'line-through opacity-50' : 'text-primary light:text-primary-dark'}>
                    {task.text}
                  </span>
                  {task.duration > 0 && (
                    <span className={`ml-1 ${task.completed ? 'line-through opacity-50' : 'text-tertiary light:text-tertiary-dark'}`}>
                      {task.duration}
                    </span>
                  )}
                </span>
              ))}
            </div>
            {/* Total row */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary light:text-secondary-dark">
                <span className="text-tertiary light:text-tertiary-dark">Total:</span>
                <span className="ml-2 text-primary light:text-primary-dark font-medium">
                  {formatTotalTime(totalMinutes)}
                </span>
                {parsedTasks.completedCount > 0 && (
                  <span className="ml-2 text-tertiary/70 light:text-tertiary-dark/70">
                    ({parsedTasks.completedCount} done)
                  </span>
                )}
              </span>
              <span className="text-tertiary light:text-tertiary-dark text-xs">↵</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
