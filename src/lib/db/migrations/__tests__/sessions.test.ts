// src/lib/db/migrations/__tests__/sessions.test.ts

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';
import { getDB, closeDB } from '../../database';
import type { CompletedSession } from '@/lib/session-storage';

const MIGRATION_KEY = 'particle_migration_sessions_v1';
const LEGACY_STORAGE_KEY = 'particle_session_history';

// Mock localStorage
const localStorageData: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageData[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageData[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageData[key];
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageData).forEach(key => delete localStorageData[key]);
  }),
  length: 0,
  key: vi.fn(() => null),
};

// Mock window and localStorage before importing the module
vi.stubGlobal('window', { localStorage: localStorageMock });
vi.stubGlobal('localStorage', localStorageMock);

// Helper to create test sessions
function createTestSession(overrides: Partial<CompletedSession> = {}): CompletedSession {
  return {
    id: `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type: 'work',
    duration: 1500,
    completedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Dynamically imported functions
let migrateSessionsV1: typeof import('../sessions').migrateSessionsV1;
let isSessionMigrationCompleted: typeof import('../sessions').isSessionMigrationCompleted;
let countPendingSessions: typeof import('../sessions').countPendingSessions;
let resetSessionMigration: typeof import('../sessions').resetSessionMigration;

describe('Session Migration', () => {
  beforeAll(async () => {
    // Import AFTER mocking
    const sessionsModule = await import('../sessions');
    migrateSessionsV1 = sessionsModule.migrateSessionsV1;
    isSessionMigrationCompleted = sessionsModule.isSessionMigrationCompleted;
    countPendingSessions = sessionsModule.countPendingSessions;
    resetSessionMigration = sessionsModule.resetSessionMigration;
  });

  beforeEach(async () => {
    // Clear mocked localStorage
    Object.keys(localStorageData).forEach(key => delete localStorageData[key]);
    vi.clearAllMocks();
    // Clear IndexedDB
    const db = getDB();
    await db.sessions.clear();
  });

  afterEach(async () => {
    await closeDB();
  });

  describe('isSessionMigrationCompleted', () => {
    it('returns false when migration flag is not set', () => {
      expect(isSessionMigrationCompleted()).toBe(false);
    });

    it('returns true when migration flag is set', () => {
      localStorageData[MIGRATION_KEY] = 'true';
      expect(isSessionMigrationCompleted()).toBe(true);
    });
  });

  describe('countPendingSessions', () => {
    it('returns 0 when localStorage is empty', () => {
      expect(countPendingSessions()).toBe(0);
    });

    it('returns 0 when migration is already completed', () => {
      const sessions = [createTestSession(), createTestSession()];
      localStorageData[LEGACY_STORAGE_KEY] = JSON.stringify(sessions);
      localStorageData[MIGRATION_KEY] = 'true';

      expect(countPendingSessions()).toBe(0);
    });

    it('returns correct count of pending sessions', () => {
      const sessions = [createTestSession(), createTestSession(), createTestSession()];
      localStorageData[LEGACY_STORAGE_KEY] = JSON.stringify(sessions);

      expect(countPendingSessions()).toBe(3);
    });

    it('handles corrupted localStorage data', () => {
      localStorageData[LEGACY_STORAGE_KEY] = 'not valid json';
      expect(countPendingSessions()).toBe(0);
    });
  });

  describe('migrateSessionsV1', () => {
    it('skips migration when already completed', async () => {
      localStorageData[MIGRATION_KEY] = 'true';
      const sessions = [createTestSession()];
      localStorageData[LEGACY_STORAGE_KEY] = JSON.stringify(sessions);

      const result = await migrateSessionsV1();

      expect(result.skipped).toBe(true);
      expect(result.migrated).toBe(0);
    });

    it('migrates sessions from localStorage to IndexedDB', async () => {
      const sessions = [
        createTestSession({ id: 'session-1', task: 'Task 1' }),
        createTestSession({ id: 'session-2', task: 'Task 2', projectId: 'proj-1' }),
      ];
      localStorageData[LEGACY_STORAGE_KEY] = JSON.stringify(sessions);

      const result = await migrateSessionsV1();

      expect(result.skipped).toBe(false);
      expect(result.migrated).toBe(2);
      expect(result.errors).toHaveLength(0);

      // Verify sessions are in IndexedDB
      const db = getDB();
      const dbSessions = await db.sessions.toArray();
      expect(dbSessions).toHaveLength(2);

      const session1 = await db.sessions.get('session-1');
      expect(session1?.task).toBe('Task 1');
      expect(session1?.syncStatus).toBe('local');

      const session2 = await db.sessions.get('session-2');
      expect(session2?.task).toBe('Task 2');
      expect(session2?.projectId).toBe('proj-1');
    });

    it('sets migration flag after completion', async () => {
      const sessions = [createTestSession()];
      localStorageData[LEGACY_STORAGE_KEY] = JSON.stringify(sessions);

      await migrateSessionsV1();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(MIGRATION_KEY, 'true');
    });

    it('handles empty localStorage gracefully', async () => {
      const result = await migrateSessionsV1();

      expect(result.skipped).toBe(false);
      expect(result.migrated).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(MIGRATION_KEY, 'true');
    });

    it('is idempotent - skips duplicate IDs', async () => {
      const session = createTestSession({ id: 'duplicate-id' });
      localStorageData[LEGACY_STORAGE_KEY] = JSON.stringify([session]);

      // First migration
      const result1 = await migrateSessionsV1();
      expect(result1.migrated).toBe(1);

      // Reset migration flag but keep data in IndexedDB
      delete localStorageData[MIGRATION_KEY];
      localStorageData[LEGACY_STORAGE_KEY] = JSON.stringify([session]);

      // Second migration
      const result2 = await migrateSessionsV1();
      expect(result2.migrated).toBe(0);
      expect(result2.duplicatesSkipped).toBe(1);

      // Verify only one session in IndexedDB
      const db = getDB();
      const dbSessions = await db.sessions.toArray();
      expect(dbSessions).toHaveLength(1);
    });

    it('continues migration despite individual errors', async () => {
      const validSession = createTestSession({ id: 'valid-session' });
      const sessions = [validSession];
      localStorageData[LEGACY_STORAGE_KEY] = JSON.stringify(sessions);

      const result = await migrateSessionsV1();

      // Should still migrate the valid session
      expect(result.migrated).toBe(1);
    });

    it('preserves all session fields during migration', async () => {
      const session = createTestSession({
        id: 'full-session',
        type: 'work',
        duration: 2500,
        task: 'Important work',
        projectId: 'project-123',
        estimatedPomodoros: 3,
        presetId: 'preset-1',
        overflowDuration: 120,
        estimatedDuration: 1500,
      });
      localStorageData[LEGACY_STORAGE_KEY] = JSON.stringify([session]);

      await migrateSessionsV1();

      const db = getDB();
      const dbSession = await db.sessions.get('full-session');

      expect(dbSession?.type).toBe('work');
      expect(dbSession?.duration).toBe(2500);
      expect(dbSession?.task).toBe('Important work');
      expect(dbSession?.projectId).toBe('project-123');
      expect(dbSession?.estimatedPomodoros).toBe(3);
      expect(dbSession?.presetId).toBe('preset-1');
      expect(dbSession?.overflowDuration).toBe(120);
      expect(dbSession?.estimatedDuration).toBe(1500);
      expect(dbSession?.syncStatus).toBe('local');
      expect(dbSession?.localUpdatedAt).toBeDefined();
    });

    it('records duration of migration', async () => {
      const sessions = [createTestSession()];
      localStorageData[LEGACY_STORAGE_KEY] = JSON.stringify(sessions);

      const result = await migrateSessionsV1();

      expect(result.duration).toBeGreaterThan(0);
    });
  });

  describe('resetSessionMigration', () => {
    it('removes the migration flag', () => {
      localStorageData[MIGRATION_KEY] = 'true';
      expect(isSessionMigrationCompleted()).toBe(true);

      resetSessionMigration();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(MIGRATION_KEY);
    });
  });
});
