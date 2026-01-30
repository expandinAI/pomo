// src/lib/db/database.ts

import Dexie, { type Table } from 'dexie';
import type { DBSession, DBProject, DBRecentTask, DBSettings } from './types';

export class ParticleDB extends Dexie {
  sessions!: Table<DBSession, string>;
  projects!: Table<DBProject, string>;
  recentTasks!: Table<DBRecentTask, string>;
  settings!: Table<DBSettings, string>;

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
