'use client';

import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimerSettingsContext, type CelebrationTrigger, type CelebrationIntensity } from '@/contexts/TimerSettingsContext';
import { SPRING } from '@/styles/design-tokens';

const TRIGGER_OPTIONS: { value: CelebrationTrigger; label: string }[] = [
  { value: 'every-session', label: 'Every Session' },
  { value: 'daily-goal', label: 'Daily Goal' },
];

const INTENSITY_OPTIONS: { value: CelebrationIntensity; label: string }[] = [
  { value: 'subtle', label: 'Subtle' },
  { value: 'full', label: 'Full' },
  { value: 'deluxe', label: 'Deluxe' },
];

export function CelebrationSettings() {
  const {
    celebrationEnabled,
    setCelebrationEnabled,
    celebrationTrigger,
    setCelebrationTrigger,
    celebrationIntensity,
    setCelebrationIntensity,
  } = useTimerSettingsContext();

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
        Celebration
      </label>
      <motion.button
        onClick={() => setCelebrationEnabled(!celebrationEnabled)}
        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
          celebrationEnabled
            ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
            : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
        }`}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <div className="flex items-center gap-3">
          <Sparkles
            className={`w-4 h-4 ${
              celebrationEnabled
                ? 'text-accent light:text-accent-dark'
                : 'text-tertiary light:text-tertiary-dark'
            }`}
          />
          <div className="text-left">
            <p
              className={`text-sm font-medium ${
                celebrationEnabled
                  ? 'text-accent light:text-accent-dark'
                  : 'text-secondary light:text-secondary-dark'
              }`}
            >
              Particle Burst
            </p>
            <p className="text-xs text-tertiary light:text-tertiary-dark">
              Celebrate completed sessions
            </p>
          </div>
        </div>
        {/* Toggle Switch */}
        <div
          className={`relative w-10 h-6 rounded-full transition-colors ${
            celebrationEnabled
              ? 'bg-accent light:bg-accent-dark'
              : 'bg-tertiary/30 light:bg-tertiary-dark/30'
          }`}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{ left: celebrationEnabled ? 20 : 4 }}
            transition={{ type: 'spring', ...SPRING.default }}
          />
        </div>
      </motion.button>

      {/* Options (only visible when enabled) */}
      <AnimatePresence>
        {celebrationEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', ...SPRING.gentle }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-4">
              {/* Trigger Selector */}
              <div className="space-y-2">
                <span className="text-xs text-tertiary light:text-tertiary-dark">
                  Trigger
                </span>
                <div className="flex gap-2">
                  {TRIGGER_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setCelebrationTrigger(value)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        celebrationTrigger === value
                          ? 'bg-accent light:bg-accent-dark text-background light:text-background-light'
                          : 'bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity Selector */}
              <div className="space-y-2">
                <span className="text-xs text-tertiary light:text-tertiary-dark">
                  Intensity
                </span>
                <div className="flex gap-2">
                  {INTENSITY_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setCelebrationIntensity(value)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        celebrationIntensity === value
                          ? 'bg-accent light:bg-accent-dark text-background light:text-background-light'
                          : 'bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
