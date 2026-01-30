// src/lib/db/database.ts

import Dexie, { type Table } from 'dexie';
import type { DBSession, DBProject, DBRecentTask, DBSettings, DBQueuedChange } from './types';

export class ParticleDB extends Dexie {
  sessions!: Table<DBSession, string>;
  projects!: Table<DBProject, string>;
  recentTasks!: Table<DBRecentTask, string>;
  settings!: Table<DBSettings, string>;
  syncQueue!: Table<DBQueuedChange, string>;

  constructor() {
    super('ParticleDB');

    // Schema v1 - Initial Setup
    this.version(1).stores({
      // Sessions: indexed by id, completedAt (für Datum-Queries), projectId, syncStatus
      sessions: 'id, completedAt, projectId, syncStatus, type',

      // Projects: indexed by id, archived, syncStatus
      projects: 'id, archived, syncStatus',

      // Recent Tasks: indexed by text (unique), lastUsed
      recentTasks: 'text, lastUsed',

      // Settings: key-value store
      settings: 'key',
    });

    // Schema v2 - Add sync queue for offline changes
    this.version(2).stores({
      // Existing tables remain unchanged
      sessions: 'id, completedAt, projectId, syncStatus, type',
      projects: 'id, archived, syncStatus',
      recentTasks: 'text, lastUsed',
      settings: 'key',

      // New: Sync queue for offline/failed changes
      syncQueue: 'id, entityType, createdAt, nextRetryAt',
    });

    // Schema v3 - Add serverId index for sync lookups
    this.version(3).stores({
      // Add serverId index for looking up entities by server ID during pull
      sessions: 'id, completedAt, projectId, syncStatus, type, serverId',
      projects: 'id, archived, syncStatus, serverId',
      recentTasks: 'text, lastUsed',
      settings: 'key',
      syncQueue: 'id, entityType, createdAt, nextRetryAt',
    });
  }
}

// Singleton instance
let db: ParticleDB | null = null;

/**
 * Get the database instance (lazy initialization)
 */
export function getDB(): ParticleDB {
  if (!db) {
    db = new ParticleDB();
  }
  return db;
}

/**
 * Close the database (for testing/cleanup)
 */
export async function closeDB(): Promise<void> {
  if (db) {
    db.close();
    db = null;
  }
}
