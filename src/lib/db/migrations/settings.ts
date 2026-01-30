// src/lib/db/migrations/settings.ts

import { getDB } from '../database';

const MIGRATION_KEY = 'particle_migration_settings_v1';

/**
 * All known Settings keys with their type information for parsing.
 *
 * Types:
 * - string: Stored as-is
 * - number: Parsed with parseFloat
 * - boolean: Parsed as 'true'/'false' string
 * - json: Parsed with JSON.parse
 */
const SETTINGS_KEYS: Record<string, { type: 'string' | 'number' | 'boolean' | 'json' }> = {
  // Timer Settings
  'pomo_timer_settings': { type: 'json' },         // Legacy key, migrate to particle_timer_settings
  'particle_timer_settings': { type: 'json' },

  // Sound Settings
  'particle_sound_settings': { type: 'string' },
  'particle_sound_volume': { type: 'number' },
  'particle_sound_muted': { type: 'boolean' },
  'particle_completion_sound_enabled': { type: 'boolean' },
  'particle_ui_sounds_enabled': { type: 'boolean' },
  'particle_transition_sounds_enabled': { type: 'boolean' },
  'particle_transition_intensity': { type: 'string' },

  // Ambient Sound Settings (both legacy pomo_ and new particle_)
  'pomo_ambient_type': { type: 'string' },
  'pomo_ambient_volume': { type: 'number' },
  'particle_ambient_type': { type: 'string' },
  'particle_ambient_volume': { type: 'number' },
  'particle_ambient_effects_enabled': { type: 'boolean' },

  // Visual Settings
  'particle_style': { type: 'string' },
  'particle_parallax': { type: 'boolean' },
  'particle_pace': { type: 'string' },
  'particle_visual_mode': { type: 'string' },

  // Haptics
  'particle_haptics_enabled': { type: 'boolean' },

  // UI Settings
  'particle:keyboard-hints-visible': { type: 'boolean' },
  'particle:contextual-hints': { type: 'json' },
  'particle:daily-intention-enabled': { type: 'boolean' },
  'particle:rhythm-onboarding-completed': { type: 'boolean' },
  'particle:intro-seen': { type: 'boolean' },
  'particle-week-start': { type: 'string' },

  // Theme
  'theme': { type: 'string' },

  // Milestones
  'particle-milestones': { type: 'json' },
};

/**
 * Legacy key mappings: old key → new key
 * Used when consolidating legacy keys during migration
 */
const LEGACY_MAPPINGS: Record<string, string> = {
  'pomo_timer_settings': 'particle_timer_settings',
  'pomo_ambient_type': 'particle_ambient_type',
  'pomo_ambient_volume': 'particle_ambient_volume',
};

export interface SettingsMigrationResult {
  name: string;
  skipped: boolean;
  migrated: number;
  errors: string[];
  duration: number;
}

/**
 * Check if settings migration has already been completed
 */
export function isSettingsMigrationCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(MIGRATION_KEY) === 'true';
}

/**
 * Get count of settings pending migration.
 * Returns 1 if migration pending (counted as a single block), 0 if completed.
 */
export function countPendingSettings(): number {
  if (typeof window === 'undefined') return 0;
  if (isSettingsMigrationCompleted()) return 0;

  // Settings are migrated as a single block, not individual items
  // Return 1 if there's anything to migrate, 0 otherwise
  const hasAnySettings = Object.keys(SETTINGS_KEYS).some(
    (key) => localStorage.getItem(key) !== null
  );

  return hasAnySettings ? 1 : 0;
}

/**
 * Parse a value from localStorage based on its type
 */
function parseValue(raw: string, type: 'string' | 'number' | 'boolean' | 'json'): unknown {
  switch (type) {
    case 'string':
      return raw;
    case 'number':
      return parseFloat(raw);
    case 'boolean':
      return raw === 'true';
    case 'json':
      return JSON.parse(raw);
  }
}

/**
 * Load all settings from localStorage
 */
function loadAllSettings(): Record<string, unknown> {
  if (typeof window === 'undefined') return {};

  const settings: Record<string, unknown> = {};

  for (const [key, { type }] of Object.entries(SETTINGS_KEYS)) {
    const raw = localStorage.getItem(key);
    if (raw === null) continue;

    try {
      const value = parseValue(raw, type);

      // Handle legacy key mapping: store under new key
      const targetKey = LEGACY_MAPPINGS[key] || key;

      // Only overwrite if target key doesn't already have a value
      // (prefer new keys over legacy keys)
      if (!(targetKey in settings)) {
        settings[targetKey] = value;
      }
    } catch {
      // Skip invalid values
    }
  }

  return settings;
}

/**
 * Migrate settings from localStorage to IndexedDB
 *
 * All settings are stored as a single document with key 'user-settings'.
 * This allows atomic reads/writes and simplifies future sync.
 *
 * Idempotent: Safe to run multiple times
 */
export async function migrateSettingsV1(): Promise<SettingsMigrationResult> {
  const startTime = performance.now();
  const result: SettingsMigrationResult = {
    name: 'settings_v1',
    skipped: false,
    migrated: 0,
    errors: [],
    duration: 0,
  };

  // Check if already migrated
  if (isSettingsMigrationCompleted()) {
    result.skipped = true;
    result.duration = performance.now() - startTime;
    return result;
  }

  // Load all settings from localStorage
  const settings = loadAllSettings();
  const settingsCount = Object.keys(settings).length;

  if (settingsCount === 0) {
    // No settings to migrate, mark as complete
    localStorage.setItem(MIGRATION_KEY, 'true');
    result.duration = performance.now() - startTime;
    return result;
  }

  try {
    const db = getDB();

    // Check if settings document already exists
    const existing = await db.settings.get('user-settings');

    if (existing) {
      // Merge with existing settings (don't overwrite)
      const mergedValue = { ...settings, ...existing.value };
      await db.settings.put({
        key: 'user-settings',
        value: mergedValue,
        localUpdatedAt: new Date().toISOString(),
      });
    } else {
      // Create new settings document
      await db.settings.add({
        key: 'user-settings',
        value: settings,
        localUpdatedAt: new Date().toISOString(),
      });
    }

    result.migrated = settingsCount;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Settings migration failed: ${message}`);
  }

  // Mark migration as complete (even if errors occurred)
  localStorage.setItem(MIGRATION_KEY, 'true');

  result.duration = performance.now() - startTime;
  return result;
}

/**
 * Reset migration state (for testing)
 */
export function resetSettingsMigration(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MIGRATION_KEY);
}
