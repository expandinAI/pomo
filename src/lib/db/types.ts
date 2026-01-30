// src/lib/db/types.ts

import type { SessionType } from '@/styles/design-tokens';

/**
 * Sync Status für spätere Cloud-Integration
 * - local: Nur lokal vorhanden
 * - pending: Geändert, wartet auf Sync
 * - synced: Mit Server synchronisiert
 * - conflict: Konflikt erkannt
 */
export type SyncStatus = 'local' | 'pending' | 'synced' | 'conflict';

/**
 * Basis-Interface für alle sync-fähigen Entities
 */
export interface SyncableEntity {
  id: string;
  syncStatus: SyncStatus;
  localUpdatedAt: string; // ISO timestamp der letzten lokalen Änderung
  syncedAt?: string; // ISO timestamp des letzten erfolgreichen Syncs
  serverId?: string; // ID in der Cloud-DB (später)
  deleted?: boolean; // Soft-delete Flag für Sync
}

/**
 * Session = Ein Partikel
 */
export interface DBSession extends SyncableEntity {
  type: SessionType;
  duration: number; // Sekunden
  completedAt: string; // ISO timestamp
  task?: string;
  projectId?: string;
  estimatedPomodoros?: number;
  presetId?: string;
  overflowDuration?: number;
  estimatedDuration?: number;
}

/**
 * Projekt zur Organisation von Sessions
 */
export interface DBProject extends SyncableEntity {
  name: string;
  brightness: number; // 0.3 - 1.0
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Kürzlich verwendete Tasks für Autocomplete
 */
export interface DBRecentTask {
  text: string; // Primary key
  lastUsed: string; // ISO timestamp
  estimatedPomodoros?: number;
}

/**
 * User Settings (Key-Value Store)
 */
export interface DBSettings {
  key: string; // Primary key, z.B. 'timer', 'sound', 'visual'
  value: Record<string, unknown>;
  localUpdatedAt: string;
}

// ============================================
// Sync Metadata Helper Functions
// ============================================

/**
 * Fügt Sync-Metadaten zu einem neuen Entity hinzu
 */
export function withSyncMetadata<T extends object>(
  data: T,
  status: SyncStatus = 'local'
): T & Pick<SyncableEntity, 'syncStatus' | 'localUpdatedAt'> {
  return {
    ...data,
    syncStatus: status,
    localUpdatedAt: new Date().toISOString(),
  };
}

/**
 * Markiert ein Entity als lokal aktualisiert
 * Ändert syncStatus von 'synced' zu 'pending'
 */
export function markAsUpdated<T extends SyncableEntity>(entity: T): T {
  return {
    ...entity,
    syncStatus: entity.syncStatus === 'synced' ? 'pending' : entity.syncStatus,
    localUpdatedAt: new Date().toISOString(),
  };
}

/**
 * Markiert ein Entity als erfolgreich synchronisiert
 */
export function markAsSynced<T extends SyncableEntity>(
  entity: T,
  serverId?: string
): T {
  return {
    ...entity,
    syncStatus: 'synced' as SyncStatus,
    syncedAt: new Date().toISOString(),
    serverId: serverId || entity.serverId,
  };
}

/**
 * Markiert ein Entity als gelöscht (Soft-Delete)
 */
export function markAsDeleted<T extends SyncableEntity>(entity: T): T {
  return {
    ...entity,
    deleted: true,
    syncStatus: entity.syncStatus === 'synced' ? 'pending' : entity.syncStatus,
    localUpdatedAt: new Date().toISOString(),
  };
}
