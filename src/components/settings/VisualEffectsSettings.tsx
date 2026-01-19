'use client';

import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAmbientEffects } from '@/contexts/AmbientEffectsContext';
import { SPRING } from '@/styles/design-tokens';

/**
 * VisualEffectsSettings - Toggle for ambient visual effects
 *
 * Allows users to enable/disable the breathing glow and particle effects.
 * Setting is persisted to localStorage.
 */
export function VisualEffectsSettings() {
  const { effectsEnabled, setEffectsEnabled, isLoaded } = useAmbientEffects();

  if (!isLoaded) {
    return null;
  }

  return (
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
      <p className="text-xs text-tertiary light:text-tertiary-dark">
        Automatically disabled for reduced motion
      </p>
    </div>
  );
}
