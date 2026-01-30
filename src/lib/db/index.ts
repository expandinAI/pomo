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

// Migrations
export {
  runMigrations,
  hasPendingMigrations,
  countPendingEntries,
  type MigrationResult,
  type MigrationSummary,
} from './migrations';

// Session API (new IndexedDB-based)
export {
  loadSessions as loadSessionsDB,
  getSessionById as getSessionByIdDB,
  saveSession as saveSessionDB,
  updateSession as updateSessionDB,
  deleteSession as deleteSessionDB,
  getSessionsByDateRange,
  getSessionsForDate,
  getSessionsByProject,
  getSessionsFromDays as getSessionsFromDaysDB,
  getTodaySessions as getTodaySessionsDB,
  getTotalSessionCount as getTotalSessionCountDB,
  getPendingSyncSessions,
  clearAllSessions,
  type CreateSessionInput,
  type UpdateSessionInput,
} from './sessions';
