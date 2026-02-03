'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, RefreshCw, Cloud } from 'lucide-react';
import { SPRING, PRESETS, getPresetLabel } from '@/styles/design-tokens';
import { useTimerSettingsContext, type TimerDurations } from '@/contexts/TimerSettingsContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useSettingsSyncActions } from '@/lib/sync';
import { SoundSettings } from './SoundSettings';
import { AmbientSettings } from './AmbientSettings';
import { VisualEffectsSettings } from './VisualEffectsSettings';
import { CustomPresetEditor } from './CustomPresetEditor';
import { WeekStartSetting } from './WeekStartSetting';
import { PrivacySettings } from './PrivacySettings';
import { OverflowSettings } from './OverflowSettings';
import { AutoStartSettings } from './AutoStartSettings';
import { EndTimeSettings } from './EndTimeSettings';
import { VisualTimerSettings } from './VisualTimerSettings';
import { CelebrationSettings } from './CelebrationSettings';
import { BreakBreathingSettings } from './BreakBreathingSettings';
import { WellbeingHintsSettings } from './WellbeingHintsSettings';
import { CoachSettings } from './CoachSettings';
import { DailyIntentionSettings } from './DailyIntentionSettings';
import { DeleteAccountModal } from './DeleteAccountModal';
import { exportAllData } from '@/lib/data-export';

interface TimerSettingsProps {
  onSettingsChange?: (durations: TimerDurations) => void;
  disabled?: boolean;
}

export function TimerSettings({ onSettingsChange, disabled }: TimerSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { durations, applyPreset, activePresetId, isLoaded, presets } = useTimerSettingsContext();
  const { pullNow, pushNow, isAvailable: isSyncAvailable } = useSettingsSyncActions();

  // Focus management refs
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap - focus the modal container itself to avoid visible ring on close button
  useFocusTrap(modalRef, isOpen, { initialFocusRef: modalRef });

  // Pull settings when modal opens
  useEffect(() => {
    if (isOpen && isSyncAvailable) {
      setIsSyncing(true);
      pullNow().finally(() => setIsSyncing(false));
    }
  }, [isOpen, isSyncAvailable, pullNow]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    if (!isSyncAvailable || isSyncing) return;
    setIsSyncing(true);
    await pullNow();
    setIsSyncing(false);
  }, [isSyncAvailable, isSyncing, pullNow]);

  // Close handler with push
  const handleClose = useCallback(async () => {
    if (isSyncAvailable) {
      await pushNow();
    }
    setIsOpen(false);
  }, [isSyncAvailable, pushNow]);

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
  // Skip if DeleteAccountModal is open (it handles its own Escape)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't handle Escape if DeleteAccountModal is open
      if (showDeleteModal) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        handleClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, handleClose, showDeleteModal]);

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
              onClick={handleClose}
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
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Close settings"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                  {/* ═══ Synced Settings Section ═══ */}
                  {isSyncAvailable ? (
                    <div className="rounded-xl border border-tertiary/20 light:border-tertiary-dark/20 bg-tertiary/5 light:bg-tertiary-dark/5 p-3 space-y-4">
                      {/* Section Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cloud className="w-3.5 h-3.5 text-tertiary light:text-tertiary-dark" />
                          <span className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
                            Synced across devices
                          </span>
                        </div>
                        <button
                          onClick={handleRefresh}
                          disabled={isSyncing}
                          className="p-1.5 rounded-md text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors disabled:opacity-50"
                          aria-label="Refresh synced settings"
                          title="Refresh from cloud"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

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

                      {/* Auto-Start Settings */}
                      <AutoStartSettings />
                    </div>
                  ) : (
                    /* Not logged in - show settings without sync container */
                    <>
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

                      {/* Auto-Start Settings */}
                      <AutoStartSettings />
                    </>
                  )}

                  {/* ═══ Device Settings Section ═══ */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
                      This Device Only
                    </span>
                  </div>

                  {/* Daily Intention Settings */}
                  <DailyIntentionSettings />

                  {/* End Time Preview Toggle */}
                  <EndTimeSettings />

                  {/* Visual Timer Toggle */}
                  <VisualTimerSettings />

                  {/* Celebration Settings */}
                  <CelebrationSettings />

                  {/* Break Breathing Settings */}
                  <BreakBreathingSettings />

                  {/* Wellbeing Hints Settings */}
                  <WellbeingHintsSettings />

                  {/* AI Coach Settings (Flow-only) */}
                  <CoachSettings />

                  {/* Sound Settings */}
                  <SoundSettings />

                  {/* Ambient Sound Settings */}
                  <AmbientSettings />

                  {/* Visual Effects Settings */}
                  <VisualEffectsSettings />

                  {/* Week Start Setting */}
                  <WeekStartSetting />

                  {/* ═══ Privacy Section ═══ */}
                  <div className="pt-4 mt-4 border-t border-tertiary/10 light:border-tertiary-dark/10">
                    <PrivacySettings onOpenDeleteModal={() => setShowDeleteModal(true)} />
                  </div>
                </div>

                {/* Footer hint */}
                <div className="px-4 py-3 border-t border-tertiary/10 light:border-tertiary-dark/10">
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

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onExportFirst={async () => {
          await exportAllData();
        }}
      />
    </div>
  );
}
