/**
 * Web Audio API generators for ambient sounds.
 * No audio files needed - all sounds synthesized in real-time.
 */

export type AmbientType = 'silence' | 'rain' | 'forest' | 'cafe' | 'white' | 'ocean';

export interface AmbientPreset {
  id: AmbientType;
  name: string;
  description: string;
}

export const AMBIENT_PRESETS: AmbientPreset[] = [
  { id: 'silence', name: 'Silence', description: 'No ambient sound' },
  { id: 'rain', name: 'Rain', description: 'Gentle rainfall' },
  { id: 'forest', name: 'Forest', description: 'Birds and wind' },
  { id: 'cafe', name: 'Café', description: 'Soft murmur' },
  { id: 'white', name: 'White Noise', description: 'Neutral static' },
  { id: 'ocean', name: 'Ocean', description: 'Waves rolling' },
];

/**
 * Represents an active ambient sound with all its audio nodes.
 * Call cleanup() to properly disconnect and stop all nodes.
 */
export interface AmbientSound {
  gainNode: GainNode;
  cleanup: () => void;
}

/**
 * Applies crossfade to make a noise buffer loop seamlessly.
 * Blends the end of the buffer into the beginning to eliminate clicks.
 */
function applyLoopCrossfade(buffer: AudioBuffer, fadeMs: number = 50): void {
  const channelData = buffer.getChannelData(0);
  const fadeSamples = Math.floor((fadeMs / 1000) * buffer.sampleRate);
  const length = channelData.length;

  for (let i = 0; i < fadeSamples; i++) {
    const fadeOut = 1 - i / fadeSamples; // 1 → 0
    const fadeIn = i / fadeSamples; // 0 → 1

    // Blend end into beginning
    const endIndex = length - fadeSamples + i;
    channelData[i] = channelData[i] * fadeIn + channelData[endIndex] * fadeOut;
  }
}

/**
 * Creates a white noise buffer source.
 * White noise has equal energy at all frequencies.
 */
