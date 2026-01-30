/**
 * Offline Queue
 *
 * Manages queued changes for offline/error scenarios.
 * Uses IndexedDB syncQueue table for persistence.
 */

import { getDB } from '@/lib/db/database';
import type { DBQueuedChange, SyncEntityType, SyncOperation } from '@/lib/db/types';
import type { SyncConfig } from './types';

/**
 * Generate a unique queue entry ID
 */
function generateQueueId(): string {
  return `queue_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate next retry time with exponential backoff
 * Retry delays: 1min, 2min, 4min, 8min, 16min
 */
function calculateNextRetryAt(retryCount: number, baseDelayMs: number): string {
  const delayMs = baseDelayMs * Math.pow(2, retryCount);
  return new Date(Date.now() + delayMs).toISOString();
}

/**
 * Add a change to the offline queue
 */
export async function enqueue(
  entityType: SyncEntityType,
  entityId: string,
  operation: SyncOperation,
  payload: Record<string, unknown>
): Promise<DBQueuedChange> {
  const db = getDB();

  const entry: DBQueuedChange = {
    id: generateQueueId(),
    entityType,
    entityId,
    operation,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  await db.syncQueue.add(entry);
  return entry;
}

/**
 * Get the next batch of changes ready for processing
 * Returns changes that are due for retry (nextRetryAt <= now or not set)
 */
export async function getNextBatch(
  batchSize: number = 10
): Promise<DBQueuedChange[]> {
  const db = getDB();
  const now = new Date().toISOString();

  // Get all queue entries and filter client-side
  // (Dexie doesn't support complex OR queries easily)
  const allEntries = await db.syncQueue
    .orderBy('createdAt')
    .toArray();

  const readyEntries = allEntries.filter((entry) => {
    // Ready if no nextRetryAt set, or nextRetryAt is in the past
    return !entry.nextRetryAt || entry.nextRetryAt <= now;
  });

  return readyEntries.slice(0, batchSize);
}

/**
 * Get count of pending changes in queue
 */
export async function getPendingCount(): Promise<number> {
  const db = getDB();
  return db.syncQueue.count();
}

/**
 * Mark a queue entry as successfully processed (remove from queue)
 */
export async function markProcessed(id: string): Promise<void> {
  const db = getDB();
  await db.syncQueue.delete(id);
}

/**
 * Mark a queue entry as failed, incrementing retry count
 * If max retries exceeded, removes from queue
 */
export async function markFailed(
  id: string,
  error: string,
  config: Partial<SyncConfig> = {}
): Promise<boolean> {
  const db = getDB();
  const { maxRetries = 5, baseRetryDelayMs = 60_000 } = config;

  const entry = await db.syncQueue.get(id);
  if (!entry) {
    return false;
  }

  const newRetryCount = entry.retryCount + 1;

  // If max retries exceeded, remove from queue
  if (newRetryCount >= maxRetries) {
    console.warn(
      `[OfflineQueue] Entry ${id} exceeded max retries (${maxRetries}), removing from queue`
    );
    await db.syncQueue.delete(id);
    return false;
  }

  // Update with new retry info
  await db.syncQueue.update(id, {
    retryCount: newRetryCount,
    lastError: error,
    nextRetryAt: calculateNextRetryAt(newRetryCount, baseRetryDelayMs),
  });

  return true;
}

/**
 * Remove all entries for a specific entity
 * Useful when a newer change supersedes queued ones
 */
export async function removeEntriesForEntity(
  entityType: SyncEntityType,
  entityId: string
): Promise<number> {
  const db = getDB();

  const entries = await db.syncQueue
    .where('entityType')
    .equals(entityType)
    .filter((entry) => entry.entityId === entityId)
    .toArray();

  await db.syncQueue.bulkDelete(entries.map((e) => e.id));
  return entries.length;
}

/**
 * Clear the entire queue
 * Use with caution - mainly for testing/reset scenarios
 */
export async function clearQueue(): Promise<void> {
  const db = getDB();
  await db.syncQueue.clear();
}

/**
 * Check if entity has pending changes in queue
 */
export async function hasPendingChanges(
  entityType: SyncEntityType,
  entityId: string
): Promise<boolean> {
  const db = getDB();

  const entry = await db.syncQueue
    .where('entityType')
    .equals(entityType)
    .filter((e) => e.entityId === entityId)
    .first();

  return !!entry;
}
