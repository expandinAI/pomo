/**
 * Platform Detection Utilities
 * Handles OS-specific formatting for keyboard shortcuts
 */

/**
 * Check if the user is on macOS/iOS
 */
export function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

/**
 * Check if the user is on Windows
 */
export function isWindows(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Win/.test(navigator.platform);
}

/**
 * Format a keyboard shortcut for the current platform
 * Converts generic key names to platform-specific symbols
 *
 * @example
 * formatShortcut('Cmd+K') // Returns '⌘K' on Mac, 'Ctrl+K' on Windows/Linux
 */
export function formatShortcut(key: string): string {
  if (isMac()) {
    return key
      .replace(/Cmd\+?/g, '⌘')
      .replace(/Alt\+?/g, '⌥')
      .replace(/Shift\+?/g, '⇧')
      .replace(/Ctrl\+?/g, '⌃')
      .replace(/Enter/g, '↵')
      .replace(/Escape/g, '⎋');
  }

  // Windows/Linux - replace Cmd with Ctrl
  return key.replace(/Cmd/g, 'Ctrl');
}

/**
 * Get the modifier key name for the current platform
 * Returns 'Cmd' on Mac, 'Ctrl' on Windows/Linux
 */
export function getModifierKey(): string {
  return isMac() ? '⌘' : 'Ctrl';
}
