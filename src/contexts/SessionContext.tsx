'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { DBSession } from '@/lib/db/types';
import {
  getStorageMode,
  loadSessionsDB,
  saveSessionDB,
  updateSessionDB,
  deleteSessionDB,
  getSessionByIdDB,
  getTodaySessionsDB,
  getTotalSessionCountDB,
  getSessionsFromDaysDB,
  type CreateSessionInput,
  type UpdateSessionInput,
} from '@/lib/db';
import {
  loadSessions as loadSessionsLS,
  addSession as addSessionLS,
  updateSession as updateSessionLS,
  deleteSession as deleteSessionLS,
  getSessionById as getSessionByIdLS,
  getTodaySessions as getTodaySessionsLS,
  getTotalSessionCount as getTotalSessionCountLS,
  getSessionsFromDays as getSessionsFromDaysLS,
  type CompletedSession,
  type TaskData,
} from '@/lib/session-storage';
import type { SessionType } from '@/styles/design-tokens';

/**
 * Unified session type that works with both storage backends
 * DBSession extends CompletedSession with sync metadata
 */
export type UnifiedSession = DBSession | CompletedSession;

/**
 * Session store context value
 */
interface SessionContextValue {
  /** All sessions (cached in memory) */
  sessions: UnifiedSession[];

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: Error | null;

  /** Storage mode in use */
  storageMode: 'indexeddb' | 'localstorage';

  // Write operations
  addSession: (
    type: SessionType,
    duration: number,
    taskData?: TaskData
  ) => Promise<UnifiedSession>;
  updateSession: (
    id: string,
    updates: UpdateSessionInput
  ) => Promise<UnifiedSession | null>;
  deleteSession: (id: string) => Promise<boolean>;

  // Read operations (computed from cached sessions)
  getSessionById: (id: string) => UnifiedSession | undefined;
  getTodaySessions: () => UnifiedSession[];
  getTotalSessionCount: () => number;
  getSessionsFromDays: (days: number) => UnifiedSession[];

