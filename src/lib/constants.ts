/**
 * Application constants
 */

// Local storage keys
export const STORAGE_KEYS = {
  theme: 'theme',
  completedPomodoros: 'completedPomodoros',
  settings: 'particleSettings',
} as const;

// Notification messages
export const NOTIFICATIONS = {
  workComplete: {
    title: 'Focus session complete!',
    body: 'Time for a break. Well done.',
  },
  shortBreakComplete: {
    title: 'Break is over',
    body: 'Ready to focus again?',
  },
  longBreakComplete: {
    title: 'Long break complete',
    body: 'Feeling refreshed? Let\'s go!',
  },
} as const;

// Tab title templates
export const TAB_TITLES = {
  idle: 'Particle - Focus Timer',
  running: (time: string, mode: string) => `${time} - ${mode} | Particle`,
  paused: (time: string, mode: string) => `⏸ ${time} - ${mode} | Particle`,
} as const;
