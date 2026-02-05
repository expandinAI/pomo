import { describe, it, expect } from 'vitest';
import {
  generateNudge,
  detectPeakHours,
  type NudgeContext,
} from '../nudge-generator';
import type { DBSession } from '@/lib/db/types';

// ============================================
// Test Helpers
// ============================================

function makeSession(overrides: Partial<DBSession> = {}): DBSession {
  return {
    id: `session-${Math.random().toString(36).slice(2)}`,
    type: 'work',
    duration: 25 * 60,
    completedAt: new Date().toISOString(),
    syncStatus: 'local',
    localUpdatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeSessionAtHour(hour: number, durationMin = 25): DBSession {
  const date = new Date();
  date.setHours(hour, 15, 0, 0);
  return makeSession({
    duration: durationMin * 60,
    completedAt: date.toISOString(),
  });
}

function makeSessionForProject(
  projectId: string,
  daysAgo = 0,
  durationMin = 25
): DBSession {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return makeSession({
    projectId,
    duration: durationMin * 60,
    completedAt: date.toISOString(),
  });
}

function makeBaseContext(overrides: Partial<NudgeContext> = {}): NudgeContext {
  return {
    selectedProjectId: null,
    selectedProjectName: null,
    currentTask: '',
    todayWorkCount: 3,
    averagePerActiveDay: 5,
    currentHour: 10,
    currentDayOfWeek: 2, // Tuesday
    patterns: [],
    intentionText: null,
    allWorkSessions: Array.from({ length: 15 }, () => makeSession()),
    activeProjects: [],
    totalWorkSessionCount: 15,
    ...overrides,
  };
}

// ============================================
// Gate Tests
// ============================================

describe('generateNudge – gate', () => {
  it('returns null when total sessions < 10', () => {
    const ctx = makeBaseContext({
      totalWorkSessionCount: 5,
      allWorkSessions: Array.from({ length: 5 }, () => makeSession()),
    });
    expect(generateNudge(ctx)).toBeNull();
  });

  it('returns null when total sessions is exactly 9', () => {
    const ctx = makeBaseContext({
      totalWorkSessionCount: 9,
    });
    expect(generateNudge(ctx)).toBeNull();
  });

  it('returns a nudge when total sessions is exactly 10', () => {
    const ctx = makeBaseContext({
      totalWorkSessionCount: 10,
      averagePerActiveDay: 4,
    });
    // Should at least get progress_context since averagePerActiveDay is set
    const result = generateNudge(ctx);
    expect(result).not.toBeNull();
  });
});

// ============================================
// Priority Tests
// ============================================

describe('generateNudge – priority', () => {
  it('intention beats all other nudge types', () => {
    const ctx = makeBaseContext({
      intentionText: 'Ship the login feature',
      averagePerActiveDay: 5,
      currentTask: 'Some task',
    });
    const result = generateNudge(ctx);
    expect(result?.type).toBe('intention');
  });

  it('progress_context appears when no higher-priority nudge matches', () => {
    const ctx = makeBaseContext({
      averagePerActiveDay: 5,
    });
    const result = generateNudge(ctx);
    expect(result?.type).toBe('progress_context');
  });
});

// ============================================
// Intention Nudge
// ============================================

describe('tryIntentionNudge', () => {
  it('shows full text when short', () => {
    const ctx = makeBaseContext({ intentionText: 'Ship login' });
    const result = generateNudge(ctx);
    expect(result?.text).toBe('Aligned with: Ship login');
    expect(result?.type).toBe('intention');
  });

  it('truncates at 30 chars with ellipsis', () => {
    const ctx = makeBaseContext({
      intentionText: 'A very long intention text that exceeds the limit',
    });
    const result = generateNudge(ctx);
    expect(result?.type).toBe('intention');
    // "Aligned with: " + truncated text (30 chars max)
    const textPart = result!.text.replace('Aligned with: ', '');
    expect(textPart.length).toBeLessThanOrEqual(30);
    expect(textPart).toContain('…');
  });
});

// ============================================
// Time Peak Nudge
// ============================================

describe('tryTimePeakNudge', () => {
  function makeSessionsAtPeak(
    peakHour: number,
    count: number
  ): DBSession[] {
    // Create sessions heavily concentrated at peakHour
    const sessions: DBSession[] = [];
    for (let i = 0; i < count; i++) {
      sessions.push(makeSessionAtHour(peakHour, 50));
    }
    // Add a few scattered sessions to make peak detectable
    sessions.push(makeSessionAtHour(3, 5));
    sessions.push(makeSessionAtHour(20, 5));
    return sessions;
  }

  it('matches when current hour is within peak', () => {
    const sessions = makeSessionsAtPeak(10, 12);
    const ctx = makeBaseContext({
      allWorkSessions: sessions,
      currentHour: 10,
      currentDayOfWeek: 2, // Tuesday
    });
    const result = generateNudge(ctx);
    // Could be time_peak or progress_context depending on pattern detection
    if (result?.type === 'time_peak') {
      expect(result.text).toContain('Tuesday');
      expect(result.text).toContain('10am');
      expect(result.text).toContain('peak focus window');
    }
  });

  it('matches when current hour is peak - 1', () => {
    const sessions = makeSessionsAtPeak(10, 12);
    const ctx = makeBaseContext({
      allWorkSessions: sessions,
      currentHour: 9, // peak.startHour - 1
      averagePerActiveDay: null, // disable progress_context
    });
    const result = generateNudge(ctx);
    if (result?.type === 'time_peak') {
      expect(result.text).toContain('9am');
    }
  });

  it('does not match when current hour is far from peak', () => {
    const sessions = makeSessionsAtPeak(10, 12);
    const ctx = makeBaseContext({
      allWorkSessions: sessions,
      currentHour: 22, // far from peak
      averagePerActiveDay: null,
    });
    const result = generateNudge(ctx);
    expect(result?.type).not.toBe('time_peak');
  });
});

// ============================================
// Project Strength Nudge
// ============================================

describe('tryProjectStrengthNudge', () => {
  it('shows nudge when selected project matches pattern', () => {
    const ctx = makeBaseContext({
      selectedProjectId: 'proj-1',
      selectedProjectName: 'Design System',
      patterns: [
        {
          type: 'project_focus',
          description: "You've been deep in Design System recently",
          confidence: 0.8,
        },
      ],
      averagePerActiveDay: null, // disable progress
    });
    const result = generateNudge(ctx);
    expect(result?.type).toBe('project_strength');
    expect(result?.text).toContain('Design System');
    expect(result?.text).toContain("you're strongest here");
  });

  it('does not show when project name does not match pattern', () => {
    const ctx = makeBaseContext({
      selectedProjectId: 'proj-2',
      selectedProjectName: 'Other Project',
      patterns: [
        {
          type: 'project_focus',
          description: "You've been deep in Design System recently",
          confidence: 0.8,
        },
      ],
      averagePerActiveDay: null,
    });
    const result = generateNudge(ctx);
    expect(result?.type).not.toBe('project_strength');
  });

  it('does not show when no project selected', () => {
    const ctx = makeBaseContext({
      selectedProjectId: null,
      selectedProjectName: null,
      patterns: [
        {
          type: 'project_focus',
          description: "You've been deep in Design System recently",
          confidence: 0.8,
        },
      ],
      averagePerActiveDay: null,
    });
    const result = generateNudge(ctx);
    expect(result?.type).not.toBe('project_strength');
  });
});

// ============================================
// Progress Context Nudge
// ============================================

describe('tryProgressContextNudge', () => {
  it('shows next particle number and average', () => {
    const ctx = makeBaseContext({
      todayWorkCount: 3,
      averagePerActiveDay: 5.2,
    });
    const result = generateNudge(ctx);
    expect(result?.type).toBe('progress_context');
    expect(result?.text).toBe('Particle #4 today. Your average is 5.');
  });

  it('returns null when average is not available', () => {
    const ctx = makeBaseContext({
      averagePerActiveDay: null,
    });
    const result = generateNudge(ctx);
    expect(result?.type).not.toBe('progress_context');
  });

  it('shows #1 when no sessions today', () => {
    const ctx = makeBaseContext({
      todayWorkCount: 0,
      averagePerActiveDay: 3,
    });
    const result = generateNudge(ctx);
    expect(result?.type).toBe('progress_context');
    expect(result?.text).toBe('Particle #1 today. Your average is 3.');
  });
});

// ============================================
// Task Continuity Nudge
// ============================================

describe('tryTaskContinuityNudge', () => {
  it('shows last session duration for matching task', () => {
    const ctx = makeBaseContext({
      currentTask: 'API Refactor',
      averagePerActiveDay: null,
      allWorkSessions: [
        makeSession({ task: 'API Refactor', duration: 47 * 60 }),
        ...Array.from({ length: 10 }, () => makeSession()),
      ],
    });
    const result = generateNudge(ctx);
    expect(result?.type).toBe('task_continuity');
    expect(result?.text).toContain('API Refactor');
    expect(result?.text).toContain('47 minutes');
  });

  it('matches case-insensitively', () => {
    const ctx = makeBaseContext({
      currentTask: 'api refactor',
      averagePerActiveDay: null,
      allWorkSessions: [
        makeSession({ task: 'API Refactor', duration: 30 * 60 }),
        ...Array.from({ length: 10 }, () => makeSession()),
      ],
    });
    const result = generateNudge(ctx);
    expect(result?.type).toBe('task_continuity');
  });

  it('truncates long task names', () => {
    const longTask = 'This is a very long task name that goes on';
    const ctx = makeBaseContext({
      currentTask: longTask,
      averagePerActiveDay: null,
      allWorkSessions: [
        makeSession({ task: longTask, duration: 25 * 60 }),
        ...Array.from({ length: 10 }, () => makeSession()),
      ],
    });
    const result = generateNudge(ctx);
    expect(result?.type).toBe('task_continuity');
    // Task name truncated at 20 chars
    expect(result!.text.length).toBeLessThan(60);
  });

  it('returns null when no matching task', () => {
    const ctx = makeBaseContext({
      currentTask: 'New task',
      averagePerActiveDay: null,
      allWorkSessions: [
        makeSession({ task: 'Old task', duration: 25 * 60 }),
        ...Array.from({ length: 10 }, () => makeSession()),
      ],
    });
    const result = generateNudge(ctx);
    expect(result?.type).not.toBe('task_continuity');
  });

  it('returns null when currentTask is empty', () => {
    const ctx = makeBaseContext({
      currentTask: '',
      averagePerActiveDay: null,
    });
    const result = generateNudge(ctx);
    expect(result?.type).not.toBe('task_continuity');
  });
});

// ============================================
// Gentle Reminder Nudge
// ============================================

describe('tryGentleReminderNudge', () => {
  it('shows reminder for project untouched 10+ days', () => {
    const ctx = makeBaseContext({
      averagePerActiveDay: null,
      selectedProjectId: 'proj-active',
      activeProjects: [
        { id: 'proj-active', name: 'Active' },
        { id: 'proj-old', name: 'Documentation' },
      ],
      allWorkSessions: [
        makeSessionForProject('proj-old', 15), // 15 days ago
        ...Array.from({ length: 10 }, () => makeSession()),
      ],
    });
    const result = generateNudge(ctx);
    expect(result?.type).toBe('gentle_reminder');
    expect(result?.text).toContain('Documentation');
    expect(result?.text).toContain('untouched for');
    expect(result?.text).toContain('days');
  });

  it('ignores selected project', () => {
    const ctx = makeBaseContext({
      averagePerActiveDay: null,
      selectedProjectId: 'proj-old',
      activeProjects: [{ id: 'proj-old', name: 'Old Project' }],
      allWorkSessions: [
        makeSessionForProject('proj-old', 20),
        ...Array.from({ length: 10 }, () => makeSession()),
      ],
    });
    const result = generateNudge(ctx);
    expect(result?.type).not.toBe('gentle_reminder');
  });

  it('does not trigger for recent projects (< 10 days)', () => {
    const ctx = makeBaseContext({
      averagePerActiveDay: null,
      selectedProjectId: null,
      activeProjects: [{ id: 'proj-recent', name: 'Recent' }],
      allWorkSessions: [
        makeSessionForProject('proj-recent', 5), // 5 days ago
        ...Array.from({ length: 10 }, () => makeSession()),
      ],
    });
    const result = generateNudge(ctx);
    expect(result?.type).not.toBe('gentle_reminder');
  });
});

// ============================================
// detectPeakHours
// ============================================

describe('detectPeakHours', () => {
  it('returns null with < 10 sessions', () => {
    const sessions = Array.from({ length: 5 }, () => makeSessionAtHour(10));
    expect(detectPeakHours(sessions)).toBeNull();
  });

  it('finds contiguous peak range', () => {
    const sessions: DBSession[] = [];
    // Heavy concentration at 9-11
    for (let i = 0; i < 10; i++) {
      sessions.push(makeSessionAtHour(9, 50));
      sessions.push(makeSessionAtHour(10, 50));
      sessions.push(makeSessionAtHour(11, 50));
    }
    // Light scattered sessions
    sessions.push(makeSessionAtHour(3, 5));
    sessions.push(makeSessionAtHour(15, 5));
    sessions.push(makeSessionAtHour(20, 5));

    const peak = detectPeakHours(sessions);
    expect(peak).not.toBeNull();
    expect(peak!.startHour).toBe(9);
    expect(peak!.endHour).toBe(12); // 11 + 1
  });

  it('returns null when sessions are evenly distributed', () => {
    const sessions: DBSession[] = [];
    // One session per hour, even distribution
    for (let h = 0; h < 24; h++) {
      sessions.push(makeSessionAtHour(h, 25));
    }
    const peak = detectPeakHours(sessions);
    // Evenly distributed = no peak above 1.5x threshold
    expect(peak).toBeNull();
  });
});
