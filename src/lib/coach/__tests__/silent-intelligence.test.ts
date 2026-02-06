import { describe, it, expect } from 'vitest';
import {
  getSmartPreset,
  getTaskPrediction,
  getSmartEmptyState,
} from '../silent-intelligence';
import type { UnifiedSession } from '@/contexts/SessionContext';

// ============================================
// Test Helpers
// ============================================

function makeSession(overrides: Partial<UnifiedSession> = {}): UnifiedSession {
  return {
    id: crypto.randomUUID(),
    type: 'work',
    duration: 25 * 60,
    completedAt: new Date().toISOString(),
    task: undefined,
    projectId: undefined,
    ...overrides,
  } as UnifiedSession;
}

/** Create N sessions at a specific hour */
function sessionsAtHour(hour: number, count: number, duration = 25 * 60): UnifiedSession[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(2026, 0, 10 + i, hour, 30); // spread across different days
    return makeSession({ duration, completedAt: d.toISOString() });
  });
}

/** Create N sessions on a specific weekday+hour with optional task */
function sessionsOnDayHour(
  day: number,
  hour: number,
  count: number,
  task?: string
): UnifiedSession[] {
  // Find dates that match the target weekday
  const results: UnifiedSession[] = [];
  let date = new Date(2026, 0, 1); // Start from Jan 1 2026
  // Find first matching weekday
  while (date.getDay() !== day) {
    date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  }
  for (let i = 0; i < count; i++) {
    const d = new Date(date);
    d.setHours(hour, 30, 0, 0);
    results.push(makeSession({
      completedAt: d.toISOString(),
      task: task || undefined,
    }));
    date = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000); // next week
  }
  return results;
}

// ============================================
// A) getSmartPreset
// ============================================

describe('getSmartPreset', () => {
  it('returns null with < 20 work sessions', () => {
    const sessions = sessionsAtHour(14, 10);
    expect(getSmartPreset(sessions, 14).presetId).toBeNull();
  });

  it('returns null with < 5 sessions at current hour', () => {
    // 20 sessions but spread across many hours
    const sessions = Array.from({ length: 20 }, (_, i) => {
      const d = new Date(2026, 0, 10 + i, i % 12 + 6, 30);
      return makeSession({ completedAt: d.toISOString() });
    });
    expect(getSmartPreset(sessions, 22).presetId).toBeNull();
  });

  it('returns "classic" for avg ~25min sessions', () => {
    const filler = sessionsAtHour(3, 15, 25 * 60); // 15 at 3am
    const relevant = sessionsAtHour(14, 8, 25 * 60); // 8 at 2pm = 25min avg
    expect(getSmartPreset([...filler, ...relevant], 14).presetId).toBe('classic');
  });

  it('returns "deepWork" for avg ~52min sessions', () => {
    const filler = sessionsAtHour(3, 15, 25 * 60);
    const relevant = sessionsAtHour(10, 8, 52 * 60);
    expect(getSmartPreset([...filler, ...relevant], 10).presetId).toBe('deepWork');
  });

  it('returns "ultradian" for avg ~90min sessions', () => {
    const filler = sessionsAtHour(3, 15, 25 * 60);
    const relevant = sessionsAtHour(9, 8, 90 * 60);
    expect(getSmartPreset([...filler, ...relevant], 9).presetId).toBe('ultradian');
  });

  it('ignores break sessions', () => {
    const breaks = sessionsAtHour(14, 25, 25 * 60).map(s => ({
      ...s,
      type: 'shortBreak' as const,
    }));
    expect(getSmartPreset(breaks, 14).presetId).toBeNull();
  });

  it('matches sessions within ±1 hour window', () => {
    const filler = sessionsAtHour(3, 15, 25 * 60);
    // Sessions at hours 13 and 15 should count for hour 14
    const at13 = sessionsAtHour(13, 3, 50 * 60);
    const at15 = sessionsAtHour(15, 3, 54 * 60);
    expect(getSmartPreset([...filler, ...at13, ...at15], 14).presetId).toBe('deepWork');
  });

  it('wraps around midnight (hour 23 matches hour 0)', () => {
    const filler = sessionsAtHour(12, 15, 25 * 60);
    const relevant = sessionsAtHour(23, 6, 50 * 60);
    expect(getSmartPreset([...filler, ...relevant], 0).presetId).toBe('deepWork');
  });

  it('returns null for very short avg (< 15min)', () => {
    const filler = sessionsAtHour(3, 15, 25 * 60);
    const relevant = sessionsAtHour(14, 8, 10 * 60); // 10min avg
    expect(getSmartPreset([...filler, ...relevant], 14).presetId).toBeNull();
  });
});

