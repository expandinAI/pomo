/**
 * Milestone Sound
 *
 * A deep, resonant gong sound for milestone moments.
 * Inspired by singing bowls - creates a sense of ceremony and significance.
 *
 * Uses Web Audio API synthesis (no external files).
 */

/**
 * Audio context singleton (reuse from useSound if available)
 */
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioContext;
}

/**
 * Play the milestone gong sound
 *
 * Characteristics:
 * - Fundamental: 220Hz (A3) - deep and resonant
 * - Harmonics: 440Hz, 660Hz, 880Hz - singing bowl character
 * - Duration: 2.5s exponential decay
 * - Frequency wobble for authentic singing bowl effect
 */
export function playMilestoneGong(volume: number = 1.0): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;
  const duration = 2.5;

  // Fundamental and harmonics (singing bowl overtone series)
  const frequencies = [220, 440, 660, 880, 1100];
  const amplitudes = [0.25, 0.15, 0.08, 0.05, 0.03]; // Descending loudness

  // Master gain for volume control
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, now);
  masterGain.connect(ctx.destination);

  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';

    // Frequency wobble for singing bowl character
    // Slightly increases then decreases for that "swelling" sound
    oscillator.frequency.setValueAtTime(freq, now);
    oscillator.frequency.linearRampToValueAtTime(freq * 1.003, now + 0.4);
    oscillator.frequency.linearRampToValueAtTime(freq * 0.997, now + 1.0);
    oscillator.frequency.linearRampToValueAtTime(freq, now + 1.8);

    // Amplitude envelope: quick attack, long exponential decay
    const amp = amplitudes[index];
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(amp, now + 0.08); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.1);
  });

  // Add a subtle low rumble for depth
  const rumbleOsc = ctx.createOscillator();
  const rumbleGain = ctx.createGain();

  rumbleOsc.type = 'sine';
  rumbleOsc.frequency.setValueAtTime(110, now); // A2 - one octave below fundamental

  rumbleGain.gain.setValueAtTime(0, now);
  rumbleGain.gain.linearRampToValueAtTime(0.08, now + 0.1);
  rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.8);

  rumbleOsc.connect(rumbleGain);
  rumbleGain.connect(masterGain);

  rumbleOsc.start(now);
  rumbleOsc.stop(now + duration);
}

/**
 * Check if audio is supported
 */
export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && !!(window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
}
