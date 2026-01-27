'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { SPRING, PRESETS, getPresetLabel } from '@/styles/design-tokens';
import { useTimerSettingsContext, type TimerDurations } from '@/contexts/TimerSettingsContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { SoundSettings } from './SoundSettings';
import { AmbientSettings } from './AmbientSettings';
import { VisualEffectsSettings } from './VisualEffectsSettings';
import { CustomPresetEditor } from './CustomPresetEditor';
import { WeekStartSetting } from './WeekStartSetting';
import { OverflowSettings } from './OverflowSettings';
import { AutoStartSettings } from './AutoStartSettings';
import { EndTimeSettings } from './EndTimeSettings';
import { VisualTimerSettings } from './VisualTimerSettings';
import { CelebrationSettings } from './CelebrationSettings';
import { BreakBreathingSettings } from './BreakBreathingSettings';
import { WellbeingHintsSettings } from './WellbeingHintsSettings';

interface TimerSettingsProps {
  onSettingsChange?: (durations: TimerDurations) => void;
  disabled?: boolean;
}

export function TimerSettings({ onSettingsChange, disabled }: TimerSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { durations, applyPreset, activePresetId, isLoaded, presets } = useTimerSettingsContext();

  // Focus management refs
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap - focus the modal container itself to avoid visible ring on close button
  useFocusTrap(modalRef, isOpen, { initialFocusRef: modalRef });

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

  // Close on Escape - stopImmediatePropagation prevents Timer from receiving the event
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  // Listen for custom event to open settings (from Cmd+, shortcut)
  useEffect(() => {
    function handleOpenSettings() {
      if (!disabled) {
        setIsOpen(true);
      }
    }

    window.addEventListener('particle:open-settings', handleOpenSettings);
    return () => window.removeEventListener('particle:open-settings', handleOpenSettings);
  }, [disabled]);


  // Preset order for display
  const presetIds = ['classic', 'deepWork', 'ultradian', 'custom'] as const;

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
              animate={{ opacity: 1, pointerEvents: 'auto' as const }}
              exit={{ opacity: 0, pointerEvents: 'none' as const }}
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
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
                className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden flex flex-col max-h-[85vh] focus:outline-none"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-tertiary/10 light:border-tertiary-dark/10">
                  <h2 id="settings-title" className="text-base font-semibold text-primary light:text-primary-dark">
                    Timer Settings
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Close settings"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                  {/* Presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
                      Timer Presets
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {presetIds.map((presetId) => {
                        const preset = PRESETS[presetId];
                        const isActive = activePresetId === presetId;
                        return (
                          <button
                            key={presetId}
                            onClick={() => applyPreset(presetId)}
                            className={`py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-accent light:bg-accent-dark text-background light:text-background-light'
                                : 'bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20'
                            }`}
                            title={preset.description}
                          >
                            {getPresetLabel(preset)}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-tertiary light:text-tertiary-dark">
                      {PRESETS[activePresetId]?.description || 'Select a preset'}
                    </p>
                  </div>

                  {/* Custom Preset Editor (only shows when custom is active) */}
                  <CustomPresetEditor />

                  {/* Overflow Mode Toggle */}
                  <OverflowSettings />

                  {/* End Time Preview Toggle */}
                  <EndTimeSettings />

                  {/* Visual Timer Toggle */}
                  <VisualTimerSettings />

                  {/* Auto-Start Settings */}
                  <AutoStartSettings />

                  {/* Celebration Settings */}
                  <CelebrationSettings />

                  {/* Break Breathing Settings */}
                  <BreakBreathingSettings />

                  {/* Wellbeing Hints Settings */}
                  <WellbeingHintsSettings />

                  {/* Sound Settings */}
                  <SoundSettings />

                  {/* Ambient Sound Settings */}
                  <AmbientSettings />

                  {/* Visual Effects Settings */}
                  <VisualEffectsSettings />

                  {/* Week Start Setting */}
                  <WeekStartSetting />
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
