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

type SoundType = 'completion' | 'break' | 'autostart' | 'celebration' | 'timer-start' | 'timer-pause' | 'transition-arrival' | 'transition-awakening';

interface UseSoundReturn {
  play: (type?: SoundType) => void;
  preview: (sound: SoundOption) => void;
  isSupported: boolean;
}

/**
 * Master gain node for volume control
 */
let masterGain: GainNode | null = null;

function getMasterGain(ctx: AudioContext, volume: number): GainNode {
  if (!masterGain || masterGain.context !== ctx) {
    masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
  }
  masterGain.gain.value = volume;
  return masterGain;
}

/**
 * Play a sound with volume control
 */
function playSoundWithVolume(
  ctx: AudioContext,
  player: (ctx: AudioContext, dest: AudioNode) => void,
  volume: number
): void {
  const gain = getMasterGain(ctx, volume);
  player(ctx, gain);
}

// Update sound players to accept destination node
function playDefaultChimeWithDest(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  const frequencies = [523.25, 659.25];
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
    gainNode.connect(dest);

    oscillator.start(now + index * 0.1);
    oscillator.stop(now + index * 0.1 + duration);
  });
}

function playSoftChimeWithDest(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  const frequencies = [196, 392, 784];
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
    gainNode.connect(dest);

    oscillator.start(now);
    oscillator.stop(now + duration);
  });
}

function playBellChimeWithDest(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  const baseFreq = 880;
  const harmonics = [1, 2, 2.4, 3, 4.2];
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
    gainNode.connect(dest);

    oscillator.start(now);
    oscillator.stop(now + duration);
  });
}

function playWoodblockChimeWithDest(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  const duration = 0.15;

  const bufferSize = Math.floor(ctx.sampleRate * 0.02);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, now);
  filter.Q.setValueAtTime(5, now);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(dest);

  noise.start(now);
  noise.stop(now + duration);

  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

  oscGain.gain.setValueAtTime(0.15, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(oscGain);
  oscGain.connect(dest);

  osc.start(now);
  osc.stop(now + 0.1);
}

function playBowlChimeWithDest(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  const frequencies = [220, 440, 660, 880];
  const duration = 1.2;

  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now);
    oscillator.frequency.setValueAtTime(freq * 1.002, now + 0.3);
    oscillator.frequency.setValueAtTime(freq * 0.998, now + 0.6);
    oscillator.frequency.setValueAtTime(freq, now + 0.9);

    const volume = 0.08 / (index + 1);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(dest);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.1);
  });
}

function playMinimalChimeWithDest(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, now);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.12, now + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, now + 0.1);

  oscillator.connect(gainNode);
  gainNode.connect(dest);

  oscillator.start(now);
  oscillator.stop(now + 0.12);
}

function playBreakChimeWithDest(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, now);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.1, now + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  oscillator.connect(gainNode);
  gainNode.connect(dest);

  oscillator.start(now);
  oscillator.stop(now + 0.3);
}

/**
 * Auto-start: Gentle awakening "ding"
 * 880 Hz (A5), 150ms, sine wave
 * Soft and pleasant - signals session is about to begin
 */
function playAutoStartSoundWithDest(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, now); // A5

  // Soft attack, smooth decay
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.2, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  oscillator.connect(gainNode);
  gainNode.connect(dest);

  oscillator.start(now);
  oscillator.stop(now + 0.18);
}

/**
 * Collect: Soft, low "doop" for particle arrival
 * Gentle, warm sound that's pleasant to hear repeatedly
 * Like something softly landing in its place
 */
function playCollectSoundWithDest(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  // Soft low tone - gentle "doop"
  const tone = ctx.createOscillator();
  const toneGain = ctx.createGain();

  tone.type = 'sine';
  // Low frequency, slight drop for "landing" feel
  tone.frequency.setValueAtTime(320, now);
  tone.frequency.exponentialRampToValueAtTime(240, now + 0.1);

  // Soft attack, smooth decay - not sharp at all
  toneGain.gain.setValueAtTime(0, now);
  toneGain.gain.linearRampToValueAtTime(0.12, now + 0.025); // Gentle attack
  toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15); // Smooth fade

  tone.connect(toneGain);
  toneGain.connect(dest);

  tone.start(now);
  tone.stop(now + 0.18);
}