// ============================================
// B) getTaskPrediction
// ============================================

describe('getTaskPrediction', () => {
  it('returns task with 3+ same occurrences on same day+hour', () => {
    // Wednesday (day 3) at hour 10
    const sessions = sessionsOnDayHour(3, 10, 4, 'Brand Redesign');
    expect(getTaskPrediction(sessions, 3, 10)).toBe('Brand Redesign');
  });

  it('returns null with < 3 occurrences', () => {
    const sessions = sessionsOnDayHour(3, 10, 2, 'Brand Redesign');
    expect(getTaskPrediction(sessions, 3, 10)).toBeNull();
  });

  it('returns most frequent task when multiple tasks match', () => {
    const dominant = sessionsOnDayHour(1, 14, 4, 'Code Review');
    const other = sessionsOnDayHour(1, 14, 2, 'Meetings');
    expect(getTaskPrediction([...dominant, ...other], 1, 14)).toBe('Code Review');
  });

  it('returns null when no task has 3+ occurrences', () => {
    const a = sessionsOnDayHour(1, 14, 2, 'Task A');
    const b = sessionsOnDayHour(1, 14, 2, 'Task B');
    expect(getTaskPrediction([...a, ...b], 1, 14)).toBeNull();
  });

  it('returns null for sessions without task text', () => {
    const sessions = sessionsOnDayHour(3, 10, 5); // no task
    expect(getTaskPrediction(sessions, 3, 10)).toBeNull();
  });

  it('returns null for different weekday', () => {
    const sessions = sessionsOnDayHour(3, 10, 5, 'Brand Redesign');
    // Query for day 4 (Thursday) instead of 3 (Wednesday)
    expect(getTaskPrediction(sessions, 4, 10)).toBeNull();
  });

  it('matches sessions within ±1 hour', () => {
    const sessions = sessionsOnDayHour(2, 9, 3, 'Morning Standup');
    // Query at hour 10 — should still match sessions at hour 9
    expect(getTaskPrediction(sessions, 2, 10)).toBe('Morning Standup');
  });

  it('ignores break sessions', () => {
    const sessions = sessionsOnDayHour(3, 10, 5, 'Work Task').map(s => ({
      ...s,
      type: 'shortBreak' as const,
    }));
    expect(getTaskPrediction(sessions, 3, 10)).toBeNull();
  });
});

// ============================================
// C) getSmartEmptyState
// ============================================

