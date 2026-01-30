'use client';

/**
 * Sync Context
 *
 * React context providing access to the SyncService.
 * Starts sync when user is authenticated, stops when logged out.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useParticleAuth, useSupabaseToken } from '@/lib/auth';
import { createSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { DBSession, DBProject } from '@/lib/db/types';
import { SyncService } from './sync-service';
import {
  SYNC_EVENTS,
  dispatchPullCompleted,
  type SessionAddedEvent,
  type SessionUpdatedEvent,
  type SessionDeletedEvent,
  type ProjectAddedEvent,
  type ProjectUpdatedEvent,
  type ProjectDeletedEvent,
} from './sync-events';
import type { SyncState, SyncEventType } from './types';
import { useSettingsSync } from './use-settings-sync';

/**
 * Sync context value
 */
interface SyncContextValue {
  /** The sync service instance (null if not authenticated) */
  service: SyncService | null;
  /** Current sync state */
  state: SyncState;
  /** Whether sync is enabled and active */
  isActive: boolean;
  /** Manually trigger a pull */
  triggerPull: () => Promise<void>;
  /** Manually trigger queue processing */
  triggerProcessQueue: () => Promise<void>;
}

const defaultState: SyncState = {
  status: 'idle',
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastSyncAt: null,
  pendingCount: 0,
};

const SyncContext = createContext<SyncContextValue | null>(null);

interface SyncProviderProps {
  children: ReactNode;
}

/**
 * Sync Provider
 *
 * Manages the SyncService lifecycle based on authentication state.
 * Automatically starts sync when user logs in, stops when logged out.
 */
export function SyncProvider({ children }: SyncProviderProps) {
  const auth = useParticleAuth();
  const getToken = useSupabaseToken();
  const [service, setService] = useState<SyncService | null>(null);
  const [state, setState] = useState<SyncState>(defaultState);

  // Settings sync (POMO-308)
  useSettingsSync();

  // Initialize or cleanup sync service based on auth state
  useEffect(() => {
    let syncService: SyncService | null = null;
    let mounted = true;
    // Cache the user ID so we don't need to fetch it on every request
    let cachedUserId: string | null = null;

    async function initSync() {
      // Only sync for authenticated users with Supabase configured
      if (auth.status !== 'authenticated' || !isSupabaseConfigured) {
        return;
      }

      try {
        // Get initial Supabase token to fetch user ID
        const token = await getToken();
        if (!token || !mounted) return;

        // Create authenticated Supabase client
        const supabase = createSupabaseClient(token);
        if (!supabase) return;

        // Get user ID from Supabase
        // We need to query the users table to get the Supabase user ID
        const { data: userDataRaw, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', auth.userId)
          .single();

        // Cast due to RLS causing never type
        const userData = userDataRaw as { id: string } | null;

        if (userError || !userData) {
          console.error('[SyncProvider] Failed to get user ID:', userError);
          return;
        }

        if (!mounted) return;

        // Cache the user ID
        cachedUserId = userData.id;

        // Create a factory function that always gets a fresh token
        const getSupabaseClient = async () => {
          const freshToken = await getToken();
          if (!freshToken) return null;
          return createSupabaseClient(freshToken);
        };

        // Create and start sync service with the factory function
        syncService = new SyncService(getSupabaseClient, cachedUserId);

        // Subscribe to state changes
        syncService.onEvent((event: SyncEventType) => {
          if (!mounted) return;
          const newState = syncService!.getState();
          setState(newState);

          // Dispatch pull completed event to trigger context refreshes
          if (event === 'pull-success') {
            dispatchPullCompleted();
          }
        });

        await syncService.start();

        if (!mounted) {
          syncService.stop();
          return;
        }

        setService(syncService);
        setState(syncService.getState());
      } catch (err) {
        console.error('[SyncProvider] Init error:', err);
      }
    }

    initSync();

    return () => {
      mounted = false;
      if (syncService) {
        syncService.stop();
      }
      setService(null);
      setState(defaultState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status, getToken]);

  // Listen for sync events from contexts
  useEffect(() => {
    if (!service) return;

    // Capture service in local const for TypeScript
    const syncService = service;

    // Session events
    function handleSessionAdded(e: Event) {
      const event = e as CustomEvent<SessionAddedEvent>;
      syncService.pushSession(event.detail.session);
    }

    function handleSessionUpdated(e: Event) {
      const event = e as CustomEvent<SessionUpdatedEvent>;
      syncService.pushSession(event.detail.session);
    }

    function handleSessionDeleted(e: Event) {
      const event = e as CustomEvent<SessionDeletedEvent>;
      syncService.pushSessionDelete(event.detail.sessionId);
    }

    // Project events
    function handleProjectAdded(e: Event) {
      const event = e as CustomEvent<ProjectAddedEvent>;
      syncService.pushProject(event.detail.project);
    }

    function handleProjectUpdated(e: Event) {
      const event = e as CustomEvent<ProjectUpdatedEvent>;
      syncService.pushProject(event.detail.project);
    }

    function handleProjectDeleted(e: Event) {
      const event = e as CustomEvent<ProjectDeletedEvent>;
      syncService.pushProjectDelete(event.detail.projectId);
    }

    // Add listeners
    window.addEventListener(SYNC_EVENTS.SESSION_ADDED, handleSessionAdded);
    window.addEventListener(SYNC_EVENTS.SESSION_UPDATED, handleSessionUpdated);
    window.addEventListener(SYNC_EVENTS.SESSION_DELETED, handleSessionDeleted);
    window.addEventListener(SYNC_EVENTS.PROJECT_ADDED, handleProjectAdded);
    window.addEventListener(SYNC_EVENTS.PROJECT_UPDATED, handleProjectUpdated);
    window.addEventListener(SYNC_EVENTS.PROJECT_DELETED, handleProjectDeleted);

    return () => {
      window.removeEventListener(SYNC_EVENTS.SESSION_ADDED, handleSessionAdded);
      window.removeEventListener(SYNC_EVENTS.SESSION_UPDATED, handleSessionUpdated);
      window.removeEventListener(SYNC_EVENTS.SESSION_DELETED, handleSessionDeleted);
      window.removeEventListener(SYNC_EVENTS.PROJECT_ADDED, handleProjectAdded);
      window.removeEventListener(SYNC_EVENTS.PROJECT_UPDATED, handleProjectUpdated);
      window.removeEventListener(SYNC_EVENTS.PROJECT_DELETED, handleProjectDeleted);
    };
  }, [service]);

  // Manual trigger functions
  const triggerPull = useCallback(async () => {
    if (service) {
      await service.pull();
    }
  }, [service]);

  const triggerProcessQueue = useCallback(async () => {
    if (service) {
      await service.processQueue();
    }
  }, [service]);

  const value = useMemo(
    (): SyncContextValue => ({
      service,
      state,
      isActive: !!service,
      triggerPull,
      triggerProcessQueue,
    }),
    [service, state, triggerPull, triggerProcessQueue]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

/**
 * Hook to access sync context
 */
export function useSyncService(): SyncContextValue {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncService must be used within a SyncProvider');
  }
  return context;
}

/**
 * Hook to check if sync is active
 */
export function useIsSyncActive(): boolean {
  const { isActive } = useSyncService();
  return isActive;
}

/**
 * Hook to get current sync state
 */
export function useSyncState(): SyncState {
  const { state } = useSyncService();
  return state;
}