/**
 * Celebration: Triumphant ascending fanfare for deluxe celebration
 * Rich, rewarding sound with multiple harmonics and ascending progression
 * Like unlocking an achievement - dopamine-inducing!
 */
function playCelebrationSoundWithDest(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  // Ascending major chord arpeggio (C5 → E5 → G5 → C6)
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const noteDuration = 0.15;
  const noteSpacing = 0.08;

  notes.forEach((freq, index) => {
    const startTime = now + index * noteSpacing;

    // Main tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration + 0.2);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(startTime);
    osc.stop(startTime + noteDuration + 0.3);

    // Harmonic overtone for richness
    const harmonic = ctx.createOscillator();
    const harmGain = ctx.createGain();

    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(freq * 2, startTime);

    harmGain.gain.setValueAtTime(0, startTime);
    harmGain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
    harmGain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration + 0.15);

    harmonic.connect(harmGain);
    harmGain.connect(dest);

    harmonic.start(startTime);
    harmonic.stop(startTime + noteDuration + 0.2);
  });

  // Final shimmer/sparkle effect
  const shimmerStart = now + notes.length * noteSpacing + 0.1;
  for (let i = 0; i < 3; i++) {
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();

    shimmer.type = 'sine';
    const shimmerFreq = 2000 + Math.random() * 1000;
    shimmer.frequency.setValueAtTime(shimmerFreq, shimmerStart + i * 0.05);

    shimmerGain.gain.setValueAtTime(0, shimmerStart + i * 0.05);
    shimmerGain.gain.linearRampToValueAtTime(0.05, shimmerStart + i * 0.05 + 0.01);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, shimmerStart + i * 0.05 + 0.1);

    shimmer.connect(shimmerGain);
    shimmerGain.connect(dest);

    shimmer.start(shimmerStart + i * 0.05);
    shimmer.stop(shimmerStart + i * 0.05 + 0.15);
  }
}

/**
 * Timer Start: Soft organic "pop" - like a particle settling into place
 * Round, warm, natural - not mechanical
 */
function playTimerStartSoundWithDest(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  // Soft round tone with natural frequency bounce
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  // Start higher, settle down - like something landing softly
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(280, now + 0.025);
  osc.frequency.exponentialRampToValueAtTime(260, now + 0.05);

  // Soft attack, natural decay
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Timer Pause: Gentle release - like a breath out
 * Softer, lower, settling down
 */
function playTimerPauseSoundWithDest(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  // Soft descending tone - like exhaling
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  // Lower, gentler descent
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.03);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

  // Even softer than start
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(now);
  osc.stop(now + 0.07);
}

// ============================================================================
// TRANSITION SOUNDS - Three intensity levels
// "Particle klingt wie Licht klingen würde"
// ============================================================================

/**
 * Transition Arrival SUBTLE: Focus → Break
 * Minimal, short (~1s), just two pure tones converging
 */
function playTransitionArrivalSubtle(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  // Root tone only (A3 = 220Hz)
  const root = ctx.createOscillator();
  const rootGain = ctx.createGain();
  root.type = 'sine';
  root.frequency.setValueAtTime(220, now);

  rootGain.gain.setValueAtTime(0, now);
  rootGain.gain.linearRampToValueAtTime(0.1, now + 0.15);
  rootGain.gain.setValueAtTime(0.1, now + 0.5);
  rootGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

  root.connect(rootGain);
  rootGain.connect(dest);
  root.start(now);
  root.stop(now + 1.1);

  // Fifth (E4 = 330Hz) - subtle convergence
  const fifth = ctx.createOscillator();
  const fifthGain = ctx.createGain();
  fifth.type = 'sine';
  fifth.frequency.setValueAtTime(330, now);

  fifthGain.gain.setValueAtTime(0, now);
  fifthGain.gain.linearRampToValueAtTime(0.08, now + 0.2);
  fifthGain.gain.setValueAtTime(0.08, now + 0.4);
  fifthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

  fifth.connect(fifthGain);
  fifthGain.connect(dest);
  fifth.start(now + 0.05);
  fifth.stop(now + 1.0);
}

