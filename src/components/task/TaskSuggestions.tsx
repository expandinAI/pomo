'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import type { RecentTask } from '@/lib/task-storage';

interface TaskSuggestionsProps {
  tasks: RecentTask[];
  selectedIndex: number;
  onSelect: (task: RecentTask) => void;
}

export function TaskSuggestions({
  tasks,
  selectedIndex,
  onSelect,
}: TaskSuggestionsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (tasks.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', ...SPRING.snappy }}
      className="absolute top-full left-0 right-0 mt-1 z-50"
    >
      <div
        ref={listRef}
        className="
          bg-surface light:bg-surface-dark
          border border-tertiary/10 light:border-tertiary-dark/10
          rounded-xl shadow-lg
          max-h-48 overflow-y-auto
          py-1
        "
        role="listbox"
        aria-label="Recent tasks"
      >
        {tasks.map((task, index) => (
          <button
            key={task.text}
            onClick={() => onSelect(task)}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5
              text-left transition-colors duration-fast
              ${
                selectedIndex === index
                  ? 'bg-accent/10 light:bg-accent-dark/10'
                  : 'hover:bg-tertiary/5 light:hover:bg-tertiary-dark/5'
              }
            `}
            role="option"
            aria-selected={selectedIndex === index}
          >
            <Clock className="w-3.5 h-3.5 text-tertiary light:text-tertiary-dark flex-shrink-0" />
            <span className="flex-1 text-sm text-primary light:text-primary-dark truncate">
              {task.text}
            </span>
            {task.estimatedPomodoros && (
              <span className="text-xs text-tertiary light:text-tertiary-dark tabular-nums">
                ~{task.estimatedPomodoros}
              </span>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