function createWhiteNoiseSource(ctx: AudioContext): AudioBufferSourceNode {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  // Apply crossfade for seamless loop
  applyLoopCrossfade(buffer, 50);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

/**
 * Creates white noise sound.
 */
export function createWhiteNoise(ctx: AudioContext): AmbientSound {
  const source = createWhiteNoiseSource(ctx);
  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.15; // Soft volume

  source.connect(gainNode);
  source.start();

  return {
    gainNode,
    cleanup: () => {
      source.stop();
      source.disconnect();
      gainNode.disconnect();
    },
  };
}

/**
 * Creates rain sound using pink noise (filtered white noise).
 * Pink noise emphasizes lower frequencies, creating a natural rain sound.
 */
export function createRainSound(ctx: AudioContext): AmbientSound {
  const source = createWhiteNoiseSource(ctx);

  // Lowpass filter creates pink noise effect
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 800;
  lowpass.Q.value = 0.5;

  // Subtle high-frequency for rain drops
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 200;

  // LFO for subtle intensity variation
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.05; // Very slow
  lfoGain.gain.value = 0.02;

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.2;

  // Connect chain
  source.connect(lowpass);
  lowpass.connect(highpass);
  highpass.connect(gainNode);

  // LFO modulates gain
  lfo.connect(lfoGain);
  lfoGain.connect(gainNode.gain);

  source.start();
  lfo.start();

  return {
    gainNode,
    cleanup: () => {
      source.stop();
      lfo.stop();
      source.disconnect();
      lowpass.disconnect();
      highpass.disconnect();
      lfo.disconnect();
      lfoGain.disconnect();
      gainNode.disconnect();
    },
  };
}

/**
 * Creates forest ambience using layered oscillators.
 * Simulates wind rustling and subtle bird-like tones.
 */
export function createForestSound(ctx: AudioContext): AmbientSound {
  const sources: AudioBufferSourceNode[] = [];
  const oscillators: OscillatorNode[] = [];

  // Wind layer (filtered noise)
  const windSource = createWhiteNoiseSource(ctx);
  sources.push(windSource);

  const windFilter = ctx.createBiquadFilter();
  windFilter.type = 'bandpass';
  windFilter.frequency.value = 400;
  windFilter.Q.value = 0.3;

  const windGain = ctx.createGain();
  windGain.gain.value = 0.08;

  // Wind modulation
  const windLfo = ctx.createOscillator();
  const windLfoGain = ctx.createGain();
  windLfo.frequency.value = 0.15;
  windLfoGain.gain.value = 0.03;
  oscillators.push(windLfo);

  windSource.connect(windFilter);
  windFilter.connect(windGain);
  windLfo.connect(windLfoGain);
  windLfoGain.connect(windGain.gain);

  // Bird-like high frequency hints (very subtle)
  const birdOsc1 = ctx.createOscillator();
  const birdOsc2 = ctx.createOscillator();
  birdOsc1.type = 'sine';
  birdOsc2.type = 'sine';
  birdOsc1.frequency.value = 2000;
  birdOsc2.frequency.value = 2400;
  oscillators.push(birdOsc1, birdOsc2);

  const birdGain = ctx.createGain();
  birdGain.gain.value = 0.005; // Very quiet

  // Modulate bird frequencies for chirp effect
  const birdLfo = ctx.createOscillator();
  birdLfo.frequency.value = 0.3;
  oscillators.push(birdLfo);

  const birdLfoGain = ctx.createGain();
  birdLfoGain.gain.value = 100;

  birdLfo.connect(birdLfoGain);
  birdLfoGain.connect(birdOsc1.frequency);
  birdLfoGain.connect(birdOsc2.frequency);

  birdOsc1.connect(birdGain);
  birdOsc2.connect(birdGain);

  // Main gain
  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.5;

  windGain.connect(gainNode);
  birdGain.connect(gainNode);

  // Start all
  windSource.start();
  oscillators.forEach((osc) => osc.start());

  return {
    gainNode,
    cleanup: () => {
      sources.forEach((s) => {
        s.stop();
        s.disconnect();
      });
      oscillators.forEach((o) => {
        o.stop();
        o.disconnect();
      });
      windFilter.disconnect();
      windGain.disconnect();
      windLfoGain.disconnect();
      birdGain.disconnect();
      birdLfoGain.disconnect();
      gainNode.disconnect();
    },
  };
}

/**
 * Creates café ambience using brown noise with subtle variations.
 * Simulates distant chatter and ambient room noise.
 */
export function createCafeSound(ctx: AudioContext): AmbientSound {
  const source = createWhiteNoiseSource(ctx);

  // Deep lowpass for brown noise (café murmur)
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 300;
  lowpass.Q.value = 0.7;

  // Bandpass for "voice-like" frequencies
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 500;
  bandpass.Q.value = 0.5;

  const bandpassGain = ctx.createGain();
  bandpassGain.gain.value = 0.1;

  // LFO for subtle volume variations (conversation ebb and flow)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.04;

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.25;

  // Connect
  source.connect(lowpass);
  lowpass.connect(gainNode);

  source.connect(bandpass);
  bandpass.connect(bandpassGain);
  bandpassGain.connect(gainNode);

  lfo.connect(lfoGain);
  lfoGain.connect(gainNode.gain);

  source.start();
  lfo.start();

  return {
    gainNode,
    cleanup: () => {
      source.stop();
      lfo.stop();
      source.disconnect();
      lowpass.disconnect();
      bandpass.disconnect();
      bandpassGain.disconnect();
      lfo.disconnect();
      lfoGain.disconnect();
      gainNode.disconnect();
    },
  };
}

/**
 * Creates ocean wave sound using brown noise with wave-like LFO modulation.
 */
export function createOceanSound(ctx: AudioContext): AmbientSound {
  const source = createWhiteNoiseSource(ctx);

  // Deep lowpass for brown noise (wave base)
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 400;
  lowpass.Q.value = 0.5;

  // Highpass to remove very low rumble
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 50;

  // Wave LFO - slow, sweeping volume changes
  const waveLfo = ctx.createOscillator();
  const waveLfoGain = ctx.createGain();
  waveLfo.frequency.value = 0.1; // ~10 second wave cycle
  waveLfoGain.gain.value = 0.15;

  // Secondary faster LFO for foam/splash texture
  const foamLfo = ctx.createOscillator();
  const foamLfoGain = ctx.createGain();
  foamLfo.frequency.value = 0.4;
  foamLfoGain.gain.value = 0.05;

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.2;

  // Connect
  source.connect(lowpass);
  lowpass.connect(highpass);
  highpass.connect(gainNode);

  waveLfo.connect(waveLfoGain);
  waveLfoGain.connect(gainNode.gain);

  foamLfo.connect(foamLfoGain);
  foamLfoGain.connect(gainNode.gain);

  source.start();
  waveLfo.start();
  foamLfo.start();

  return {
    gainNode,
    cleanup: () => {
      source.stop();
      waveLfo.stop();
      foamLfo.stop();
      source.disconnect();
      lowpass.disconnect();
      highpass.disconnect();
      waveLfo.disconnect();
      waveLfoGain.disconnect();
      foamLfo.disconnect();
      foamLfoGain.disconnect();
      gainNode.disconnect();
    },
  };
}

/**
 * Creates an ambient sound of the specified type.
 * Returns null for 'silence' type.
 */
export function createAmbientSound(
  ctx: AudioContext,
  type: AmbientType
): AmbientSound | null {
  switch (type) {
    case 'silence':
      return null;
    case 'rain':
      return createRainSound(ctx);
    case 'forest':
      return createForestSound(ctx);
    case 'cafe':
      return createCafeSound(ctx);
    case 'white':
      return createWhiteNoise(ctx);
    case 'ocean':
      return createOceanSound(ctx);
    default:
      return null;
  }
}
