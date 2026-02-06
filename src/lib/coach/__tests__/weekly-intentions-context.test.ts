import { describe, it, expect } from 'vitest';
import {
  traceDeferralChain,
  buildDeferredChains,
  buildSingleWeekSummary,
  buildWeeklyIntentions,
  formatContextForPrompt,
} from '../context-builder';
import type { DBIntention, DBSession } from '@/lib/db/types';
import type { CoachContext } from '../types';

// ============================================
// Test Helpers
// ============================================

/** Format Date as "YYYY-MM-DD" in local timezone (mirrors production helper) */
function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function makeIntention(overrides: Partial<DBIntention> = {}): DBIntention {
  return {
    id: `int-${Math.random().toString(36).slice(2, 8)}`,
    date: '2026-02-02',
    text: 'Ship login feature',
    status: 'active',
    syncStatus: 'local',
    localUpdatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeSession(overrides: Partial<DBSession> = {}): DBSession {
  return {
    id: `session-${Math.random().toString(36).slice(2, 8)}`,
    type: 'work',
    duration: 25 * 60,
    completedAt: '2026-02-03T10:00:00.000Z',
    syncStatus: 'local',
    localUpdatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMinimalContext(overrides: Partial<CoachContext> = {}): CoachContext {
  return {
    sessionSummary: {
      totalParticles: 0,
      totalMinutes: 0,
      todayParticles: 0,
      todayMinutes: 0,
      weekParticles: 0,
      weekMinutes: 0,
      averageSessionMinutes: 0,
    },
    projectBreakdown: [],
    patterns: [],
    recentActivity: {
      lastSession: null,
      last24Hours: 0,
      activeProject: null,
      recentTasks: [],
    },
    weeklyTrend: [],
    dailyTrend: [],
    taskFrequency: [],
    ...overrides,
  };
}

// ============================================
// traceDeferralChain
// ============================================

describe('traceDeferralChain', () => {
  it('returns depth 0 for intention without deferredFrom', () => {
    const intention = makeIntention({ date: '2026-02-05' });
    const map = new Map<string, DBIntention>();

    const result = traceDeferralChain(intention, map);

    expect(result.depth).toBe(0);
    expect(result.originalDate).toBe('2026-02-05');
  });

  it('returns depth 1 for single deferral', () => {
    const original = makeIntention({ date: '2026-02-03', text: 'Ship login' });
    const deferred = makeIntention({
      date: '2026-02-04',
      text: 'Ship login',
      deferredFrom: '2026-02-03',
    });

    const map = new Map<string, DBIntention>();
    map.set('2026-02-03', original);
    map.set('2026-02-04', deferred);

    const result = traceDeferralChain(deferred, map);

    expect(result.depth).toBe(1);
    expect(result.originalDate).toBe('2026-02-03');
  });

  it('returns depth 3 for chain of 3 deferrals', () => {
    const int1 = makeIntention({ date: '2026-02-01', text: 'Ship login' });
    const int2 = makeIntention({ date: '2026-02-02', text: 'Ship login', deferredFrom: '2026-02-01' });
    const int3 = makeIntention({ date: '2026-02-03', text: 'Ship login', deferredFrom: '2026-02-02' });
    const int4 = makeIntention({ date: '2026-02-04', text: 'Ship login', deferredFrom: '2026-02-03' });

    const map = new Map<string, DBIntention>();
    map.set('2026-02-01', int1);
    map.set('2026-02-02', int2);
    map.set('2026-02-03', int3);
    map.set('2026-02-04', int4);

    const result = traceDeferralChain(int4, map);

    expect(result.depth).toBe(3);
    expect(result.originalDate).toBe('2026-02-01');
  });

  it('handles circular references gracefully', () => {
    // Create a cycle: A → B → A
    const intA = makeIntention({ date: '2026-02-01', deferredFrom: '2026-02-02' });
    const intB = makeIntention({ date: '2026-02-02', deferredFrom: '2026-02-01' });

    const map = new Map<string, DBIntention>();
    map.set('2026-02-01', intA);
    map.set('2026-02-02', intB);

    // Should not infinite loop
    const result = traceDeferralChain(intA, map);

    expect(result.depth).toBeGreaterThan(0);
    // The exact values depend on when the cycle is detected, but it should terminate
    expect(result.depth).toBeLessThanOrEqual(2);
  });

  it('returns correct originalDate for broken chain (missing link)', () => {
    // Deferred from a date that doesn't exist in the map
    const deferred = makeIntention({
      date: '2026-02-05',
      text: 'Ship login',
      deferredFrom: '2026-02-03',
    });

    const map = new Map<string, DBIntention>();
    // Intentionally don't add '2026-02-03' to the map

    const result = traceDeferralChain(deferred, map);

    expect(result.depth).toBe(0);
    expect(result.originalDate).toBe('2026-02-05');
  });
});

// ============================================
// buildDeferredChains
// ============================================

describe('buildDeferredChains', () => {
  it('returns empty array when no intentions have deferrals', () => {
    const intentions = [
      makeIntention({ date: '2026-02-03' }),
      makeIntention({ date: '2026-02-04' }),
    ];
    const map = new Map<string, DBIntention>();
    intentions.forEach((i) => map.set(i.date, i));

    const result = buildDeferredChains(intentions, map);

    expect(result).toEqual([]);
  });

  it('returns chain for a single deferred intention', () => {
    const original = makeIntention({ date: '2026-02-03', text: 'Ship login' });
    const deferred = makeIntention({
      date: '2026-02-04',
      text: 'Ship login',
      status: 'active',
      deferredFrom: '2026-02-03',
    });

    const map = new Map<string, DBIntention>();
    map.set('2026-02-03', original);
    map.set('2026-02-04', deferred);

    const result = buildDeferredChains([original, deferred], map);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      text: 'Ship login',
      deferralCount: 1,
      originalDate: '2026-02-03',
      currentDate: '2026-02-04',
      currentStatus: 'active',
    });
  });

  it('returns multiple chains for multiple deferred intentions', () => {
    const origA = makeIntention({ date: '2026-02-03', text: 'Task A' });
    const defA = makeIntention({ date: '2026-02-04', text: 'Task A', deferredFrom: '2026-02-03' });
    const origB = makeIntention({ date: '2026-02-05', text: 'Task B' });
    const defB = makeIntention({ date: '2026-02-06', text: 'Task B', deferredFrom: '2026-02-05' });

    const map = new Map<string, DBIntention>();
    [origA, defA, origB, defB].forEach((i) => map.set(i.date, i));

    const result = buildDeferredChains([origA, defA, origB, defB], map);

    expect(result).toHaveLength(2);
  });
});

// ============================================
// buildSingleWeekSummary
// ============================================

describe('buildSingleWeekSummary', () => {
  it('returns null for empty week (no intentions, no sessions)', () => {
    const result = buildSingleWeekSummary(
      'current',
      0,
      [],
      new Map(),
      []
    );

    expect(result).toBeNull();
  });

  it('computes correct per-day alignment counts', () => {
    // We need to know the actual Monday of week offset 0 at test time
    // Use a fixed approach: create sessions on each day of the current week
    const now = new Date();
    const currentDay = now.getDay();
    const isoDay = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - isoDay);
    monday.setHours(0, 0, 0, 0);

    const mondayStr = toLocalDateString(monday);

    const intention = makeIntention({ date: mondayStr, text: 'Deep work', status: 'completed' });
    const map = new Map<string, DBIntention>();
    map.set(mondayStr, intention);

    // Create sessions on Monday
    const mondayNoon = new Date(monday);
    mondayNoon.setHours(12, 0, 0, 0);

    const sessions = [
      makeSession({
        completedAt: mondayNoon.toISOString(),
        intentionAlignment: 'aligned',
      }),
      makeSession({
        completedAt: new Date(mondayNoon.getTime() + 3600000).toISOString(),
        intentionAlignment: 'aligned',
      }),
      makeSession({
        completedAt: new Date(mondayNoon.getTime() + 7200000).toISOString(),
        intentionAlignment: 'reactive',
        task: 'email replies',
      }),
    ];

    const result = buildSingleWeekSummary('current', 0, [intention], map, sessions);

    expect(result).not.toBeNull();
    // Monday should have 3 particles, 2 aligned, 1 reactive
    const mondayEntry = result!.days[0];
    expect(mondayEntry.particles).toBe(3);
    expect(mondayEntry.alignedCount).toBe(2);
    expect(mondayEntry.reactiveCount).toBe(1);
    expect(mondayEntry.alignmentPct).toBe(67);
  });

  it('computes correct week-level aggregation', () => {
    const now = new Date();
    const currentDay = now.getDay();
    const isoDay = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - isoDay);
    monday.setHours(0, 0, 0, 0);

    const mondayStr = toLocalDateString(monday);
    const tuesday = new Date(monday);
    tuesday.setDate(monday.getDate() + 1);
    const tuesdayStr = toLocalDateString(tuesday);

    const int1 = makeIntention({ date: mondayStr, text: 'Task A', status: 'completed' });
    const int2 = makeIntention({ date: tuesdayStr, text: 'Task B', status: 'active' });

    const map = new Map<string, DBIntention>();
    map.set(mondayStr, int1);
    map.set(tuesdayStr, int2);

    const mondayNoon = new Date(monday);
    mondayNoon.setHours(12, 0, 0, 0);
    const tuesdayNoon = new Date(tuesday);
    tuesdayNoon.setHours(12, 0, 0, 0);

    const sessions = [
      makeSession({ completedAt: mondayNoon.toISOString(), intentionAlignment: 'aligned' }),
      makeSession({ completedAt: tuesdayNoon.toISOString(), intentionAlignment: 'reactive', task: 'code review' }),
    ];

    const result = buildSingleWeekSummary('current', 0, [int1, int2], map, sessions);

    expect(result).not.toBeNull();
    expect(result!.daysWithIntention).toBe(2);
    expect(result!.totalParticles).toBe(2);
    expect(result!.totalAligned).toBe(1);
    expect(result!.totalReactive).toBe(1);
    expect(result!.alignmentPct).toBe(50);
  });

  it('identifies top reactive tasks', () => {
    const now = new Date();
    const currentDay = now.getDay();
    const isoDay = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - isoDay);
    monday.setHours(0, 0, 0, 0);

    const mondayStr = toLocalDateString(monday);
    const intention = makeIntention({ date: mondayStr, text: 'Deep work' });
    const map = new Map<string, DBIntention>();
    map.set(mondayStr, intention);

    const mondayNoon = new Date(monday);
    mondayNoon.setHours(12, 0, 0, 0);

    const sessions = [
      makeSession({ completedAt: mondayNoon.toISOString(), intentionAlignment: 'reactive', task: 'email replies' }),
      makeSession({ completedAt: new Date(mondayNoon.getTime() + 3600000).toISOString(), intentionAlignment: 'reactive', task: 'email replies' }),
      makeSession({ completedAt: new Date(mondayNoon.getTime() + 7200000).toISOString(), intentionAlignment: 'reactive', task: 'code review' }),
    ];

    const result = buildSingleWeekSummary('current', 0, [intention], map, sessions);

    expect(result).not.toBeNull();
    expect(result!.topReactiveTasks).toHaveLength(2);
    expect(result!.topReactiveTasks[0]).toEqual({ task: 'email replies', count: 2 });
    expect(result!.topReactiveTasks[1]).toEqual({ task: 'code review', count: 1 });
  });

  it('reports null alignmentPct for days with 0 particles', () => {
    const now = new Date();
    const currentDay = now.getDay();
    const isoDay = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - isoDay);
    monday.setHours(0, 0, 0, 0);

    const mondayStr = toLocalDateString(monday);
    const intention = makeIntention({ date: mondayStr, text: 'Deep work' });
    const map = new Map<string, DBIntention>();
    map.set(mondayStr, intention);

    // No sessions
    const result = buildSingleWeekSummary('current', 0, [intention], map, []);

    expect(result).not.toBeNull();
    expect(result!.days[0].alignmentPct).toBeNull();
    expect(result!.alignmentPct).toBeNull();
  });
});