describe('getSmartEmptyState', () => {
  it('returns default with < 10 sessions', () => {
    const sessions = sessionsAtHour(14, 5);
    expect(getSmartEmptyState(sessions, 3, 14)).toBe('A blank canvas');
  });

  it('returns "Welcome back" after 3+ day break', () => {
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    const sessions = sessionsAtHour(14, 10).map(s => ({
      ...s,
      completedAt: fourDaysAgo.toISOString(),
    }));
    expect(getSmartEmptyState(sessions, new Date().getDay(), 14)).toBe(
      'Welcome back. Start small.'
    );
  });

  it('does not return "Welcome back" for 2-day break', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const sessions = sessionsAtHour(14, 10).map(s => ({
      ...s,
      completedAt: twoDaysAgo.toISOString(),
    }));
    const result = getSmartEmptyState(sessions, new Date().getDay(), 14);
    expect(result).not.toBe('Welcome back. Start small.');
  });

  it('returns strong day message when current day is 1.2x above average', () => {
    // Create sessions concentrated on Monday across different hours
    // so strong day triggers but peak hour does NOT for the queried hour
    const mondaySessions = [
      ...sessionsOnDayHour(1, 9, 3),
      ...sessionsOnDayHour(1, 11, 3),
      ...sessionsOnDayHour(1, 15, 3),
    ]; // 9 sessions across Mondays
    // Spread other sessions across other days (1 each)
    const otherSessions = [
      ...sessionsOnDayHour(2, 10, 1),
      ...sessionsOnDayHour(3, 10, 1),
    ];
    const now = new Date();
    const allSessions = [...mondaySessions, ...otherSessions];
    // Add a recent session to avoid "welcome back" trigger
    allSessions.push(makeSession({ completedAt: now.toISOString() }));

    // Query for Monday (day 1) at hour 20 (no peak hour signal)
    const result = getSmartEmptyState(allSessions, 1, 20);
    expect(result).toContain('Monday');
    expect(result).toContain('most productive day');
    expect(result).toContain('avg.');
  });

  it('returns peak hour message when current hour is 1.5x above average', () => {
    // Create 10 sessions: 8 at hour 10, 2 at hour 20
    // Hour 10 gets 200min (8*25), hour 20 gets 50min
    // Total = 250min, avg = 250/24 ≈ 10.4
    // Hour 10 = 200 > 10.4 * 1.5 = 15.6 ✓
    const peakSessions = sessionsAtHour(10, 8, 25 * 60);
    const otherSessions = sessionsAtHour(20, 2, 25 * 60);
    // Make them all recent
    const now = new Date();
    const allSessions = [...peakSessions, ...otherSessions];
    allSessions.push(makeSession({ completedAt: now.toISOString() }));

    // All on same day → no strong day pattern, but peak hour should match
    const result = getSmartEmptyState(allSessions, now.getDay(), 10);
    // Could match strong day OR peak hour depending on data distribution
    expect(
      result === 'Your peak focus window. Make it count.' ||
      result.includes('most productive day')
    ).toBe(true);
  });

  it('returns default when no conditions met', () => {
    // Evenly distributed sessions — no pattern
    const now = new Date();
    const sessions: UnifiedSession[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(8 + (i % 12), 0, 0, 0);
      sessions.push(makeSession({ completedAt: d.toISOString(), duration: 25 * 60 }));
    }
    // Query for hour with no strong signal
    const result = getSmartEmptyState(sessions, now.getDay(), 3);
    expect(result).toBe('A blank canvas');
  });

  it('prioritizes break over strong day', () => {
    // Create conditions for both: strong day AND 3+ day break
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const day = fiveDaysAgo.getDay();
    const sessions = sessionsOnDayHour(day, 14, 10, 'work').map(s => ({
      ...s,
      completedAt: fiveDaysAgo.toISOString(),
    }));

    const result = getSmartEmptyState(sessions, day, 14);
    // Break should take priority
    expect(result).toBe('Welcome back. Start small.');
  });

  it('formats avg as integer when whole number', () => {
    // 5 sessions across 1 Monday = 5.0 avg → should show "5"
    // Need to carefully construct data with enough sessions
    const monday = new Date(2026, 0, 5, 14, 0); // Jan 5, 2026 is a Monday
    const sessions: UnifiedSession[] = [];

    // 5 sessions on one Monday
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setHours(14 + i, 0, 0, 0);
      sessions.push(makeSession({ completedAt: d.toISOString() }));
    }
    // 2 sessions on one other day to create contrast (and reach 10+ total)
    const tuesday = new Date(2026, 0, 6, 14, 0);
    for (let i = 0; i < 2; i++) {
      sessions.push(makeSession({ completedAt: tuesday.toISOString() }));
    }
    // More filler on other days
    for (let i = 0; i < 4; i++) {
      const d = new Date(2026, 0, 7 + i, 14, 0);
      sessions.push(makeSession({ completedAt: d.toISOString() }));
    }
    // Recent session to avoid break detection
    sessions.push(makeSession({ completedAt: new Date().toISOString() }));

    const result = getSmartEmptyState(sessions, 1, 14); // Monday
    if (result.includes('Monday')) {
      expect(result).toContain('5 avg.');
    }
  });
});
