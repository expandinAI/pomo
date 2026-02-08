import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getMonthBoundaries,
  getSessionsForMonth,
  selectMonthlyHighlight,
  buildMonthlyRecap,
} from '../monthly-recap';
import type { CompletedSession } from '@/lib/session-storage';

function makeSession(overrides: Partial<CompletedSession> = {}): CompletedSession {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: 'work',
    duration: 1500,
    completedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('getMonthBoundaries', () => {
  beforeEach(() => {
    // Fix date to 2026-02-15 12:00:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns start and end of current month for offset 0', () => {
    const { start, end } = getMonthBoundaries(0);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(1); // February
    expect(start.getDate()).toBe(1);
    expect(start.getHours()).toBe(0);

    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(1);
    expect(end.getDate()).toBe(28); // Feb 2026 has 28 days
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });

  it('returns start and end of previous month for offset -1', () => {
    const { start, end } = getMonthBoundaries(-1);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(0); // January
    expect(start.getDate()).toBe(1);

    expect(end.getMonth()).toBe(0);
    expect(end.getDate()).toBe(31);
  });
});

describe('getSessionsForMonth', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('filters sessions to only include current month', () => {
    const sessions = [
      makeSession({ completedAt: new Date(2026, 1, 3, 10, 0).toISOString() }),
      makeSession({ completedAt: new Date(2026, 1, 20, 14, 0).toISOString() }),
      makeSession({ completedAt: new Date(2026, 0, 15, 10, 0).toISOString() }), // January
      makeSession({ completedAt: new Date(2025, 11, 1, 10, 0).toISOString() }), // December 2025
    ];

    const result = getSessionsForMonth(sessions, 0);
    expect(result).toHaveLength(2);
  });

  it('filters sessions to previous month with offset -1', () => {
    const sessions = [
      makeSession({ completedAt: new Date(2026, 1, 3, 10, 0).toISOString() }),
      makeSession({ completedAt: new Date(2026, 0, 15, 10, 0).toISOString() }), // January
      makeSession({ completedAt: new Date(2026, 0, 28, 18, 0).toISOString() }), // January
    ];

    const result = getSessionsForMonth(sessions, -1);
    expect(result).toHaveLength(2);
  });
});

describe('selectMonthlyHighlight', () => {
  it('returns null when no work sessions', () => {
    const sessions = [makeSession({ type: 'shortBreak' })];
    expect(selectMonthlyHighlight(sessions)).toBeNull();
  });

  it('picks the longest work session by default', () => {
    const sessions = [
      makeSession({ id: 'short', duration: 1500 }),
      makeSession({ id: 'long', duration: 3600 }),
      makeSession({ id: 'medium', duration: 2400 }),
    ];

    const result = selectMonthlyHighlight(sessions);
    expect(result).not.toBeNull();
    expect(result!.session.id).toBe('long');
    expect(result!.criterion).toBe('longest');
    expect(result!.narrative).toContain('deepest focus');
  });

  it('uses overflow criterion when overflowDuration > 600s', () => {
    const sessions = [
      makeSession({
        id: 'overflow-session',
        duration: 3600,
        overflowDuration: 900,
        estimatedDuration: 2700,
      }),
    ];

    const result = selectMonthlyHighlight(sessions);
    expect(result).not.toBeNull();
    expect(result!.criterion).toBe('overflow');
    expect(result!.narrative).toContain('kept going');
  });

  it('uses early_bird criterion when session started before 7am', () => {
    // Session completed at 7:30am, lasted 45 min → started at 6:45am
    const completedAt = new Date(2026, 1, 15, 7, 30, 0);
    const sessions = [
      makeSession({
        id: 'early',
        duration: 2700, // 45 min
        completedAt: completedAt.toISOString(),
      }),
    ];

    const result = selectMonthlyHighlight(sessions);
    expect(result).not.toBeNull();
    expect(result!.criterion).toBe('early_bird');
    expect(result!.narrative).toContain('before the day began');
  });
});

