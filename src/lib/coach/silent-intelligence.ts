/**
 * Silent Intelligence — Pure functions for subtle UI enhancements
 *
 * Three sub-features that make existing UI elements smarter:
 * A) Smart Preset Highlighting — recommends a preset based on time-of-day patterns
 * B) Task Prediction — predicts likely task based on day+hour patterns
 * C) Intelligent Empty States — contextual timeline empty messages
 *
 * All functions are pure (no React, no hooks). Components call them via useMemo.
 */

import type { UnifiedSession } from '@/contexts/SessionContext';

// ============================================
// A) Smart Preset Highlighting
// ============================================

interface PresetRecommendation {
  presetId: 'classic' | 'deepWork' | 'ultradian' | null;
}

/**
 * Recommends a preset based on the user's historical session durations
 * at the current time of day.
 *
 * - Needs 20+ total work sessions and 5+ at current hour (±1h)
 * - Maps average duration to closest preset
 * - Never recommends 'custom'
 */
export function getSmartPreset(
  sessions: UnifiedSession[],
  currentHour: number
): PresetRecommendation {
  const workSessions = sessions.filter(s => s.type === 'work');
  if (workSessions.length < 20) return { presetId: null };

  // Filter: sessions at current hour ±1h (wraps around midnight)
  const relevant = workSessions.filter(s => {
    const h = new Date(s.completedAt).getHours();
    const diff = Math.abs(h - currentHour);
    return diff <= 1 || diff >= 23;
  });

  if (relevant.length < 5) return { presetId: null };

  const avgSeconds = relevant.reduce((sum, s) => sum + s.duration, 0) / relevant.length;
  const avgMinutes = avgSeconds / 60;

  // Map to preset by duration cluster
  // Presets: classic=25m, deepWork=52m, ultradian=90m
  if (avgMinutes >= 70) return { presetId: 'ultradian' };
  if (avgMinutes >= 40) return { presetId: 'deepWork' };
  if (avgMinutes >= 15) return { presetId: 'classic' };

  return { presetId: null };
}

// ============================================
// B) Task Prediction
// ============================================

/**
 * Predicts the most likely task based on day-of-week and hour patterns.
 *
 * - Matches same weekday + same hour (±1h)
 * - Needs 3+ occurrences of the exact same task text
 * - Returns the most frequent matching task, or null
 */
export function getTaskPrediction(
  sessions: UnifiedSession[],
  currentDay: number,  // 0-6 (getDay())
  currentHour: number  // 0-23
): string | null {
  const withTask = sessions.filter(s => s.type === 'work' && s.task);

  // Filter: same weekday, same hour ±1h
  const contextSessions = withTask.filter(s => {
    const d = new Date(s.completedAt);
    return d.getDay() === currentDay &&
           Math.abs(d.getHours() - currentHour) <= 1;
  });

  if (contextSessions.length < 3) return null;

  // Count task occurrences
  const taskCounts = new Map<string, number>();
  for (const s of contextSessions) {
    if (s.task) {
      taskCounts.set(s.task, (taskCounts.get(s.task) || 0) + 1);
    }
  }

  // Find dominant task with >= 3 occurrences
  let maxTask = '';
  let maxCount = 0;
  for (const [task, count] of Array.from(taskCounts.entries())) {
    if (count > maxCount) { maxCount = count; maxTask = task; }
  }

  return maxCount >= 3 ? maxTask : null;
}

// ============================================
// C) Intelligent Empty States
// ============================================

/**
 * Returns a contextual message for the empty timeline state.
 *
 * Priority chain:
 * 1. 3+ day break → "Welcome back. Start small."
 * 2. Strong day of week → "Monday — your most productive day. 4.2 avg."
 * 3. Peak focus hour → "Your peak focus window. Make it count."
 * 4. Default → "A blank canvas"
 *
 * Needs 10+ work sessions to activate intelligence.
 */
export function getSmartEmptyState(
  sessions: UnifiedSession[],
  currentDay: number,
  currentHour: number
): string {
  const workSessions = sessions.filter(s => s.type === 'work');

  if (workSessions.length < 10) return 'A blank canvas';

  // Priority 1: Return after 3+ day break
  const sorted = [...workSessions].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  if (sorted.length > 0) {
    const lastDate = new Date(sorted[0].completedAt);
    const now = new Date();
    const lastDay = new Date(lastDate); lastDay.setHours(0, 0, 0, 0);
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const daysDiff = Math.round((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff >= 3) return 'Welcome back. Start small.';
  }

  // Priority 2: Strong day of week
  const dayBuckets: Record<number, number[]> = {};
  for (let i = 0; i < 7; i++) dayBuckets[i] = [];
  for (const s of workSessions) {
    dayBuckets[new Date(s.completedAt).getDay()].push(s.duration);
  }

  // Count unique calendar days per weekday
  const dateSets: Record<number, Set<string>> = {};
  for (let i = 0; i < 7; i++) dateSets[i] = new Set();
  for (const s of workSessions) {
    const d = new Date(s.completedAt);
    dateSets[d.getDay()].add(d.toLocaleDateString('en-CA'));
  }

  const allUniqueDays = new Set(
    workSessions.map(s => new Date(s.completedAt).toLocaleDateString('en-CA'))
  ).size;
  const overallAvg = workSessions.length / Math.max(allUniqueDays, 1);
  const todayCount = dayBuckets[currentDay].length;
  const todayUniqueDays = Math.max(dateSets[currentDay].size, 1);
  const todayAvg = todayCount / todayUniqueDays;

  if (todayAvg > overallAvg * 1.2 && todayCount >= 5) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formatted = Number.isInteger(todayAvg) ? `${todayAvg}` : todayAvg.toFixed(1);
    return `${dayNames[currentDay]}\u2009\u2014\u2009your most productive day. ${formatted} avg.`;
  }

  // Priority 3: Peak focus hour
  const hourBuckets: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourBuckets[i] = 0;
  for (const s of workSessions) {
    hourBuckets[new Date(s.completedAt).getHours()] += s.duration / 60;
  }
  const totalMinutes = Object.values(hourBuckets).reduce((a, b) => a + b, 0);
  const avgPerHour = totalMinutes / 24;
  if (avgPerHour > 0 && hourBuckets[currentHour] > avgPerHour * 1.5) {
    return 'Your peak focus window. Make it count.';
  }

  return 'A blank canvas';
}
