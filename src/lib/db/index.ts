// src/lib/db/index.ts

export { getDB, closeDB, ParticleDB } from './database';
export {
  isIndexedDBAvailable,
  getStorageMode,
  resetAvailabilityCache,
  type StorageMode,
} from './feature-detection';
export {
  // Types
  type SyncStatus,
  type SyncableEntity,
  type DBSession,
  type DBProject,
  type DBRecentTask,
  type DBSettings,
  // Helper Functions
  withSyncMetadata,
  markAsUpdated,
  markAsSynced,
  markAsDeleted,
} from './types';
