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

// Animation durations in milliseconds
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  breath: 1500, // Duration of one breath phase (in/out)
  celebration: 600,
} as const;

// Spring configurations for Framer Motion
export const SPRING = {
  default: { stiffness: 400, damping: 30 },
  gentle: { stiffness: 300, damping: 40 },
  bouncy: { stiffness: 500, damping: 25 },
  snappy: { stiffness: 500, damping: 35 },
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

// Colors (for use in JS/TS, e.g., Framer Motion)
export const COLORS = {
  light: {
    background: '#FAFAF9',
    surface: '#FFFFFF',
    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    textTertiary: '#A8A29E',
    accent: '#0D9488',
    accentSoft: '#CCFBF1',
  },
  dark: {
    background: '#0C0A09',
    surface: '#1C1917',
    textPrimary: '#FAFAF9',
    textSecondary: '#A8A29E',
    textTertiary: '#78716C',
    accent: '#2DD4BF',
    accentSoft: '#134E4A',
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