describe('buildMonthlyRecap', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when no work sessions in current month', () => {
    const sessions = [
      makeSession({ completedAt: new Date(2026, 0, 10).toISOString() }), // January
    ];

    expect(buildMonthlyRecap(sessions)).toBeNull();
  });

  it('returns null for only break sessions this month', () => {
    const sessions = [
      makeSession({ type: 'shortBreak', completedAt: new Date(2026, 1, 10).toISOString() }),
    ];

    expect(buildMonthlyRecap(sessions)).toBeNull();
  });

  it('computes correct stats for current month sessions', () => {
    const sessions = [
      makeSession({ duration: 1800, completedAt: new Date(2026, 1, 3, 10, 0).toISOString() }),
      makeSession({ duration: 3600, completedAt: new Date(2026, 1, 5, 14, 0).toISOString() }),
      makeSession({ duration: 2700, completedAt: new Date(2026, 1, 5, 16, 0).toISOString() }),
    ];

    const result = buildMonthlyRecap(sessions);
    expect(result).not.toBeNull();
    expect(result!.totalSeconds).toBe(8100);
    expect(result!.particleCount).toBe(3);
    expect(result!.monthLabel).toBe('February 2026');
  });

  it('counts active days correctly (multiple sessions same day = 1)', () => {
    const sessions = [
      makeSession({ completedAt: new Date(2026, 1, 3, 10, 0).toISOString() }),
      makeSession({ completedAt: new Date(2026, 1, 3, 14, 0).toISOString() }),
      makeSession({ completedAt: new Date(2026, 1, 5, 10, 0).toISOString() }),
      makeSession({ completedAt: new Date(2026, 1, 10, 9, 0).toISOString() }),
    ];

    const result = buildMonthlyRecap(sessions);
    expect(result).not.toBeNull();
    expect(result!.activeDays).toBe(3);
  });

  it('computes month-over-month comparison correctly', () => {
    const sessions = [
      // Current month: 1h
      makeSession({ duration: 3600, completedAt: new Date(2026, 1, 10).toISOString() }),
      // Previous month: 30min
      makeSession({ duration: 1800, completedAt: new Date(2026, 0, 15).toISOString() }),
    ];

    const result = buildMonthlyRecap(sessions);
    expect(result).not.toBeNull();
    expect(result!.comparison).not.toBeNull();
    expect(result!.comparison!.trend).toBe('up');
    expect(result!.comparison!.trendDelta).toBe(1800);
    expect(result!.comparison!.prevMonthLabel).toBe('January');
  });

  it('returns null comparison when no previous month sessions', () => {
    const sessions = [
      makeSession({ duration: 3600, completedAt: new Date(2026, 1, 10).toISOString() }),
    ];

    const result = buildMonthlyRecap(sessions);
    expect(result).not.toBeNull();
    expect(result!.comparison).toBeNull();
  });

  it('shows down trend when current month has less focus', () => {
    const sessions = [
      // Current month: 30min
      makeSession({ duration: 1800, completedAt: new Date(2026, 1, 10).toISOString() }),
      // Previous month: 1h
      makeSession({ duration: 3600, completedAt: new Date(2026, 0, 15).toISOString() }),
    ];

    const result = buildMonthlyRecap(sessions);
    expect(result!.comparison!.trend).toBe('down');
    expect(result!.comparison!.trendDelta).toBe(-1800);
  });

  it('includes highlight from current month sessions', () => {
    const sessions = [
      makeSession({ duration: 1800, completedAt: new Date(2026, 1, 3).toISOString() }),
      makeSession({ duration: 3600, completedAt: new Date(2026, 1, 10).toISOString() }),
    ];

    const result = buildMonthlyRecap(sessions);
    expect(result).not.toBeNull();
    expect(result!.highlight).not.toBeNull();
    expect(result!.highlight!.session.duration).toBe(3600);
  });
});
