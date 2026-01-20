'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo, type ReactNode } from 'react';
import {
  type AmbientType,
  type AmbientSound,
  AMBIENT_PRESETS,
  createAmbientSound,
} from '@/lib/ambientGenerators';

const STORAGE_KEY_TYPE = 'particle_ambient_type';
const STORAGE_KEY_VOLUME = 'particle_ambient_volume';

// Old keys for migration
const OLD_STORAGE_KEY_TYPE = 'pomo_ambient_type';
const OLD_STORAGE_KEY_VOLUME = 'pomo_ambient_volume';

const DEFAULT_TYPE: AmbientType = 'silence';
const DEFAULT_VOLUME = 0.5;

const FADE_IN_DURATION = 0.3;
const FADE_OUT_DURATION = 0.5;

interface AmbientState {
  type: AmbientType;
  volume: number;
  isPlaying: boolean;
}

function loadSettings(): { type: AmbientType; volume: number } {
  if (typeof window === 'undefined') {
    return { type: DEFAULT_TYPE, volume: DEFAULT_VOLUME };
  }

  try {
    // Migrate from old keys if they exist
    const migrations = [
      [OLD_STORAGE_KEY_TYPE, STORAGE_KEY_TYPE],
      [OLD_STORAGE_KEY_VOLUME, STORAGE_KEY_VOLUME],
    ];
    for (const [oldKey, newKey] of migrations) {
      const oldValue = localStorage.getItem(oldKey);
      if (oldValue !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldValue);
        localStorage.removeItem(oldKey);
      }
    }

    const storedType = localStorage.getItem(STORAGE_KEY_TYPE);
    const storedVolume = localStorage.getItem(STORAGE_KEY_VOLUME);

    return {
      type:
        storedType && AMBIENT_PRESETS.some((p) => p.id === storedType)
          ? (storedType as AmbientType)
          : DEFAULT_TYPE,
      volume: storedVolume !== null ? parseFloat(storedVolume) : DEFAULT_VOLUME,
    };
  } catch {
    return { type: DEFAULT_TYPE, volume: DEFAULT_VOLUME };
  }
}

interface AmbientSoundContextValue {
  type: AmbientType;
  volume: number;
  isPlaying: boolean;
  isLoaded: boolean;
  play: () => void;
  stop: () => void;
  setType: (type: AmbientType) => void;
  setVolume: (volume: number) => void;
  preview: (type: AmbientType) => void;
  presets: typeof AMBIENT_PRESETS;
}

const AmbientSoundContext = createContext<AmbientSoundContextValue | null>(null);

interface AmbientSoundProviderProps {
  children: ReactNode;
}

