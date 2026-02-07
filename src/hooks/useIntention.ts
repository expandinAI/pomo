'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DBIntention, IntentionStatus } from '@/lib/db/types';
import {
  getIntentionForDate,
  saveIntention,
  updateIntention,
  deleteIntention,
  getTodayDateString,
} from '@/lib/intentions';
import {
  dispatchIntentionAdded,
  dispatchIntentionUpdated,
  dispatchIntentionDeleted,
} from '@/lib/sync/sync-events';

interface UseIntentionReturn {
  /** Today's intention (null if not set) */
  todayIntention: DBIntention | null;
  /** Loading state */
  isLoading: boolean;
  /** Set a new intention for today */
  setIntention: (text: string, projectId?: string, particleGoal?: number, deferredFrom?: string) => Promise<DBIntention>;
  /** Update the status of today's intention */
  updateIntentionStatus: (status: IntentionStatus) => Promise<DBIntention | null>;
  /** Update the text of today's intention */
  updateIntentionText: (text: string) => Promise<DBIntention | null>;
  /** Update the project of today's intention */
  updateIntentionProject: (projectId: string | null) => Promise<DBIntention | null>;
  /** Update the particle goal of today's intention */
  updateIntentionGoal: (particleGoal: number | null) => Promise<DBIntention | null>;
  /** Clear (delete) today's intention */
  clearIntention: () => Promise<boolean>;
  /** Refresh intention from storage */
  refresh: () => Promise<void>;
  /** Check if there's an intention set for today */
  hasIntention: boolean;
  /** Current particle goal (null if not set) */
  particleGoal: number | null;
  /** Yesterday's deferred intention (if any) for suggestion */
  deferredSuggestion: DBIntention | null;
}

/**
 * Hook for managing the daily intention
 *
 * Provides CRUD operations for today's intention with automatic
 * loading on mount and optimistic state updates.
 *
 * @example
 * ```tsx
 * const { todayIntention, setIntention, updateIntentionStatus } = useIntention();
 *
 * // Set today's intention
 * await setIntention('Ship the login feature');
 *
 * // Mark as completed
 * await updateIntentionStatus('completed');
 * ```
 */
export function useIntention(): UseIntentionReturn {
  const [todayIntention, setTodayIntention] = useState<DBIntention | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deferredSuggestion, setDeferredSuggestion] = useState<DBIntention | null>(null);

  // Load today's intention on mount
  const loadIntention = useCallback(async () => {
    try {
      const today = getTodayDateString();
      const intention = await getIntentionForDate(today);
      setTodayIntention(intention ?? null);
    } catch (error) {
      console.error('Failed to load intention:', error);
      setTodayIntention(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntention();
  }, [loadIntention]);

  // Check if yesterday's intention was deferred (for suggestion banner)
  useEffect(() => {
    async function checkDeferred() {
      // Only suggest if today has no intention yet
      if (todayIntention) {
        setDeferredSuggestion(null);
        return;
      }
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const yesterdayIntention = await getIntentionForDate(yesterdayStr);
        if (yesterdayIntention?.status === 'deferred') {
          setDeferredSuggestion(yesterdayIntention);
        } else {
          setDeferredSuggestion(null);
        }
      } catch {
        setDeferredSuggestion(null);
      }
    }
    if (!isLoading) {
      checkDeferred();
    }
  }, [todayIntention, isLoading]);

  // Set a new intention for today
  const setIntentionHandler = useCallback(
    async (text: string, projectId?: string, particleGoal?: number, deferredFrom?: string): Promise<DBIntention> => {
      const today = getTodayDateString();

      // If there's already an intention for today, delete it first
      if (todayIntention) {
        await deleteIntention(todayIntention.id);
        dispatchIntentionDeleted(todayIntention.id);
      }

      const newIntention = await saveIntention({
        text,
        date: today,
        projectId,
        particleGoal,
        deferredFrom,
      });

      dispatchIntentionAdded(newIntention);
      setTodayIntention(newIntention);
      return newIntention;
    },
    [todayIntention]
  );

  // Update the status of today's intention
  const updateIntentionStatus = useCallback(
    async (status: IntentionStatus): Promise<DBIntention | null> => {
      if (!todayIntention) return null;

      const updates: Parameters<typeof updateIntention>[1] = { status };

      // Set completedAt timestamp when marking as completed
      if (status === 'completed') {
        updates.completedAt = Date.now();
      }

      const updated = await updateIntention(todayIntention.id, updates);

      if (updated) {
        dispatchIntentionUpdated(updated);
        setTodayIntention(updated);
      }

      return updated;
    },
    [todayIntention]
  );

  // Update the text of today's intention
  const updateIntentionText = useCallback(
    async (text: string): Promise<DBIntention | null> => {
      if (!todayIntention) return null;

      const updated = await updateIntention(todayIntention.id, { text });

      if (updated) {
        dispatchIntentionUpdated(updated);
        setTodayIntention(updated);
      }

      return updated;
    },
    [todayIntention]
  );

  // Update the project of today's intention
  const updateIntentionProject = useCallback(
    async (projectId: string | null): Promise<DBIntention | null> => {
      if (!todayIntention) return null;

      const updated = await updateIntention(todayIntention.id, { projectId });

      if (updated) {
        dispatchIntentionUpdated(updated);
        setTodayIntention(updated);
      }

      return updated;
    },
    [todayIntention]
  );

  // Update the particle goal of today's intention
  const updateIntentionGoal = useCallback(
    async (particleGoal: number | null): Promise<DBIntention | null> => {
      if (!todayIntention) return null;

      const updated = await updateIntention(todayIntention.id, { particleGoal });

      if (updated) {
        dispatchIntentionUpdated(updated);
        setTodayIntention(updated);
      }

      return updated;
    },
    [todayIntention]
  );

  // Clear (delete) today's intention
  const clearIntention = useCallback(async (): Promise<boolean> => {
    if (!todayIntention) return false;

    const intentionId = todayIntention.id;
    const success = await deleteIntention(intentionId);

    if (success) {
      dispatchIntentionDeleted(intentionId);
      setTodayIntention(null);
    }

    return success;
  }, [todayIntention]);

  // Refresh intention from storage
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadIntention();
  }, [loadIntention]);

  return {
    todayIntention,
    isLoading,
    setIntention: setIntentionHandler,
    updateIntentionStatus,
    updateIntentionText,
    updateIntentionProject,
    updateIntentionGoal,
    clearIntention,
    refresh,
    hasIntention: todayIntention !== null,
    particleGoal: todayIntention?.particleGoal ?? null,
    deferredSuggestion,
  };
}
