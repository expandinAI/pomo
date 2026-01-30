// src/lib/db/__tests__/database.test.ts

// Mock IndexedDB for Node.js environment
import 'fake-indexeddb/auto';

import { describe, it, expect, afterEach } from 'vitest';
import { getDB, closeDB } from '../database';
import { isIndexedDBAvailable, resetAvailabilityCache } from '../feature-detection';
import {
  withSyncMetadata,
  markAsUpdated,
  markAsSynced,
  markAsDeleted,
  type DBSession,
  type SyncableEntity,
} from '../types';

describe('ParticleDB', () => {
  afterEach(async () => {
    await closeDB();
  });

  it('returns singleton instance', () => {
    const db1 = getDB();
    const db2 = getDB();
    expect(db1).toBe(db2);
  });

  it('has all required tables', () => {
    const db = getDB();
    expect(db.sessions).toBeDefined();
    expect(db.projects).toBeDefined();
    expect(db.recentTasks).toBeDefined();
    expect(db.settings).toBeDefined();
  });

  it('can perform basic CRUD operations', async () => {
    const db = getDB();

    // Create
    const id = 'test-session-1';
    await db.sessions.add({
      id,
      type: 'work',
      duration: 1500,
      completedAt: new Date().toISOString(),
      syncStatus: 'local',
      localUpdatedAt: new Date().toISOString(),
    });

    // Read
    const session = await db.sessions.get(id);
    expect(session).toBeDefined();
    expect(session?.duration).toBe(1500);

    // Update
    await db.sessions.update(id, { duration: 1800 });
    const updated = await db.sessions.get(id);
    expect(updated?.duration).toBe(1800);

    // Delete
    await db.sessions.delete(id);
    const deleted = await db.sessions.get(id);
    expect(deleted).toBeUndefined();
  });

  it('can query sessions by date', async () => {
    const db = getDB();
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();

    await db.sessions.bulkAdd([
      {
        id: 'session-today',
        type: 'work',
        duration: 1500,
        completedAt: today,
        syncStatus: 'local',
        localUpdatedAt: today,
      },
      {
        id: 'session-yesterday',
        type: 'work',
        duration: 1500,
        completedAt: yesterday,
        syncStatus: 'local',
        localUpdatedAt: yesterday,
      },
    ]);

    const todaySessions = await db.sessions
      .where('completedAt')
      .above(new Date(Date.now() - 43200000).toISOString()) // 12 hours ago
      .toArray();

    expect(todaySessions.length).toBe(1);
    expect(todaySessions[0].id).toBe('session-today');

    // Cleanup
    await db.sessions.bulkDelete(['session-today', 'session-yesterday']);
  });

  it('can query sessions by syncStatus', async () => {
    const db = getDB();

    await db.sessions.bulkAdd([
      {
        id: 'session-local',
        type: 'work',
        duration: 1500,
        completedAt: new Date().toISOString(),
        syncStatus: 'local',
        localUpdatedAt: new Date().toISOString(),
      },
      {
        id: 'session-pending',
        type: 'work',
        duration: 1500,
        completedAt: new Date().toISOString(),
        syncStatus: 'pending',
        localUpdatedAt: new Date().toISOString(),
      },
    ]);

    const pendingSessions = await db.sessions
      .where('syncStatus')
      .equals('pending')
      .toArray();

    expect(pendingSessions.length).toBe(1);
    expect(pendingSessions[0].id).toBe('session-pending');

    // Cleanup
    await db.sessions.bulkDelete(['session-local', 'session-pending']);
  });
});

describe('Feature Detection', () => {
  afterEach(() => {
    resetAvailabilityCache();
  });

  it('returns boolean for isIndexedDBAvailable', () => {
    const result = isIndexedDBAvailable();
    expect(typeof result).toBe('boolean');
  });

  it('caches the availability result', () => {
    const result1 = isIndexedDBAvailable();
    const result2 = isIndexedDBAvailable();
    expect(result1).toBe(result2);
  });
});

describe('Sync Metadata Helpers', () => {
  it('withSyncMetadata adds default metadata', () => {
    const data = { id: 'test', name: 'Test' };
    const result = withSyncMetadata(data);

    expect(result.syncStatus).toBe('local');
    expect(result.localUpdatedAt).toBeDefined();
    expect(new Date(result.localUpdatedAt).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('withSyncMetadata accepts custom status', () => {
    const data = { id: 'test' };
    const result = withSyncMetadata(data, 'synced');

    expect(result.syncStatus).toBe('synced');
  });

  it('markAsUpdated changes synced to pending', () => {
    const entity: SyncableEntity = {
      id: 'test',
      syncStatus: 'synced',
      localUpdatedAt: '2024-01-01T00:00:00Z',
    };

    const result = markAsUpdated(entity);

    expect(result.syncStatus).toBe('pending');
    expect(new Date(result.localUpdatedAt).getTime()).toBeGreaterThan(
      new Date('2024-01-01').getTime()
    );
  });

  it('markAsUpdated keeps local status as local', () => {
    const entity: SyncableEntity = {
      id: 'test',
      syncStatus: 'local',
      localUpdatedAt: '2024-01-01T00:00:00Z',
    };

    const result = markAsUpdated(entity);

    expect(result.syncStatus).toBe('local');
  });

  it('markAsSynced sets synced status and timestamp', () => {
    const entity: SyncableEntity = {
      id: 'test',
      syncStatus: 'pending',
      localUpdatedAt: '2024-01-01T00:00:00Z',
    };

    const result = markAsSynced(entity, 'server-123');

    expect(result.syncStatus).toBe('synced');
    expect(result.syncedAt).toBeDefined();
    expect(result.serverId).toBe('server-123');
  });

  it('markAsDeleted sets deleted flag and pending status', () => {
    const entity: SyncableEntity = {
      id: 'test',
      syncStatus: 'synced',
      localUpdatedAt: '2024-01-01T00:00:00Z',
    };

    const result = markAsDeleted(entity);

    expect(result.deleted).toBe(true);
    expect(result.syncStatus).toBe('pending');
  });
});