/**
 * Transition Arrival NORMAL: Focus → Break
 * Two sine waves converging in harmony (root + perfect fifth = 2:3 ratio)
 * Like light waves finding resonance. Warm, fulfilled, peaceful. (~2s)
 */
function playTransitionArrivalNormal(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  // Root tone (A3 = 220Hz) - grounding, warm
  const root = ctx.createOscillator();
  const rootGain = ctx.createGain();
  root.type = 'sine';
  root.frequency.setValueAtTime(220, now);

  rootGain.gain.setValueAtTime(0, now);
  rootGain.gain.linearRampToValueAtTime(0.15, now + 0.3);
  rootGain.gain.setValueAtTime(0.15, now + 1.0);
  rootGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

  root.connect(rootGain);
  rootGain.connect(dest);
  root.start(now);
  root.stop(now + 2.2);

  // Fifth (E4 = 330Hz) - harmony, convergence
  const fifth = ctx.createOscillator();
  const fifthGain = ctx.createGain();
  fifth.type = 'sine';
  fifth.frequency.setValueAtTime(330, now);

  fifthGain.gain.setValueAtTime(0, now);
  fifthGain.gain.linearRampToValueAtTime(0.12, now + 0.4);
  fifthGain.gain.setValueAtTime(0.12, now + 0.9);
  fifthGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

  fifth.connect(fifthGain);
  fifthGain.connect(dest);
  fifth.start(now + 0.1);
  fifth.stop(now + 2.0);

  // Subtle high overtone - shimmer of light
  const shimmer = ctx.createOscillator();
  const shimmerGain = ctx.createGain();
  shimmer.type = 'sine';
  shimmer.frequency.setValueAtTime(880, now); // A5

  shimmerGain.gain.setValueAtTime(0, now);
  shimmerGain.gain.linearRampToValueAtTime(0.04, now + 0.5);
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

  shimmer.connect(shimmerGain);
  shimmerGain.connect(dest);
  shimmer.start(now + 0.2);
  shimmer.stop(now + 1.7);
}

/**
 * Transition Arrival RICH: Focus → Break
 * Full harmonic spectrum, longer decay (~3s), extra octave
 * Like light refracting into a warm glow
 */
