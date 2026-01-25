import { parseMultiLineInput } from './smart-input-parser';

const STORAGE_KEY = 'particle_recent_tasks';
const OLD_STORAGE_KEY = 'pomo_recent_tasks';
const MAX_RECENT_TASKS = 10;

export interface RecentTask {
  text: string;
  lastUsed: string; // ISO date string
  estimatedPomodoros?: number;
}

export function getRecentTasks(): RecentTask[] {
  if (typeof window === 'undefined') return [];

  try {
    // Migrate from old key if exists
    const oldStored = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldStored && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, oldStored);
      localStorage.removeItem(OLD_STORAGE_KEY);
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore errors
  }
  return [];
}

export function addRecentTask(task: RecentTask): void {
  if (typeof window === 'undefined') return;
  if (!task.text.trim()) return;

  const tasks = getRecentTasks();

  // Remove existing task with same text (case-insensitive)
  const filteredTasks = tasks.filter(
    (t) => t.text.toLowerCase() !== task.text.toLowerCase()
  );

  // Add new task at the beginning
  filteredTasks.unshift({
    text: task.text.trim(),
    lastUsed: task.lastUsed || new Date().toISOString(),
    ...(task.estimatedPomodoros && { estimatedPomodoros: task.estimatedPomodoros }),
  });

  // Keep only last MAX_RECENT_TASKS
  const trimmed = filteredTasks.slice(0, MAX_RECENT_TASKS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function clearRecentTasks(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Parse multi-line input and add each task individually to recent tasks.
 * Extracts clean task names without times, minus signs, or other formatting.
 *
 * Examples:
 * - "Emails 10min" → adds "Emails"
 * - "Emails 10\nCall 15\n-Report 30" → adds "Emails", "Call", "Report"
 */
export function addRecentTasksFromInput(input: string): void {
  if (typeof window === 'undefined') return;
  if (!input.trim()) return;

  const { tasks } = parseMultiLineInput(input);
  const now = new Date().toISOString();

  // Add each task individually (in reverse order so first task is most recent)
  const uniqueTasks = tasks
    .map(t => t.text.trim())
    .filter(t => t.length > 0)
    .reverse();

  for (const taskText of uniqueTasks) {
    addRecentTask({
      text: taskText,
      lastUsed: now,
    });
  }
}

// Filter tasks by search query (fuzzy match)
export function filterTasks(tasks: RecentTask[], query: string): RecentTask[] {
  if (!query.trim()) return tasks;

  const lowerQuery = query.toLowerCase();
  return tasks.filter((task) =>
    task.text.toLowerCase().includes(lowerQuery)
  );
}
