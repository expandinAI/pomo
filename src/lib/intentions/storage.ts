// src/lib/intentions/storage.ts

import { getDB } from '@/lib/db/database';
import type { DBIntention } from '@/lib/db/types';
import { withSyncMetadata, markAsUpdated, markAsDeleted } from '@/lib/db/types';
import type { CreateIntentionInput, UpdateIntentionInput } from './types';

/**
 * Generate a unique ID for a new intention
 */
function generateId(): string {
  return `int-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get today's date as ISO date string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Create and save a new intention
 */
export async function saveIntention(input: CreateIntentionInput): Promise<DBIntention> {
  const db = getDB();

  const intention: DBIntention = withSyncMetadata({
    id: generateId(),
    date: input.date,
    text: input.text,
    status: 'active' as const,
    ...(input.projectId && { projectId: input.projectId }),
    ...(input.deferredFrom && { deferredFrom: input.deferredFrom }),
  });

  await db.intentions.add(intention);
  return intention;
}

/**
 * Get an intention by ID
 */
export async function getIntentionById(id: string): Promise<DBIntention | undefined> {
  const db = getDB();
  const intention = await db.intentions.get(id);
  if (intention?.deleted) return undefined;
  return intention;
}

/**
 * Update an existing intention
 */
export async function updateIntention(
  id: string,
  updates: UpdateIntentionInput
): Promise<DBIntention | null> {
  const db = getDB();
  const intention = await db.intentions.get(id);

  if (!intention || intention.deleted) {
    return null;
  }

  const updated = markAsUpdated({
    ...intention,
    ...(updates.text !== undefined && { text: updates.text }),
    ...(updates.projectId !== undefined && {
      projectId: updates.projectId === null ? undefined : updates.projectId,
    }),
    ...(updates.status !== undefined && { status: updates.status }),
    ...(updates.completedAt !== undefined && { completedAt: updates.completedAt }),
    ...(updates.deferredFrom !== undefined && { deferredFrom: updates.deferredFrom }),
  });

  await db.intentions.put(updated);
  return updated;
}

/**
 * Delete an intention (soft delete for sync compatibility)
 */
export async function deleteIntention(id: string): Promise<boolean> {
  const db = getDB();
  const intention = await db.intentions.get(id);

  if (!intention) {
    return false;
  }

  const deleted = markAsDeleted(intention);
  await db.intentions.put(deleted);
  return true;
}

/**
 * Hard delete an intention (for local cleanup, not sync)
 */
export async function hardDeleteIntention(id: string): Promise<boolean> {
  const db = getDB();
  const count = await db.intentions.where('id').equals(id).delete();
  return count > 0;
}

// ============================================
// Query Operations
// ============================================

/**
 * Get the intention for a specific date
 * Returns the most recent non-deleted intention for that date
 */
export async function getIntentionForDate(date: string): Promise<DBIntention | undefined> {
  const db = getDB();
  const intentions = await db.intentions
    .where('date')
    .equals(date)
    .filter((i) => !i.deleted)
    .toArray();

  // Return the most recent one if multiple exist (shouldn't happen normally)
  if (intentions.length === 0) return undefined;
  return intentions.sort((a, b) =>
    new Date(b.localUpdatedAt).getTime() - new Date(a.localUpdatedAt).getTime()
  )[0];
}

/**
 * Get today's intention
 */
export async function getTodayIntention(): Promise<DBIntention | undefined> {
  return getIntentionForDate(getTodayDateString());
}

/**
 * Get intentions for a week starting from a given date
 * @param startDate - ISO date string (YYYY-MM-DD) for the start of the week
 */
export async function getIntentionsForWeek(startDate: string): Promise<DBIntention[]> {
  const db = getDB();

  // Calculate end date (7 days from start)
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const endDate = end.toISOString().split('T')[0];

  return db.intentions
    .where('date')
    .between(startDate, endDate, true, true)
    .filter((i) => !i.deleted)
    .toArray();
}

/**
 * Load all intentions from IndexedDB
 * Ordered by date descending (newest first)
 */
export async function loadIntentions(): Promise<DBIntention[]> {
  const db = getDB();
  const intentions = await db.intentions
    .orderBy('date')
    .reverse()
    .filter((i) => !i.deleted)
    .toArray();
  return intentions;
}

/**
 * Get intentions by status
 */
export async function getIntentionsByStatus(
  status: DBIntention['status']
): Promise<DBIntention[]> {
  const db = getDB();
  return db.intentions
    .where('status')
    .equals(status)
    .filter((i) => !i.deleted)
    .toArray();
}

/**
 * Get active (non-completed) intentions
 */
export async function getActiveIntentions(): Promise<DBIntention[]> {
  return getIntentionsByStatus('active');
}

/**
 * Get intentions that need to be synced
 */
export async function getPendingSyncIntentions(): Promise<DBIntention[]> {
  const db = getDB();
  return db.intentions
    .filter((i) => i.syncStatus === 'local' || i.syncStatus === 'pending')
    .toArray();
}

/**
 * Clear all intentions (for testing)
 */
export async function clearAllIntentions(): Promise<void> {
  const db = getDB();
  await db.intentions.clear();
}
