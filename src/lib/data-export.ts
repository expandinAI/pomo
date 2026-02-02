// src/lib/data-export.ts
//
// GDPR-compliant data export for Particle
// Collects all user data from IndexedDB and localStorage, exports as JSON

import { getDB } from './db/database';
import { getStorageMode, type StorageMode } from './db/feature-detection';
import type { DBSession, DBProject, DBRecentTask } from './db/types';
import { loadMilestones, type EarnedMilestone } from './milestones/milestone-storage';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface ParticleExportData {
  exportVersion: '1.0';
  exportedAt: string;
  device: {
    storageMode: StorageMode;
    userAgent: string;
  };
  data: {
    sessions: DBSession[];
    projects: DBProject[];
    recentTasks: DBRecentTask[];
    milestones: EarnedMilestone[];
    settings: {
      timer: Record<string, unknown>;
      coach: Record<string, unknown>;
      sound: Record<string, unknown>;
      visual: Record<string, unknown>;
      ui: Record<string, unknown>;
    };
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// localStorage Keys to Export
// ═══════════════════════════════════════════════════════════════════════════

const TIMER_SETTINGS_KEYS = [
  'particle_timer_settings',
  'particle_custom_preset',
  'particle_overflow_enabled',
  'particle_daily_goal',
  'particle_auto_start_enabled',
  'particle_auto_start_delay',
  'particle_auto_start_mode',
];

const COACH_SETTINGS_KEYS = [
  'particle:coach-insight-frequency',
  'particle:coach-weekly-summary',
  'particle:coach-display-duration',
];

const SOUND_SETTINGS_KEYS = [
  'particle_sound_settings',
  'particle_sound_volume',
  'particle_sound_muted',
  'particle_completion_sound_enabled',
  'particle_ui_sounds_enabled',
  'particle_transition_sounds_enabled',
  'particle_transition_intensity',
  'particle_ambient_type',
  'particle_ambient_volume',
];

const VISUAL_SETTINGS_KEYS = [
  'particle_visual_mode',
  'particle_style',
  'particle_parallax',
  'particle_pace',
  'particle_ambient_effects_enabled',
];

const UI_SETTINGS_KEYS = [
  'particle:keyboard-hints-visible',
  'particle:daily-intention-enabled',
  'particle:rhythm-onboarding-completed',
  'particle:intro-seen',
  'particle:contextual-hints',
  'particle-week-start',
  'particle_haptics_enabled',
  'theme',
];

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Collect settings from localStorage by keys
 */
function collectLocalStorageSettings(keys: string[]): Record<string, unknown> {
  const settings: Record<string, unknown> = {};

  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      // Try to parse as JSON, fallback to string
      try {
        settings[key] = JSON.parse(value);
      } catch {
        settings[key] = value;
      }
    }
  }

  return settings;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Export Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Collect all exportable data from IndexedDB and localStorage
 */
export async function collectExportData(): Promise<ParticleExportData> {
  const db = getDB();

  // Collect from IndexedDB
  // Include all sessions (even deleted ones for complete export)
  const sessions = await db.sessions.toArray();
  const projects = await db.projects.toArray();
  const recentTasks = await db.recentTasks.toArray();

  // Collect from localStorage
  const milestones = loadMilestones();

  // Collect settings by category
  const timerSettings = collectLocalStorageSettings(TIMER_SETTINGS_KEYS);
  const coachSettings = collectLocalStorageSettings(COACH_SETTINGS_KEYS);
  const soundSettings = collectLocalStorageSettings(SOUND_SETTINGS_KEYS);
  const visualSettings = collectLocalStorageSettings(VISUAL_SETTINGS_KEYS);
  const uiSettings = collectLocalStorageSettings(UI_SETTINGS_KEYS);

  return {
    exportVersion: '1.0',
    exportedAt: new Date().toISOString(),
    device: {
      storageMode: getStorageMode(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    },
    data: {
      sessions,
      projects,
      recentTasks,
      milestones,
      settings: {
        timer: timerSettings,
        coach: coachSettings,
        sound: soundSettings,
        visual: visualSettings,
        ui: uiSettings,
      },
    },
  };
}

/**
 * Generate a timestamped filename for the export
 */
export function generateExportFilename(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `particle-data-${dateStr}.json`;
}

/**
 * Trigger a download of the export data as JSON
 */
export function downloadExportData(data: ParticleExportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = generateExportFilename();

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Full export flow: collect data and download
 */
export async function exportAllData(): Promise<void> {
  const data = await collectExportData();
  downloadExportData(data);
}
