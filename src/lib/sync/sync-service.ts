/**
 * Sync Service
 *
 * Handles continuous synchronization between local IndexedDB and Supabase.
 * - Push: Immediately sync local changes to server
 * - Pull: Fetch server changes every 30s and on focus
 * - Queue: Handle offline scenarios with retry logic
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getDB } from '@/lib/db/database';
import type { DBSession, DBProject } from '@/lib/db/types';
import { markAsSynced } from '@/lib/db/types';
import type {
  Database,
  SessionMode,
  Session as SupabaseSession,
  Project as SupabaseProject,
} from '@/lib/supabase/types';
import {
  enqueue,
  getNextBatch,
  getPendingCount,
  markProcessed,
  markFailed,
  removeEntriesForEntity,
} from './offline-queue';
import { isRemoteNewerOrEqual, isDeleted } from './conflict-resolution';
import type {
  SyncConfig,
  SyncState,
  SyncEventCallback,
  PullResult,
  SyncEntityType,
} from './types';
import { DEFAULT_SYNC_CONFIG, LAST_PULL_KEY } from './types';

/**
 * Map local session type to Supabase mode
 */
function mapSessionType(type: DBSession['type']): SessionMode {
  switch (type) {
    case 'work':
      return 'work';
    case 'shortBreak':
      return 'break';
    case 'longBreak':
      return 'longBreak';
    default:
      return 'work';
  }
}

/**
 * Map Supabase mode to local session type
 */
function mapSessionModeToType(mode: SessionMode): DBSession['type'] {
  switch (mode) {
    case 'work':
      return 'work';
    case 'break':
      return 'shortBreak';
    case 'longBreak':
      return 'longBreak';
    default:
      return 'work';
  }
}

/**
 * Convert brightness value (0.3-1.0) to hex color string
 */
function brightnessToHex(brightness: number): string {
  const clamped = Math.max(0.3, Math.min(1.0, brightness));
  const value = Math.round(clamped * 255);
  const hex = value.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
}

/**
 * Convert hex color to brightness value (0.3-1.0)
 */
function hexToBrightness(hex: string | null): number {
  if (!hex) return 0.7;
  const cleaned = hex.replace('#', '');
  const value = parseInt(cleaned.substring(0, 2), 16);
  return Math.max(0.3, Math.min(1.0, value / 255));
}

/**
 * Calculate started_at from completedAt and duration
 */
function calculateStartedAt(completedAt: string, durationSeconds: number): string {
  const endTime = new Date(completedAt);
  const startTime = new Date(endTime.getTime() - durationSeconds * 1000);
  return startTime.toISOString();
}

/**
 * Function type for creating a fresh Supabase client with a new JWT token
 */
export type SupabaseClientFactory = () => Promise<SupabaseClient<Database> | null>;

/**
 * Sync Service Class
 */
export class SyncService {
  private getSupabaseClient: SupabaseClientFactory;
  private userId: string;
  private config: SyncConfig;
  private pullIntervalId: ReturnType<typeof setInterval> | null = null;
  private isProcessingQueue = false;
  private eventListeners: SyncEventCallback[] = [];
  private state: SyncState = {
    status: 'idle',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncAt: null,
    pendingCount: 0,
  };

  // Map local project IDs to server project IDs (cached for session pushes)
  private projectIdMap = new Map<string, string>();

  constructor(
    getSupabaseClient: SupabaseClientFactory,
    userId: string,
    config: Partial<SyncConfig> = {}
  ) {
    this.getSupabaseClient = getSupabaseClient;
    this.userId = userId;
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
  }

  /**
   * Get a fresh Supabase client with a valid JWT token
   */
  private async getClient(): Promise<SupabaseClient<Database> | null> {
    try {
      return await this.getSupabaseClient();
    } catch (err) {
      console.error('[SyncService] Failed to get Supabase client:', err);
      return null;
    }
  }

  /**
   * Start the sync service
   * - Initialize project ID map
   * - Start pull interval
   * - Listen for online/offline events
   * - Listen for window focus
   */
  async start(): Promise<void> {
    console.log('[SyncService] Starting...');

    // Initialize project ID map
    await this.loadProjectIdMap();

    // Initial pull
    await this.pull();

    // Process any queued changes
    await this.processQueue();

    // Start pull interval
    this.pullIntervalId = setInterval(() => {
      this.pull();
    }, this.config.pullIntervalMs);

    // Listen for online/offline
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      window.addEventListener('focus', this.handleFocus);
    }

