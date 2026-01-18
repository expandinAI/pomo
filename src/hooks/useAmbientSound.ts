'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type AmbientType,
  type AmbientSound,
  AMBIENT_PRESETS,
  createAmbientSound,
} from '@/lib/ambientGenerators';

const STORAGE_KEY_TYPE = 'pomo_ambient_type';
const STORAGE_KEY_VOLUME = 'pomo_ambient_volume';

const DEFAULT_TYPE: AmbientType = 'silence';
const DEFAULT_VOLUME = 0.5;

// Fade durations in seconds
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

export function useAmbientSound() {
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

  // Track if we're in a fade to prevent overlapping operations
  const isFadingRef = useRef(false);

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

  // Play ambient sound with fade-in
  const play = useCallback(() => {
    if (state.type === 'silence') return;
    if (isFadingRef.current) return;

    const ctx = getAudioContext();

    // Resume if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Clean up existing sound if any
    if (ambientSoundRef.current) {
      ambientSoundRef.current.cleanup();
      ambientSoundRef.current = null;
    }

    // Create new ambient sound
    const sound = createAmbientSound(ctx, state.type);
    if (!sound) return;

    ambientSoundRef.current = sound;

    // Create master gain for volume control
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0; // Start at 0 for fade-in
    masterGainRef.current = masterGain;

    // Connect: sound -> masterGain -> destination
    sound.gainNode.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Fade in
    masterGain.gain.linearRampToValueAtTime(
      state.volume,
      ctx.currentTime + FADE_IN_DURATION
    );

    setState((prev) => ({ ...prev, isPlaying: true }));
  }, [state.type, state.volume, getAudioContext]);

  // Stop ambient sound with fade-out
  const stop = useCallback(() => {
    if (!ambientSoundRef.current || !masterGainRef.current) {
      setState((prev) => ({ ...prev, isPlaying: false }));
      return;
    }

    if (isFadingRef.current) return;
    isFadingRef.current = true;

    const ctx = audioContextRef.current;
    if (!ctx) {
      setState((prev) => ({ ...prev, isPlaying: false }));
      isFadingRef.current = false;
      return;
    }

    const masterGain = masterGainRef.current;
    const sound = ambientSoundRef.current;

    // Fade out
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_OUT_DURATION);

    // Cleanup after fade completes
    setTimeout(() => {
      sound.cleanup();
      masterGain.disconnect();
      ambientSoundRef.current = null;
      masterGainRef.current = null;
      isFadingRef.current = false;
      setState((prev) => ({ ...prev, isPlaying: false }));
    }, FADE_OUT_DURATION * 1000 + 50);
  }, []);

  // Set ambient type
  const setType = useCallback(
    (type: AmbientType) => {
      const wasPlaying = state.isPlaying;

      // Stop current sound if playing
      if (wasPlaying && ambientSoundRef.current) {
        ambientSoundRef.current.cleanup();
        if (masterGainRef.current) {
          masterGainRef.current.disconnect();
        }
        ambientSoundRef.current = null;
        masterGainRef.current = null;
      }

      setState((prev) => ({ ...prev, type, isPlaying: false }));

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_TYPE, type);
      }

      // Restart with new type if was playing
      if (wasPlaying && type !== 'silence') {
        // Small delay to allow state update
        setTimeout(() => {
          const ctx = getAudioContext();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }

          const sound = createAmbientSound(ctx, type);
          if (!sound) return;

          ambientSoundRef.current = sound;

          const masterGain = ctx.createGain();
          masterGain.gain.value = state.volume;
          masterGainRef.current = masterGain;

          sound.gainNode.connect(masterGain);
          masterGain.connect(ctx.destination);

          setState((prev) => ({ ...prev, isPlaying: true }));
        }, 50);
      }
    },
    [state.isPlaying, state.volume, getAudioContext]
  );

  // Set volume
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setState((prev) => ({ ...prev, volume: clampedVolume }));

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_VOLUME, String(clampedVolume));
    }

    // Update master gain if playing
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        clampedVolume,
        audioContextRef.current.currentTime + 0.1
      );
    }
  }, []);

  // Preview a sound type (plays briefly)
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

      // Fade out after 1.5 seconds
      setTimeout(() => {
        previewGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        setTimeout(() => {
          sound.cleanup();
          previewGain.disconnect();
        }, 350);
      }, 1500);
    },
    [state.volume, getAudioContext]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ambientSoundRef.current) {
        ambientSoundRef.current.cleanup();
      }
      if (masterGainRef.current) {
        masterGainRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
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
  };
}
