'use client';

import { Sparkles, Zap, Layers, Smartphone, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAmbientEffects } from '@/contexts/AmbientEffectsContext';
import { SPRING } from '@/styles/design-tokens';
import type { VisualMode } from '@/hooks/useAdaptiveQuality';
import type { ParticleStyle } from '@/hooks/useParticleStyle';

interface ModeOption {
  value: VisualMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Grain texture only',
    icon: <Zap className="w-4 h-4" />,
  },
  {
    value: 'ambient',
    label: 'Ambient',
    description: 'Full visual effects',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    value: 'auto',
    label: 'Auto',
    description: 'Adapts to device',
    icon: <Smartphone className="w-4 h-4" />,
  },
];

interface ParticleStyleOption {
  value: ParticleStyle;
  label: string;
  description: string;
  icon: string;
}

const PARTICLE_STYLE_OPTIONS: ParticleStyleOption[] = [
  {
    value: 'rise-fall',
    label: 'Rise & Fall',
    description: 'Vertical flow',
    icon: '\u2195', // ↕
  },
  {
    value: 'shine-gather',
    label: 'Shine & Gather',
    description: 'Radial expansion',
    icon: '\u2732', // ✲
  },
  {
    value: 'shuffle',
    label: 'Shuffle',
    description: 'Random each session',
    icon: '\u2684', // ⚄
  },
];

/**
 * VisualEffectsSettings - Toggle and mode selector for ambient visual effects
 *
 * Allows users to:
 * - Enable/disable ambient effects
 * - Choose visual mode: Minimal | Ambient | Auto
 * - Choose particle style: Rise & Fall | Shine & Gather | Shuffle
 *
 * Settings are persisted to localStorage.
 */
export function VisualEffectsSettings() {
  const {
    effectsEnabled,
    setEffectsEnabled,
    visualMode,
    setVisualMode,
    deviceCapabilities,
    quality,
    particleStyle,
    setParticleStyle,
    isLoaded,
  } = useAmbientEffects();

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Main toggle */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
          Visual Effects
        </label>
        <motion.button
          onClick={() => setEffectsEnabled(!effectsEnabled)}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
            effectsEnabled
              ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
              : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
          }`}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', ...SPRING.default }}
        >
          <div className="flex items-center gap-3">
            <Sparkles
              className={`w-4 h-4 ${
                effectsEnabled
                  ? 'text-accent light:text-accent-dark'
                  : 'text-tertiary light:text-tertiary-dark'
              }`}
            />
            <div className="text-left">
              <p
                className={`text-sm font-medium ${
                  effectsEnabled
                    ? 'text-accent light:text-accent-dark'
                    : 'text-secondary light:text-secondary-dark'
                }`}
              >
                Ambient Effects
              </p>
              <p className="text-xs text-tertiary light:text-tertiary-dark">
                Glow and particles during sessions
              </p>
            </div>
          </div>
          {/* Toggle Switch */}
          <div
            className={`relative w-10 h-6 rounded-full transition-colors ${
              effectsEnabled
                ? 'bg-accent light:bg-accent-dark'
                : 'bg-tertiary/30 light:bg-tertiary-dark/30'
            }`}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
              animate={{ left: effectsEnabled ? 20 : 4 }}
              transition={{ type: 'spring', ...SPRING.default }}
            />
          </div>
        </motion.button>
      </div>

      {/* Visual Mode Selector - only show when effects are enabled */}
      {effectsEnabled && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3 h-3" />
            Visual Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {MODE_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => setVisualMode(option.value)}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                  visualMode === option.value
                    ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
                    : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
                }`}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', ...SPRING.default }}
              >
                <span
                  className={`mb-1 ${
                    visualMode === option.value
                      ? 'text-accent light:text-accent-dark'
                      : 'text-tertiary light:text-tertiary-dark'
                  }`}
                >
                  {option.icon}
                </span>
                <span
                  className={`text-xs font-medium ${
                    visualMode === option.value
                      ? 'text-accent light:text-accent-dark'
                      : 'text-secondary light:text-secondary-dark'
                  }`}
                >
                  {option.label}
                </span>
                <span className="text-[10px] text-tertiary light:text-tertiary-dark">
                  {option.description}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Device info for auto mode */}
          {visualMode === 'auto' && (
            <p className="text-xs text-tertiary light:text-tertiary-dark">
              {deviceCapabilities.isMobile ? 'Mobile' : 'Desktop'} detected, using {quality} quality
            </p>
          )}
        </div>
      )}

      {/* Particle Style Selector - only show when effects are enabled and not minimal */}
      {effectsEnabled && visualMode !== 'minimal' && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider flex items-center gap-2">
            <Circle className="w-3 h-3" />
            Particle Style
          </label>
          <div className="grid grid-cols-1 gap-2">
            {PARTICLE_STYLE_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => setParticleStyle(option.value)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  particleStyle === option.value
                    ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
                    : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
                }`}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', ...SPRING.default }}
              >
                <span
                  className={`text-lg w-6 text-center ${
                    particleStyle === option.value
                      ? 'text-accent light:text-accent-dark'
                      : 'text-tertiary light:text-tertiary-dark'
                  }`}
                >
                  {option.icon}
                </span>
                <div className="text-left">
                  <p
                    className={`text-sm font-medium ${
                      particleStyle === option.value
                        ? 'text-accent light:text-accent-dark'
                        : 'text-secondary light:text-secondary-dark'
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="text-xs text-tertiary light:text-tertiary-dark">
                    {option.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-tertiary light:text-tertiary-dark">
        Automatically disabled for reduced motion
      </p>
    </div>
  );
}
