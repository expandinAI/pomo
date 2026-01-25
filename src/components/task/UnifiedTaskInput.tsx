'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { TaskSuggestions } from './TaskSuggestions';
import { ProjectDropdown } from './ProjectDropdown';
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
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
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
}: UnifiedTaskInputProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = externalRef || internalRef;
  const containerRef = useRef<HTMLDivElement>(null);

  // Task state
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  // Project dropdown state
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Parse smart input for duration detection
  const multiLineParsed = useMemo(() => parseMultiLineInput(taskText), [taskText]);
  const hasMultipleLines = taskText.includes('\n');
  const totalMinutes = multiLineParsed.totalMinutes;

  // For single-line, still show smart preview
  const singleLineParsed = useMemo(() => {
    if (hasMultipleLines) return null;
    return parseSmartInput(taskText);
  }, [taskText, hasMultipleLines]);

  const showSmartPreview = !hasMultipleLines && singleLineParsed?.durationSeconds !== null;
  const showTotalTime = hasMultipleLines && totalMinutes > 0;

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
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value.slice(0, MAX_TASK_LENGTH * 10);
      onTaskChange(newValue);
    },
    [onTaskChange]
  );

  // Auto-grow textarea height (also triggers on focus to expand multi-line)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 128)}px`;
    }
  }, [taskText, inputRef, isFocused]);

  // Focus textarea when switching from compact view to edit mode
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
      // Trigger height recalculation after focus
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 128)}px`;
        }
      });
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
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Cmd/Ctrl+Enter = Submit
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.blur();

        if (totalMinutes > 0 && onSubmitWithDuration) {
          // Keep multi-line format for editing, display handles compact view
          onSubmitWithDuration(taskText, totalMinutes * 60, false);
        } else if (singleLineParsed?.durationSeconds && onSubmitWithDuration) {
          // Single-line with duration - keep full text for styled display
          onSubmitWithDuration(taskText, singleLineParsed.durationSeconds, singleLineParsed.wasLimited);
        } else {
          onEnter?.();
        }
        return;
      }

      // Escape = close
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        setSuggestionIndex(-1);
        inputRef.current?.blur();
        return;
      }

      // Arrow navigation for suggestions (only single-line)
      if (!hasMultipleLines && showSuggestions && filteredTasks.length > 0) {
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
            if (suggestionIndex >= 0) {
              e.preventDefault();
              handleSelectTask(filteredTasks[suggestionIndex]);
            }
            // Else: normal new line (default textarea behavior)
            break;
        }
        return;
      }

      // Enter = always new line (multi-line mode)
      // This allows users to type multiple tasks before submitting
    },
    [showSuggestions, filteredTasks, suggestionIndex, handleSelectTask, onEnter, onSubmitWithDuration, singleLineParsed, inputRef, hasMultipleLines, totalMinutes, multiLineParsed]
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
        {/* Textarea + Project Badge */}
        <div className="flex items-start gap-3">
          {/* Unfocused with duration: Show compact styled display */}
          {!isFocused && totalMinutes > 0 ? (
            <div
              onClick={() => setIsFocused(true)}
              className="flex-1 text-sm leading-relaxed cursor-text truncate"
            >
              {multiLineParsed.tasks.map((task, i) => (
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
          ) : (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={taskText}
              onChange={handleTaskChange}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              disabled={disabled}
              placeholder="What are you working on?"
              maxLength={MAX_TASK_LENGTH * 10}
              rows={1}
              className={`
                flex-1 bg-transparent resize-none
                text-primary light:text-primary-dark
                placeholder:text-tertiary/60 light:placeholder:text-tertiary-dark/60
                text-sm leading-relaxed
                focus:outline-none
                ${disabled ? 'cursor-not-allowed' : ''}
              `}
              style={{
                minHeight: '1.5rem',
                maxHeight: '8rem',
                height: 'auto',
              }}
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
            <span className="text-tertiary light:text-tertiary-dark text-xs">⌘↵</span>
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
              {multiLineParsed.tasks.map((task, i) => (
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
                {multiLineParsed.completedCount > 0 && (
                  <span className="ml-2 text-tertiary/70 light:text-tertiary-dark/70">
                    ({multiLineParsed.completedCount} done)
                  </span>
                )}
              </span>
              <span className="text-tertiary light:text-tertiary-dark text-xs">⌘↵</span>
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