// ============================================
// formatContextForPrompt with weeklyIntentions
// ============================================

describe('formatContextForPrompt with weeklyIntentions', () => {
  it('omits Intention Patterns section when weeklyIntentions is undefined', () => {
    const context = makeMinimalContext();
    const output = formatContextForPrompt(context);
    expect(output).not.toContain('## Intention Patterns');
  });

  it('omits Intention Patterns section when weeklyIntentions is empty', () => {
    const context = makeMinimalContext({ weeklyIntentions: [] });
    const output = formatContextForPrompt(context);
    expect(output).not.toContain('## Intention Patterns');
  });

  it('formats day lines correctly', () => {
    const context = makeMinimalContext({
      weeklyIntentions: [{
        weekLabel: 'current',
        weekStart: '2026-02-02',
        days: [
          {
            date: '2026-02-02',
            dayLabel: 'Mon',
            text: 'Ship login',
            status: 'completed',
            deferralDepth: 0,
            originalDate: null,
            particles: 6,
            alignedCount: 5,
            reactiveCount: 1,
            alignmentPct: 83,
          },
          // Fill remaining days as empty
          ...Array.from({ length: 6 }, (_, i) => ({
            date: `2026-02-0${3 + i}`,
            dayLabel: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
            text: null,
            status: null,
            deferralDepth: 0,
            originalDate: null,
            particles: 0,
            alignedCount: 0,
            reactiveCount: 0,
            alignmentPct: null,
          })),
        ],
        daysWithIntention: 1,
        totalParticles: 6,
        totalAligned: 5,
        totalReactive: 1,
        alignmentPct: 83,
        deferredChains: [],
        topReactiveTasks: [],
      }],
    });

    const output = formatContextForPrompt(context);
    expect(output).toContain('## Intention Patterns');
    expect(output).toContain('This week: 1/7 days with intention, 6p, 83% aligned');
    expect(output).toContain('Mon: "Ship login" [completed] — 6p 83%');
  });

  it('includes deferral warnings', () => {
    const context = makeMinimalContext({
      weeklyIntentions: [{
        weekLabel: 'current',
        weekStart: '2026-02-02',
        days: Array.from({ length: 7 }, (_, i) => ({
          date: `2026-02-0${2 + i}`,
          dayLabel: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          text: i === 1 ? 'Ship login' : null,
          status: i === 1 ? 'active' : null,
          deferralDepth: i === 1 ? 2 : 0,
          originalDate: i === 1 ? '2026-01-31' : null,
          particles: 0,
          alignedCount: 0,
          reactiveCount: 0,
          alignmentPct: null,
        })),
        daysWithIntention: 1,
        totalParticles: 0,
        totalAligned: 0,
        totalReactive: 0,
        alignmentPct: null,
        deferredChains: [{
          text: 'Ship login',
          deferralCount: 2,
          originalDate: '2026-01-31',
          currentDate: '2026-02-03',
          currentStatus: 'active',
        }],
        topReactiveTasks: [],
      }],
    });

    const output = formatContextForPrompt(context);
    expect(output).toContain('⚠ "Ship login" deferred 2x (since 2026-01-31)');
  });

  it('includes reactive task summary', () => {
    const context = makeMinimalContext({
      weeklyIntentions: [{
        weekLabel: 'current',
        weekStart: '2026-02-02',
        days: Array.from({ length: 7 }, (_, i) => ({
          date: `2026-02-0${2 + i}`,
          dayLabel: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          text: null,
          status: null,
          deferralDepth: 0,
          originalDate: null,
          particles: i === 0 ? 3 : 0,
          alignedCount: 0,
          reactiveCount: i === 0 ? 3 : 0,
          alignmentPct: i === 0 ? 0 : null,
        })),
        daysWithIntention: 0,
        totalParticles: 3,
        totalAligned: 0,
        totalReactive: 3,
        alignmentPct: 0,
        deferredChains: [],
        topReactiveTasks: [
          { task: 'email replies', count: 4 },
          { task: 'code review', count: 2 },
        ],
      }],
    });

    const output = formatContextForPrompt(context);
    expect(output).toContain('Reactive: "email replies" 4x, "code review" 2x');
  });

  it('formats previous week label correctly', () => {
    const context = makeMinimalContext({
      weeklyIntentions: [{
        weekLabel: 'previous',
        weekStart: '2026-01-26',
        days: Array.from({ length: 7 }, (_, i) => ({
          date: `2026-01-2${6 + i}`,
          dayLabel: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          text: null,
          status: null,
          deferralDepth: 0,
          originalDate: null,
          particles: i === 0 ? 2 : 0,
          alignedCount: i === 0 ? 2 : 0,
          reactiveCount: 0,
          alignmentPct: i === 0 ? 100 : null,
        })),
        daysWithIntention: 0,
        totalParticles: 2,
        totalAligned: 2,
        totalReactive: 0,
        alignmentPct: 100,
        deferredChains: [],
        topReactiveTasks: [],
      }],
    });

    const output = formatContextForPrompt(context);
    expect(output).toContain('Last week: 0/7 days with intention, 2p, 100% aligned');
  });
});
