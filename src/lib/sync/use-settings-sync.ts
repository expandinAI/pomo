'use client';

/**
 * Settings Sync Hook (POMO-308)
 *
 * Synchronizes workflow settings between devices.
 * - Pulls settings on mount (after auth)
 * - Pushes settings on localStorage changes (debounced)
 * - Uses Last-Write-Wins for conflict resolution
 */

import { useEffect, useRef, useCallback } from 'react';
import { useParticleAuth, useSupabaseToken } from '@/lib/auth';
import { createSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  pushSettings,
  pullSettings,
  extractSyncedSettings,
  applySyncedSettings,
  dispatchSettingsChanged,
} from './settings-sync';
import { LAST_SETTINGS_SYNC_KEY } from './types';

// Debounce delay for push operations
const PUSH_DEBOUNCE_MS = 2000;

// localStorage keys to watch for changes
const WATCHED_KEYS = [
  'particle_timer_settings',
  'particle_custom_preset',
  'particle_overflow_enabled',
  'particle_daily_goal',
  'particle_auto_start_enabled',
  'particle_auto_start_delay',
  'particle_auto_start_mode',
];

/**
 * Hook to sync workflow settings between devices
 */
export function useSettingsSync(): void {
  const auth = useParticleAuth();
  const getToken = useSupabaseToken();
  const pushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef<string | null>(null);
  const isPullingRef = useRef(false);
  const hasInitialPullRef = useRef(false);

  // Get clerk user ID (only available when authenticated)
  const clerkUserId = auth.status === 'authenticated' ? auth.userId : null;

  // Get Supabase user ID
  const getUserId = useCallback(async (): Promise<string | null> => {
    if (userIdRef.current) return userIdRef.current;
    if (!clerkUserId) return null;

    const token = await getToken();
    if (!token) return null;

    const supabase = createSupabaseClient(token);
    if (!supabase) return null;

    const { data: rawData, error } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (error || !rawData) return null;

    // Cast due to RLS
    const data = rawData as { id: string };
    userIdRef.current = data.id;
    return data.id;
  }, [clerkUserId, getToken]);

  // Pull settings from server
  const doPull = useCallback(async (): Promise<boolean> => {
    if (isPullingRef.current) return false;
    isPullingRef.current = true;

    try {
      const token = await getToken();
      if (!token) return false;

      const supabase = createSupabaseClient(token);
      if (!supabase) return false;

      const userId = await getUserId();
      if (!userId) return false;

      const { settings, updatedAt, error } = await pullSettings(supabase, userId);

      if (error) {
        console.error('[useSettingsSync] Pull failed:', error);
        return false;
      }

      if (!settings) {
        // No remote settings yet - push local settings
        console.log('[useSettingsSync] No remote settings, pushing local');
        const localSettings = extractSyncedSettings();
        await pushSettings(supabase, userId, localSettings);
        localStorage.setItem(LAST_SETTINGS_SYNC_KEY, new Date().toISOString());
        return true;
      }

      // Check if remote is newer (LWW)
      const lastSyncStr = localStorage.getItem(LAST_SETTINGS_SYNC_KEY);
      const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;
      const remoteUpdated = updatedAt ? new Date(updatedAt) : null;

      if (remoteUpdated && (!lastSync || remoteUpdated > lastSync)) {
        // Remote is newer - apply to local
        const changed = applySyncedSettings(settings);
        if (changed) {
          console.log('[useSettingsSync] Applied remote settings');
          dispatchSettingsChanged();
        }
      }

      localStorage.setItem(LAST_SETTINGS_SYNC_KEY, new Date().toISOString());
      return true;
    } catch (err) {
      console.error('[useSettingsSync] Pull exception:', err);
      return false;
    } finally {
      isPullingRef.current = false;
    }
  }, [getToken, getUserId]);

  // Push settings to server (debounced)
  const doPush = useCallback(async (): Promise<void> => {
    // Don't push while pulling to avoid race conditions
    if (isPullingRef.current) return;

    try {
      const token = await getToken();
      if (!token) return;

      const supabase = createSupabaseClient(token);
      if (!supabase) return;

      const userId = await getUserId();
      if (!userId) return;

      const settings = extractSyncedSettings();
      const { success, error } = await pushSettings(supabase, userId, settings);

      if (success) {
        localStorage.setItem(LAST_SETTINGS_SYNC_KEY, new Date().toISOString());
        console.log('[useSettingsSync] Pushed settings');
      } else {
        console.error('[useSettingsSync] Push failed:', error);
      }
    } catch (err) {
      console.error('[useSettingsSync] Push exception:', err);
    }
  }, [getToken, getUserId]);

  // Schedule a debounced push
  const schedulePush = useCallback(() => {
    if (pushTimeoutRef.current) {
      clearTimeout(pushTimeoutRef.current);
    }
    pushTimeoutRef.current = setTimeout(() => {
      doPush();
      pushTimeoutRef.current = null;
    }, PUSH_DEBOUNCE_MS);
  }, [doPush]);

  // Initial pull on mount
  useEffect(() => {
    if (auth.status !== 'authenticated' || !isSupabaseConfigured) {
      hasInitialPullRef.current = false;
      userIdRef.current = null;
      return;
    }

    if (hasInitialPullRef.current) return;
    hasInitialPullRef.current = true;

    // Small delay to ensure auth is fully ready
    const timeout = setTimeout(() => {
      doPull();
    }, 500);

    return () => clearTimeout(timeout);
  }, [auth.status, doPull]);

  // Listen for localStorage changes
  useEffect(() => {
    if (auth.status !== 'authenticated' || !isSupabaseConfigured) return;

    function handleStorageChange(e: StorageEvent) {
      // Only react to our watched keys
      if (!e.key || !WATCHED_KEYS.includes(e.key)) return;

      // Don't push if the change came from our own sync
      if (isPullingRef.current) return;

      console.log('[useSettingsSync] Local change detected:', e.key);
      schedulePush();
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (pushTimeoutRef.current) {
        clearTimeout(pushTimeoutRef.current);
      }
    };
  }, [auth.status, schedulePush]);

  // Also listen for direct localStorage changes in the same tab
  // (storage event only fires for changes from other tabs)
  useEffect(() => {
    if (auth.status !== 'authenticated' || !isSupabaseConfigured) return;

    // Store original setItem
    const originalSetItem = localStorage.setItem.bind(localStorage);

    // Override setItem to detect changes
    localStorage.setItem = function (key: string, value: string) {
      originalSetItem(key, value);

      // Only react to our watched keys and not during pull
      if (WATCHED_KEYS.includes(key) && !isPullingRef.current) {
        console.log('[useSettingsSync] Same-tab change detected:', key);
        schedulePush();
      }
    };

    return () => {
      // Restore original
      localStorage.setItem = originalSetItem;
    };
  }, [auth.status, schedulePush]);
}
