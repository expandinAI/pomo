/**
 * Application constants
 */

// Local storage keys
export const STORAGE_KEYS = {
  theme: 'theme',
  completedPomodoros: 'completedPomodoros',
  settings: 'pomoSettings',
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
  idle: 'Pomo - Focus Timer',
  running: (time: string, mode: string) => `${time} - ${mode} | Pomo`,
  paused: (time: string, mode: string) => `⏸ ${time} - ${mode} | Pomo`,
} as const;
