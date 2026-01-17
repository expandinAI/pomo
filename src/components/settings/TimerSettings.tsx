'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useTimerSettings, TIMER_PRESETS, type TimerDurations } from '@/hooks/useTimerSettings';
import { SoundSettings } from './SoundSettings';
import { ThemeSettings } from './ThemeSettings';

interface TimerSettingsProps {
  onSettingsChange?: (durations: TimerDurations) => void;
  disabled?: boolean;
}

interface SliderRowProps {
  label: string;
  value: number; // in seconds
  min: number;
  max: number;
  onChange: (minutes: number) => void;
}

function SliderRow({ label, value, min, max, onChange }: SliderRowProps) {
  const minutes = Math.round(value / 60);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-secondary dark:text-secondary-dark">
          {label}
        </label>
        <span className="text-sm font-mono text-accent dark:text-accent-dark tabular-nums">
          {minutes} min
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={minutes}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-tertiary/20 dark:bg-tertiary-dark/20 rounded-full appearance-none cursor-pointer accent-accent dark:accent-accent-dark [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent dark:[&::-webkit-slider-thumb]:bg-accent-dark [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent dark:[&::-moz-range-thumb]:bg-accent-dark [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  );
}

export function TimerSettings({ onSettingsChange, disabled }: TimerSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { durations, updateDuration, applyPreset, currentPreset, isLoaded } = useTimerSettings();

  const toggleOpen = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  // Notify parent when settings change
  useEffect(() => {
    if (isLoaded && onSettingsChange) {
      onSettingsChange(durations);
    }
  }, [durations, isLoaded, onSettingsChange]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative">
      <motion.button
        onClick={toggleOpen}
        disabled={disabled}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-tertiary dark:text-tertiary-dark hover:text-secondary dark:hover:text-secondary-dark hover:bg-tertiary/10 dark:hover:bg-tertiary-dark/10 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Timer settings"
        aria-expanded={isOpen}
        whileHover={disabled ? {} : { scale: 1.05 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <Settings className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', ...SPRING.gentle }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm max-h-[85vh]"
            >
              <div className="bg-surface dark:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 dark:border-tertiary-dark/10 overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-tertiary/10 dark:border-tertiary-dark/10">
                  <h2 className="text-base font-semibold text-primary dark:text-primary-dark">
                    Timer Settings
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary dark:text-tertiary-dark hover:text-secondary dark:hover:text-secondary-dark hover:bg-tertiary/10 dark:hover:bg-tertiary-dark/10 transition-colors"
                    aria-label="Close settings"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-5 overflow-y-auto flex-1">
                  {/* Presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-tertiary dark:text-tertiary-dark uppercase tracking-wider">
                      Presets
                    </label>
                    <div className="flex gap-2">
                      {TIMER_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => applyPreset(preset.name)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            currentPreset === preset.name
                              ? 'bg-accent dark:bg-accent-dark text-white'
                              : 'bg-tertiary/10 dark:bg-tertiary-dark/10 text-secondary dark:text-secondary-dark hover:bg-tertiary/20 dark:hover:bg-tertiary-dark/20'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-4">
                    <SliderRow
                      label="Focus Session"
                      value={durations.work}
                      min={1}
                      max={90}
                      onChange={(mins) => updateDuration('work', mins)}
                    />
                    <SliderRow
                      label="Short Break"
                      value={durations.shortBreak}
                      min={1}
                      max={30}
                      onChange={(mins) => updateDuration('shortBreak', mins)}
                    />
                    <SliderRow
                      label="Long Break"
                      value={durations.longBreak}
                      min={1}
                      max={60}
                      onChange={(mins) => updateDuration('longBreak', mins)}
                    />
                  </div>

                  {/* Sound Settings */}
                  <SoundSettings />

                  {/* Theme Settings */}
                  <ThemeSettings />
                </div>

                {/* Footer hint */}
                <div className="px-4 pb-4">
                  <p className="text-xs text-center text-tertiary dark:text-tertiary-dark">
                    Settings are saved automatically
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
