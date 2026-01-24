import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format seconds to MM:SS display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to human readable (e.g., "25 min")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) {
    return `${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMins}m`;
}

/**
 * Check if the browser supports notifications
 */
export function supportsNotifications(): boolean {
  return 'Notification' in window;
}

/**
 * Check if the browser supports wake lock
 */
export function supportsWakeLock(): boolean {
  return 'wakeLock' in navigator;
}

/**
 * Check if the user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if the user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Format end time for display (e.g., "Endet um 14:30" or "Im Flow seit 14:07")
 */
export function formatEndTime(
  secondsRemaining: number,
  isOverflow: boolean = false,
  sessionType: 'work' | 'shortBreak' | 'longBreak' = 'work'
): string {
  const targetDate = isOverflow
    ? new Date(Date.now() - secondsRemaining * 1000) // When timer hit 0
    : new Date(Date.now() + secondsRemaining * 1000); // When timer will end

  const now = new Date();
  const isToday = targetDate.toDateString() === now.toDateString();

  const timeStr = targetDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isBreak = sessionType === 'shortBreak' || sessionType === 'longBreak';

  if (isOverflow) {
    return isBreak ? `Pause seit ${timeStr}` : `Im Flow seit ${timeStr}`;
  }

  return isToday ? `Endet um ${timeStr}` : `Endet morgen um ${timeStr}`;
}
