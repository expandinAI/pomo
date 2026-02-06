import { describe, it, expect } from 'vitest';
import {
  findMatchingContext,
  buildMorningInsight,
  findPeakHour,
  generateLocalEveningInsight,
  type MatchResult,
  type EveningInsightContext,
} from '../intention-insights';
import type { CompletedSession } from '@/lib/session-storage';

// ============================================
// Test Helpers
// ============================================

function makeSession(overrides: Partial<CompletedSession> = {}): CompletedSession {
  return {
    id: `session-${Math.random().toString(36).slice(2, 8)}`,
    type: 'work',
    duration: 25 * 60,
    completedAt: '2026-02-05T10:00:00.000Z',
    ...overrides,
  };
}

function makeProject(id: string, name: string) {
  return { id, name };
}

/** Generate N sessions for a project at a specific hour */
function makeProjectSessions(
  projectId: string,
  count: number,
  hour: number = 10
): CompletedSession[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date('2026-02-05');
    date.setDate(date.getDate() - i);
    date.setHours(hour + 1, 0, 0, 0); // completedAt = hour+1 (assuming ~60min session approx, but duration matters for start calc)
    return makeSession({
      projectId,
      duration: 25 * 60,
      completedAt: date.toISOString(),
    });
  });
}

// ============================================
// Morning Context: findMatchingContext
// ============================================

describe('findMatchingContext', () => {
  const projects = [
    makeProject('p1', 'Design System'),
    makeProject('p2', 'API Refactor'),
  ];

  it('returns null for empty text', () => {
    expect(findMatchingContext('', projects, [])).toBeNull();
  });

  it('returns null for short text (< 3 chars)', () => {
    expect(findMatchingContext('ab', projects, [])).toBeNull();
  });

  it('returns null when no match found', () => {
    const sessions = makeProjectSessions('p1', 5);
    expect(findMatchingContext('Marketing', projects, sessions)).toBeNull();
  });

  it('matches project by exact name (case-insensitive)', () => {
    const sessions = makeProjectSessions('p1', 5);
    const result = findMatchingContext('design system', projects, sessions);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('project');
    expect(result!.name).toBe('Design System');
    expect(result!.particleCount).toBe(5);
  });

  it('matches project by partial name', () => {
    const sessions = makeProjectSessions('p2', 4);
    const result = findMatchingContext('API', projects, sessions);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('project');
    expect(result!.name).toBe('API Refactor');
  });

  it('returns null for project match with < 3 sessions', () => {
    const sessions = makeProjectSessions('p1', 2);
    expect(findMatchingContext('Design', projects, sessions)).toBeNull();
  });

  it('only counts sessions from last 14 days for projects', () => {
    // 2 recent + 3 old = only 2 count
    const recent = makeProjectSessions('p1', 2);
    const old = Array.from({ length: 3 }, (_, i) => {
      const date = new Date('2026-01-10');
      date.setDate(date.getDate() - i);
      return makeSession({
        projectId: 'p1',
        completedAt: date.toISOString(),
      });
    });
    expect(findMatchingContext('Design', projects, [...recent, ...old])).toBeNull();
  });

  it('matches task name when no project matches', () => {
    const sessions = Array.from({ length: 4 }, (_, i) => {
      const date = new Date('2026-02-05');
      date.setDate(date.getDate() - i);
      return makeSession({
        task: 'Write unit tests',
        completedAt: date.toISOString(),
      });
    });
    const result = findMatchingContext('unit tests', projects, sessions);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('task');
    expect(result!.name).toBe('Write unit tests');
    expect(result!.particleCount).toBe(4);
  });

  it('returns null for task match with < 3 occurrences', () => {
    const sessions = [
      makeSession({ task: 'Write docs' }),
      makeSession({ task: 'Write docs' }),
    ];
    expect(findMatchingContext('docs', projects, sessions)).toBeNull();
  });

  it('calculates totalMinutes correctly', () => {
    const sessions = makeProjectSessions('p1', 3).map((s) => ({
      ...s,
      duration: 30 * 60, // 30 min each
    }));
    const result = findMatchingContext('Design', projects, sessions);
    expect(result).not.toBeNull();
    expect(result!.totalMinutes).toBe(90);
  });
});

// ============================================
// Morning Context: findPeakHour
// ============================================

describe('findPeakHour', () => {
  it('returns null when no hour has >= 3 sessions', () => {
    const sessions = [
      makeSession({ completedAt: '2026-02-05T10:25:00.000Z', duration: 25 * 60 }),
      makeSession({ completedAt: '2026-02-05T11:25:00.000Z', duration: 25 * 60 }),
    ];
    expect(findPeakHour(sessions)).toBeNull();
  });

  it('returns the mode hour when >= 3 sessions', () => {
    // All sessions start around 9am (completedAt ~9:25, duration 25min → start ~9:00)
    const sessions = Array.from({ length: 4 }, (_, i) => {
      const date = new Date('2026-02-05');
      date.setDate(date.getDate() - i);
      date.setHours(9, 25, 0, 0);
      return makeSession({ completedAt: date.toISOString(), duration: 25 * 60 });
    });
    expect(findPeakHour(sessions)).toBe(9);
  });

  it('returns the hour with most sessions when multiple qualify', () => {
    const sessions = [
      // 3 at 9am
      ...Array.from({ length: 3 }, (_, i) => {
        const date = new Date('2026-02-05');
        date.setDate(date.getDate() - i);
        date.setHours(9, 25, 0, 0);
        return makeSession({ completedAt: date.toISOString(), duration: 25 * 60 });
      }),
      // 4 at 14:00
      ...Array.from({ length: 4 }, (_, i) => {
        const date = new Date('2026-02-05');
        date.setDate(date.getDate() - i);
        date.setHours(14, 25, 0, 0);
        return makeSession({ completedAt: date.toISOString(), duration: 25 * 60 });
      }),
    ];
    expect(findPeakHour(sessions)).toBe(14);
  });
});

