/**
 * Session Quality — Subtle quality labels for completed sessions
 *
 * Pure function, no React/UI imports.
 * Icon mapping happens at render sites (Flame, Zap, Trophy from lucide-react).
 */

export type SessionQuality = 'deep_work' | 'quick_focus' | 'overflow_champion';

export interface SessionQualityInfo {
  type: SessionQuality;
  label: string;
}

const DEEP_WORK_THRESHOLD = 2700; // 45 min in seconds
const QUICK_FOCUS_THRESHOLD = 900; // 15 min in seconds
const OVERFLOW_CHAMPION_RATIO = 1.5; // 150% of planned

/**
 * Determine the quality label for a session.
 *
 * Priority: Overflow Champion > Deep Work > Quick Focus
 *
 * @param duration — actual session duration in seconds
 * @param estimatedDuration — planned duration in seconds (optional)
 * @param overflowDuration — overflow time in seconds (optional)
 * @returns quality info or null if no label applies
 */
export function getSessionQuality(
  duration: number,
  estimatedDuration?: number,
  overflowDuration?: number,
): SessionQualityInfo | null {
  // Priority 1: Overflow Champion
  if (
    overflowDuration &&
    overflowDuration > 0 &&
    estimatedDuration &&
    duration > estimatedDuration * OVERFLOW_CHAMPION_RATIO
  ) {
    return { type: 'overflow_champion', label: 'Overflow Champion' };
  }

  // Priority 2: Deep Work
  if (duration >= DEEP_WORK_THRESHOLD) {
    return { type: 'deep_work', label: 'Deep Work' };
  }

  // Priority 3: Quick Focus
  if (duration < QUICK_FOCUS_THRESHOLD) {
    return { type: 'quick_focus', label: 'Quick Focus' };
  }

  return null;
}
