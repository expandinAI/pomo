'use client';

import { useState, useEffect, useCallback } from 'react';

export type SoundOption = 'default' | 'soft' | 'bell' | 'woodblock' | 'bowl' | 'minimal';

export interface SoundPreset {
  id: SoundOption;
  name: string;
  description: string;
}

export const SOUND_PRESETS: SoundPreset[] = [
  { id: 'default', name: 'Default', description: 'Warm two-tone chime' },
  { id: 'soft', name: 'Soft', description: 'Gentle gong' },
  { id: 'bell', name: 'Bell', description: 'Clear bell tone' },
  { id: 'woodblock', name: 'Woodblock', description: 'Crisp percussion' },
  { id: 'bowl', name: 'Bowl', description: 'Singing bowl' },
  { id: 'minimal', name: 'Minimal', description: 'Short beep' },
];

const STORAGE_KEY = 'particle_sound_settings';
const VOLUME_KEY = 'particle_sound_volume';
const MUTED_KEY = 'particle_sound_muted';

// Old keys for migration
const OLD_STORAGE_KEY = 'pomo_sound_settings';
const OLD_VOLUME_KEY = 'pomo_sound_volume';
const OLD_MUTED_KEY = 'pomo_sound_muted';

const DEFAULT_SOUND: SoundOption = 'default';
const DEFAULT_VOLUME = 0.75;

interface SoundSettings {
  sound: SoundOption;
  volume: number;
  muted: boolean;
}

function loadSettings(): SoundSettings {
  if (typeof window === 'undefined') {
    return { sound: DEFAULT_SOUND, volume: DEFAULT_VOLUME, muted: false };
  }

  try {
    // Migrate from old keys if they exist
    const migrations = [
      [OLD_STORAGE_KEY, STORAGE_KEY],
      [OLD_VOLUME_KEY, VOLUME_KEY],
      [OLD_MUTED_KEY, MUTED_KEY],
    ];
    for (const [oldKey, newKey] of migrations) {
      const oldValue = localStorage.getItem(oldKey);
      if (oldValue !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldValue);
        localStorage.removeItem(oldKey);
      }
    }

    const storedSound = localStorage.getItem(STORAGE_KEY);
    const storedVolume = localStorage.getItem(VOLUME_KEY);
    const storedMuted = localStorage.getItem(MUTED_KEY);

    return {
      sound: storedSound && SOUND_PRESETS.some((p) => p.id === storedSound)
        ? (storedSound as SoundOption)
        : DEFAULT_SOUND,
      volume: storedVolume !== null ? parseFloat(storedVolume) : DEFAULT_VOLUME,
      muted: storedMuted === 'true',
    };
  } catch {
    return { sound: DEFAULT_SOUND, volume: DEFAULT_VOLUME, muted: false };
  }
}

function saveSettings(settings: Partial<SoundSettings>): void {
  if (typeof window === 'undefined') return;

  if (settings.sound !== undefined) {
    localStorage.setItem(STORAGE_KEY, settings.sound);
  }
  if (settings.volume !== undefined) {
    localStorage.setItem(VOLUME_KEY, String(settings.volume));
  }
  if (settings.muted !== undefined) {
    localStorage.setItem(MUTED_KEY, String(settings.muted));
  }
}

export function useSoundSettings() {
  const [selectedSound, setSelectedSound] = useState<SoundOption>(DEFAULT_SOUND);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [muted, setMutedState] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const settings = loadSettings();
    setSelectedSound(settings.sound);
    setVolumeState(settings.volume);
    setMutedState(settings.muted);
    setIsLoaded(true);
  }, []);

  // Change sound
  const setSound = useCallback((sound: SoundOption) => {
    setSelectedSound(sound);
    saveSettings({ sound });
  }, []);

  // Change volume (0-1)
  const setVolume = useCallback((vol: number) => {
    const clampedVolume = Math.max(0, Math.min(1, vol));
    setVolumeState(clampedVolume);
    saveSettings({ volume: clampedVolume });
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      saveSettings({ muted: next });
      return next;
    });
  }, []);

  // Set mute directly
  const setMuted = useCallback((isMuted: boolean) => {
    setMutedState(isMuted);
    saveSettings({ muted: isMuted });
  }, []);

  return {
    selectedSound,
    setSound,
    volume,
    setVolume,
    muted,
    toggleMute,
    setMuted,
    isLoaded,
    presets: SOUND_PRESETS,
  };
}
