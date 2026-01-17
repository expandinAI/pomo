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

const STORAGE_KEY = 'pomo_sound_settings';
const DEFAULT_SOUND: SoundOption = 'default';

function loadSoundSetting(): SoundOption {
  if (typeof window === 'undefined') return DEFAULT_SOUND;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SOUND_PRESETS.some((p) => p.id === stored)) {
      return stored as SoundOption;
    }
  } catch {
    // Ignore errors
  }
  return DEFAULT_SOUND;
}

function saveSoundSetting(sound: SoundOption): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, sound);
}

export function useSoundSettings() {
  const [selectedSound, setSelectedSound] = useState<SoundOption>(DEFAULT_SOUND);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load setting on mount
  useEffect(() => {
    setSelectedSound(loadSoundSetting());
    setIsLoaded(true);
  }, []);

  // Change sound
  const setSound = useCallback((sound: SoundOption) => {
    setSelectedSound(sound);
    saveSoundSetting(sound);
  }, []);

  return {
    selectedSound,
    setSound,
    isLoaded,
    presets: SOUND_PRESETS,
  };
}
