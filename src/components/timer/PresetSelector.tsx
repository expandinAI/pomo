'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FastForward, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimerSettingsContext, type TimerDurations } from '@/contexts/TimerSettingsContext';
import { PRESETS, getPresetLabel, SPRING, type TimerPreset, type SessionType } from '@/styles/design-tokens';

interface PresetSelectorProps {
  disabled: boolean;
  onPresetChange?: (presetId: string) => void;
  isSessionActive?: boolean;
  currentMode?: SessionType;
  durations?: TimerDurations;
  nextBreakIsLong?: boolean;
  /** Override work duration from smart input (e.g., "Meeting 30") */
  overrideWorkDuration?: number | null;
  /** Whether auto-start is enabled (shows visual indicator) */
  autoStartEnabled?: boolean;
  /** Whether overflow mode is enabled (shows visual indicator) */
  overflowEnabled?: boolean;
  /** Callback when hovering over a preset (only when idle) */
  onPresetHover?: (presetId: string | null) => void;
  /** Callback when hovering over collapsed view (during active session) */
  onCollapsedHover?: (isHovered: boolean) => void;
}

// Get preset info text (work + break duration)
function getPresetInfo(preset: TimerPreset): string {
  const workMinutes = Math.floor(preset.durations.work / 60);
  const breakMinutes = Math.floor(preset.durations.shortBreak / 60);
  return `${preset.name} · ${workMinutes}m Work · ${breakMinutes}m Break`;
}

// Get accessible label with full info
function getPresetAriaLabel(preset: TimerPreset): string {
  const workMinutes = Math.floor(preset.durations.work / 60);
  const breakMinutes = Math.floor(preset.durations.shortBreak / 60);
  const longBreakMinutes = Math.floor(preset.durations.longBreak / 60);
  return `${preset.name}: ${workMinutes} minute work, ${breakMinutes} minute break, ${longBreakMinutes} minute long break after ${preset.sessionsUntilLong} sessions`;
}

// Collapsed view shown during active sessions
function CollapsedPresetView({
  currentMode,
  durations,
  nextBreakIsLong,
  overrideWorkDuration,
  autoStartEnabled,
  overflowEnabled,
}: {
  currentMode: SessionType;
  durations: TimerDurations;
  nextBreakIsLong?: boolean;
  overrideWorkDuration?: number | null;
  autoStartEnabled?: boolean;
  overflowEnabled?: boolean;
}) {
  const isWork = currentMode === 'work';
  // Use override duration if set (from smart input), otherwise use preset
  const workMinutes = overrideWorkDuration
    ? Math.floor(overrideWorkDuration / 60)
    : Math.floor(durations.work / 60);

  // Determine break duration and label based on current mode and next break type
  let breakMinutes: number;
  let breakLabel: string;

  if (currentMode === 'longBreak') {
    breakMinutes = Math.floor(durations.longBreak / 60);
    breakLabel = 'Long Break';
  } else if (currentMode === 'shortBreak') {
    breakMinutes = Math.floor(durations.shortBreak / 60);
    breakLabel = 'Break';
  } else {
    // Work mode - show what the NEXT break will be
    if (nextBreakIsLong) {
      breakMinutes = Math.floor(durations.longBreak / 60);
      breakLabel = 'Long Break';
    } else {
      breakMinutes = Math.floor(durations.shortBreak / 60);
      breakLabel = 'Break';
    }
  }

  return (
    <div
      className="relative z-20 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface/40 light:bg-surface-dark/40 backdrop-blur-sm border border-white/[0.08] light:border-black/[0.05] shadow-lg text-sm font-medium"
      role="status"
      aria-live="polite"
    >
      {isWork ? (
        <>
          <span className="text-primary light:text-primary-dark">{workMinutes}m Work</span>
          <span className="text-tertiary light:text-tertiary-dark mx-2">→</span>
          <span className="text-tertiary light:text-tertiary-dark">{breakMinutes}m {breakLabel}</span>
        </>
      ) : (
        <>
          <span className="text-primary light:text-primary-dark">{breakMinutes}m {breakLabel}</span>
          <span className="text-tertiary light:text-tertiary-dark mx-2">→</span>
          <span className="text-tertiary light:text-tertiary-dark">{workMinutes}m Work</span>
        </>
      )}
      {/* Mode indicators */}
      {(overflowEnabled || autoStartEnabled) && (
        <div className="flex items-center gap-1 ml-1">
          {overflowEnabled && (
            <Timer
              className="w-3 h-3 text-tertiary light:text-tertiary-dark"
              aria-label="Overflow mode enabled"
            />
          )}
          {autoStartEnabled && (
            <FastForward
              className="w-3 h-3 text-tertiary light:text-tertiary-dark"
              aria-label="Auto-start enabled"
            />
          )}
        </div>
      )}
    </div>
  );
}

