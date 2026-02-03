'use client';

import { getWeekBoundaries, getSessionsForWeek } from '@/lib/session-analytics';
import type { CompletedSession } from '@/lib/session-storage';

export type POTWCriterion = 'longest' | 'overflow' | 'early_bird' | 'weekend';

export interface ParticleOfWeek {
  sessionId: string;
  session: CompletedSession;
  weekNumber: number;
  year: number;
  criterion: POTWCriterion;
  narrative: {
    opening: string;
    body: string;
    meaning: string;
  };
  selectedAt: string; // ISO date
}

// Narrative templates for each criterion
const NARRATIVE_TEMPLATES: Record<POTWCriterion, {
  opening: (s: CompletedSession) => string;
  body: (s: CompletedSession) => string;
  meaning: (s: CompletedSession) => string;
}> = {
  longest: {
    opening: (s) => {
      const date = new Date(s.completedAt);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `On ${day} at ${time}, something happened.`;
    },
    body: (s) => {
      const duration = Math.round(s.duration / 60);
      return `You sat down, started the timer — and then you disappeared. ${duration} minutes later, you came back.`;
    },
    meaning: (s) => s.task
      ? `${s.task}? Done. The rest of the world? It waited.`
      : `That's flow. That's you.`,
  },
  overflow: {
    opening: (s) => {
      const estimated = Math.round((s.estimatedDuration || s.duration) / 60);
      return `You planned for ${estimated} minutes.`;
    },
    body: (s) => {
      const overflow = Math.round((s.overflowDuration || 0) / 60);
      return `The timer said stop. You kept going. ${overflow} extra minutes — because you weren't done yet.`;
    },
    meaning: () => `Some call it overworking. We call it: being in flow.`,
  },
  early_bird: {
    opening: (s) => {
      const time = new Date(s.completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `${time}. Most people are still asleep.`;
    },
    body: (s) => {
      const duration = Math.round(s.duration / 60);
      return `Not you. You took ${duration} minutes before the day even started.`;
    },
    meaning: () => `That's not discipline. That's priority.`,
  },
  weekend: {
    opening: () => `Saturday. You could have done anything.`,
    body: (s) => {
      const duration = Math.round(s.duration / 60);
      return `Instead: ${duration} minutes of focused work. Not because you had to. Because you wanted to.`;
    },
    meaning: () => `That's what separates passion from obligation.`,
  },
};

/**
 * Get the ISO week number for a given date
 */
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Select the Particle of the Week from a week's sessions.
 * Priority: longest session, then determine criterion based on properties.
 *
 * @param sessions All sessions
 * @param weekOffset 0 = current week, -1 = last week
 */
export function selectParticleOfWeek(
  sessions: CompletedSession[],
  weekOffset: number = 0
): ParticleOfWeek | null {
  // Get work sessions for the specified week only
  const weekSessions = getSessionsForWeek(sessions, weekOffset)
    .filter(s => s.type === 'work');

  if (weekSessions.length === 0) return null;

  // Find the longest session
  const longest = weekSessions.reduce((max, s) =>
    s.duration > max.duration ? s : max
  );

  // Determine criterion based on session properties
  let criterion: POTWCriterion = 'longest';

  // Check for significant overflow (>10 min extra)
  if (longest.overflowDuration && longest.overflowDuration > 600) {
    criterion = 'overflow';
  }

  // Check for early bird (started before 7 AM)
  const completedDate = new Date(longest.completedAt);
  const startTime = new Date(completedDate.getTime() - longest.duration * 1000);
  const startHour = startTime.getHours();
  if (startHour < 7) {
    criterion = 'early_bird';
  }

  // Check for weekend
  const dayOfWeek = completedDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    criterion = 'weekend';
  }

  // Get week number and year
  const { start } = getWeekBoundaries(weekOffset);
  const weekNumber = getISOWeekNumber(start);
  const year = start.getFullYear();

  // Generate narrative
  const template = NARRATIVE_TEMPLATES[criterion];
  const narrative = {
    opening: template.opening(longest),
    body: template.body(longest),
    meaning: template.meaning(longest),
  };

  return {
    sessionId: longest.id,
    session: longest,
    weekNumber,
    year,
    criterion,
    narrative,
    selectedAt: new Date().toISOString(),
  };
}

// Storage key for POTW history
const POTW_STORAGE_KEY = 'particle:potw-history';

/**
 * Save a POTW to localStorage history
 */
export function savePOTW(potw: ParticleOfWeek): void {
  if (typeof window === 'undefined') return;

  const history = getPOTWHistory();
  // Avoid duplicates for same week
  const filtered = history.filter(p =>
    !(p.weekNumber === potw.weekNumber && p.year === potw.year)
  );
  filtered.unshift(potw);
  // Keep last 52 weeks
  const trimmed = filtered.slice(0, 52);
  localStorage.setItem(POTW_STORAGE_KEY, JSON.stringify(trimmed));
}

/**
 * Get all stored POTW history
 */
export function getPOTWHistory(): ParticleOfWeek[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(POTW_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get the current week's POTW if it exists
 */
export function getCurrentPOTW(): ParticleOfWeek | null {
  const history = getPOTWHistory();
  if (history.length === 0) return null;

  // Check if latest is from current week
  const { start } = getWeekBoundaries(0);
  const currentWeek = getISOWeekNumber(start);
  const currentYear = start.getFullYear();

  const latest = history[0];
  if (latest.weekNumber === currentWeek && latest.year === currentYear) {
    return latest;
  }
  return null;
}

/**
 * Check if a specific session is the current POTW
 */
export function isSessionPOTW(sessionId: string): boolean {
  const potw = getCurrentPOTW();
  return potw?.sessionId === sessionId;
}
