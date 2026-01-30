/**
 * Settings Sync Service (POMO-308)
 *
 * Handles synchronization of workflow settings between devices.
 * Device-specific settings (sound, theme, etc.) remain local.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AutoStartMode, AutoStartDelay, Json } from '@/lib/supabase/types';
import type { SyncedSettings, CustomPreset } from './types';
import { PRESETS } from '@/styles/design-tokens';

// localStorage keys (must match TimerSettingsContext)
const STORAGE_KEY = 'particle_timer_settings';
const CUSTOM_PRESET_KEY = 'particle_custom_preset';
const OVERFLOW_KEY = 'particle_overflow_enabled';
const DAILY_GOAL_KEY = 'particle_daily_goal';
const AUTO_START_KEY = 'particle_auto_start_enabled';
const AUTO_START_DELAY_KEY = 'particle_auto_start_delay';
const AUTO_START_MODE_KEY = 'particle_auto_start_mode';

// Default values
const DEFAULT_PRESET_ID = 'classic';
const DEFAULT_OVERFLOW_ENABLED = true;
const DEFAULT_AUTO_START_ENABLED = false;
const DEFAULT_AUTO_START_DELAY: AutoStartDelay = 5;
const DEFAULT_AUTO_START_MODE: AutoStartMode = 'all';

/** Row type for user_settings (with new columns) */
interface UserSettingsRow {
  id: string;
  user_id: string;
  work_duration_seconds: number;
  break_duration_seconds: number;
  long_break_duration_seconds: number;
  sessions_until_long_break: number;
  auto_start_breaks: boolean;
  auto_start_work: boolean;
  sound_enabled: boolean;
  notification_enabled: boolean;
  theme: string;
  keyboard_hints_visible: boolean;
  settings_json: Json;
  overflow_enabled: boolean;
  daily_goal: number | null;
  auto_start_delay: AutoStartDelay;
  auto_start_mode: AutoStartMode;
  created_at: string;
  updated_at: string;
}

/**
 * Push local settings to Supabase
 */
export async function pushSettings(
  supabase: SupabaseClient,
  userId: string,
  settings: SyncedSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    // Build settings_json with custom preset if applicable
    const settingsJson: Record<string, unknown> = {};
    if (settings.presetId === 'custom' && settings.customPreset) {
      settingsJson.customPreset = settings.customPreset;
    }
    // Store presetId in settings_json for sync
    settingsJson.presetId = settings.presetId;

    // Map autoStartEnabled to auto_start_breaks/auto_start_work based on mode
    const autoStartBreaks = settings.autoStartEnabled;
    const autoStartWork = settings.autoStartEnabled && settings.autoStartMode === 'all';

    // Use explicit cast to avoid RLS type issues
    const { error } = await (supabase.from('user_settings') as ReturnType<SupabaseClient['from']>)
      .upsert(
        {
          user_id: userId,
          work_duration_seconds: settings.workDuration,
          break_duration_seconds: settings.shortBreakDuration,
          long_break_duration_seconds: settings.longBreakDuration,
          sessions_until_long_break: settings.sessionsUntilLongBreak,
          auto_start_breaks: autoStartBreaks,
          auto_start_work: autoStartWork,
          overflow_enabled: settings.overflowEnabled,
          daily_goal: settings.dailyGoal,
          auto_start_delay: settings.autoStartDelay,
          auto_start_mode: settings.autoStartMode,
          settings_json: settingsJson,
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('[SettingsSync] Push error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[SettingsSync] Push exception:', err);
    return { success: false, error: message };
  }
}

/**
 * Pull settings from Supabase
 */
export async function pullSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<{ settings: SyncedSettings | null; updatedAt: string | null; error?: string }> {
  try {
    // Use explicit cast to avoid RLS type issues
    const { data: rawData, error } = await (supabase.from('user_settings') as ReturnType<SupabaseClient['from']>)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // No settings yet is not an error
      if (error.code === 'PGRST116') {
        return { settings: null, updatedAt: null };
      }
      console.error('[SettingsSync] Pull error:', error);
      return { settings: null, updatedAt: null, error: error.message };
    }

    if (!rawData) {
      return { settings: null, updatedAt: null };
    }

    // Cast the data
    const data = rawData as UserSettingsRow;

    // Extract preset ID and custom preset from settings_json
    const settingsJson = (data.settings_json || {}) as Record<string, unknown>;
    const presetId = (settingsJson.presetId as string) || DEFAULT_PRESET_ID;
    const customPreset = (settingsJson.customPreset as CustomPreset) || null;

    // Determine autoStartEnabled and mode from the legacy columns
    const autoStartEnabled = data.auto_start_breaks || data.auto_start_work;
    const autoStartMode: 'all' | 'breaks-only' = data.auto_start_work ? 'all' : 'breaks-only';

    const settings: SyncedSettings = {
      workDuration: data.work_duration_seconds,
      shortBreakDuration: data.break_duration_seconds,
      longBreakDuration: data.long_break_duration_seconds,
      sessionsUntilLongBreak: data.sessions_until_long_break,
      presetId,
      customPreset,
      overflowEnabled: data.overflow_enabled,
      dailyGoal: data.daily_goal,
      autoStartEnabled,
      autoStartDelay: data.auto_start_delay,
      autoStartMode: data.auto_start_mode || autoStartMode,
    };

    return { settings, updatedAt: data.updated_at };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[SettingsSync] Pull exception:', err);
    return { settings: null, updatedAt: null, error: message };
  }
}