// ============================================
// Morning Context: buildMorningInsight
// ============================================

describe('buildMorningInsight', () => {
  it('builds project insight with peak hour', () => {
    const match: MatchResult = {
      type: 'project',
      name: 'Design System',
      particleCount: 8,
      totalMinutes: 200,
      peakHour: 9,
    };
    const result = buildMorningInsight(match);
    expect(result).toBe('Last 2 weeks: 8 particles on Design System. Best sessions around 9am.');
  });

  it('builds project insight without peak hour', () => {
    const match: MatchResult = {
      type: 'project',
      name: 'Design System',
      particleCount: 4,
      totalMinutes: 100,
      peakHour: null,
    };
    const result = buildMorningInsight(match);
    expect(result).toBe('Last 2 weeks: 4 particles on Design System. Avg 25 min each.');
  });

  it('builds task insight', () => {
    const match: MatchResult = {
      type: 'task',
      name: 'Write unit tests',
      particleCount: 5,
      totalMinutes: 150,
      peakHour: null,
    };
    const result = buildMorningInsight(match);
    expect(result).toBe('You\'ve done "Write unit tests" 5 times recently. Avg 30 min each.');
  });

  it('formats afternoon hour correctly', () => {
    const match: MatchResult = {
      type: 'project',
      name: 'API',
      particleCount: 3,
      totalMinutes: 75,
      peakHour: 14,
    };
    expect(buildMorningInsight(match)).toContain('2pm');
  });

  it('formats midnight hour correctly', () => {
    const match: MatchResult = {
      type: 'project',
      name: 'API',
      particleCount: 3,
      totalMinutes: 75,
      peakHour: 0,
    };
    expect(buildMorningInsight(match)).toContain('12am');
  });

  it('formats noon hour correctly', () => {
    const match: MatchResult = {
      type: 'project',
      name: 'API',
      particleCount: 3,
      totalMinutes: 75,
      peakHour: 12,
    };
    expect(buildMorningInsight(match)).toContain('12pm');
  });
});

// ============================================
// Evening Insight (local)
// ============================================

describe('generateLocalEveningInsight', () => {
  it('returns quiet day message for 0 particles', () => {
    const ctx: EveningInsightContext = {
      intentionText: 'Ship the feature',
      totalParticles: 0,
      alignedCount: 0,
      reactiveCount: 0,
      alignedMinutes: 0,
      reactiveMinutes: 0,
      reactiveTasks: [],
    };
    expect(generateLocalEveningInsight(ctx)).toBe("A quiet day. Tomorrow's a fresh page.");
  });

  it('returns fully aligned message when 0 reactive', () => {
    const ctx: EveningInsightContext = {
      intentionText: 'Ship the feature',
      totalParticles: 5,
      alignedCount: 5,
      reactiveCount: 0,
      alignedMinutes: 125,
      reactiveMinutes: 0,
      reactiveTasks: [],
    };
    expect(generateLocalEveningInsight(ctx)).toBe(
      'Fully aligned. Every particle served your intention.'
    );
  });

  it('returns life happened message when 0 aligned', () => {
    const ctx: EveningInsightContext = {
      intentionText: 'Ship the feature',
      totalParticles: 3,
      alignedCount: 0,
      reactiveCount: 3,
      alignedMinutes: 0,
      reactiveMinutes: 75,
      reactiveTasks: ['Bug fix', 'Meeting prep'],
    };
    expect(generateLocalEveningInsight(ctx)).toBe("Life happened. Tomorrow's a fresh page.");
  });

  it('returns mixed message with reactive tasks', () => {
    const ctx: EveningInsightContext = {
      intentionText: 'Ship the feature',
      totalParticles: 6,
      alignedCount: 4,
      reactiveCount: 2,
      alignedMinutes: 100,
      reactiveMinutes: 50,
      reactiveTasks: ['Bug fix', 'Meeting prep'],
    };
    const result = generateLocalEveningInsight(ctx);
    expect(result).toContain('4 of 6 aligned');
    expect(result).toContain('"Bug fix"');
    expect(result).toContain('"Meeting prep"');
  });

  it('returns mixed message without task names', () => {
    const ctx: EveningInsightContext = {
      intentionText: 'Ship the feature',
      totalParticles: 5,
      alignedCount: 3,
      reactiveCount: 2,
      alignedMinutes: 75,
      reactiveMinutes: 50,
      reactiveTasks: [],
    };
    const result = generateLocalEveningInsight(ctx);
    expect(result).toContain('3 of 5 aligned');
    expect(result).toContain('The rest was reactive');
  });

  it('limits reactive tasks to 2 in message', () => {
    const ctx: EveningInsightContext = {
      intentionText: 'Ship the feature',
      totalParticles: 6,
      alignedCount: 2,
      reactiveCount: 4,
      alignedMinutes: 50,
      reactiveMinutes: 100,
      reactiveTasks: ['Bug fix', 'Meeting prep', 'Email', 'Review'],
    };
    const result = generateLocalEveningInsight(ctx);
    expect(result).toContain('"Bug fix"');
    expect(result).toContain('"Meeting prep"');
    expect(result).not.toContain('"Email"');
    expect(result).not.toContain('"Review"');
  });
});
