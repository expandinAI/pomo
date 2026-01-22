'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTimerSettingsContext } from '@/contexts/TimerSettingsContext';
import { PRESETS, getPresetLabel, type TimerPreset } from '@/styles/design-tokens';

interface PresetSelectorProps {
  disabled: boolean;
  onPresetChange?: (presetId: string) => void;
}

// Get preset info text (break duration)
function getPresetInfo(preset: TimerPreset): string {
  const breakMinutes = Math.floor(preset.durations.shortBreak / 60);
  return `${preset.name} \u00B7 ${breakMinutes}min Break`;
}

// Get accessible label with full info
function getPresetAriaLabel(preset: TimerPreset): string {
  const workMinutes = Math.floor(preset.durations.work / 60);
  const breakMinutes = Math.floor(preset.durations.shortBreak / 60);
  const longBreakMinutes = Math.floor(preset.durations.longBreak / 60);
  return `${preset.name}: ${workMinutes} minute work, ${breakMinutes} minute break, ${longBreakMinutes} minute long break after ${preset.sessionsUntilLong} sessions`;
}

export function PresetSelector({ disabled, onPresetChange }: PresetSelectorProps) {
  const { activePresetId, applyPreset, getActivePreset } = useTimerSettingsContext();
  const [isHovered, setIsHovered] = useState(false);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const presetIds = ['classic', 'deepWork', 'ultradian', 'custom'] as const;
  const activeIndex = presetIds.indexOf(activePresetId as typeof presetIds[number]);

  // Button width (w-16 = 64px) + gap (gap-1 = 4px)
  const buttonWidth = 64;
  const gap = 4;

  const handlePresetClick = (presetId: string) => {
    if (disabled) return;
    applyPreset(presetId);
    onPresetChange?.(presetId);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleTouchStart = () => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleTouchEnd = () => {
    touchTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 2000); // 2s visible after touch
  };

  const activePreset = getActivePreset();

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Preset info - absolutely positioned above tabs, no layout shift */}
      <AnimatePresence>
        {isHovered && (
          <motion.p
            key={activePresetId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm text-secondary light:text-secondary-dark whitespace-nowrap"
          >
            {getPresetInfo(activePreset)}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Preset tabs */}
      <div
        role="radiogroup"
        aria-label="Timer preset"
        className="relative z-20 flex items-center gap-1 p-1 rounded-xl bg-surface/40 light:bg-surface-dark/40 backdrop-blur-sm border border-white/[0.08] light:border-black/[0.05] shadow-lg"
      >
        {/* Animated highlight - positioned absolutely, moves only horizontally */}
        <motion.div
          className="absolute top-1 bottom-1 w-16 bg-tertiary/20 light:bg-tertiary-dark/20 rounded-md"
          animate={{ x: activeIndex * (buttonWidth + gap) }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          style={{ left: 4 }} // p-1 = 4px padding
          aria-hidden="true"
        />
        {presetIds.map((presetId) => {
          const preset = PRESETS[presetId];
          const isActive = activePresetId === presetId;

          return (
            <button
              key={presetId}
              role="radio"
              aria-checked={isActive}
              aria-label={getPresetAriaLabel(preset)}
              onClick={() => handlePresetClick(presetId)}
              disabled={disabled}
              title={preset.description}
              className={cn(
                'relative z-10 w-16 py-2 text-sm font-medium rounded-md text-center transition-colors duration-normal',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isActive
                  ? 'text-primary light:text-primary-dark'
                  : 'text-secondary light:text-secondary-dark hover:text-primary light:hover:text-primary-dark'
              )}
            >
              {getPresetLabel(preset)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
