import { describe, it, expect } from 'vitest';
import { getTopTasks } from '../task-intelligence';
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

describe('getTopTasks', () => {
  it('groups sessions with the same task and computes count and avg duration', () => {
    const sessions = [
      makeSession({ task: 'Emails', duration: 1200 }),
      makeSession({ task: 'Emails', duration: 1800 }),
      makeSession({ task: 'Code Review', duration: 2400 }),
      makeSession({ task: 'Code Review', duration: 3600 }),
    ];

    const result = getTopTasks(sessions);

    expect(result).toHaveLength(2);

    const emails = result.find((t) => t.name === 'Emails');
    expect(emails).toBeDefined();
    expect(emails!.count).toBe(2);
    expect(emails!.totalDuration).toBe(3000);
    expect(emails!.avgDuration).toBe(1500);

    const review = result.find((t) => t.name === 'Code Review');
    expect(review).toBeDefined();
    expect(review!.count).toBe(2);
    expect(review!.totalDuration).toBe(6000);
    expect(review!.avgDuration).toBe(3000);
  });

  it('groups case-insensitively, preserving first-seen casing', () => {
    const sessions = [
      makeSession({ task: 'Emails' }),
      makeSession({ task: 'emails' }),
      makeSession({ task: 'EMAILS' }),
    ];

    const result = getTopTasks(sessions, { minCount: 2 });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Emails');
    expect(result[0].count).toBe(3);
  });

  it('filters out tasks with count below minCount', () => {
    const sessions = [
      makeSession({ task: 'Emails' }),
      makeSession({ task: 'Rare Task' }),
    ];

    const result = getTopTasks(sessions);
    expect(result).toHaveLength(0);
  });

  it('ignores sessions without a task', () => {
    const sessions = [
      makeSession({ task: undefined }),
      makeSession({ task: '' }),
      makeSession({ task: '  ' }),
      makeSession({ task: 'Emails' }),
      makeSession({ task: 'Emails' }),
    ];

    const result = getTopTasks(sessions);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Emails');
  });

  it('ignores break sessions', () => {
    const sessions = [
      makeSession({ type: 'shortBreak', task: 'Emails' }),
      makeSession({ type: 'shortBreak', task: 'Emails' }),
      makeSession({ type: 'longBreak', task: 'Emails' }),
    ];

    const result = getTopTasks(sessions, { minCount: 1 });
    expect(result).toHaveLength(0);
  });

  it('sorts by count desc, then totalDuration desc on tie', () => {
    const sessions = [
      makeSession({ task: 'A', duration: 100 }),
      makeSession({ task: 'A', duration: 100 }),
      makeSession({ task: 'B', duration: 500 }),
      makeSession({ task: 'B', duration: 500 }),
      makeSession({ task: 'C', duration: 100 }),
      makeSession({ task: 'C', duration: 100 }),
      makeSession({ task: 'C', duration: 100 }),
    ];

    const result = getTopTasks(sessions);

    expect(result[0].name).toBe('C');
    expect(result[0].count).toBe(3);
    // B and A tied at count 2, B has higher totalDuration
    expect(result[1].name).toBe('B');
    expect(result[2].name).toBe('A');
  });

  it('respects default limit of 5', () => {
    const tasks = ['A', 'B', 'C', 'D', 'E', 'F'];
    const sessions = tasks.flatMap((t) => [
      makeSession({ task: t }),
      makeSession({ task: t }),
    ]);

    const result = getTopTasks(sessions);
    expect(result).toHaveLength(5);
  });

  it('respects custom limit', () => {
    const sessions = [
      makeSession({ task: 'A' }),
      makeSession({ task: 'A' }),
      makeSession({ task: 'B' }),
      makeSession({ task: 'B' }),
      makeSession({ task: 'C' }),
      makeSession({ task: 'C' }),
    ];

    const result = getTopTasks(sessions, { limit: 2 });
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no sessions have tasks', () => {
    const sessions = [
      makeSession({}),
      makeSession({}),
    ];

    const result = getTopTasks(sessions);
    expect(result).toHaveLength(0);
  });

  it('returns empty array for empty input', () => {
    expect(getTopTasks([])).toHaveLength(0);
  });

  it('trims whitespace from task names', () => {
    const sessions = [
      makeSession({ task: '  Emails  ' }),
      makeSession({ task: 'Emails' }),
    ];

    const result = getTopTasks(sessions);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Emails');
    expect(result[0].count).toBe(2);
  });
});
