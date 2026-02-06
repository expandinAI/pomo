import { describe, it, expect } from 'vitest';
import {
  generateMemory,
  MAX_MEMORY_LENGTH,
  type MemoryContext,
} from '../memory-generator';

// ============================================
// Test Helpers
// ============================================

/** Base context where nothing is noteworthy — should produce null */
function baseContext(overrides: Partial<MemoryContext> = {}): MemoryContext {
  return {
    sessionDuration: 25 * 60, // 25 min
    sessionTask: null,
    sessionProjectId: null,
    sessionProjectName: null,
    sessionCompletedAt: '2026-02-06T14:00:00.000Z', // 2pm
    sessionOverflowDuration: 0,
    sessionEstimatedDuration: 25 * 60,
    todayWorkCount: 2,       // 2 before this one
    allTimeDailyMax: 5,      // personal best is 5
    daysSinceLastSession: 0, // no gap
    longestThisWeekDuration: 30 * 60, // 30 min
    consecutiveSameProject: 1,
    lifetimeWorkCount: 42,   // nothing near a milestone
    sessionStartHour: 13,    // 1pm — normal hours
    ...overrides,
  };
}

/** Assert result is null or does not contain text */
function expectNotToContain(result: string | null, text: string) {
  if (result === null) return; // null means no memory = pass
  expect(result).not.toContain(text);
}

// ============================================
// Tests
// ============================================

