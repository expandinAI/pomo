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
  type MigrationProgress,
  // Session migration
  migrateSessionsV1,
  isSessionMigrationCompleted,
  countPendingSessions,
  resetSessionMigration,
  // Project migration
  migrateProjectsV1,
  isProjectMigrationCompleted,
  countPendingProjects,
  resetProjectMigration,
  // Settings migration
  migrateSettingsV1,
  isSettingsMigrationCompleted,
  countPendingSettings,
  resetSettingsMigration,
  // Recent tasks migration
  migrateRecentTasksV1,
  isTasksMigrationCompleted,
  countPendingTasks,
  resetTasksMigration,
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

// Project API (new IndexedDB-based)
export {
  loadProjects as loadProjectsDB,
  getProjectById as getProjectByIdDB,
  saveProject as saveProjectDB,
  updateProject as updateProjectDB,
  deleteProject as deleteProjectDB,
  getActiveProjects as getActiveProjectsDB,
  getArchivedProjects as getArchivedProjectsDB,
  archiveProject as archiveProjectDB,
  restoreProject as restoreProjectDB,
  isDuplicateName as isDuplicateNameDB,
  getPendingSyncProjects,
  clearAllProjects,
  type CreateProjectInput,
  type UpdateProjectInput,
} from './projects';

// Settings API (new IndexedDB-based)
export {
  getAllSettings,
  getSetting,
  setSetting,
  setSettings,
  deleteSetting,
  clearAllSettings,
} from './settings';

// Recent Tasks API (new IndexedDB-based)
export {
  loadRecentTasks as loadRecentTasksDB,
  getRecentTaskByText,
  addRecentTask as addRecentTaskDB,
  updateRecentTask as updateRecentTaskDB,
  deleteRecentTask as deleteRecentTaskDB,
  clearRecentTasks as clearRecentTasksDB,
  getRecentTaskCount,
  filterRecentTasks as filterRecentTasksDB,
  type CreateRecentTaskInput,
} from './recent-tasks';
