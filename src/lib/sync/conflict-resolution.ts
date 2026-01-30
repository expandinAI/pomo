/**
 * Conflict Resolution Helpers
 *
 * Strategie: Last-Write-Wins (LWW)
 * Bei Timestamp-Gleichstand gewinnt Server (Determinismus).
 */

export type ConflictResolution = 'keep_local' | 'use_remote';

/**
 * Löst Konflikt zwischen lokaler und Server-Version.
 * Bei Gleichstand gewinnt Server (Determinismus).
 *
 * @param localUpdatedAt - ISO timestamp der lokalen Version
 * @param remoteUpdatedAt - ISO timestamp der Server-Version
 * @returns 'use_remote' wenn Server neuer oder gleich alt, sonst 'keep_local'
 */
export function resolveConflict(
  localUpdatedAt: string,
  remoteUpdatedAt: string
): ConflictResolution {
  return isRemoteNewerOrEqual(localUpdatedAt, remoteUpdatedAt)
    ? 'use_remote'
    : 'keep_local';
}

/**
 * Prüft ob Server-Version neuer oder gleich alt ist.
 * >= für Determinismus bei Gleichstand (Server gewinnt).
 *
 * @param localUpdatedAt - ISO timestamp der lokalen Version
 * @param remoteUpdatedAt - ISO timestamp der Server-Version
 * @returns true wenn Server neuer oder gleich alt
 */
export function isRemoteNewerOrEqual(
  localUpdatedAt: string,
  remoteUpdatedAt: string
): boolean {
  return new Date(remoteUpdatedAt) >= new Date(localUpdatedAt);
}

/**
 * Prüft ob Entity als gelöscht markiert ist.
 *
 * @param remote - Entity mit optionalem deleted_at Feld
 * @returns true wenn deleted_at gesetzt ist
 */
export function isDeleted(remote: { deleted_at?: string | null }): boolean {
  return remote.deleted_at != null;
}