function playTransitionArrivalRich(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  // Root tone (A3 = 220Hz) - foundation
  const root = ctx.createOscillator();
  const rootGain = ctx.createGain();
  root.type = 'sine';
  root.frequency.setValueAtTime(220, now);

  rootGain.gain.setValueAtTime(0, now);
  rootGain.gain.linearRampToValueAtTime(0.15, now + 0.4);
  rootGain.gain.setValueAtTime(0.15, now + 1.5);
  rootGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

  root.connect(rootGain);
  rootGain.connect(dest);
  root.start(now);
  root.stop(now + 3.2);

  // Lower octave (A2 = 110Hz) - deep warmth
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(110, now);

  subGain.gain.setValueAtTime(0, now);
  subGain.gain.linearRampToValueAtTime(0.08, now + 0.5);
  subGain.gain.setValueAtTime(0.08, now + 1.2);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

  sub.connect(subGain);
  subGain.connect(dest);
  sub.start(now);
  sub.stop(now + 2.7);

  // Fifth (E4 = 330Hz) - harmony
  const fifth = ctx.createOscillator();
  const fifthGain = ctx.createGain();
  fifth.type = 'sine';
  fifth.frequency.setValueAtTime(330, now);

  fifthGain.gain.setValueAtTime(0, now);
  fifthGain.gain.linearRampToValueAtTime(0.12, now + 0.5);
  fifthGain.gain.setValueAtTime(0.12, now + 1.3);
  fifthGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

  fifth.connect(fifthGain);
  fifthGain.connect(dest);
  fifth.start(now + 0.1);
  fifth.stop(now + 2.7);

  // Octave (A4 = 440Hz) - brightness
  const octave = ctx.createOscillator();
  const octaveGain = ctx.createGain();
  octave.type = 'sine';
  octave.frequency.setValueAtTime(440, now);

  octaveGain.gain.setValueAtTime(0, now);
  octaveGain.gain.linearRampToValueAtTime(0.08, now + 0.6);
  octaveGain.gain.setValueAtTime(0.08, now + 1.0);
  octaveGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

  octave.connect(octaveGain);
  octaveGain.connect(dest);
  octave.start(now + 0.2);
  octave.stop(now + 2.2);

  // High shimmer (A5 = 880Hz)
  const shimmer = ctx.createOscillator();
  const shimmerGain = ctx.createGain();
  shimmer.type = 'sine';
  shimmer.frequency.setValueAtTime(880, now);

  shimmerGain.gain.setValueAtTime(0, now);
  shimmerGain.gain.linearRampToValueAtTime(0.05, now + 0.7);
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

  shimmer.connect(shimmerGain);
  shimmerGain.connect(dest);
  shimmer.start(now + 0.3);
  shimmer.stop(now + 2.2);
}

/**
 * Transition Awakening SUBTLE: Break → Focus
 * Minimal, short (~0.8s), gentle rising tone
 */
function playTransitionAwakeningSubtle(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  // Simple rising tone
  const rise = ctx.createOscillator();
  const riseGain = ctx.createGain();
  rise.type = 'sine';
  rise.frequency.setValueAtTime(280, now);
  rise.frequency.exponentialRampToValueAtTime(400, now + 0.5);

  riseGain.gain.setValueAtTime(0, now);
  riseGain.gain.linearRampToValueAtTime(0.1, now + 0.1);
  riseGain.gain.setValueAtTime(0.1, now + 0.4);
  riseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  rise.connect(riseGain);
  riseGain.connect(dest);
  rise.start(now);
  rise.stop(now + 0.9);
}

/**
 * Transition Awakening NORMAL: Break → Focus
 * Rising harmonics that dissolve into clarity (~1.5s)
 * Like first light of dawn. Fresh, clear, ready.
 */
function playTransitionAwakeningNormal(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  // Rising tone - starts low, rises gently
  const rise = ctx.createOscillator();
  const riseGain = ctx.createGain();
  rise.type = 'sine';
  rise.frequency.setValueAtTime(220, now);
  rise.frequency.exponentialRampToValueAtTime(330, now + 0.8);
  rise.frequency.setValueAtTime(330, now + 1.2);

  riseGain.gain.setValueAtTime(0, now);
  riseGain.gain.linearRampToValueAtTime(0.12, now + 0.2);
  riseGain.gain.setValueAtTime(0.12, now + 0.9);
  riseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

  rise.connect(riseGain);
  riseGain.connect(dest);
  rise.start(now);
  rise.stop(now + 1.7);

  // Clarity tone - appears as the rise settles
  const clarity = ctx.createOscillator();
  const clarityGain = ctx.createGain();
  clarity.type = 'sine';
  clarity.frequency.setValueAtTime(440, now); // A4 - clear, bright

  clarityGain.gain.setValueAtTime(0, now);
  clarityGain.gain.linearRampToValueAtTime(0.1, now + 0.5);
  clarityGain.gain.setValueAtTime(0.1, now + 0.8);
  clarityGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

  clarity.connect(clarityGain);
  clarityGain.connect(dest);
  clarity.start(now + 0.3);
  clarity.stop(now + 1.5);

  // Soft high tone - the "ready" moment
  const ready = ctx.createOscillator();
  const readyGain = ctx.createGain();
  ready.type = 'sine';
  ready.frequency.setValueAtTime(660, now); // E5

  readyGain.gain.setValueAtTime(0, now);
  readyGain.gain.linearRampToValueAtTime(0.06, now + 0.6);
  readyGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

  ready.connect(readyGain);
  readyGain.connect(dest);
  ready.start(now + 0.5);
  ready.stop(now + 1.3);
}

