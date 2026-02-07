import type { CompletedSession } from '@/lib/session-storage';

export interface TaskAnalysis {
  name: string;          // Display name (first-seen casing)
  count: number;         // Number of sessions
  avgDuration: number;   // Average duration in seconds
  totalDuration: number; // Total duration in seconds
}

interface TopTasksOptions {
  limit?: number;
  minCount?: number;
}

/**
 * Analyzes sessions to find the most frequently recurring tasks.
 * Groups case-insensitively, preserving first-seen casing for display.
 */
export function getTopTasks(
  sessions: CompletedSession[],
  options?: TopTasksOptions
): TaskAnalysis[] {
  const limit = options?.limit ?? 5;
  const minCount = options?.minCount ?? 2;

  const taskMap = new Map<string, { name: string; count: number; totalDuration: number }>();

  for (const session of sessions) {
    if (session.type !== 'work') continue;
    if (!session.task || session.task.trim() === '') continue;

    const trimmed = session.task.trim();
    const key = trimmed.toLowerCase();

    const existing = taskMap.get(key);
    if (existing) {
      existing.count += 1;
      existing.totalDuration += session.duration;
    } else {
      taskMap.set(key, {
        name: trimmed,
        count: 1,
        totalDuration: session.duration,
      });
    }
  }

  const results: TaskAnalysis[] = [];

  for (const entry of Array.from(taskMap.values())) {
    if (entry.count < minCount) continue;
    results.push({
      name: entry.name,
      count: entry.count,
      avgDuration: Math.round(entry.totalDuration / entry.count),
      totalDuration: entry.totalDuration,
    });
  }

  results.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.totalDuration - a.totalDuration;
  });

  return results.slice(0, limit);
}
