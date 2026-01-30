'use client';

/**
 * Settings Sync Actions Hook (POMO-308)
 *
 * Provides manual pullNow() and pushNow() functions for settings sync.
 * Use this in components that need explicit control over sync timing.
 *
 * Example: Pull when Settings modal opens, Push when it closes.
 */

import { useCallback, useRef } from 'react';
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

interface SettingsSyncActions {
  /** Pull settings from server and apply to localStorage */
  pullNow: () => Promise<boolean>;
  /** Push current localStorage settings to server */
  pushNow: () => Promise<boolean>;
  /** Whether sync is available (authenticated + configured) */
  isAvailable: boolean;
}

/**
 * Hook providing manual settings sync actions
 */
export function useSettingsSyncActions(): SettingsSyncActions {
  const auth = useParticleAuth();
  const getToken = useSupabaseToken();
  const userIdRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);

  const isAuthenticated = auth.status === 'authenticated';
  const clerkUserId = isAuthenticated ? auth.userId : null;
  const isAvailable = isAuthenticated && isSupabaseConfigured;

  // Get Supabase user ID (cached)
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

    const data = rawData as { id: string };
    userIdRef.current = data.id;
    return data.id;
  }, [clerkUserId, getToken]);

  // Pull settings from server
  const pullNow = useCallback(async (): Promise<boolean> => {
    if (!isAvailable || isSyncingRef.current) return false;
    isSyncingRef.current = true;

    try {
      const token = await getToken();
      if (!token) return false;

      const supabase = createSupabaseClient(token);
      if (!supabase) return false;

      const userId = await getUserId();
      if (!userId) return false;

      const { settings, updatedAt, error } = await pullSettings(supabase, userId);

      if (error) {
        console.error('[SettingsSyncActions] Pull failed:', error);
        return false;
      }

      if (!settings) {
        // No remote settings yet
        console.log('[SettingsSyncActions] No remote settings found');
        return true;
      }

      // Apply remote settings to local
      const changed = applySyncedSettings(settings);
      if (changed) {
        console.log('[SettingsSyncActions] Applied remote settings');
        dispatchSettingsChanged();
      } else {
        console.log('[SettingsSyncActions] Settings already in sync');
      }

      localStorage.setItem(LAST_SETTINGS_SYNC_KEY, new Date().toISOString());
      return true;
    } catch (err) {
      console.error('[SettingsSyncActions] Pull exception:', err);
      return false;
    } finally {
      isSyncingRef.current = false;
    }
  }, [isAvailable, getToken, getUserId]);

  // Push settings to server
  const pushNow = useCallback(async (): Promise<boolean> => {
    if (!isAvailable || isSyncingRef.current) return false;
    isSyncingRef.current = true;

    try {
      const token = await getToken();
      if (!token) return false;

      const supabase = createSupabaseClient(token);
      if (!supabase) return false;

      const userId = await getUserId();
      if (!userId) return false;

      const settings = extractSyncedSettings();
      const { success, error } = await pushSettings(supabase, userId, settings);

      if (success) {
        localStorage.setItem(LAST_SETTINGS_SYNC_KEY, new Date().toISOString());
        console.log('[SettingsSyncActions] Pushed settings');
        return true;
      } else {
        console.error('[SettingsSyncActions] Push failed:', error);
        return false;
      }
    } catch (err) {
      console.error('[SettingsSyncActions] Push exception:', err);
      return false;
    } finally {
      isSyncingRef.current = false;
    }
  }, [isAvailable, getToken, getUserId]);

  return {
    pullNow,
    pushNow,
    isAvailable,
  };
}
