'use client';

import { FastForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimerSettingsContext, type AutoStartDelay, type AutoStartMode } from '@/contexts/TimerSettingsContext';
import { SPRING } from '@/styles/design-tokens';

const DELAY_OPTIONS: { value: AutoStartDelay; label: string }[] = [
  { value: 3, label: '3s' },
  { value: 5, label: '5s' },
  { value: 10, label: '10s' },
];

const MODE_OPTIONS: { value: AutoStartMode; label: string; description: string }[] = [
  { value: 'all', label: 'All', description: 'After every session' },
  { value: 'breaks-only', label: 'Breaks only', description: 'Only after work sessions' },
];

export function AutoStartSettings() {
  const { autoStartEnabled, setAutoStartEnabled, autoStartDelay, setAutoStartDelay, autoStartMode, setAutoStartMode } = useTimerSettingsContext();

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
        Auto-Start
      </label>
      <motion.button
        onClick={() => setAutoStartEnabled(!autoStartEnabled)}
        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
          autoStartEnabled
            ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
            : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
        }`}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <div className="flex items-center gap-3">
          <FastForward
            className={`w-4 h-4 ${
              autoStartEnabled
                ? 'text-accent light:text-accent-dark'
                : 'text-tertiary light:text-tertiary-dark'
            }`}
          />
          <div className="text-left">
            <p
              className={`text-sm font-medium ${
                autoStartEnabled
                  ? 'text-accent light:text-accent-dark'
                  : 'text-secondary light:text-secondary-dark'
              }`}
            >
              Auto-Start Next
            </p>
            <p className="text-xs text-tertiary light:text-tertiary-dark">
              Automatically start the next session
            </p>
          </div>
        </div>
        {/* Toggle Switch */}
        <div
          className={`relative w-10 h-6 rounded-full transition-colors ${
            autoStartEnabled
              ? 'bg-accent light:bg-accent-dark'
              : 'bg-tertiary/30 light:bg-tertiary-dark/30'
          }`}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{ left: autoStartEnabled ? 20 : 4 }}
            transition={{ type: 'spring', ...SPRING.default }}
          />
        </div>
      </motion.button>

      {/* Options (only visible when enabled) */}
      <AnimatePresence>
        {autoStartEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', ...SPRING.gentle }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-4">
              {/* Mode Selector */}
              <div className="space-y-2">
                <span className="text-xs text-tertiary light:text-tertiary-dark">
                  Start automatically
                </span>
                <div className="flex gap-2">
                  {MODE_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setAutoStartMode(value)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        autoStartMode === value
                          ? 'bg-accent light:bg-accent-dark text-background light:text-background-light'
                          : 'bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Countdown Duration Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-tertiary light:text-tertiary-dark">
                    Countdown Duration
                  </span>
                  <span className="text-xs text-tertiary light:text-tertiary-dark">
                    Shift+A to toggle
                  </span>
                </div>
                <div className="flex gap-2">
                  {DELAY_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setAutoStartDelay(value)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        autoStartDelay === value
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
