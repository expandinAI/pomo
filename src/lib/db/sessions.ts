// src/lib/db/sessions.ts

import { getDB } from './database';
import type { DBSession, IntentionAlignment } from './types';
import { withSyncMetadata, markAsUpdated, markAsDeleted } from './types';
import type { SessionType } from '@/styles/design-tokens';

/**
 * Generate a unique ID for a new session
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Load all sessions from IndexedDB
 * Ordered by completedAt descending (newest first)
 */
export async function loadSessions(): Promise<DBSession[]> {
  const db = getDB();
  // Get all non-deleted sessions, ordered by completedAt desc
  const sessions = await db.sessions
    .orderBy('completedAt')
    .reverse()
    .filter(s => !s.deleted)
    .toArray();
  return sessions;
}

/**
 * Get a session by ID
 */
export async function getSessionById(id: string): Promise<DBSession | undefined> {
  const db = getDB();
  const session = await db.sessions.get(id);
  if (session?.deleted) return undefined;
  return session;
}

/**
 * Input data for creating a new session
 */
export interface CreateSessionInput {
  type: SessionType;
  duration: number;
  task?: string;
  projectId?: string;
  estimatedPomodoros?: number;
  presetId?: string;
  overflowDuration?: number;
  estimatedDuration?: number;
  intentionAlignment?: IntentionAlignment;
}

/**
 * Create and save a new session
 */
export async function saveSession(input: CreateSessionInput): Promise<DBSession> {
  const db = getDB();

  const session: DBSession = withSyncMetadata({
    id: generateId(),
    type: input.type,
    duration: input.duration,
    completedAt: new Date().toISOString(),
    ...(input.task && { task: input.task }),
    ...(input.projectId && { projectId: input.projectId }),
    ...(input.estimatedPomodoros && { estimatedPomodoros: input.estimatedPomodoros }),
    ...(input.presetId && { presetId: input.presetId }),
    ...(input.overflowDuration && { overflowDuration: input.overflowDuration }),
    ...(input.estimatedDuration && { estimatedDuration: input.estimatedDuration }),
    ...(input.intentionAlignment && { intentionAlignment: input.intentionAlignment }),
  });

  await db.sessions.add(session);
  return session;
}

/**
 * Update an existing session
 */
export interface UpdateSessionInput {
  task?: string;
  projectId?: string | null;
  duration?: number;
  intentionAlignment?: IntentionAlignment | null;
}

export async function updateSession(
  id: string,
  updates: UpdateSessionInput
): Promise<DBSession | null> {
  const db = getDB();
  const session = await db.sessions.get(id);

  if (!session || session.deleted) {
    return null;
  }

  const updated = markAsUpdated({
    ...session,
    ...(updates.task !== undefined && { task: updates.task || undefined }),
    ...(updates.projectId !== undefined && {
      projectId: updates.projectId === null ? undefined : updates.projectId
    }),
    ...(updates.duration !== undefined && { duration: updates.duration }),
    ...(updates.intentionAlignment !== undefined && {
      intentionAlignment: updates.intentionAlignment === null ? undefined : updates.intentionAlignment
    }),
  });

  await db.sessions.put(updated);
  return updated;
}

/**
 * Delete a session (soft delete for sync compatibility)
 */
export async function deleteSession(id: string): Promise<boolean> {
  const db = getDB();
  const session = await db.sessions.get(id);

  if (!session) {
    return false;
  }

  // Soft delete for sync
  const deleted = markAsDeleted(session);
  await db.sessions.put(deleted);
  return true;
}

/**
 * Hard delete a session (for local cleanup, not sync)
 */
export async function hardDeleteSession(id: string): Promise<boolean> {
  const db = getDB();
  const count = await db.sessions.where('id').equals(id).delete();
  return count > 0;
}

/**
 * Get sessions within a date range
 * @param start - ISO date string (inclusive)
 * @param end - ISO date string (inclusive)
 */
export async function getSessionsByDateRange(
  start: string,
  end: string
): Promise<DBSession[]> {
  const db = getDB();
  return db.sessions
    .where('completedAt')
    .between(start, end, true, true)
    .filter(s => !s.deleted)
    .reverse()
    .toArray();
}

/**
 * Get sessions for a specific date
 * @param date - Date object or ISO date string (YYYY-MM-DD)
 */
export async function getSessionsForDate(date: Date | string): Promise<DBSession[]> {
  const targetDate = typeof date === 'string' ? new Date(date) : date;

  // Start of day
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);

  // End of day
  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);

  return getSessionsByDateRange(start.toISOString(), end.toISOString());
}

/**
 * Get sessions for a specific project
 */
export async function getSessionsByProject(projectId: string): Promise<DBSession[]> {
  const db = getDB();
  return db.sessions
    .where('projectId')
    .equals(projectId)
    .filter(s => !s.deleted)
    .reverse()
    .toArray();
}

/**
 * Get sessions from the last N days
 */
export async function getSessionsFromDays(days: number): Promise<DBSession[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);

  const now = new Date();

  return getSessionsByDateRange(cutoff.toISOString(), now.toISOString());
}

/**
 * Get today's work sessions
 */
export async function getTodaySessions(): Promise<DBSession[]> {
  const sessions = await getSessionsForDate(new Date());
  return sessions.filter(s => s.type === 'work');
}

/**
 * Get total count of all completed work sessions
 */
export async function getTotalSessionCount(): Promise<number> {
  const db = getDB();
  return db.sessions
    .where('type')
    .equals('work')
    .filter(s => !s.deleted)
    .count();
}

/**
 * Get sessions that need to be synced
 */
export async function getPendingSyncSessions(): Promise<DBSession[]> {
  const db = getDB();
  return db.sessions
    .where('syncStatus')
    .anyOf(['local', 'pending'])
    .toArray();
}

/**
 * Clear all sessions (for testing)
 */
export async function clearAllSessions(): Promise<void> {
  const db = getDB();
  await db.sessions.clear();
}
