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
  /** Number of intentions updated */
  intentionsUpdated: number;
  /** Number of intentions deleted */
  intentionsDeleted: number;
}

/**
 * Storage key for last pull timestamp
 */
export const LAST_PULL_KEY = 'particle:last-sync-pull';

/**
 * Storage key for sync enabled state
 */
export const SYNC_ENABLED_KEY = 'particle:sync-enabled';

/**
 * Storage key for last settings sync timestamp
 */
export const LAST_SETTINGS_SYNC_KEY = 'particle:last-settings-sync';

// ============================================================================
// Settings Sync Types (POMO-308)
// ============================================================================

/**
 * Custom preset configuration stored in settings_json
 */
export interface CustomPreset {
  name: string;
  workDuration: number; // seconds
  shortBreakDuration: number; // seconds
  longBreakDuration: number; // seconds
  sessionsUntilLongBreak: number;
}

/**
 * Workflow settings that are synchronized between devices.
 * Device-specific settings (sound, theme, etc.) remain local.
 */
export interface SyncedSettings {
  // Timer durations (in seconds)
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;

  // Active preset ID
  presetId: string;

  // Custom preset (if presetId === 'custom')
  customPreset: CustomPreset | null;

  // Workflow settings
  overflowEnabled: boolean;
  dailyGoal: number | null;

  // Auto-start settings
  autoStartEnabled: boolean;
  autoStartDelay: 3 | 5 | 10;
  autoStartMode: 'all' | 'breaks-only';
}

/**
 * Settings sync event types
 */
export type SettingsSyncEventType =
  | 'settings-pull-start'
  | 'settings-pull-success'
  | 'settings-pull-error'
  | 'settings-push-start'
  | 'settings-push-success'
  | 'settings-push-error';