export function AmbientSoundProvider({ children }: AmbientSoundProviderProps) {
  const [state, setState] = useState<AmbientState>({
    type: DEFAULT_TYPE,
    volume: DEFAULT_VOLUME,
    isPlaying: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientSoundRef = useRef<AmbientSound | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const isFadingRef = useRef(false);
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track ALL active sounds (main + previews) for central kill
  const activeSoundsRef = useRef<Set<{ sound: AmbientSound; gain: GainNode }>>(new Set());

  // Load settings on mount
  useEffect(() => {
    const settings = loadSettings();
    setState((prev) => ({
      ...prev,
      type: settings.type,
      volume: settings.volume,
    }));
    setIsLoaded(true);
  }, []);

  // Get or create AudioContext
  const getAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Kill ALL active sounds immediately - prevents overlapping
  const killAllSounds = useCallback(() => {
    // Cancel pending switch timeout
    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
      switchTimeoutRef.current = null;
    }

    // Kill ALL tracked sounds immediately (includes previews)
    activeSoundsRef.current.forEach(({ sound, gain }) => {
      try {
        sound.cleanup();
        gain.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    });
    activeSoundsRef.current.clear();

    // Also clean legacy refs
    ambientSoundRef.current = null;
    masterGainRef.current = null;
    isFadingRef.current = false;
  }, []);

  // Play ambient sound with fade-in
  const play = useCallback(() => {
    if (state.type === 'silence') return;

    // Kill all existing sounds first to prevent overlapping
    killAllSounds();

    const ctx = getAudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const sound = createAmbientSound(ctx, state.type);
    if (!sound) return;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;

    sound.gainNode.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Track this sound
    const entry = { sound, gain: masterGain };
    activeSoundsRef.current.add(entry);
    ambientSoundRef.current = sound;
    masterGainRef.current = masterGain;

    masterGain.gain.linearRampToValueAtTime(
      state.volume,
      ctx.currentTime + FADE_IN_DURATION
    );

    setState((prev) => ({ ...prev, isPlaying: true }));
  }, [state.type, state.volume, getAudioContext, killAllSounds]);

  // Stop ambient sound - kill all immediately
  const stop = useCallback(() => {
    killAllSounds();
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, [killAllSounds]);

  // Set ambient type - kills all sounds first, then creates new one if needed
  const setType = useCallback(
    (type: AmbientType) => {
      const wasPlaying = state.isPlaying || activeSoundsRef.current.size > 0;

      // Kill ALL active sounds immediately (including previews)
      killAllSounds();

      setState((prev) => ({ ...prev, type, isPlaying: false }));

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_TYPE, type);
      }

      // Restart with new type immediately if was playing and not silence
      if (wasPlaying && type !== 'silence') {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const sound = createAmbientSound(ctx, type);
        if (!sound) return;

        const masterGain = ctx.createGain();
        masterGain.gain.value = state.volume;

        sound.gainNode.connect(masterGain);
        masterGain.connect(ctx.destination);

        // Track this sound
        const entry = { sound, gain: masterGain };
        activeSoundsRef.current.add(entry);
        ambientSoundRef.current = sound;
        masterGainRef.current = masterGain;

        setState((prev) => ({ ...prev, isPlaying: true }));
      }
    },
    [state.isPlaying, state.volume, getAudioContext, killAllSounds]
  );

  // Set volume
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setState((prev) => ({ ...prev, volume: clampedVolume }));

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_VOLUME, String(clampedVolume));
    }

    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        clampedVolume,
        audioContextRef.current.currentTime + 0.1
      );
    }
  }, []);

  // Preview a sound type - tracked so killAllSounds() can stop it
  const preview = useCallback(
    (type: AmbientType) => {
      if (type === 'silence') return;

      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const sound = createAmbientSound(ctx, type);
      if (!sound) return;

      const previewGain = ctx.createGain();
      previewGain.gain.value = state.volume;

      sound.gainNode.connect(previewGain);
      previewGain.connect(ctx.destination);

      // Track this preview sound so killAllSounds() can stop it
      const entry = { sound, gain: previewGain };
      activeSoundsRef.current.add(entry);

      // Auto-cleanup after 1.5s with fade-out
      setTimeout(() => {
        // Only cleanup if still in the set (not killed by killAllSounds)
        if (activeSoundsRef.current.has(entry)) {
          previewGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
          setTimeout(() => {
            if (activeSoundsRef.current.has(entry)) {
              sound.cleanup();
              try {
                previewGain.disconnect();
              } catch {
                // Ignore
              }
              activeSoundsRef.current.delete(entry);
            }
          }, 350);
        }
      }, 1500);
    },
    [state.volume, getAudioContext]
  );

  // Cleanup on unmount - kill all tracked sounds
  useEffect(() => {
    const activeSounds = activeSoundsRef.current;
    const audioContext = audioContextRef.current;
    const switchTimeout = switchTimeoutRef.current;

    return () => {
      // Cancel any pending timeout
      if (switchTimeout) {
        clearTimeout(switchTimeout);
      }

      // Kill all tracked sounds (main + previews)
      activeSounds.forEach(({ sound, gain }) => {
        try {
          sound.cleanup();
          gain.disconnect();
        } catch {
          // Ignore
        }
      });
      activeSounds.clear();

      // Close audio context
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      type: state.type,
      volume: state.volume,
      isPlaying: state.isPlaying,
      isLoaded,
      play,
      stop,
      setType,
      setVolume,
      preview,
      presets: AMBIENT_PRESETS,
    }),
    [state.type, state.volume, state.isPlaying, isLoaded, play, stop, setType, setVolume, preview]
  );

  return (
    <AmbientSoundContext.Provider value={value}>
      {children}
    </AmbientSoundContext.Provider>
  );
}

export function useAmbientSoundContext(): AmbientSoundContextValue {
  const context = useContext(AmbientSoundContext);
  if (!context) {
    throw new Error('useAmbientSoundContext must be used within an AmbientSoundProvider');
  }
  return context;
}