describe('generateMemory', () => {
  describe('No Match', () => {
    it('returns null when nothing is noteworthy', () => {
      expect(generateMemory(baseContext())).toBeNull();
    });

    it('returns null for zero duration', () => {
      expect(generateMemory(baseContext({ sessionDuration: 0 }))).toBeNull();
    });
  });

  describe('1. Daily Record', () => {
    it('triggers when today beats all-time daily max', () => {
      const result = generateMemory(baseContext({
        todayWorkCount: 5,  // 5 before + this one = 6
        allTimeDailyMax: 5, // previous best was 5
      }));
      expect(result).toBe('6 particles today — a new daily record.');
    });

    it('does not trigger when not beating the record', () => {
      const result = generateMemory(baseContext({
        todayWorkCount: 3,
        allTimeDailyMax: 5,
      }));
      expectNotToContain(result, 'daily record');
    });

    it('does not trigger for fewer than 3 particles', () => {
      const result = generateMemory(baseContext({
        todayWorkCount: 1,  // 1 + 1 = 2
        allTimeDailyMax: 1,
      }));
      expectNotToContain(result, 'daily record');
    });
  });

  describe('2. Return After Break', () => {
    it('triggers after 3-day gap', () => {
      const result = generateMemory(baseContext({
        daysSinceLastSession: 3,
      }));
      expect(result).toBe('First particle after 3 days.');
    });

    it('triggers after 10-day gap', () => {
      const result = generateMemory(baseContext({
        daysSinceLastSession: 10,
      }));
      expect(result).toBe('First particle after 10 days.');
    });

    it('does not trigger for 2-day gap', () => {
      const result = generateMemory(baseContext({
        daysSinceLastSession: 2,
      }));
      expectNotToContain(result, 'after');
    });
  });

  describe('3. Duration Milestone', () => {
    it('triggers when longest this week', () => {
      const result = generateMemory(baseContext({
        sessionDuration: 45 * 60,
        longestThisWeekDuration: 30 * 60,
        // Need to disable deep work (task with comma)
        sessionTask: 'task A, task B',
      }));
      expect(result).toBe('Longest particle this week.');
    });

    it('includes overtime suffix when there is overflow', () => {
      const result = generateMemory(baseContext({
        sessionDuration: 40 * 60,
        longestThisWeekDuration: 30 * 60,
        sessionOverflowDuration: 10 * 60,
      }));
      expect(result).toBe('Longest particle this week — with overtime.');
    });

    it('does not trigger when longestThisWeekDuration is 0', () => {
      const result = generateMemory(baseContext({
        sessionDuration: 25 * 60,
        longestThisWeekDuration: 0,
      }));
      expectNotToContain(result, 'Longest');
    });
  });

  describe('4. Deep Work', () => {
    it('triggers for 45+ min with single task', () => {
      const result = generateMemory(baseContext({
        sessionDuration: 50 * 60,
        longestThisWeekDuration: 60 * 60, // not the longest this week
        sessionTask: 'Write documentation',
      }));
      expect(result).toBe('50 uninterrupted minutes.');
    });

    it('triggers for 45+ min with no task', () => {
      const result = generateMemory(baseContext({
        sessionDuration: 45 * 60,
        longestThisWeekDuration: 60 * 60,
        sessionTask: null,
      }));
      expect(result).toBe('45 uninterrupted minutes.');
    });

    it('does not trigger for multi-task sessions', () => {
      const result = generateMemory(baseContext({
        sessionDuration: 50 * 60,
        longestThisWeekDuration: 60 * 60,
        sessionTask: 'Task A, Task B',
      }));
      expectNotToContain(result, 'uninterrupted');
    });

    it('does not trigger for < 45 min', () => {
      const result = generateMemory(baseContext({
        sessionDuration: 44 * 60,
        longestThisWeekDuration: 60 * 60,
      }));
      expectNotToContain(result, 'uninterrupted');
    });
  });

  describe('5. Overflow Champion', () => {
    it('triggers when overflow >= 50% of estimated', () => {
      const result = generateMemory(baseContext({
        sessionDuration: 40 * 60,
        sessionEstimatedDuration: 25 * 60,
        sessionOverflowDuration: 15 * 60, // 60% of 25
        longestThisWeekDuration: 60 * 60, // not longest
      }));
      expect(result).toBe('Planned 25m, worked 40m. In the zone.');
    });

    it('does not trigger when overflow < 50%', () => {
      const result = generateMemory(baseContext({
        sessionDuration: 30 * 60,
        sessionEstimatedDuration: 25 * 60,
        sessionOverflowDuration: 5 * 60, // 20% of 25
        longestThisWeekDuration: 60 * 60,
      }));
      expectNotToContain(result, 'In the zone');
    });
  });

  describe('6. Early Bird', () => {
    it('triggers for session starting before 7am', () => {
      const result = generateMemory(baseContext({
        sessionStartHour: 5,
        sessionCompletedAt: '2026-02-06T06:00:00.000Z',
        sessionDuration: 25 * 60,
      }));
      expect(result).toContain('ahead of the world');
    });

    it('does not trigger for 7am start', () => {
      const result = generateMemory(baseContext({
        sessionStartHour: 7,
      }));
      expectNotToContain(result, 'ahead of the world');
    });
  });

  describe('7. Night Owl', () => {
    it('triggers for session starting at 10pm', () => {
      const result = generateMemory(baseContext({
        sessionStartHour: 22,
        sessionCompletedAt: '2026-02-06T22:30:00.000Z',
        sessionDuration: 25 * 60,
      }));
      expect(result).toContain('the quiet hours');
    });

    it('triggers for session starting at 11pm', () => {
      const result = generateMemory(baseContext({
        sessionStartHour: 23,
        sessionCompletedAt: '2026-02-06T23:30:00.000Z',
        sessionDuration: 25 * 60,
      }));
      expect(result).toContain('the quiet hours');
    });

    it('does not trigger for 9pm start', () => {
      const result = generateMemory(baseContext({
        sessionStartHour: 21,
      }));
      expectNotToContain(result, 'quiet hours');
    });
  });

  describe('8. Project Dedication', () => {
    it('triggers for 3+ consecutive same-project sessions', () => {
      const result = generateMemory(baseContext({
        consecutiveSameProject: 3,
        sessionProjectName: 'Particle',
        sessionProjectId: 'proj-1',
      }));
      expect(result).toBe('3x Particle in a row.');
    });

    it('triggers for 5 consecutive sessions', () => {
      const result = generateMemory(baseContext({
        consecutiveSameProject: 5,
        sessionProjectName: 'Design System',
        sessionProjectId: 'proj-2',
      }));
      expect(result).toBe('5x Design System in a row.');
    });

    it('does not trigger without project name', () => {
      const result = generateMemory(baseContext({
        consecutiveSameProject: 3,
        sessionProjectName: null,
        sessionProjectId: null,
      }));
      expectNotToContain(result, 'in a row');
    });

    it('does not trigger for < 3 consecutive', () => {
      const result = generateMemory(baseContext({
        consecutiveSameProject: 2,
        sessionProjectName: 'Particle',
        sessionProjectId: 'proj-1',
      }));
      expectNotToContain(result, 'in a row');
    });
  });

  describe('9. Milestone Proximity', () => {
    it('triggers near 100 milestone', () => {
      const result = generateMemory(baseContext({
        lifetimeWorkCount: 97,
      }));
      expect(result).toBe('Particle #97. 3 to go.');
    });

    it('triggers at 95', () => {
      const result = generateMemory(baseContext({
        lifetimeWorkCount: 95,
      }));
      expect(result).toBe('Particle #95. 5 to go.');
    });

    it('triggers near 50 milestone', () => {
      const result = generateMemory(baseContext({
        lifetimeWorkCount: 48,
      }));
      expect(result).toBe('Particle #48. Almost there.');
    });

    it('triggers at 49', () => {
      const result = generateMemory(baseContext({
        lifetimeWorkCount: 49,
      }));
      expect(result).toBe('Particle #49. Almost there.');
    });

    it('does not trigger at 42', () => {
      const result = generateMemory(baseContext({
        lifetimeWorkCount: 42,
      }));
      expectNotToContain(result, 'Particle #');
    });

    it('prefers 100-milestone over 50-milestone at 198', () => {
      const result = generateMemory(baseContext({
        lifetimeWorkCount: 198,
      }));
      expect(result).toBe('Particle #198. 2 to go.');
    });
  });

  describe('Priority Order', () => {
    it('daily record wins over return after break', () => {
      const result = generateMemory(baseContext({
        todayWorkCount: 5,
        allTimeDailyMax: 5,
        daysSinceLastSession: 5,
      }));
      expect(result).toContain('daily record');
    });

    it('return after break wins over deep work', () => {
      const result = generateMemory(baseContext({
        daysSinceLastSession: 5,
        sessionDuration: 50 * 60,
        longestThisWeekDuration: 60 * 60,
      }));
      expect(result).toContain('after 5 days');
    });
  });

  describe('Max Length', () => {
    it('all templates produce <= 80 chars', () => {
      const cases: Partial<MemoryContext>[] = [
        { todayWorkCount: 99, allTimeDailyMax: 99 },
        { daysSinceLastSession: 365 },
        { sessionDuration: 120 * 60, longestThisWeekDuration: 60 * 60, sessionOverflowDuration: 30 * 60 },
        { sessionDuration: 120 * 60, longestThisWeekDuration: 180 * 60 },
        { sessionEstimatedDuration: 25 * 60, sessionOverflowDuration: 25 * 60, sessionDuration: 50 * 60, longestThisWeekDuration: 60 * 60 },
        { sessionStartHour: 4, sessionCompletedAt: '2026-02-06T04:30:00.000Z' },
        { sessionStartHour: 23, sessionCompletedAt: '2026-02-06T23:55:00.000Z' },
        { consecutiveSameProject: 10, sessionProjectName: 'A Very Long Project Name That Is Quite Long', sessionProjectId: 'p' },
        { lifetimeWorkCount: 999 },
      ];

      for (const override of cases) {
        const result = generateMemory(baseContext(override));
        if (result) {
          expect(result.length).toBeLessThanOrEqual(MAX_MEMORY_LENGTH);
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('handles sessionDuration = 0', () => {
      expect(generateMemory(baseContext({ sessionDuration: 0 }))).toBeNull();
    });

    it('handles daysSinceLastSession = 0', () => {
      expect(generateMemory(baseContext({ daysSinceLastSession: 0 }))).toBeNull();
    });

    it('handles empty project name with consecutiveSameProject', () => {
      const result = generateMemory(baseContext({
        consecutiveSameProject: 5,
        sessionProjectName: '',
        sessionProjectId: 'proj-1',
      }));
      // Empty string is falsy, should not trigger project dedication
      expectNotToContain(result, 'in a row');
    });
  });
});