/**
 * Transition Awakening RICH: Break → Focus
 * Full spectrum rising, longer duration (~2.5s)
 * Like dawn breaking with full clarity
 */
function playTransitionAwakeningRich(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  // Deep rising tone
  const deepRise = ctx.createOscillator();
  const deepRiseGain = ctx.createGain();
  deepRise.type = 'sine';
  deepRise.frequency.setValueAtTime(165, now); // E3
  deepRise.frequency.exponentialRampToValueAtTime(220, now + 1.0);

  deepRiseGain.gain.setValueAtTime(0, now);
  deepRiseGain.gain.linearRampToValueAtTime(0.08, now + 0.3);
  deepRiseGain.gain.setValueAtTime(0.08, now + 0.8);
  deepRiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

  deepRise.connect(deepRiseGain);
  deepRiseGain.connect(dest);
  deepRise.start(now);
  deepRise.stop(now + 2.0);

  // Main rising tone
  const rise = ctx.createOscillator();
  const riseGain = ctx.createGain();
  rise.type = 'sine';
  rise.frequency.setValueAtTime(220, now);
  rise.frequency.exponentialRampToValueAtTime(330, now + 1.2);
  rise.frequency.setValueAtTime(330, now + 2.0);

  riseGain.gain.setValueAtTime(0, now);
  riseGain.gain.linearRampToValueAtTime(0.12, now + 0.3);
  riseGain.gain.setValueAtTime(0.12, now + 1.5);
  riseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);

  rise.connect(riseGain);
  riseGain.connect(dest);
  rise.start(now + 0.1);
  rise.stop(now + 2.5);

  // Clarity tone (A4)
  const clarity = ctx.createOscillator();
  const clarityGain = ctx.createGain();
  clarity.type = 'sine';
  clarity.frequency.setValueAtTime(440, now);

  clarityGain.gain.setValueAtTime(0, now);
  clarityGain.gain.linearRampToValueAtTime(0.1, now + 0.7);
  clarityGain.gain.setValueAtTime(0.1, now + 1.2);
  clarityGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

  clarity.connect(clarityGain);
  clarityGain.connect(dest);
  clarity.start(now + 0.4);
  clarity.stop(now + 2.2);

  // Ready tone (E5)
  const ready = ctx.createOscillator();
  const readyGain = ctx.createGain();
  ready.type = 'sine';
  ready.frequency.setValueAtTime(660, now);

  readyGain.gain.setValueAtTime(0, now);
  readyGain.gain.linearRampToValueAtTime(0.07, now + 0.8);
  readyGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

  ready.connect(readyGain);
  readyGain.connect(dest);
  ready.start(now + 0.6);
  ready.stop(now + 1.8);

  // High sparkle (A5)
  const sparkle = ctx.createOscillator();
  const sparkleGain = ctx.createGain();
  sparkle.type = 'sine';
  sparkle.frequency.setValueAtTime(880, now);

  sparkleGain.gain.setValueAtTime(0, now);
  sparkleGain.gain.linearRampToValueAtTime(0.04, now + 1.0);
  sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

  sparkle.connect(sparkleGain);
  sparkleGain.connect(dest);
  sparkle.start(now + 0.8);
  sparkle.stop(now + 2.0);
}

const SOUND_PLAYERS_WITH_DEST: Record<SoundOption, (ctx: AudioContext, dest: AudioNode) => void> = {
  default: playDefaultChimeWithDest,
  soft: playSoftChimeWithDest,
  bell: playBellChimeWithDest,
  woodblock: playWoodblockChimeWithDest,
  bowl: playBowlChimeWithDest,
  minimal: playMinimalChimeWithDest,
};