/**
 * Extract synced settings from localStorage
 */
export function extractSyncedSettings(): SyncedSettings {
  if (typeof window === 'undefined') {
    // Return defaults for SSR
    return {
      workDuration: PRESETS.classic.durations.work,
      shortBreakDuration: PRESETS.classic.durations.shortBreak,
      longBreakDuration: PRESETS.classic.durations.longBreak,
      sessionsUntilLongBreak: PRESETS.classic.sessionsUntilLong,
      presetId: DEFAULT_PRESET_ID,
      customPreset: null,
      overflowEnabled: DEFAULT_OVERFLOW_ENABLED,
      dailyGoal: null,
      autoStartEnabled: DEFAULT_AUTO_START_ENABLED,
      autoStartDelay: DEFAULT_AUTO_START_DELAY,
      autoStartMode: DEFAULT_AUTO_START_MODE,
    };
  }

  // Read preset settings
  let presetId = DEFAULT_PRESET_ID;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.presetId === 'string' && parsed.presetId in PRESETS) {
        presetId = parsed.presetId;
      }
    }
  } catch {
    // Ignore
  }

  // Read custom preset
  let customPreset: CustomPreset | null = null;
  try {
    const stored = localStorage.getItem(CUSTOM_PRESET_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        typeof parsed.durations?.work === 'number' &&
        typeof parsed.durations?.shortBreak === 'number' &&
        typeof parsed.durations?.longBreak === 'number' &&
        typeof parsed.sessionsUntilLong === 'number'
      ) {
        customPreset = {
          name: 'Custom',
          workDuration: parsed.durations.work,
          shortBreakDuration: parsed.durations.shortBreak,
          longBreakDuration: parsed.durations.longBreak,
          sessionsUntilLongBreak: parsed.sessionsUntilLong,
        };
      }
    }
  } catch {
    // Ignore
  }

  // Get active preset durations
  let workDuration: number;
  let shortBreakDuration: number;
  let longBreakDuration: number;
  let sessionsUntilLongBreak: number;

  if (presetId === 'custom' && customPreset) {
    workDuration = customPreset.workDuration;
    shortBreakDuration = customPreset.shortBreakDuration;
    longBreakDuration = customPreset.longBreakDuration;
    sessionsUntilLongBreak = customPreset.sessionsUntilLongBreak;
  } else {
    const preset = PRESETS[presetId] || PRESETS.classic;
    workDuration = preset.durations.work;
    shortBreakDuration = preset.durations.shortBreak;
    longBreakDuration = preset.durations.longBreak;
    sessionsUntilLongBreak = preset.sessionsUntilLong;
  }

  // Read overflow
  let overflowEnabled = DEFAULT_OVERFLOW_ENABLED;
  try {
    const stored = localStorage.getItem(OVERFLOW_KEY);
    if (stored !== null) {
      overflowEnabled = JSON.parse(stored) === true;
    }
  } catch {
    // Ignore
  }

  // Read daily goal
  let dailyGoal: number | null = null;
  try {
    const stored = localStorage.getItem(DAILY_GOAL_KEY);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 9) {
        dailyGoal = parsed;
      }
    }
  } catch {
    // Ignore
  }

  // Read auto-start settings
  let autoStartEnabled = DEFAULT_AUTO_START_ENABLED;
  try {
    const stored = localStorage.getItem(AUTO_START_KEY);
    if (stored !== null) {
      autoStartEnabled = JSON.parse(stored) === true;
    }
  } catch {
    // Ignore
  }

  let autoStartDelay: 3 | 5 | 10 = DEFAULT_AUTO_START_DELAY;
  try {
    const stored = localStorage.getItem(AUTO_START_DELAY_KEY);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (parsed === 3 || parsed === 5 || parsed === 10) {
        autoStartDelay = parsed;
      }
    }
  } catch {
    // Ignore
  }

  let autoStartMode: 'all' | 'breaks-only' = DEFAULT_AUTO_START_MODE;
  try {
    const stored = localStorage.getItem(AUTO_START_MODE_KEY);
    if (stored === 'all' || stored === 'breaks-only') {
      autoStartMode = stored;
    }
  } catch {
    // Ignore
  }

  return {
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsUntilLongBreak,
    presetId,
    customPreset,
    overflowEnabled,
    dailyGoal,
    autoStartEnabled,
    autoStartDelay,
    autoStartMode,
  };
}