  // Refresh
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Convert CompletedSession to CreateSessionInput for IndexedDB
 */
function toCreateInput(
  type: SessionType,
  duration: number,
  taskData?: TaskData
): CreateSessionInput {
  return {
    type,
    duration,
    ...(taskData?.task && { task: taskData.task }),
    ...(taskData?.projectId && { projectId: taskData.projectId }),
    ...(taskData?.estimatedPomodoros && {
      estimatedPomodoros: taskData.estimatedPomodoros,
    }),
    ...(taskData?.presetId && { presetId: taskData.presetId }),
    ...(taskData?.overflowDuration && {
      overflowDuration: taskData.overflowDuration,
    }),
    ...(taskData?.estimatedDuration && {
      estimatedDuration: taskData.estimatedDuration,
    }),
  };
}

interface SessionProviderProps {
  children: ReactNode;
}

/**
 * Session Provider
 *
 * Provides unified access to sessions regardless of storage backend.
 * Automatically detects and uses IndexedDB when available, falls back to localStorage.
 */
export function SessionProvider({ children }: SessionProviderProps) {
  const [sessions, setSessions] = useState<UnifiedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [storageMode, setStorageMode] = useState<'indexeddb' | 'localstorage'>(
    'localstorage'
  );

  // Initialize: detect storage mode and load sessions
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        setError(null);

        const mode = getStorageMode();
        setStorageMode(mode);

        if (mode === 'indexeddb') {
          const loadedSessions = await loadSessionsDB();
          setSessions(loadedSessions);
        } else {
          const loadedSessions = loadSessionsLS();
          setSessions(loadedSessions);
        }
      } catch (err) {
        console.error('[SessionProvider] Init error:', err);
        setError(err instanceof Error ? err : new Error('Failed to load sessions'));
        // Fallback to localStorage on error
        try {
          const loadedSessions = loadSessionsLS();
          setSessions(loadedSessions);
          setStorageMode('localstorage');
        } catch {
          setSessions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // Refresh sessions from storage
  const refresh = useCallback(async () => {
    try {
      if (storageMode === 'indexeddb') {
        const loadedSessions = await loadSessionsDB();
        setSessions(loadedSessions);
      } else {
        const loadedSessions = loadSessionsLS();
        setSessions(loadedSessions);
      }
    } catch (err) {
      console.error('[SessionProvider] Refresh error:', err);
    }
  }, [storageMode]);

  // Add session
  const addSession = useCallback(
    async (
      type: SessionType,
      duration: number,
      taskData?: TaskData
    ): Promise<UnifiedSession> => {
      if (storageMode === 'indexeddb') {
        const input = toCreateInput(type, duration, taskData);
        const newSession = await saveSessionDB(input);
        setSessions((prev) => [newSession, ...prev]);
        return newSession;
      } else {
        const newSession = addSessionLS(type, duration, taskData);
        setSessions((prev) => [newSession, ...prev]);
        return newSession;
      }
    },
    [storageMode]
  );

  // Update session
  const updateSession = useCallback(
    async (
      id: string,
      updates: UpdateSessionInput
    ): Promise<UnifiedSession | null> => {
      if (storageMode === 'indexeddb') {
        const updated = await updateSessionDB(id, updates);
        if (updated) {
          setSessions((prev) =>
            prev.map((s) => (s.id === id ? updated : s))
          );
        }
        return updated;
      } else {
        // localStorage API doesn't support null for projectId, convert to undefined
        const lsUpdates = {
          ...updates,
          projectId: updates.projectId === null ? undefined : updates.projectId,
        };
        const updated = updateSessionLS(id, lsUpdates);
        if (updated) {
          setSessions((prev) =>
            prev.map((s) => (s.id === id ? updated : s))
          );
        }
        return updated;
      }
    },
    [storageMode]
  );

  // Delete session
  const deleteSession = useCallback(
    async (id: string): Promise<boolean> => {
      if (storageMode === 'indexeddb') {
        const success = await deleteSessionDB(id);
        if (success) {
          // Soft delete in IndexedDB - remove from visible list
          setSessions((prev) => prev.filter((s) => s.id !== id));
        }
        return success;
      } else {
        const success = deleteSessionLS(id);
        if (success) {
          setSessions((prev) => prev.filter((s) => s.id !== id));
        }
        return success;
      }
    },
    [storageMode]
  );

  // Get session by ID (from cached sessions)
  const getSessionById = useCallback(
    (id: string): UnifiedSession | undefined => {
      return sessions.find((s) => s.id === id);
    },
    [sessions]
  );

  // Get today's work sessions (from cached sessions)
  const getTodaySessions = useCallback((): UnifiedSession[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sessions.filter((session) => {
      const sessionDate = new Date(session.completedAt);
      return sessionDate >= today && session.type === 'work';
    });
  }, [sessions]);

  // Get total work session count (from cached sessions)
  const getTotalSessionCount = useCallback((): number => {
    return sessions.filter((s) => s.type === 'work').length;
  }, [sessions]);

  // Get sessions from last N days (from cached sessions)
  const getSessionsFromDays = useCallback(
    (days: number): UnifiedSession[] => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      cutoff.setHours(0, 0, 0, 0);

      return sessions.filter(
        (session) => new Date(session.completedAt) >= cutoff
      );
    },
    [sessions]
  );

  const value = useMemo(
    (): SessionContextValue => ({
      sessions,
      isLoading,
      error,
      storageMode,
      addSession,
      updateSession,
      deleteSession,
      getSessionById,
      getTodaySessions,
      getTotalSessionCount,
      getSessionsFromDays,
      refresh,
    }),
    [
      sessions,
      isLoading,
      error,
      storageMode,
      addSession,
      updateSession,
      deleteSession,
      getSessionById,
      getTodaySessions,
      getTotalSessionCount,
      getSessionsFromDays,
      refresh,
    ]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/**
 * Hook to access session store
 *
 * @example
 * ```tsx
 * const { addSession, getTodaySessions, isLoading } = useSessionStore();
 *
 * // Add a new session
 * await addSession('work', 1500, { task: 'Build feature' });
 *
 * // Get today's work sessions
 * const todaySessions = getTodaySessions();
 * ```
 */
export function useSessionStore(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionStore must be used within a SessionProvider');
  }
  return context;
}

/**
 * Hook to access just the sessions array
 * Useful when you only need to read sessions
 */
export function useSessions(): UnifiedSession[] {
  const { sessions } = useSessionStore();
  return sessions;
}
