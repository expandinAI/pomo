// src/lib/sync/__tests__/settings-sync.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  extractSyncedSettings,
  applySyncedSettings,
} from '../settings-sync';
import type { SyncedSettings } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window for event dispatch
Object.defineProperty(global, 'window', {
  value: {
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

describe('settings-sync', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('extractSyncedSettings', () => {
    it('returns default values when localStorage is empty', () => {
      const settings = extractSyncedSettings();

      expect(settings.presetId).toBe('classic');
      expect(settings.workDuration).toBe(25 * 60);
      expect(settings.shortBreakDuration).toBe(5 * 60);
      expect(settings.longBreakDuration).toBe(15 * 60);
      expect(settings.sessionsUntilLongBreak).toBe(4);
      expect(settings.overflowEnabled).toBe(true);
      expect(settings.dailyGoal).toBeNull();
      expect(settings.autoStartEnabled).toBe(false);
      expect(settings.autoStartDelay).toBe(5);
      expect(settings.autoStartMode).toBe('all');
      expect(settings.customPreset).toBeNull();
    });

    it('reads preset from localStorage', () => {
      localStorageMock.setItem('particle_timer_settings', JSON.stringify({ presetId: 'deepWork' }));

      const settings = extractSyncedSettings();

      expect(settings.presetId).toBe('deepWork');
      expect(settings.workDuration).toBe(52 * 60);
      expect(settings.shortBreakDuration).toBe(17 * 60);
    });

    it('reads custom preset durations', () => {
      localStorageMock.setItem('particle_timer_settings', JSON.stringify({ presetId: 'custom' }));
      localStorageMock.setItem(
        'particle_custom_preset',
        JSON.stringify({
          durations: { work: 30 * 60, shortBreak: 10 * 60, longBreak: 20 * 60 },
          sessionsUntilLong: 3,
        })
      );

      const settings = extractSyncedSettings();

      expect(settings.presetId).toBe('custom');
      expect(settings.workDuration).toBe(30 * 60);
      expect(settings.shortBreakDuration).toBe(10 * 60);
      expect(settings.longBreakDuration).toBe(20 * 60);
      expect(settings.sessionsUntilLongBreak).toBe(3);
      expect(settings.customPreset).not.toBeNull();
      expect(settings.customPreset?.workDuration).toBe(30 * 60);
    });

    it('reads overflow setting', () => {
      localStorageMock.setItem('particle_overflow_enabled', 'false');

      const settings = extractSyncedSettings();

      expect(settings.overflowEnabled).toBe(false);
    });

    it('reads daily goal', () => {
      localStorageMock.setItem('particle_daily_goal', '6');

      const settings = extractSyncedSettings();

      expect(settings.dailyGoal).toBe(6);
    });

    it('reads auto-start settings', () => {
      localStorageMock.setItem('particle_auto_start_enabled', 'true');
      localStorageMock.setItem('particle_auto_start_delay', '10');
      localStorageMock.setItem('particle_auto_start_mode', 'breaks-only');

      const settings = extractSyncedSettings();

      expect(settings.autoStartEnabled).toBe(true);
      expect(settings.autoStartDelay).toBe(10);
      expect(settings.autoStartMode).toBe('breaks-only');
    });

    it('handles invalid JSON gracefully', () => {
      localStorageMock.setItem('particle_timer_settings', 'invalid json');

      const settings = extractSyncedSettings();

      // Should return defaults
      expect(settings.presetId).toBe('classic');
    });

    it('handles invalid daily goal values', () => {
      localStorageMock.setItem('particle_daily_goal', '15'); // Out of range

      const settings = extractSyncedSettings();

      expect(settings.dailyGoal).toBeNull();
    });

    it('handles invalid auto-start delay values', () => {
      localStorageMock.setItem('particle_auto_start_delay', '7'); // Not 3, 5, or 10

      const settings = extractSyncedSettings();

      expect(settings.autoStartDelay).toBe(5); // Default
    });
  });

  describe('applySyncedSettings', () => {
    const defaultSettings: SyncedSettings = {
      workDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      sessionsUntilLongBreak: 4,
      presetId: 'classic',
      customPreset: null,
      overflowEnabled: true,
      dailyGoal: null,
      autoStartEnabled: false,
      autoStartDelay: 5,
      autoStartMode: 'all',
    };

    it('applies preset to localStorage', () => {
      const settings: SyncedSettings = {
        ...defaultSettings,
        presetId: 'deepWork',
      };

      const changed = applySyncedSettings(settings);

      expect(changed).toBe(true);
      const stored = JSON.parse(localStorageMock.getItem('particle_timer_settings') || '{}');
      expect(stored.presetId).toBe('deepWork');
    });

    it('applies custom preset to localStorage', () => {
      const settings: SyncedSettings = {
        ...defaultSettings,
        presetId: 'custom',
        customPreset: {
          name: 'Custom',
          workDuration: 45 * 60,
          shortBreakDuration: 15 * 60,
          longBreakDuration: 30 * 60,
          sessionsUntilLongBreak: 2,
        },
      };

      const changed = applySyncedSettings(settings);

      expect(changed).toBe(true);
      const stored = JSON.parse(localStorageMock.getItem('particle_custom_preset') || '{}');
      expect(stored.durations.work).toBe(45 * 60);
      expect(stored.sessionsUntilLong).toBe(2);
    });

    it('applies overflow setting', () => {
      const settings: SyncedSettings = {
        ...defaultSettings,
        overflowEnabled: false,
      };

      applySyncedSettings(settings);

      expect(localStorageMock.getItem('particle_overflow_enabled')).toBe('false');
    });

    it('applies daily goal', () => {
      const settings: SyncedSettings = {
        ...defaultSettings,
        dailyGoal: 8,
      };

      applySyncedSettings(settings);

      expect(localStorageMock.getItem('particle_daily_goal')).toBe('8');
    });

    it('removes daily goal when null', () => {
      // First set a goal
      localStorageMock.setItem('particle_daily_goal', '5');

      const settings: SyncedSettings = {
        ...defaultSettings,
        dailyGoal: null,
      };

      applySyncedSettings(settings);

      expect(localStorageMock.getItem('particle_daily_goal')).toBeNull();
    });

    it('applies auto-start settings', () => {
      const settings: SyncedSettings = {
        ...defaultSettings,
        autoStartEnabled: true,
        autoStartDelay: 3,
        autoStartMode: 'breaks-only',
      };

      applySyncedSettings(settings);

      expect(localStorageMock.getItem('particle_auto_start_enabled')).toBe('true');
      expect(localStorageMock.getItem('particle_auto_start_delay')).toBe('3');
      expect(localStorageMock.getItem('particle_auto_start_mode')).toBe('breaks-only');
    });

    it('returns false when no changes needed', () => {
      // Pre-populate with same values
      localStorageMock.setItem('particle_timer_settings', JSON.stringify({ presetId: 'classic' }));
      localStorageMock.setItem('particle_overflow_enabled', 'true');
      localStorageMock.setItem('particle_auto_start_enabled', 'false');
      localStorageMock.setItem('particle_auto_start_delay', '5');
      localStorageMock.setItem('particle_auto_start_mode', 'all');

      const changed = applySyncedSettings(defaultSettings);

      expect(changed).toBe(false);
    });

    it('returns true when any setting changes', () => {
      // Pre-populate with different overflow
      localStorageMock.setItem('particle_timer_settings', JSON.stringify({ presetId: 'classic' }));
      localStorageMock.setItem('particle_overflow_enabled', 'false'); // Different!
      localStorageMock.setItem('particle_auto_start_enabled', 'false');
      localStorageMock.setItem('particle_auto_start_delay', '5');
      localStorageMock.setItem('particle_auto_start_mode', 'all');

      const changed = applySyncedSettings(defaultSettings);

      expect(changed).toBe(true);
    });
  });

  describe('roundtrip', () => {
    it('extract -> apply -> extract produces same result', () => {
      // Set up initial state
      localStorageMock.setItem('particle_timer_settings', JSON.stringify({ presetId: 'ultradian' }));
      localStorageMock.setItem('particle_overflow_enabled', 'false');
      localStorageMock.setItem('particle_daily_goal', '4');
      localStorageMock.setItem('particle_auto_start_enabled', 'true');
      localStorageMock.setItem('particle_auto_start_delay', '10');
      localStorageMock.setItem('particle_auto_start_mode', 'breaks-only');

      // Extract
      const original = extractSyncedSettings();

      // Clear and apply
      localStorageMock.clear();
      applySyncedSettings(original);

      // Extract again
      const restored = extractSyncedSettings();

      // Compare
      expect(restored.presetId).toBe(original.presetId);
      expect(restored.workDuration).toBe(original.workDuration);
      expect(restored.shortBreakDuration).toBe(original.shortBreakDuration);
      expect(restored.longBreakDuration).toBe(original.longBreakDuration);
      expect(restored.sessionsUntilLongBreak).toBe(original.sessionsUntilLongBreak);
      expect(restored.overflowEnabled).toBe(original.overflowEnabled);
      expect(restored.dailyGoal).toBe(original.dailyGoal);
      expect(restored.autoStartEnabled).toBe(original.autoStartEnabled);
      expect(restored.autoStartDelay).toBe(original.autoStartDelay);
      expect(restored.autoStartMode).toBe(original.autoStartMode);
    });

    it('preserves custom preset through roundtrip', () => {
      localStorageMock.setItem('particle_timer_settings', JSON.stringify({ presetId: 'custom' }));
      localStorageMock.setItem(
        'particle_custom_preset',
        JSON.stringify({
          durations: { work: 35 * 60, shortBreak: 7 * 60, longBreak: 25 * 60 },
          sessionsUntilLong: 5,
        })
      );

      const original = extractSyncedSettings();

      localStorageMock.clear();
      applySyncedSettings(original);

      const restored = extractSyncedSettings();

      expect(restored.customPreset).not.toBeNull();
      expect(restored.customPreset?.workDuration).toBe(35 * 60);
      expect(restored.customPreset?.shortBreakDuration).toBe(7 * 60);
      expect(restored.customPreset?.longBreakDuration).toBe(25 * 60);
      expect(restored.customPreset?.sessionsUntilLongBreak).toBe(5);
    });
  });
});
