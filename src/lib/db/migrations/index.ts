// src/lib/db/migrations/index.ts

import {
  migrateSessionsV1,
  isSessionMigrationCompleted,
  countPendingSessions,
  type SessionMigrationResult,
} from './sessions';

import {
  migrateProjectsV1,
  isProjectMigrationCompleted,
  countPendingProjects,
  type ProjectMigrationResult,
} from './projects';

import {
  migrateSettingsV1,
  isSettingsMigrationCompleted,
  countPendingSettings,
  type SettingsMigrationResult,
} from './settings';

import {
  migrateRecentTasksV1,
  isTasksMigrationCompleted,
  countPendingTasks,
  type TasksMigrationResult,
} from './recent-tasks';

export interface MigrationResult {
  name: string;
  skipped: boolean;
  migrated: number;
  errors: string[];
  duration: number;
}

export interface MigrationSummary {
  totalMigrated: number;
  totalErrors: number;
  results: MigrationResult[];
  duration: number;
}

/**
 * Progress information during migration
 */
export interface MigrationProgress {
  /** Current migration name (e.g., 'sessions_v1', 'projects_v1') */
  current: string;
  /** Human-readable label for current phase */
  currentLabel: string;
  /** Total number of migrations */
  total: number;
  /** Number of completed migrations */
  completed: number;
}

/**
 * Migration phase labels for UI display
 */
const MIGRATION_LABELS: Record<string, string> = {
  sessions_v1: 'Migrating particles...',
  projects_v1: 'Migrating projects...',
  settings_v1: 'Migrating settings...',
  recent_tasks_v1: 'Migrating tasks...',
};

/**
 * Check if there are any pending migrations
 */
export function hasPendingMigrations(): boolean {
  return (
    !isSessionMigrationCompleted() ||
    !isProjectMigrationCompleted() ||
    !isSettingsMigrationCompleted() ||
    !isTasksMigrationCompleted()
  );
}

/**
 * Count total entries pending migration across all types
 */
export function countPendingEntries(): number {
  let count = 0;
  count += countPendingSessions();
  count += countPendingProjects();
  count += countPendingSettings();
  count += countPendingTasks();
  return count;
}

/**
 * Run all pending migrations
 *
 * Migrations are:
 * - Idempotent (safe to run multiple times)
 * - Independent (one failure doesn't block others)
 * - Logged (results returned for debugging)
 *
 * @param onProgress - Optional callback for progress updates
 */
export async function runMigrations(
  onProgress?: (progress: MigrationProgress) => void
): Promise<MigrationSummary> {
  const startTime = performance.now();
  const results: MigrationResult[] = [];
  let totalMigrated = 0;
  let totalErrors = 0;
  const totalMigrations = 4;
  let completedMigrations = 0;

  // Helper to report progress
  const reportProgress = (name: string) => {
    onProgress?.({
      current: name,
      currentLabel: MIGRATION_LABELS[name] || name,
      total: totalMigrations,
      completed: completedMigrations,
    });
  };

  // Run session migration
  reportProgress('sessions_v1');
  try {
    const sessionResult = await migrateSessionsV1();
    results.push(normalizeResult(sessionResult));
    totalMigrated += sessionResult.migrated;
    totalErrors += sessionResult.errors.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    results.push({
      name: 'sessions_v1',
      skipped: false,
      migrated: 0,
      errors: [`Fatal: ${message}`],
      duration: 0,
    });
    totalErrors++;
  }
  completedMigrations++;

  // Run project migration
  reportProgress('projects_v1');
  try {
    const projectResult = await migrateProjectsV1();
    results.push(normalizeResult(projectResult));
    totalMigrated += projectResult.migrated;
    totalErrors += projectResult.errors.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    results.push({
      name: 'projects_v1',
      skipped: false,
      migrated: 0,
      errors: [`Fatal: ${message}`],
      duration: 0,
    });
    totalErrors++;
  }
  completedMigrations++;

  // Run settings migration
  reportProgress('settings_v1');
  try {
    const settingsResult = await migrateSettingsV1();
    results.push(normalizeResult(settingsResult));
    totalMigrated += settingsResult.migrated;
    totalErrors += settingsResult.errors.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    results.push({
      name: 'settings_v1',
      skipped: false,
      migrated: 0,
      errors: [`Fatal: ${message}`],
      duration: 0,
    });
    totalErrors++;
  }
  completedMigrations++;

  // Run recent tasks migration
  reportProgress('recent_tasks_v1');
  try {
    const tasksResult = await migrateRecentTasksV1();
    results.push(normalizeResult(tasksResult));
    totalMigrated += tasksResult.migrated;
    totalErrors += tasksResult.errors.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    results.push({
      name: 'recent_tasks_v1',
      skipped: false,
      migrated: 0,
      errors: [`Fatal: ${message}`],
      duration: 0,
    });
    totalErrors++;
  }
  completedMigrations++;

  // Final progress update
  onProgress?.({
    current: 'complete',
    currentLabel: 'Migration complete',
    total: totalMigrations,
    completed: completedMigrations,
  });

  return {
    totalMigrated,
    totalErrors,
    results,
    duration: performance.now() - startTime,
  };
}

/**
 * Normalize specific migration result to generic format
 */
function normalizeResult(
  result: SessionMigrationResult | ProjectMigrationResult | SettingsMigrationResult | TasksMigrationResult
): MigrationResult {
  return {
    name: result.name,
    skipped: result.skipped,
    migrated: result.migrated,
    errors: result.errors,
    duration: result.duration,
  };
}

// Re-export for direct access
export {
  migrateSessionsV1,
  isSessionMigrationCompleted,
  countPendingSessions,
  resetSessionMigration,
} from './sessions';

export {
  migrateProjectsV1,
  isProjectMigrationCompleted,
  countPendingProjects,
  resetProjectMigration,
} from './projects';

export {
  migrateSettingsV1,
  isSettingsMigrationCompleted,
  countPendingSettings,
  resetSettingsMigration,
} from './settings';

export {
  migrateRecentTasksV1,
  isTasksMigrationCompleted,
  countPendingTasks,
  resetTasksMigration,
} from './recent-tasks';
