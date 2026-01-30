// src/lib/db/migrations/recent-tasks.ts

import { getDB } from '../database';
import type { DBRecentTask } from '../types';

const MIGRATION_KEY = 'particle_migration_tasks_v1';
const LEGACY_STORAGE_KEY = 'particle_recent_tasks';
const OLD_LEGACY_KEY = 'pomo_recent_tasks';

interface LegacyRecentTask {
  text: string;
  lastUsed: string;
  estimatedPomodoros?: number;
}

export interface TasksMigrationResult {
  name: string;
  skipped: boolean;
  migrated: number;
  duplicatesSkipped: number;
  errors: string[];
  duration: number;
}

/**
 * Check if recent tasks migration has already been completed
 */
export function isTasksMigrationCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(MIGRATION_KEY) === 'true';
}

/**
 * Get count of tasks pending migration
 */
export function countPendingTasks(): number {
  if (typeof window === 'undefined') return 0;
  if (isTasksMigrationCompleted()) return 0;

  try {
    // Check both old and new keys
    const newStored = localStorage.getItem(LEGACY_STORAGE_KEY);
    const oldStored = localStorage.getItem(OLD_LEGACY_KEY);

    const stored = newStored || oldStored;
    if (!stored) return 0;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Load legacy recent tasks from localStorage
 */
function loadLegacyTasks(): LegacyRecentTask[] {
  if (typeof window === 'undefined') return [];

  try {
    // Check for migration from old key
    const oldStored = localStorage.getItem(OLD_LEGACY_KEY);
    if (oldStored && !localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.setItem(LEGACY_STORAGE_KEY, oldStored);
      localStorage.removeItem(OLD_LEGACY_KEY);
    }

    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Convert a localStorage task to IndexedDB format
 */
function convertToDBTask(task: LegacyRecentTask): DBRecentTask {
  return {
    text: task.text,
    lastUsed: task.lastUsed,
    estimatedPomodoros: task.estimatedPomodoros,
  };
}

/**
 * Migrate recent tasks from localStorage to IndexedDB
 *
 * This migration:
 * 1. Checks if already completed (skip if so)
 * 2. Loads all recent tasks from localStorage
 * 3. Inserts each into IndexedDB (skipping duplicates by text)
 * 4. Sets completion flag
 *
 * Note: text is the primary key in IndexedDB
 *
 * Idempotent: Safe to run multiple times
 */
export async function migrateRecentTasksV1(): Promise<TasksMigrationResult> {
  const startTime = performance.now();
  const result: TasksMigrationResult = {
    name: 'recent_tasks_v1',
    skipped: false,
    migrated: 0,
    duplicatesSkipped: 0,
    errors: [],
    duration: 0,
  };

  // Check if already migrated
  if (isTasksMigrationCompleted()) {
    result.skipped = true;
    result.duration = performance.now() - startTime;
    return result;
  }

  // Load legacy tasks
  const legacyTasks = loadLegacyTasks();

  if (legacyTasks.length === 0) {
    // No tasks to migrate, mark as complete
    localStorage.setItem(MIGRATION_KEY, 'true');
    result.duration = performance.now() - startTime;
    return result;
  }

  const db = getDB();

  // Process each task
  for (const task of legacyTasks) {
    try {
      // Validate task has required fields
      if (!task.text || typeof task.text !== 'string' || !task.text.trim()) {
        result.errors.push(`Task missing text: ${JSON.stringify(task).slice(0, 100)}`);
        continue;
      }

      const normalizedText = task.text.trim();

      // Check if task already exists in IndexedDB (idempotency)
      const existing = await db.recentTasks.get(normalizedText);

      if (existing) {
        result.duplicatesSkipped++;
        continue;
      }

      // Convert and insert
      const dbTask = convertToDBTask({
        ...task,
        text: normalizedText,
      });
      await db.recentTasks.add(dbTask);
      result.migrated++;
    } catch (error) {
      // Log error but continue with other tasks
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Task "${task.text?.slice(0, 30) || 'unknown'}": ${message}`);
    }
  }

  // Mark migration as complete (even if some errors occurred)
  localStorage.setItem(MIGRATION_KEY, 'true');

  result.duration = performance.now() - startTime;
  return result;
}

/**
 * Reset migration state (for testing)
 */
export function resetTasksMigration(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MIGRATION_KEY);
}
