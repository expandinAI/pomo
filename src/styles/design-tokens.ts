/**
 * Design tokens for Particle
 * These values should match tailwind.config.js
 */

// Duration type for timer
export interface TimerDurations {
  work: number; // in seconds
  shortBreak: number;
  longBreak: number;
}

// Preset definition with all configuration
export interface TimerPreset {
  id: string;
  name: string;
  shortcut: string;
  durations: TimerDurations;
  sessionsUntilLong: number;
  description?: string;
}

// All available presets
export const PRESETS: Record<string, TimerPreset> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    shortcut: '1',
    durations: { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 },
    sessionsUntilLong: 4,
    description: 'Classic 25/5/15 technique',
  },
  deepWork: {
    id: 'deepWork',
    name: 'Deep Work',
    shortcut: '2',
    durations: { work: 52 * 60, shortBreak: 17 * 60, longBreak: 30 * 60 },
    sessionsUntilLong: 2,
    description: 'Based on DeskTime study: Top 10% work 52 min, break 17 min',
  },
  ultradian: {
    id: 'ultradian',
    name: '90-Min',
    shortcut: '3',
    durations: { work: 90 * 60, shortBreak: 20 * 60, longBreak: 30 * 60 },
    sessionsUntilLong: 2,
    description: "Based on Kleitman's Basic Rest-Activity Cycle",
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    shortcut: '4',
    durations: { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 },
    sessionsUntilLong: 4,
    description: 'Customize your own timer settings',
  },
} as const;

// Get preset display label (work duration in minutes)
export function getPresetLabel(preset: TimerPreset): string {
  const workMinutes = Math.floor(preset.durations.work / 60);
  return `${workMinutes}m`;
}

// Legacy: Duration presets in seconds (for backward compatibility)
export const TIMER_DURATIONS = PRESETS.classic.durations;

// Legacy: Number of sessions before a long break (for backward compatibility)
export const LONG_BREAK_INTERVAL = PRESETS.classic.sessionsUntilLong;

// Animation durations in milliseconds (snappier feel)
export const ANIMATION = {
  instant: 0,
  fast: 100,
  normal: 150,
  moderate: 200,
  slow: 300, // MAX for UI interactions
  breath: 1500, // Duration of one breath phase (in/out)
  celebration: 400,
} as const;

// Spring configurations for Framer Motion (snappier springs)
export const SPRING = {
  default: { stiffness: 500, damping: 30 },
  gentle: { stiffness: 400, damping: 35 },
  bouncy: { stiffness: 600, damping: 25 },
  snappy: { stiffness: 600, damping: 35 },
} as const;

// Micro-animation presets for premium feel (no `as const` for Framer Motion compatibility)
export const MICRO_ANIMATION = {
  // Subtle colon blink for timer tick (1 second cycle)
  colonBlink: {
    opacity: [1, 0.4, 1],
    transition: { duration: 1, ease: 'easeInOut' as const, repeat: Infinity },
  },
  // Celebration scale pulse
  celebrationPulse: {
    scale: [1, 1.02, 1],
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

// Colors (for use in JS/TS, e.g., Framer Motion) - Pure Monochrome
// Dark mode is the default/primary theme
export const COLORS = {
  // Dark is now the default (pure black immersive)
  dark: {
    background: '#000000',
    backgroundElevated: '#080808',
    surface: '#0C0C0C',
    border: '#1A1A1A',
    textPrimary: '#FAFAFA',
    textSecondary: '#808080',
    textTertiary: '#4A4A4A',
    accent: '#FFFFFF',
    accentHover: '#E5E5E5',
    accentSoft: 'rgba(255, 255, 255, 0.12)',
    accentGlow: 'rgba(255, 255, 255, 0.15)',
  },
  // Light mode is now the alternative theme
  light: {
    background: '#FAFAFA',
    backgroundElevated: '#FFFFFF',
    surface: '#F5F5F5',
    border: '#E5E5E5',
    textPrimary: '#171717',
    textSecondary: '#525252',
    textTertiary: '#A3A3A3',
    accent: '#171717',
    accentHover: '#000000',
    accentSoft: 'rgba(0, 0, 0, 0.08)',
    accentGlow: 'rgba(0, 0, 0, 0.08)',
  },
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  startPause: ' ', // Space
  reset: 'r',
  skip: 's',
  toggleMute: 'm',
  toggleDarkMode: 'd',
  showHelp: '?',
} as const;

// Session types
export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export const SESSION_LABELS: Record<SessionType, string> = {
  work: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
} as const;
