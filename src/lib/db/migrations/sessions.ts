// src/lib/db/migrations/sessions.ts

import { getDB } from '../database';
import type { DBSession } from '../types';
import type { CompletedSession } from '@/lib/session-storage';

const MIGRATION_KEY = 'particle_migration_sessions_v1';
const LEGACY_STORAGE_KEY = 'particle_session_history';

export interface SessionMigrationResult {
  name: string;
  skipped: boolean;
  migrated: number;
  duplicatesSkipped: number;
  errors: string[];
  duration: number;
}

/**
 * Check if session migration has already been completed
 */
export function isSessionMigrationCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(MIGRATION_KEY) === 'true';
}

/**
 * Get count of sessions pending migration
 */
export function countPendingSessions(): number {
  if (typeof window === 'undefined') return 0;
  if (isSessionMigrationCompleted()) return 0;

  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return 0;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Load legacy sessions from localStorage
 */
function loadLegacySessions(): CompletedSession[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Convert a localStorage session to IndexedDB format
 */
function convertToDBSession(session: CompletedSession): DBSession {
  return {
    id: session.id,
    type: session.type,
    duration: session.duration,
    completedAt: session.completedAt,
    task: session.task,
    projectId: session.projectId,
    estimatedPomodoros: session.estimatedPomodoros,
    presetId: session.presetId,
    overflowDuration: session.overflowDuration,
    estimatedDuration: session.estimatedDuration,
    // Sync metadata
    syncStatus: 'local',
    localUpdatedAt: session.completedAt, // Use completion time as initial update time
  };
}

/**
 * Migrate sessions from localStorage to IndexedDB
 *
 * This migration:
 * 1. Checks if already completed (skip if so)
 * 2. Loads all sessions from localStorage
 * 3. Inserts each into IndexedDB (skipping duplicates by ID)
 * 4. Sets completion flag
 *
 * Idempotent: Safe to run multiple times
 */
export async function migrateSessionsV1(): Promise<SessionMigrationResult> {
  const startTime = performance.now();
  const result: SessionMigrationResult = {
    name: 'sessions_v1',
    skipped: false,
    migrated: 0,
    duplicatesSkipped: 0,
    errors: [],
    duration: 0,
  };

  // Check if already migrated
  if (isSessionMigrationCompleted()) {
    result.skipped = true;
    result.duration = performance.now() - startTime;
    return result;
  }

  // Load legacy sessions
  const legacySessions = loadLegacySessions();

  if (legacySessions.length === 0) {
    // No sessions to migrate, mark as complete
    localStorage.setItem(MIGRATION_KEY, 'true');
    result.duration = performance.now() - startTime;
    return result;
  }

  const db = getDB();

  // Process each session
  for (const session of legacySessions) {
    try {
      // Check if session already exists in IndexedDB
      const existing = await db.sessions.get(session.id);

      if (existing) {
        result.duplicatesSkipped++;
        continue;
      }

      // Convert and insert
      const dbSession = convertToDBSession(session);
      await db.sessions.add(dbSession);
      result.migrated++;
    } catch (error) {
      // Log error but continue with other sessions
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Session ${session.id}: ${message}`);
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
export function resetSessionMigration(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MIGRATION_KEY);
}
