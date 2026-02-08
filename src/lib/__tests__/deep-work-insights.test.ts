import { describe, it, expect } from 'vitest';
import { buildDeepWorkInsights } from '../deep-work-insights';
import type { CompletedSession } from '../session-storage';

function makeSession(overrides: Partial<CompletedSession> = {}): CompletedSession {
  return {
    id: `test-${Math.random()}`,
    type: 'work',
    duration: 1500,
    completedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('buildDeepWorkInsights', () => {
  it('returns null for empty array', () => {
    expect(buildDeepWorkInsights([])).toBeNull();
  });

  it('returns null when only break sessions exist', () => {
    const sessions = [
      makeSession({ type: 'shortBreak', duration: 300 }),
      makeSession({ type: 'longBreak', duration: 900 }),
    ];
    expect(buildDeepWorkInsights(sessions)).toBeNull();
  });

  it('categorizes a deep work session (>= 45 min)', () => {
    const sessions = [makeSession({ duration: 2700 })];
    const result = buildDeepWorkInsights(sessions)!;

    expect(result.breakdown.deepWork).toBe(1);
    expect(result.breakdown.normal).toBe(0);
    expect(result.breakdown.quickFocus).toBe(0);
    expect(result.deepWorkRatio).toBe(1);
  });

  it('categorizes a quick focus session (< 15 min)', () => {
    const sessions = [makeSession({ duration: 600 })];
    const result = buildDeepWorkInsights(sessions)!;

    expect(result.breakdown.quickFocus).toBe(1);
    expect(result.breakdown.normal).toBe(0);
    expect(result.breakdown.deepWork).toBe(0);
  });

  it('categorizes a normal session (15-44 min)', () => {
    const sessions = [makeSession({ duration: 1500 })];
    const result = buildDeepWorkInsights(sessions)!;

    expect(result.breakdown.normal).toBe(1);
    expect(result.breakdown.deepWork).toBe(0);
    expect(result.breakdown.quickFocus).toBe(0);
  });

  it('counts overflow champion as deep work', () => {
    // 2500s actual, 1500s estimated, 1000s overflow → 167% > 150%
    const sessions = [
      makeSession({ duration: 2500, estimatedDuration: 1500, overflowDuration: 1000 }),
    ];
    const result = buildDeepWorkInsights(sessions)!;

    expect(result.breakdown.deepWork).toBe(1);
    expect(result.breakdown.normal).toBe(0);
  });

  it('calculates correct deep work ratio', () => {
    const sessions = [
      makeSession({ duration: 2700 }),  // deep
      makeSession({ duration: 2800 }),  // deep
      makeSession({ duration: 1500 }),  // normal
      makeSession({ duration: 600 }),   // quick
      makeSession({ duration: 1800 }),  // normal
    ];
    const result = buildDeepWorkInsights(sessions)!;

    expect(result.totalWorkSessions).toBe(5);
    expect(result.breakdown.deepWork).toBe(2);
    expect(result.breakdown.normal).toBe(2);
    expect(result.breakdown.quickFocus).toBe(1);
    expect(result.deepWorkRatio).toBeCloseTo(0.4);
  });

  it('calculates average session duration', () => {
    const sessions = [
      makeSession({ duration: 1000 }),
      makeSession({ duration: 2000 }),
      makeSession({ duration: 3000 }),
    ];
    const result = buildDeepWorkInsights(sessions)!;

    expect(result.avgSessionDuration).toBe(2000);
  });

  it('counts flow sessions correctly (overflowDuration > 0)', () => {
    const sessions = [
      makeSession({ duration: 1800, overflowDuration: 300 }),
      makeSession({ duration: 1500 }),
      makeSession({ duration: 2000, overflowDuration: 500 }),
    ];
    const result = buildDeepWorkInsights(sessions)!;

    expect(result.flowSessions).toBe(2);
  });

  it('sums total overflow seconds', () => {
    const sessions = [
      makeSession({ duration: 1800, overflowDuration: 300 }),
      makeSession({ duration: 2000, overflowDuration: 500 }),
      makeSession({ duration: 1500 }),
    ];
    const result = buildDeepWorkInsights(sessions)!;

    expect(result.totalOverflowSeconds).toBe(800);
  });

  it('reports zero flow stats when no overflow sessions', () => {
    const sessions = [
      makeSession({ duration: 1500 }),
      makeSession({ duration: 2700 }),
    ];
    const result = buildDeepWorkInsights(sessions)!;

    expect(result.flowSessions).toBe(0);
    expect(result.totalOverflowSeconds).toBe(0);
  });

  it('handles single session without NaN or division errors', () => {
    const sessions = [makeSession({ duration: 1500 })];
    const result = buildDeepWorkInsights(sessions)!;

    expect(result.totalWorkSessions).toBe(1);
    expect(result.avgSessionDuration).toBe(1500);
    expect(result.deepWorkRatio).toBe(0);
    expect(Number.isNaN(result.deepWorkRatio)).toBe(false);
    expect(Number.isNaN(result.avgSessionDuration)).toBe(false);
  });

  it('ignores break sessions in calculations', () => {
    const sessions = [
      makeSession({ type: 'work', duration: 2700 }),
      makeSession({ type: 'shortBreak', duration: 300 }),
      makeSession({ type: 'longBreak', duration: 900 }),
      makeSession({ type: 'work', duration: 600 }),
    ];
    const result = buildDeepWorkInsights(sessions)!;

    expect(result.totalWorkSessions).toBe(2);
    expect(result.breakdown.deepWork).toBe(1);
    expect(result.breakdown.quickFocus).toBe(1);
  });
});
