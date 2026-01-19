'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useTimerSettingsContext, TIMER_PRESETS, type TimerDurations } from '@/contexts/TimerSettingsContext';
import { SoundSettings } from './SoundSettings';
import { AmbientSettings } from './AmbientSettings';
import { VisualEffectsSettings } from './VisualEffectsSettings';

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
        <label className="text-sm font-medium text-secondary light:text-secondary-dark">
          {label}
        </label>
        <span className="text-sm font-mono text-accent light:text-accent-dark tabular-nums">
          {minutes} min
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={minutes}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-tertiary/20 light:bg-tertiary-dark/20 rounded-full appearance-none cursor-pointer accent-accent light:accent-accent-dark [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent light:[&::-webkit-slider-thumb]:bg-accent-dark [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent light:[&::-moz-range-thumb]:bg-accent-dark [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  );
}

export function TimerSettings({ onSettingsChange, disabled }: TimerSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { durations, updateDuration, applyPreset, currentPreset, isLoaded } = useTimerSettingsContext();

  // Focus management refs
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  // Listen for custom event to open settings (from Cmd+, shortcut)
  useEffect(() => {
    function handleOpenSettings() {
      if (!disabled) {
        setIsOpen(true);
      }
    }

    window.addEventListener('pomo:open-settings', handleOpenSettings);
    return () => window.removeEventListener('pomo:open-settings', handleOpenSettings);
  }, [disabled]);

  // Focus management: save focus on open, restore on close
  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus close button after modal animation
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else if (previousFocusRef.current) {
      // Restore focus when closing
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // Focus trap within modal
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
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
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {/* Modal Backdrop + Container */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 light:bg-black/40"
              onClick={() => setIsOpen(false)}
            >
              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: 'spring', ...SPRING.gentle }}
                className="w-[90vw] max-w-sm max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
              >
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
                className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden flex flex-col max-h-[85vh]"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-tertiary/10 light:border-tertiary-dark/10">
                  <h2 id="settings-title" className="text-base font-semibold text-primary light:text-primary-dark">
                    Timer Settings
                  </h2>
                  <button
                    ref={closeButtonRef}
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Close settings"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-5 overflow-y-auto flex-1">
                  {/* Presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
                      Presets
                    </label>
                    <div className="flex gap-2">
                      {TIMER_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => applyPreset(preset.name)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            currentPreset === preset.name
                              ? 'bg-accent light:bg-accent-dark text-background light:text-background-light'
                              : 'bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20'
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

                  {/* Ambient Sound Settings */}
                  <AmbientSettings />

                  {/* Visual Effects Settings */}
                  <VisualEffectsSettings />
                </div>

                {/* Footer hint */}
                <div className="px-4 pb-4">
                  <p className="text-xs text-center text-tertiary light:text-tertiary-dark">
                    Settings are saved automatically
                  </p>
                </div>
              </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
