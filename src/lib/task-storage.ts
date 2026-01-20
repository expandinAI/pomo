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

// Filter tasks by search query (fuzzy match)
export function filterTasks(tasks: RecentTask[], query: string): RecentTask[] {
  if (!query.trim()) return tasks;

  const lowerQuery = query.toLowerCase();
  return tasks.filter((task) =>
    task.text.toLowerCase().includes(lowerQuery)
  );
}