/**
 * Apply synced settings to localStorage
 * Returns true if any settings were changed
 */
export function applySyncedSettings(settings: SyncedSettings): boolean {
  if (typeof window === 'undefined') return false;

  let changed = false;

  // Apply preset
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    const newValue = JSON.stringify({ presetId: settings.presetId });
    if (current !== newValue) {
      localStorage.setItem(STORAGE_KEY, newValue);
      changed = true;
    }
  } catch {
    // Ignore
  }

  // Apply custom preset
  if (settings.customPreset) {
    try {
      const newValue = JSON.stringify({
        durations: {
          work: settings.customPreset.workDuration,
          shortBreak: settings.customPreset.shortBreakDuration,
          longBreak: settings.customPreset.longBreakDuration,
        },
        sessionsUntilLong: settings.customPreset.sessionsUntilLongBreak,
      });
      const current = localStorage.getItem(CUSTOM_PRESET_KEY);
      if (current !== newValue) {
        localStorage.setItem(CUSTOM_PRESET_KEY, newValue);
        changed = true;
      }
    } catch {
      // Ignore
    }
  }

  // Apply overflow
  try {
    const current = localStorage.getItem(OVERFLOW_KEY);
    const newValue = JSON.stringify(settings.overflowEnabled);
    if (current !== newValue) {
      localStorage.setItem(OVERFLOW_KEY, newValue);
      changed = true;
    }
  } catch {
    // Ignore
  }

  // Apply daily goal
  try {
    const current = localStorage.getItem(DAILY_GOAL_KEY);
    const newValue = settings.dailyGoal !== null ? settings.dailyGoal.toString() : null;
    if (current !== newValue) {
      if (newValue === null) {
        localStorage.removeItem(DAILY_GOAL_KEY);
      } else {
        localStorage.setItem(DAILY_GOAL_KEY, newValue);
      }
      changed = true;
    }
  } catch {
    // Ignore
  }

  // Apply auto-start settings
  try {
    const current = localStorage.getItem(AUTO_START_KEY);
    const newValue = JSON.stringify(settings.autoStartEnabled);
    if (current !== newValue) {
      localStorage.setItem(AUTO_START_KEY, newValue);
      changed = true;
    }
  } catch {
    // Ignore
  }

  try {
    const current = localStorage.getItem(AUTO_START_DELAY_KEY);
    const newValue = settings.autoStartDelay.toString();
    if (current !== newValue) {
      localStorage.setItem(AUTO_START_DELAY_KEY, newValue);
      changed = true;
    }
  } catch {
    // Ignore
  }

  try {
    const current = localStorage.getItem(AUTO_START_MODE_KEY);
    const newValue = settings.autoStartMode;
    if (current !== newValue) {
      localStorage.setItem(AUTO_START_MODE_KEY, newValue);
      changed = true;
    }
  } catch {
    // Ignore
  }

  return changed;
}

/**
 * Dispatch a custom event to notify TimerSettingsContext of changes
 */
export function dispatchSettingsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('particle:settings-synced'));
}
