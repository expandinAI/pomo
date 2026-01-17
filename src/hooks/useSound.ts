'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useSoundSettings, type SoundOption } from './useSoundSettings';

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
 * Default: Warm two-tone chime (C5 → E5)
 */
function playDefaultChime(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const frequencies = [523.25, 659.25]; // C5, E5
  const duration = 0.4;

  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now);

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
 * Soft: Gentle gong with overtones
 */
function playSoftChime(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const frequencies = [196, 392, 784]; // G3, G4, G5
  const duration = 0.8;

  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now);

    const volume = 0.12 / (index + 1);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  });
}

/**
 * Bell: Clear bell tone with harmonics
 */
function playBellChime(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const baseFreq = 880; // A5
  const harmonics = [1, 2, 2.4, 3, 4.2]; // Bell-like partials
  const duration = 0.6;

  harmonics.forEach((mult, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(baseFreq * mult, now);

    const volume = 0.1 / (index + 1);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / (index + 1));

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  });
}

/**
 * Woodblock: Short percussive click
 */
function playWoodblockChime(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const duration = 0.15;

  // Noise burst for attack
  const bufferSize = Math.floor(ctx.sampleRate * 0.02);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Bandpass filter for woody sound
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, now);
  filter.Q.setValueAtTime(5, now);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration);

  // Add tonal component
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

  oscGain.gain.setValueAtTime(0.15, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

/**
 * Bowl: Singing bowl with slow decay
 */
function playBowlChime(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const frequencies = [220, 440, 660, 880]; // A3 harmonics
  const duration = 1.2;

  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    // Slight frequency wobble for singing bowl effect
    oscillator.frequency.setValueAtTime(freq, now);
    oscillator.frequency.setValueAtTime(freq * 1.002, now + 0.3);
    oscillator.frequency.setValueAtTime(freq * 0.998, now + 0.6);
    oscillator.frequency.setValueAtTime(freq, now + 0.9);

    const volume = 0.08 / (index + 1);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.1);
  });
}

/**
 * Minimal: Short simple beep
 */
function playMinimalChime(ctx: AudioContext): void {
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, now);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.12, now + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, now + 0.1);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.12);
}

/**
 * Break chime: Softer, shorter version
 */
function playBreakChime(ctx: AudioContext): void {
  const now = ctx.currentTime;

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

const SOUND_PLAYERS: Record<SoundOption, (ctx: AudioContext) => void> = {
  default: playDefaultChime,
  soft: playSoftChime,
  bell: playBellChime,
  woodblock: playWoodblockChime,
  bowl: playBowlChime,
  minimal: playMinimalChime,
};

type SoundType = 'completion' | 'break';

interface UseSoundReturn {
  play: (type?: SoundType) => void;
  preview: (sound: SoundOption) => void;
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
  const { selectedSound } = useSoundSettings();

  // Track user interaction to enable audio
  useEffect(() => {
    const enableAudio = () => {
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

  const playSound = useCallback((sound: SoundOption) => {
    const ctx = getAudioContext();
    if (!ctx) {
      isSupported.current = false;
      return;
    }

    const player = SOUND_PLAYERS[sound];
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => player(ctx));
    } else {
      player(ctx);
    }
  }, []);

  const play = useCallback((type: SoundType = 'completion') => {
    const ctx = getAudioContext();

    if (!ctx) {
      isSupported.current = false;
      return;
    }

    if (type === 'break') {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => playBreakChime(ctx));
      } else {
        playBreakChime(ctx);
      }
    } else {
      playSound(selectedSound);
    }
  }, [selectedSound, playSound]);

  const preview = useCallback((sound: SoundOption) => {
    playSound(sound);
  }, [playSound]);

  return {
    play,
    preview,
    isSupported: isSupported.current,
  };
}
