'use client';

import { useCallback, useRef, useEffect } from 'react';

/**
 * Audio context singleton to avoid creating multiple contexts
 */
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioContext;
}

/**
 * Creates a warm, pleasant completion chime using Web Audio API
 *
 * The sound is a soft two-tone chime (C5 → E5) with gentle decay,
 * designed to be calming and non-jarring.
 */
function playCompletionChime(ctx: AudioContext): void {
  const now = ctx.currentTime;

  // Two harmonious notes for a pleasant chime
  const frequencies = [523.25, 659.25]; // C5, E5
  const duration = 0.4;

  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now);

    // Gentle attack and decay envelope
    gainNode.gain.setValueAtTime(0, now + index * 0.1);
    gainNode.gain.linearRampToValueAtTime(0.15, now + index * 0.1 + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now + index * 0.1);
    oscillator.stop(now + index * 0.1 + duration);
  });
}

/**
 * Creates a softer, shorter chime for break completion
 */
function playBreakChime(ctx: AudioContext): void {
  const now = ctx.currentTime;

  // Single gentle note
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, now); // A4

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.1, now + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.3);
}

type SoundType = 'completion' | 'break';

interface UseSoundReturn {
  play: (type?: SoundType) => void;
  isSupported: boolean;
}

/**
 * Hook for playing notification sounds
 *
 * Uses Web Audio API to synthesize pleasant chimes.
 * Respects browser audio policies and system mute.
 */
export function useSound(): UseSoundReturn {
  const isSupported = useRef(true);
  const hasUserInteracted = useRef(false);

  // Track user interaction to enable audio
  useEffect(() => {
    const enableAudio = () => {
      hasUserInteracted.current = true;
      // Resume audio context if suspended (browser policy)
      const ctx = getAudioContext();
      if (ctx?.state === 'suspended') {
        ctx.resume();
      }
    };

    window.addEventListener('click', enableAudio, { once: true });
    window.addEventListener('keydown', enableAudio, { once: true });
    window.addEventListener('touchstart', enableAudio, { once: true });

    return () => {
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('keydown', enableAudio);
      window.removeEventListener('touchstart', enableAudio);
    };
  }, []);

  const play = useCallback((type: SoundType = 'completion') => {
    const ctx = getAudioContext();

    if (!ctx) {
      isSupported.current = false;
      return;
    }

    // Resume context if needed (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        if (type === 'completion') {
          playCompletionChime(ctx);
        } else {
          playBreakChime(ctx);
        }
      });
    } else {
      if (type === 'completion') {
        playCompletionChime(ctx);
      } else {
        playBreakChime(ctx);
      }
    }
  }, []);

  return {
    play,
    isSupported: isSupported.current,
  };
}