export function PresetSelector({ disabled, onPresetChange, isSessionActive, currentMode, durations: propDurations, nextBreakIsLong, overrideWorkDuration, autoStartEnabled, overflowEnabled, onPresetHover, onCollapsedHover }: PresetSelectorProps) {
  const { activePresetId, applyPreset, getActivePreset, customDurations, customSessionsUntilLong } = useTimerSettingsContext();

  // Build a virtual custom preset with actual custom values (not dependent on active preset)
  const customPreset: TimerPreset = {
    ...PRESETS.custom,
    durations: customDurations,
    sessionsUntilLong: customSessionsUntilLong,
  };
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredPresetId, setHoveredPresetId] = useState<string | null>(null);
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
    setHoveredPresetId(null);
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

  // Use durations from props if provided, otherwise fall back to active preset
  const effectiveDurations = propDurations || activePreset.durations;

  // Show info for hovered preset, or active preset if nothing hovered
  // For custom preset, always use actual custom values (not dependent on active preset)
  const displayPreset = hoveredPresetId
    ? (hoveredPresetId === 'custom' ? customPreset : PRESETS[hoveredPresetId as keyof typeof PRESETS])
    : activePreset;

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Preset info - only show when expanded and hovered */}
      <AnimatePresence>
        {!isSessionActive && isHovered && (
          <motion.div
            key={hoveredPresetId || activePresetId}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-6 inset-x-0 flex justify-center"
          >
            <span className="text-sm text-secondary light:text-secondary-dark whitespace-nowrap">
              {getPresetInfo(displayPreset)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated switch between collapsed and expanded views */}
      <AnimatePresence mode="wait">
        {isSessionActive && currentMode ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{
              type: 'spring',
              ...SPRING.bouncy,
              opacity: { duration: 0.2 }
            }}
            onMouseEnter={() => onCollapsedHover?.(true)}
            onMouseLeave={() => onCollapsedHover?.(false)}
          >
            <CollapsedPresetView
              currentMode={currentMode}
              durations={effectiveDurations}
              nextBreakIsLong={nextBreakIsLong}
              overrideWorkDuration={overrideWorkDuration}
              autoStartEnabled={autoStartEnabled}
              overflowEnabled={overflowEnabled}
            />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{
              type: 'spring',
              ...SPRING.bouncy,
              opacity: { duration: 0.2 }
            }}
          >
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
                // For custom preset, use the actual custom values (not dependent on active preset)
                const preset = presetId === 'custom' ? customPreset : PRESETS[presetId];
                const isActive = activePresetId === presetId;

                return (
                  <button
                    key={presetId}
                    role="radio"
                    aria-checked={isActive}
                    aria-label={getPresetAriaLabel(preset)}
                    onClick={() => handlePresetClick(presetId)}
                    onMouseEnter={() => {
                      setHoveredPresetId(presetId);
                      if (!isSessionActive) {
                        onPresetHover?.(presetId);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredPresetId(null);
                      if (!isSessionActive) {
                        onPresetHover?.(null);
                      }
                    }}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
