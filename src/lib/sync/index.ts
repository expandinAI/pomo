/**
 * Sync Services
 *
 * Handles data synchronization between local IndexedDB and Supabase.
 */

// Initial upload (for upgrade flow)
export {
  getLocalDataSummary,
  hasLocalData,
  performInitialUpload,
  type LocalDataSummary,
  type UploadProgress,
  type UploadResult,
} from './initial-upload';

// Sync types
export {
  type SyncEntityType,
  type SyncOperation,
  type DBQueuedChange,
  type SyncOperationStatus,
  type SyncConfig,
  type SyncState,
  type SyncEventType,
  type SyncEventCallback,
  type PullResult,
  type SyncedSettings,
  type CustomPreset,
  type SettingsSyncEventType,
  DEFAULT_SYNC_CONFIG,
  LAST_PULL_KEY,
  SYNC_ENABLED_KEY,
  LAST_SETTINGS_SYNC_KEY,
} from './types';

// Sync service
export { SyncService, type SupabaseClientFactory } from './sync-service';

// React context
export {
  SyncProvider,
  useSyncService,
  useIsSyncActive,
  useSyncState,
} from './sync-context';

// Offline queue utilities
export {
  enqueue,
  getNextBatch,
  getPendingCount,
  markProcessed,
  markFailed,
  removeEntriesForEntity,
  clearQueue,
  hasPendingChanges,
} from './offline-queue';

// Sync events
export {
  SYNC_EVENTS,
  dispatchSessionAdded,
  dispatchSessionUpdated,
  dispatchSessionDeleted,
  dispatchProjectAdded,
  dispatchProjectUpdated,
  dispatchProjectDeleted,
  dispatchPullCompleted,
} from './sync-events';

// Conflict resolution
export {
  resolveConflict,
  isRemoteNewerOrEqual,
  isDeleted,
  type ConflictResolution,
} from './conflict-resolution';

// Settings sync (POMO-308)
export {
  pushSettings,
  pullSettings,
  extractSyncedSettings,
  applySyncedSettings,
  dispatchSettingsChanged,
} from './settings-sync';

export { useSettingsSync } from './use-settings-sync';
export { useSettingsSyncActions } from './use-settings-sync-actions';