    console.log('[SyncService] Started');
  }

  /**
   * Stop the sync service
   */
  stop(): void {
    console.log('[SyncService] Stopping...');

    if (this.pullIntervalId) {
      clearInterval(this.pullIntervalId);
      this.pullIntervalId = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
      window.removeEventListener('focus', this.handleFocus);
    }

    console.log('[SyncService] Stopped');
  }

  /**
   * Subscribe to sync events
   */
  onEvent(callback: SyncEventCallback): () => void {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Get current sync state
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Push a session to Supabase
   */
  async pushSession(session: DBSession): Promise<boolean> {
    if (!this.state.isOnline) {
      await this.queueChange('sessions', session.id, 'upsert', session);
      return false;
    }

    this.emit('push-start');
    this.updateState({ status: 'syncing' });

    try {
      const supabase = await this.getClient();
      if (!supabase) {
        throw new Error('Failed to get Supabase client');
      }

      // Map project ID if exists
      let serverProjectId: string | null = null;
      if (session.projectId) {
        serverProjectId = this.projectIdMap.get(session.projectId) || null;
      }

      const sessionData = {
        id: session.serverId || crypto.randomUUID(),
        user_id: this.userId,
        local_id: session.id,
        started_at: calculateStartedAt(session.completedAt, session.duration),
        ended_at: session.completedAt,
        duration_seconds: session.duration,
        mode: mapSessionType(session.type),
        project_id: serverProjectId,
        task: session.task || null,
        is_overflow: !!session.overflowDuration && session.overflowDuration > 0,
        overflow_seconds: session.overflowDuration || 0,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('sessions')
        .upsert(sessionData as never, { onConflict: 'local_id,user_id' });

      if (error) {
        throw error;
      }

      // Mark local session as synced
      const db = getDB();
      const synced = markAsSynced(session, sessionData.id);
      await db.sessions.put(synced);

      // Remove any queued changes for this entity
      await removeEntriesForEntity('sessions', session.id);

      this.emit('push-success');
      this.updateState({
        status: 'idle',
        lastSyncAt: new Date().toISOString(),
      });
      await this.updatePendingCount();

      return true;
    } catch (err) {
      console.error('[SyncService] Push session failed:', err);
      await this.queueChange('sessions', session.id, 'upsert', session);
      this.emit('push-error', err);
      this.updateState({
        status: 'error',
        lastError: err instanceof Error ? err.message : 'Push failed',
      });
      return false;
    }
  }

  /**
   * Push a session delete to Supabase
   */
  async pushSessionDelete(sessionId: string): Promise<boolean> {
    if (!this.state.isOnline) {
      await this.queueChange('sessions', sessionId, 'delete', {});
      return false;
    }

    this.emit('push-start');
    this.updateState({ status: 'syncing' });

    try {
      const supabase = await this.getClient();
      if (!supabase) {
        throw new Error('Failed to get Supabase client');
      }

      // Soft delete on server
      const { error } = await supabase
        .from('sessions')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('local_id', sessionId)
        .eq('user_id', this.userId);

      if (error) {
        throw error;
      }

      // Remove any queued changes for this entity
      await removeEntriesForEntity('sessions', sessionId);

      this.emit('push-success');
      this.updateState({
        status: 'idle',
        lastSyncAt: new Date().toISOString(),
      });
      await this.updatePendingCount();

      return true;
    } catch (err) {
      console.error('[SyncService] Push session delete failed:', err);
      await this.queueChange('sessions', sessionId, 'delete', {});
      this.emit('push-error', err);
      this.updateState({
        status: 'error',
        lastError: err instanceof Error ? err.message : 'Delete failed',
      });
      return false;
    }
  }

  /**
   * Push a project to Supabase
   */
  async pushProject(project: DBProject): Promise<boolean> {
    if (!this.state.isOnline) {
      await this.queueChange('projects', project.id, 'upsert', project);
      return false;
    }

    this.emit('push-start');
    this.updateState({ status: 'syncing' });

    try {
      const supabase = await this.getClient();
      if (!supabase) {
        throw new Error('Failed to get Supabase client');
      }

      const serverId = project.serverId || crypto.randomUUID();

      const projectData = {
        id: serverId,
        user_id: this.userId,
        local_id: project.id,
        name: project.name,
        color: brightnessToHex(project.brightness),
        is_active: !project.archived,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('projects')
        .upsert(projectData as never, { onConflict: 'local_id,user_id' });

      if (error) {
        throw error;
      }

      // Mark local project as synced
      const db = getDB();
      const synced = markAsSynced(project, serverId);
      await db.projects.put(synced);

      // Update project ID map
      this.projectIdMap.set(project.id, serverId);

      // Remove any queued changes for this entity
      await removeEntriesForEntity('projects', project.id);

      this.emit('push-success');
      this.updateState({
        status: 'idle',
        lastSyncAt: new Date().toISOString(),
      });
      await this.updatePendingCount();

      return true;
    } catch (err) {
      console.error('[SyncService] Push project failed:', err);
      await this.queueChange('projects', project.id, 'upsert', project);
      this.emit('push-error', err);
      this.updateState({
        status: 'error',
        lastError: err instanceof Error ? err.message : 'Push failed',
      });
      return false;
    }
  }

  /**
   * Push a project delete to Supabase
   */
  async pushProjectDelete(projectId: string): Promise<boolean> {
    if (!this.state.isOnline) {
      await this.queueChange('projects', projectId, 'delete', {});
      return false;
    }

    this.emit('push-start');
    this.updateState({ status: 'syncing' });

    try {
      const supabase = await this.getClient();
      if (!supabase) {
        throw new Error('Failed to get Supabase client');
      }

      // Soft delete on server
      const { error } = await supabase
        .from('projects')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('local_id', projectId)
        .eq('user_id', this.userId);

      if (error) {
        throw error;
      }

      // Remove from project ID map
      this.projectIdMap.delete(projectId);

      // Remove any queued changes for this entity
      await removeEntriesForEntity('projects', projectId);

      this.emit('push-success');
      this.updateState({
        status: 'idle',
        lastSyncAt: new Date().toISOString(),
      });
      await this.updatePendingCount();

      return true;
    } catch (err) {
      console.error('[SyncService] Push project delete failed:', err);
      await this.queueChange('projects', projectId, 'delete', {});
      this.emit('push-error', err);
      this.updateState({
        status: 'error',
        lastError: err instanceof Error ? err.message : 'Delete failed',
      });
      return false;
    }
  }

  /**
   * Pull changes from Supabase since last pull
   */
  async pull(): Promise<PullResult> {
    if (!this.state.isOnline) {
      return { sessionsUpdated: 0, sessionsDeleted: 0, projectsUpdated: 0, projectsDeleted: 0 };
    }

    this.emit('pull-start');
    this.updateState({ status: 'syncing' });

    const result: PullResult = {
      sessionsUpdated: 0,
      sessionsDeleted: 0,
      projectsUpdated: 0,
      projectsDeleted: 0,
    };

    try {
      const supabase = await this.getClient();
      if (!supabase) {
        throw new Error('Failed to get Supabase client');
      }

      const lastPullAt = localStorage.getItem(LAST_PULL_KEY) || '1970-01-01T00:00:00.000Z';
      const db = getDB();

      // Pull projects first
      const { data: serverProjectsData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', this.userId)
        .gte('updated_at', lastPullAt);

      if (projectError) {
        throw projectError;
      }

      // Cast to typed array (RLS causes never type)
      const serverProjects = serverProjectsData as SupabaseProject[] | null;

      if (serverProjects) {
        for (const serverProject of serverProjects) {
          // Check if deleted (soft-delete from server)
          if (isDeleted(serverProject)) {
            const local = await db.projects
              .where('serverId')
              .equals(serverProject.id)
              .first();
            if (local) {
              await db.projects.delete(local.id);
              result.projectsDeleted++;
            }
            continue;
          }

          // Check if we have a local version by local_id
          const existing = await db.projects.get(serverProject.local_id);

          if (existing) {
            // Update if server is newer or equal (server wins on tie)
            if (isRemoteNewerOrEqual(existing.localUpdatedAt, serverProject.updated_at)) {
              await db.projects.update(serverProject.local_id, {
                name: serverProject.name,
                brightness: hexToBrightness(serverProject.color),
                archived: !serverProject.is_active,
                syncStatus: 'synced',
                syncedAt: new Date().toISOString(),
                serverId: serverProject.id,
              });
              result.projectsUpdated++;
            }
          } else {
            // Insert new project from server
            const newProject: DBProject = {
              id: serverProject.local_id,
              name: serverProject.name,
              brightness: hexToBrightness(serverProject.color),
              archived: !serverProject.is_active,
              createdAt: serverProject.created_at,
              updatedAt: serverProject.updated_at,
              syncStatus: 'synced',
              localUpdatedAt: serverProject.updated_at,
              syncedAt: new Date().toISOString(),
              serverId: serverProject.id,
            };
            await db.projects.add(newProject);
            result.projectsUpdated++;
          }

          // Update project ID map
          this.projectIdMap.set(serverProject.local_id, serverProject.id);
        }
      }

      // Pull sessions
      const { data: serverSessionsData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', this.userId)
        .gte('updated_at', lastPullAt);

      if (sessionError) {
        throw sessionError;
      }

      // Cast to typed array (RLS causes never type)
      const serverSessions = serverSessionsData as SupabaseSession[] | null;

      if (serverSessions) {
        for (const serverSession of serverSessions) {
          // Check if deleted (soft-delete from server)
          if (isDeleted(serverSession)) {
            const local = await db.sessions
              .where('serverId')
              .equals(serverSession.id)
              .first();
            if (local) {
              await db.sessions.delete(local.id);
              result.sessionsDeleted++;
            }
            continue;
          }

          // Check if we have a local version by local_id
          const existing = await db.sessions.get(serverSession.local_id);

          // Map project server ID back to local ID
          let localProjectId: string | undefined;
          if (serverSession.project_id) {
            this.projectIdMap.forEach((serverId, localId) => {
              if (serverId === serverSession.project_id) {
                localProjectId = localId;
              }
            });
          }

          if (existing) {
            // Update if server is newer or equal (server wins on tie)
            if (isRemoteNewerOrEqual(existing.localUpdatedAt, serverSession.updated_at)) {
              await db.sessions.update(serverSession.local_id, {
                type: mapSessionModeToType(serverSession.mode),
                duration: serverSession.duration_seconds,
                completedAt: serverSession.ended_at || serverSession.started_at,
                task: serverSession.task || undefined,
                projectId: localProjectId,
                overflowDuration: serverSession.overflow_seconds || undefined,
                syncStatus: 'synced',
                syncedAt: new Date().toISOString(),
                serverId: serverSession.id,
              });
              result.sessionsUpdated++;
            }
          } else {
            // Insert new session from server
            const newSession: DBSession = {
              id: serverSession.local_id,
              type: mapSessionModeToType(serverSession.mode),
              duration: serverSession.duration_seconds,
              completedAt: serverSession.ended_at || serverSession.started_at,
              task: serverSession.task || undefined,
              projectId: localProjectId,
              overflowDuration: serverSession.overflow_seconds || undefined,
              syncStatus: 'synced',
              localUpdatedAt: serverSession.updated_at,
              syncedAt: new Date().toISOString(),
              serverId: serverSession.id,
            };
            await db.sessions.add(newSession);
            result.sessionsUpdated++;
          }
        }
      }

      // Update last pull timestamp
      localStorage.setItem(LAST_PULL_KEY, new Date().toISOString());

      this.emit('pull-success', result);
      this.updateState({
        status: 'idle',
        lastSyncAt: new Date().toISOString(),
      });

      return result;
    } catch (err) {
      console.error('[SyncService] Pull failed:', err);
      this.emit('pull-error', err);
      this.updateState({
        status: 'error',
        lastError: err instanceof Error ? err.message : 'Pull failed',
      });
      return result;
    }
  }

  /**
   * Process offline queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessingQueue || !this.state.isOnline) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      const batch = await getNextBatch(this.config.queueBatchSize);

      for (const entry of batch) {
        try {
          let success = false;

          if (entry.entityType === 'sessions') {
            if (entry.operation === 'delete') {
              success = await this.pushSessionDeleteDirect(entry.entityId);
            } else {
              const session = entry.payload as unknown as DBSession;
              success = await this.pushSessionDirect(session);
            }
          } else if (entry.entityType === 'projects') {
            if (entry.operation === 'delete') {
              success = await this.pushProjectDeleteDirect(entry.entityId);
            } else {
              const project = entry.payload as unknown as DBProject;
              success = await this.pushProjectDirect(project);
            }
          }

          if (success) {
            await markProcessed(entry.id);
          } else {
            await markFailed(entry.id, 'Push failed', this.config);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          await markFailed(entry.id, message, this.config);
        }
      }

      await this.updatePendingCount();
      this.emit('queue-processed');
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // ============================================
  // Private helpers
  // ============================================

  private async loadProjectIdMap(): Promise<void> {
    const db = getDB();
    const projects = await db.projects.toArray();
    for (const project of projects) {
      if (project.serverId) {
        this.projectIdMap.set(project.id, project.serverId);
      }
    }
  }

  private async queueChange(
    entityType: SyncEntityType,
    entityId: string,
    operation: 'upsert' | 'delete',
    payload: DBSession | DBProject | Record<string, unknown>
  ): Promise<void> {
    // Convert entity to Record for storage
    await enqueue(entityType, entityId, operation, payload as Record<string, unknown>);
    await this.updatePendingCount();
  }

  private async updatePendingCount(): Promise<void> {
    const count = await getPendingCount();
    this.updateState({ pendingCount: count });
  }

  private updateState(updates: Partial<SyncState>): void {
    this.state = { ...this.state, ...updates };
  }

  private emit(event: Parameters<SyncEventCallback>[0], data?: unknown): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event, data);
      } catch (err) {
        console.error('[SyncService] Event listener error:', err);
      }
    }
  }

  // Direct push methods (skip queue logic)
  private async pushSessionDirect(session: DBSession): Promise<boolean> {
    const supabase = await this.getClient();
    if (!supabase) {
      throw new Error('Failed to get Supabase client');
    }

    let serverProjectId: string | null = null;
    if (session.projectId) {
      serverProjectId = this.projectIdMap.get(session.projectId) || null;
    }

    const sessionData = {
      id: session.serverId || crypto.randomUUID(),
      user_id: this.userId,
      local_id: session.id,
      started_at: calculateStartedAt(session.completedAt, session.duration),
      ended_at: session.completedAt,
      duration_seconds: session.duration,
      mode: mapSessionType(session.type),
      project_id: serverProjectId,
      task: session.task || null,
      is_overflow: !!session.overflowDuration && session.overflowDuration > 0,
      overflow_seconds: session.overflowDuration || 0,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('sessions')
      .upsert(sessionData as never, { onConflict: 'local_id,user_id' });

    if (error) {
      throw error;
    }

    // Mark local session as synced
    const db = getDB();
    const synced = markAsSynced(session, sessionData.id);
    await db.sessions.put(synced);

    return true;
  }

  private async pushSessionDeleteDirect(sessionId: string): Promise<boolean> {
    const supabase = await this.getClient();
    if (!supabase) {
      throw new Error('Failed to get Supabase client');
    }

    const { error } = await supabase
      .from('sessions')
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('local_id', sessionId)
      .eq('user_id', this.userId);

    if (error) {
      throw error;
    }

    return true;
  }

  private async pushProjectDirect(project: DBProject): Promise<boolean> {
    const supabase = await this.getClient();
    if (!supabase) {
      throw new Error('Failed to get Supabase client');
    }

    const serverId = project.serverId || crypto.randomUUID();

    const projectData = {
      id: serverId,
      user_id: this.userId,
      local_id: project.id,
      name: project.name,
      color: brightnessToHex(project.brightness),
      is_active: !project.archived,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('projects')
      .upsert(projectData as never, { onConflict: 'local_id,user_id' });

    if (error) {
      throw error;
    }

    // Mark local project as synced
    const db = getDB();
    const synced = markAsSynced(project, serverId);
    await db.projects.put(synced);

    // Update project ID map
    this.projectIdMap.set(project.id, serverId);

    return true;
  }

  private async pushProjectDeleteDirect(projectId: string): Promise<boolean> {
    const supabase = await this.getClient();
    if (!supabase) {
      throw new Error('Failed to get Supabase client');
    }

    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('local_id', projectId)
      .eq('user_id', this.userId);

    if (error) {
      throw error;
    }

    // Remove from project ID map
    this.projectIdMap.delete(projectId);

    return true;
  }

  // Event handlers
  private handleOnline = (): void => {
    console.log('[SyncService] Online');
    this.updateState({ isOnline: true, status: 'idle' });
    this.emit('online');
    // Process queue when coming back online
    this.processQueue();
    this.pull();
  };

  private handleOffline = (): void => {
    console.log('[SyncService] Offline');
    this.updateState({ isOnline: false, status: 'offline' });
    this.emit('offline');
  };

  private handleFocus = (): void => {
    // Pull on window focus for quicker sync
    this.pull();
    this.processQueue();
  };
}