/**
 * Hook for playing notification sounds
 *
 * Uses Web Audio API to synthesize pleasant chimes.
 * Respects browser audio policies, system mute, and user volume settings.
 */
export function useSound(): UseSoundReturn {
  const isSupported = useRef(true);
  const { selectedSound, volume, muted } = useSoundSettings();

  // Track user interaction to enable audio
  useEffect(() => {
    const enableAudio = () => {
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

  const playSound = useCallback((sound: SoundOption, vol: number) => {
    const ctx = getAudioContext();
    if (!ctx) {
      isSupported.current = false;
      return;
    }

    const player = SOUND_PLAYERS_WITH_DEST[sound];
    const doPlay = () => playSoundWithVolume(ctx, player, vol);

    if (ctx.state === 'suspended') {
      ctx.resume().then(doPlay);
    } else {
      doPlay();
    }
  }, []);

  const play = useCallback((type: SoundType = 'completion') => {
    if (muted) return;

    // UI sounds require uiSoundsEnabled to be true
    // Read directly from localStorage to get the latest value
    const isUiSound = type === 'timer-start' || type === 'timer-pause';
    if (isUiSound) {
      const storedUiSounds = localStorage.getItem('particle_ui_sounds_enabled');
      const uiSoundsCurrentlyEnabled = storedUiSounds !== 'false';
      if (!uiSoundsCurrentlyEnabled) return;
    }

    // Transition sounds require transitionSoundsEnabled to be true
    // Read directly from localStorage to get the latest value
    const isTransitionSound = type === 'transition-arrival' || type === 'transition-awakening';
    if (isTransitionSound) {
      const storedTransitionSounds = localStorage.getItem('particle_transition_sounds_enabled');
      const transitionSoundsCurrentlyEnabled = storedTransitionSounds !== 'false';
      if (!transitionSoundsCurrentlyEnabled) return;
    }

    // Get transition intensity from localStorage
    const storedIntensity = localStorage.getItem('particle_transition_intensity');
    const transitionIntensity = (storedIntensity === 'subtle' || storedIntensity === 'rich')
      ? storedIntensity
      : 'normal';

    const ctx = getAudioContext();
    if (!ctx) {
      isSupported.current = false;
      return;
    }

    const doPlay = () => {
      if (type === 'break') {
        playSoundWithVolume(ctx, playBreakChimeWithDest, volume);
      } else if (type === 'autostart') {
        playSoundWithVolume(ctx, playAutoStartSoundWithDest, volume);
      } else if (type === 'celebration') {
        playSoundWithVolume(ctx, playCelebrationSoundWithDest, volume);
      } else if (type === 'timer-start') {
        playSoundWithVolume(ctx, playTimerStartSoundWithDest, volume);
      } else if (type === 'timer-pause') {
        playSoundWithVolume(ctx, playTimerPauseSoundWithDest, volume);
      } else if (type === 'transition-arrival') {
        // Select arrival sound based on intensity
        const arrivalSound = transitionIntensity === 'subtle'
          ? playTransitionArrivalSubtle
          : transitionIntensity === 'rich'
            ? playTransitionArrivalRich
            : playTransitionArrivalNormal;
        playSoundWithVolume(ctx, arrivalSound, volume);
      } else if (type === 'transition-awakening') {
        // Select awakening sound based on intensity
        const awakeningSound = transitionIntensity === 'subtle'
          ? playTransitionAwakeningSubtle
          : transitionIntensity === 'rich'
            ? playTransitionAwakeningRich
            : playTransitionAwakeningNormal;
        playSoundWithVolume(ctx, awakeningSound, volume);
      } else {
        playSound(selectedSound, volume);
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(doPlay);
    } else {
      doPlay();
    }
  }, [selectedSound, volume, muted, playSound]);

  const preview = useCallback((sound: SoundOption) => {
    // Preview always plays (ignores mute) but respects volume
    playSound(sound, volume);
  }, [playSound, volume]);

  return {
    play,
    preview,
    isSupported: isSupported.current,
  };
}
