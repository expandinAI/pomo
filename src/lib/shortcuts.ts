/**
 * Keyboard Shortcuts Registry
 * Central source of truth for all keyboard shortcuts in the app
 */

export type ShortcutCategory = 'timer' | 'projects' | 'navigation' | 'general';

export interface Shortcut {
  key: string;
  description: string;
  category: ShortcutCategory;
}

/**
 * All available keyboard shortcuts
 * Organized by category for display in help modal
 */
export const SHORTCUTS: Shortcut[] = [
  // Timer shortcuts
  { key: 'Space', description: 'Start / Pause timer', category: 'timer' },
  { key: 'R', description: 'Reset timer', category: 'timer' },
  { key: 'S', description: 'Skip to next session', category: 'timer' },
  { key: 'E', description: 'End session early', category: 'timer' },
  { key: 'T', description: 'Focus task input', category: 'timer' },
  { key: '↑', description: '+1 minute (paused)', category: 'timer' },
  { key: '↓', description: '-1 minute (paused)', category: 'timer' },
  { key: 'Shift+↑', description: '+5 minutes (paused)', category: 'timer' },
  { key: 'Shift+↓', description: '-5 minutes (paused)', category: 'timer' },
  { key: '1', description: 'Pomodoro preset', category: 'timer' },
  { key: '2', description: 'Deep Work preset', category: 'timer' },
  { key: '3', description: 'Ultradian preset', category: 'timer' },
  { key: '4', description: 'Custom preset', category: 'timer' },

  // Project shortcuts
  { key: 'P', description: 'Open project selector', category: 'projects' },
  { key: 'P 1-9', description: 'Select recent project', category: 'projects' },
  { key: 'P 0', description: 'Select "No Project"', category: 'projects' },
  { key: 'N', description: 'New project (in Projects)', category: 'projects' },
  { key: 'E', description: 'Edit project', category: 'projects' },
  { key: 'A', description: 'Archive project', category: 'projects' },
  { key: 'J / K', description: 'Navigate project list', category: 'projects' },

  // Navigation shortcuts
  { key: 'G T', description: 'Go to Timer', category: 'navigation' },
  { key: 'G S', description: 'Open Statistics', category: 'navigation' },
  { key: 'G H', description: 'Open History', category: 'navigation' },
  { key: 'G P', description: 'Go to Projects', category: 'navigation' },
  { key: 'G Y', description: 'Open Year View', category: 'navigation' },
  { key: 'G ,', description: 'Open Settings', category: 'navigation' },

  // General shortcuts
  { key: 'Cmd+K', description: 'Command palette', category: 'general' },
  { key: 'Cmd+,', description: 'Open settings', category: 'general' },
  { key: '?', description: 'Keyboard shortcuts', category: 'general' },
  { key: 'D', description: 'Toggle dark mode', category: 'general' },
  { key: 'M', description: 'Mute / Unmute', category: 'general' },
  { key: 'A', description: 'Cycle ambient sound', category: 'general' },
  { key: 'Esc', description: 'Close modal', category: 'general' },
];

/**
 * Category labels for display
 */
export const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  timer: 'Timer',
  projects: 'Projects',
  navigation: 'Navigation',
  general: 'General',
};

/**
 * Category display order
 */
export const CATEGORY_ORDER: ShortcutCategory[] = ['timer', 'projects', 'navigation', 'general'];

/**
 * Get shortcuts grouped by category
 */
export function getShortcutsByCategory(): Map<ShortcutCategory, Shortcut[]> {
  const grouped = new Map<ShortcutCategory, Shortcut[]>();

  for (const category of CATEGORY_ORDER) {
    grouped.set(
      category,
      SHORTCUTS.filter((s) => s.category === category)
    );
  }

  return grouped;
}

/**
 * Search shortcuts by key or description
 */
export function searchShortcuts(query: string): Shortcut[] {
  if (!query.trim()) return SHORTCUTS;

  const normalizedQuery = query.toLowerCase().trim();

  return SHORTCUTS.filter(
    (shortcut) =>
      shortcut.key.toLowerCase().includes(normalizedQuery) ||
      shortcut.description.toLowerCase().includes(normalizedQuery)
  );
}
