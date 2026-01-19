/**
 * Design tokens for Pomo
 * These values should match tailwind.config.js
 */

// Duration presets in seconds
export const TIMER_DURATIONS = {
  work: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
} as const;

// Number of pomodoros before a long break
export const LONG_BREAK_INTERVAL = 4;

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

// Colors (for use in JS/TS, e.g., Framer Motion) - Monochrome + Blue accent
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
    accent: '#4F6EF7',
    accentHover: '#6B85F9',
    accentSoft: 'rgba(79, 110, 247, 0.15)',
    accentGlow: 'rgba(79, 110, 247, 0.2)',
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
    accent: '#4F6EF7',
    accentHover: '#3B5BDB',
    accentSoft: 'rgba(79, 110, 247, 0.1)',
    accentGlow: 'rgba(79, 110, 247, 0.1)',
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
