/**
 * Nudge generator for Session Start Nudge (POMO-380)
 *
 * Pure functions that generate personalized one-liners shown
 * below the start button when the timer is idle.
 * No React dependencies — fully unit-testable.
 */

import type { DBSession } from '@/lib/db/types';
import type { DetectedPattern } from './types';

// ============================================
// Types
// ============================================

export type NudgeType =
  | 'intention'
  | 'time_peak'
  | 'project_strength'
  | 'progress_context'
  | 'task_continuity'
  | 'gentle_reminder';

export interface NudgeResult {
  text: string;
  type: NudgeType;
}

export interface NudgeContext {
  selectedProjectId: string | null;
  selectedProjectName: string | null;
  currentTask: string;
  todayWorkCount: number;
  averagePerActiveDay: number | null; // null when < 7 active days
  currentHour: number; // 0-23
  currentDayOfWeek: number; // 0=Sun...6=Sat
  patterns: DetectedPattern[];
  intentionText: string | null;
  allWorkSessions: DBSession[]; // last 30 days, work only
  activeProjects: Array<{ id: string; name: string }>;
  totalWorkSessionCount: number;
}

// ============================================
// Constants
// ============================================

const MIN_SESSIONS_FOR_NUDGE = 10;
const PEAK_THRESHOLD = 1.5;

// ============================================
// Core Function
// ============================================

/**
 * Generate a contextual nudge based on user data.
 * Returns null if not enough data or no nudge fits.
 * Priority chain: Intention > Time Peak > Project Strength >
 *                 Progress Context > Task Continuity > Gentle Reminder
 */
export function generateNudge(ctx: NudgeContext): NudgeResult | null {
  if (ctx.totalWorkSessionCount < MIN_SESSIONS_FOR_NUDGE) return null;

  return (
    tryIntentionNudge(ctx) ??
    tryTimePeakNudge(ctx) ??
    tryProjectStrengthNudge(ctx) ??
    tryProgressContextNudge(ctx) ??
    tryTaskContinuityNudge(ctx) ??
    tryGentleReminderNudge(ctx) ??
    null
  );
}

// ============================================
// Nudge Generators (priority order)
// ============================================

/**
 * 1. Intention — show today's intention if set
 */
function tryIntentionNudge(ctx: NudgeContext): NudgeResult | null {
  if (!ctx.intentionText) return null;

  return {
    text: `Aligned with: ${truncate(ctx.intentionText, 30)}`,
    type: 'intention',
  };
}

/**
 * 2. Time Peak — current hour falls within detected peak window
 */
