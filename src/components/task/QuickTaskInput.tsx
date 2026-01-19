'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { TaskSuggestions } from './TaskSuggestions';
import { PomodoroEstimate } from './PomodoroEstimate';
import { getRecentTasks, filterTasks, type RecentTask } from '@/lib/task-storage';

interface QuickTaskInputProps {
  value: string;
  onChange: (value: string) => void;
  estimatedPomodoros: number | null;
  onEstimateChange: (estimate: number | null) => void;
  disabled?: boolean;
  onEnter?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const MAX_TASK_LENGTH = 100;

export function QuickTaskInput({
  value,
  onChange,
  estimatedPomodoros,
  onEstimateChange,
  disabled = false,
  onEnter,
  inputRef: externalRef,
}: QuickTaskInputProps) {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = externalRef || internalRef;
  const containerRef = useRef<HTMLDivElement>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Load recent tasks on mount and when focused
  useEffect(() => {
    if (isFocused) {
      setRecentTasks(getRecentTasks());
    }
  }, [isFocused]);

  // Filter suggestions based on input
  const filteredTasks = filterTasks(recentTasks, value);
  const hasSuggestions = filteredTasks.length > 0 && !disabled;

  // Show suggestions when focused and has suggestions
  useEffect(() => {
    setShowSuggestions(isFocused && hasSuggestions);
    setSelectedIndex(-1);
  }, [isFocused, hasSuggestions]);

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.slice(0, MAX_TASK_LENGTH);
      onChange(newValue);
    },
    [onChange]
  );

  // Handle task selection from suggestions
  const handleSelectTask = useCallback(
    (task: RecentTask) => {
      onChange(task.text);
      if (task.estimatedPomodoros) {
        onEstimateChange(task.estimatedPomodoros);
      }
      setShowSuggestions(false);
      inputRef.current?.focus();
    },
    [onChange, onEstimateChange, inputRef]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showSuggestions && filteredTasks.length > 0) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev < filteredTasks.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
            break;
          case 'Enter':
            if (selectedIndex >= 0 && selectedIndex < filteredTasks.length) {
              e.preventDefault();
              handleSelectTask(filteredTasks[selectedIndex]);
            } else if (onEnter) {
              onEnter();
            }
            break;
          case 'Escape':
            e.preventDefault();
            setShowSuggestions(false);
            setSelectedIndex(-1);
            break;
        }
      } else if (e.key === 'Enter' && onEnter) {
        onEnter();
      }
    },
    [showSuggestions, filteredTasks, selectedIndex, handleSelectTask, onEnter]
  );

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
          relative z-20 flex items-center gap-2 px-4 py-3
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
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
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

        <PomodoroEstimate
          value={estimatedPomodoros}
          onChange={onEstimateChange}
          disabled={disabled}
        />
      </motion.div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <TaskSuggestions
            tasks={filteredTasks}
            selectedIndex={selectedIndex}
            onSelect={handleSelectTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
