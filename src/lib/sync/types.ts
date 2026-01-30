/**
 * Sync Types
 *
 * Type definitions for the continuous sync service.
 */

// Re-export entity types from db/types
export type { SyncEntityType, SyncOperation, DBQueuedChange } from '@/lib/db/types';

/**
 * Sync operation status
 */
export type SyncOperationStatus = 'idle' | 'syncing' | 'error' | 'offline';

/**
 * Sync configuration
 */
export interface SyncConfig {
  /** Interval for pull operations in milliseconds */
  pullIntervalMs: number;
  /** Maximum retry attempts before giving up */
  maxRetries: number;
  /** Base delay for exponential backoff in milliseconds */
  baseRetryDelayMs: number;
  /** Batch size for queue processing */
  queueBatchSize: number;
}

/**
 * Default sync configuration
 */
export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  pullIntervalMs: 30_000, // 30 seconds
  maxRetries: 5,
  baseRetryDelayMs: 60_000, // 1 minute base
  queueBatchSize: 10,
};

/**
 * Sync status for UI display
 */
export interface SyncState {
  /** Current operation status */
  status: SyncOperationStatus;
  /** Whether device is online */
  isOnline: boolean;
  /** Last successful sync timestamp */
  lastSyncAt: string | null;
  /** Number of pending changes in queue */
  pendingCount: number;
  /** Last error message if any */
  lastError?: string;
}

/**
 * Sync event types for callbacks
 */
export type SyncEventType =
  | 'push-start'
  | 'push-success'
  | 'push-error'
  | 'pull-start'
  | 'pull-success'
  | 'pull-error'
  | 'queue-processed'
  | 'offline'
  | 'online';

/**
 * Sync event callback
 */
export type SyncEventCallback = (event: SyncEventType, data?: unknown) => void;

/**
 * Pull result with changes
 */
export interface PullResult {
  /** Number of sessions updated */
  sessionsUpdated: number;
  /** Number of sessions deleted */
  sessionsDeleted: number;
  /** Number of projects updated */
  projectsUpdated: number;
  /** Number of projects deleted */
  projectsDeleted: number;
}

/**
 * Storage key for last pull timestamp
 */
export const LAST_PULL_KEY = 'particle:last-sync-pull';

/**
 * Storage key for sync enabled state
 */
export const SYNC_ENABLED_KEY = 'particle:sync-enabled';