function tryTimePeakNudge(ctx: NudgeContext): NudgeResult | null {
  const peak = detectPeakHours(ctx.allWorkSessions);
  if (!peak) return null;

  // Check if current hour is within peak ±1h
  if (ctx.currentHour < peak.startHour - 1 || ctx.currentHour > peak.endHour) {
    return null;
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[ctx.currentDayOfWeek];

  return {
    text: `${dayName} ${formatHourShort(ctx.currentHour)} — your peak focus window.`,
    type: 'time_peak',
  };
}

/**
 * 3. Project Strength — selected project matches project_focus pattern
 */
function tryProjectStrengthNudge(ctx: NudgeContext): NudgeResult | null {
  if (!ctx.selectedProjectId || !ctx.selectedProjectName) return null;

  const projectPattern = ctx.patterns.find((p) => p.type === 'project_focus');
  if (!projectPattern) return null;

  // Check if the pattern description mentions the selected project name
  if (!projectPattern.description.includes(ctx.selectedProjectName)) return null;

  return {
    text: `${truncate(ctx.selectedProjectName, 20)} — you're strongest here.`,
    type: 'project_strength',
  };
}

/**
 * 4. Progress Context — today's count vs average
 */
function tryProgressContextNudge(ctx: NudgeContext): NudgeResult | null {
  if (ctx.averagePerActiveDay === null) return null;

  const nextParticle = ctx.todayWorkCount + 1;
  const avg = Math.round(ctx.averagePerActiveDay);

  return {
    text: `Particle #${nextParticle} today. Your average is ${avg}.`,
    type: 'progress_context',
  };
}

/**
 * 5. Task Continuity — current task matches a recent session's task
 */
function tryTaskContinuityNudge(ctx: NudgeContext): NudgeResult | null {
  if (!ctx.currentTask) return null;

  const taskLower = ctx.currentTask.toLowerCase().trim();
  if (!taskLower) return null;

  // Find most recent session with a matching task
  for (const session of ctx.allWorkSessions) {
    if (!session.task) continue;

    if (session.task.toLowerCase().trim() === taskLower) {
      const durationMin = Math.round(session.duration / 60);
      return {
        text: `${truncate(ctx.currentTask, 20)} — last session was ${durationMin} minutes.`,
        type: 'task_continuity',
      };
    }
  }

  return null;
}

/**
 * 6. Gentle Reminder — project untouched for 10+ days (NOT the selected project)
 */
function tryGentleReminderNudge(ctx: NudgeContext): NudgeResult | null {
  const now = Date.now();
  const tenDaysMs = 10 * 24 * 60 * 60 * 1000;

  for (const project of ctx.activeProjects) {
    // Skip the currently selected project
    if (project.id === ctx.selectedProjectId) continue;

    // Find last session for this project
    const lastSession = ctx.allWorkSessions.find(
      (s) => s.projectId === project.id
    );

    if (!lastSession) continue;

    const lastDate = new Date(lastSession.completedAt).getTime();
    const daysSince = Math.floor((now - lastDate) / (24 * 60 * 60 * 1000));

    if (now - lastDate >= tenDaysMs) {
      return {
        text: `${truncate(project.name, 20)} — untouched for ${daysSince} days.`,
        type: 'gentle_reminder',
      };
    }
  }

  return null;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Truncate text with ellipsis if longer than maxLength
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

/**
 * Format hour as short string: 9 → "9am", 14 → "2pm"
 */
function formatHourShort(hour: number): string {
  if (hour === 0 || hour === 24) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

/**
 * Detect peak focus hours from session data.
 * Returns the best contiguous range of hours that are
 * significantly above average, or null if no clear peak.
 */
export function detectPeakHours(
  sessions: DBSession[]
): { startHour: number; endHour: number } | null {
  if (sessions.length < MIN_SESSIONS_FOR_NUDGE) return null;

  // Group by hour
  const hourBuckets: Record<number, number> = {};
  for (let i = 0; i < 24; i++) {
    hourBuckets[i] = 0;
  }

  for (const session of sessions) {
    const hour = new Date(session.completedAt).getHours();
    hourBuckets[hour] += session.duration / 60;
  }

  const totalMinutes = Object.values(hourBuckets).reduce((a, b) => a + b, 0);
  const avgMinutesPerHour = totalMinutes / 24;

  if (avgMinutesPerHour === 0) return null;

  // Find peak hours above threshold
  const peakHours: number[] = [];
  for (const [hourStr, minutes] of Object.entries(hourBuckets)) {
    if (minutes > avgMinutesPerHour * PEAK_THRESHOLD) {
      peakHours.push(parseInt(hourStr, 10));
    }
  }

  if (peakHours.length === 0) return null;

  peakHours.sort((a, b) => a - b);

  // Find contiguous ranges
  const ranges: number[][] = [];
  let currentRange: number[] = [peakHours[0]];

  for (let i = 1; i < peakHours.length; i++) {
    if (peakHours[i] === peakHours[i - 1] + 1) {
      currentRange.push(peakHours[i]);
    } else {
      ranges.push(currentRange);
      currentRange = [peakHours[i]];
    }
  }
  ranges.push(currentRange);

  // Find best range by total minutes
  const bestRange = ranges.reduce((best, range) => {
    const rangeMinutes = range.reduce((sum, h) => sum + hourBuckets[h], 0);
    const bestMinutes = best.reduce((sum, h) => sum + hourBuckets[h], 0);
    return rangeMinutes > bestMinutes ? range : best;
  }, ranges[0]);

  if (!bestRange || bestRange.length === 0) return null;

  return {
    startHour: bestRange[0],
    endHour: bestRange[bestRange.length - 1] + 1,
  };
}
