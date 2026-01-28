'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SPRING, type SessionType } from '@/styles/design-tokens';
import type { TimerDurations } from '@/contexts/TimerSettingsContext';
import { type SessionFeedback, formatFeedbackMessage } from '@/lib/session-feedback';

interface StatusMessageProps {
  message: string | null;
  autoStartCountdown?: number | null;
  nextMode?: string;
  /** Currently hovered preset (for description display) */
  hoveredPresetId?: string | null;
  /** Timer durations for contextual display */
  durations?: TimerDurations;
  /** Whether timer is currently running */
  isRunning?: boolean;
  /** Current session mode */
  mode?: SessionType;
  /** Whether collapsed view is being hovered (shows session info) */
  isCollapsedHovered?: boolean;
  /** Whether the next break will be a long break */
  nextBreakIsLong?: boolean;
  /** Session feedback after completion (kontextueller Moment) */
  sessionFeedback?: SessionFeedback | null;
  /** End time preview (when setting enabled and timer running) */
  endTimePreview?: string | null;
  /** Wellbeing hint to display during breaks (lowest priority) */
  wellbeingHint?: string | null;
  /** Currently hovered mode indicator (overflow/autoStart) */
  hoveredModeIndicator?: 'overflow' | 'autoStart' | null;
  /** Whether overflow mode is enabled */
  overflowEnabled?: boolean;
  /** Whether auto-start is enabled */
  autoStartEnabled?: boolean;
}

/** Preset descriptions with philosophy */
const PRESET_DESCRIPTIONS: Record<string, string> = {
  classic: 'The original Pomodoro · 25 min focus, 5 or 15 min break · Perfect for getting started',
  deepWork: 'Based on DeskTime research · 52 min focus, 17 or 30 min break · For demanding tasks',
  ultradian: 'Ultradian rhythm · 90 min deep sessions, 20 or 30 min break · Matches your natural cycles',
  custom: 'Your personal rhythm · Adjust in settings',
};

/** Mode indicator descriptions */
const MODE_INDICATOR_DESCRIPTIONS = {
  overflow: {
    enabled: 'Overflow Mode · Timer continues past zero · Press Enter when ready',
    disabled: 'Overflow Mode is off · Timer stops at zero',
  },
  autoStart: {
    enabled: 'Auto Start · Next session begins automatically after countdown',
    disabled: 'Auto Start is off · You control when to begin',
  },
};

/**
 * Fixed-position status message slot at the bottom of the screen.
 * Displays transient messages like "Well done!" or "Skipped to Focus".
 *
 * Design principles:
 * - No layout shifts (fixed positioning)
 * - Smooth fade in/out animations
 * - CONSISTENT: Always same color, same font, same brightness
 * - Auto-start countdown: gentle breathing animation
 * - Contextual: Shows preset descriptions on hover, session info when running
 */
export function StatusMessage({
  message,
  autoStartCountdown,
  nextMode,
  hoveredPresetId,
  durations,
  isRunning,
  mode,
  isCollapsedHovered,
  nextBreakIsLong,
  sessionFeedback,
  endTimePreview,
  wellbeingHint,
  hoveredModeIndicator,
  overflowEnabled,
  autoStartEnabled,
}: StatusMessageProps) {
  // Check if countdown is active (must be > 0, not just truthy)
  const isCountdownActive = typeof autoStartCountdown === 'number' && autoStartCountdown > 0;

  /**
   * Get display message with priority:
   * 1. Auto-Start Countdown (highest priority)
   * 2. Explicit message (toast, celebration, skip, etc.)
   * 3. Session Feedback (kontextueller Moment after completion)
   * 4. Mode indicator hover (overflow/autoStart icons)
   * 5. Preset hover (only when idle)
   * 6. Session status (when running)
   * 7. End time preview
   * 8. Wellbeing hint (lowest priority)
   */
  function getDisplayMessage(): string | null {
    // 1. Auto-start countdown (highest priority)
    if (isCountdownActive) {
      return `${nextMode || 'Next'} in ${autoStartCountdown} · Space to cancel`;
    }

    // 2. Explicit message (toast, celebration, skip, particle hover, etc.)
    if (message) {
      return message;
    }

    // 3. Session Feedback (kontextueller Moment after completion)
    if (sessionFeedback) {
      return formatFeedbackMessage(sessionFeedback);
    }

    // 4. Mode indicator hover (overflow/autoStart icons)
    if (hoveredModeIndicator) {
      const isEnabled = hoveredModeIndicator === 'overflow' ? overflowEnabled : autoStartEnabled;
      return MODE_INDICATOR_DESCRIPTIONS[hoveredModeIndicator][isEnabled ? 'enabled' : 'disabled'];
    }

    // 5. Preset hover (only when idle)
    if (hoveredPresetId && !isRunning) {
      return PRESET_DESCRIPTIONS[hoveredPresetId] || null;
    }

    // 6. Session status (only when hovering collapsed view)
    if (isCollapsedHovered && isRunning && durations && mode) {
      if (mode === 'work') {
        const workMin = Math.floor(durations.work / 60);
        const breakType = nextBreakIsLong ? 'long break' : 'short break';
        const breakMin = nextBreakIsLong
          ? Math.floor(durations.longBreak / 60)
          : Math.floor(durations.shortBreak / 60);
        return `${workMin} min focus · ${breakMin} min ${breakType} after`;
      } else {
        const breakType = mode === 'shortBreak' ? 'Short break' : 'Long break';
        const breakMin = Math.floor(durations[mode] / 60);
        return `${breakType} · ${breakMin} min to recharge`;
      }
    }

    // 7. End Time Preview (when setting enabled and timer running)
    if (endTimePreview) {
      return endTimePreview;
    }

    // 8. Wellbeing Hint (only during break, lowest priority)
    if (wellbeingHint) {
      return wellbeingHint;
    }

    return null;
  }

  const displayMessage = getDisplayMessage();

  // For countdown: stable key so text updates in place without re-animation
  // For regular messages: key changes to trigger enter/exit animation
  const messageKey = isCountdownActive
    ? 'countdown-active'
    : `message-${displayMessage}`;

  return (
    <div
      className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-40"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait">
        {displayMessage && (
          <motion.p
            key={messageKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{
              type: 'spring',
              ...SPRING.gentle,
              opacity: { duration: 0.2 }
            }}
            className="text-sm text-secondary light:text-secondary-dark"
          >
            {displayMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
