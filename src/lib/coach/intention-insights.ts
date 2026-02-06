/**
 * Intention-Coach Bridge — Pure Functions
 *
 * Morning Context: Shows historical insight while typing intention.
 * Evening Insight: Reflective sentence after day's work (local fallback).
 *
 * No React. No side effects.
 */

import type { CompletedSession } from '@/lib/session-storage';

// ============================================================================
// Types
// ============================================================================

export interface MatchResult {
  type: 'project' | 'task';
  name: string;
  particleCount: number;
  totalMinutes: number;
  peakHour: number | null;
}

export interface EveningInsightContext {
  intentionText: string;
  totalParticles: number;
  alignedCount: number;
  reactiveCount: number;
  alignedMinutes: number;
  reactiveMinutes: number;
  reactiveTasks: string[];
}

// ============================================================================
// Morning Context
// ============================================================================

/**
 * Find matching historical context for the intention text.
 *
 * Checks project names first, then frequent tasks.
 * Returns null if text is too short or no sufficient match found.
 */
export function findMatchingContext(
  text: string,
  projects: Array<{ id: string; name: string }>,
  sessions: CompletedSession[]
): MatchResult | null {
  const trimmed = text.trim();
  if (trimmed.length < 3) return null;

  const lower = trimmed.toLowerCase();

  // 1. Try project name match (case-insensitive substring)
  const matchedProject = projects.find(
    (p) => p.name.toLowerCase().includes(lower) || lower.includes(p.name.toLowerCase())
  );

  if (matchedProject) {
    const now = Date.now();
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

    const matched = sessions.filter(
      (s) =>
        s.type === 'work' &&
        s.projectId === matchedProject.id &&
        new Date(s.completedAt).getTime() >= fourteenDaysAgo
    );

    if (matched.length >= 3) {
      const totalMinutes = matched.reduce((sum, s) => sum + s.duration, 0) / 60;
      return {
        type: 'project',
        name: matchedProject.name,
        particleCount: matched.length,
        totalMinutes: Math.round(totalMinutes),
        peakHour: findPeakHour(matched),
      };
    }
  }

  // 2. Try task name match (last 30 days, >= 3 occurrences)
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const recentWork = sessions.filter(
    (s) =>
      s.type === 'work' &&
      s.task &&
      new Date(s.completedAt).getTime() >= thirtyDaysAgo
  );

  // Find tasks matching the input text
  const matchingTasks = recentWork.filter(
    (s) => s.task!.toLowerCase().includes(lower) || lower.includes(s.task!.toLowerCase())
  );

  if (matchingTasks.length >= 3) {
    // Group by exact task name — pick the most frequent
    const taskGroups: Record<string, CompletedSession[]> = {};
    for (const s of matchingTasks) {
      const task = s.task!;
      if (!taskGroups[task]) taskGroups[task] = [];
      taskGroups[task].push(s);
    }

    let bestTask: string | null = null;
    let bestSessions: CompletedSession[] = [];

    for (const [task, group] of Object.entries(taskGroups)) {
      if (group.length > bestSessions.length) {
        bestTask = task;
        bestSessions = group;
      }
    }

    if (bestTask && bestSessions.length >= 3) {
      const totalMinutes = bestSessions.reduce((sum, s) => sum + s.duration, 0) / 60;
      return {
        type: 'task',
        name: bestTask,
        particleCount: bestSessions.length,
        totalMinutes: Math.round(totalMinutes),
        peakHour: findPeakHour(bestSessions),
      };
    }
  }

  return null;
}

/**
 * Build a human-readable morning insight from a match result.
 */
export function buildMorningInsight(match: MatchResult): string {
  const avgMinutes = Math.round(match.totalMinutes / match.particleCount);

  if (match.type === 'project') {
    if (match.peakHour !== null) {
      const hourLabel = formatHourLabel(match.peakHour);
      return `Last 2 weeks: ${match.particleCount} particles on ${match.name}. Best sessions around ${hourLabel}.`;
    }
    return `Last 2 weeks: ${match.particleCount} particles on ${match.name}. Avg ${avgMinutes} min each.`;
  }

  // Task match
  return `You've done "${match.name}" ${match.particleCount} times recently. Avg ${avgMinutes} min each.`;
}

/**
 * Find the peak hour (mode) from a set of sessions.
 * Returns null if no hour has >= 3 sessions.
 */
export function findPeakHour(sessions: CompletedSession[]): number | null {
  const hourCounts: Record<number, number> = {};

  for (const s of sessions) {
    const hour = new Date(s.completedAt).getHours();
    // Use start hour (approximate: completedAt - duration)
    const startTime = new Date(s.completedAt).getTime() - s.duration * 1000;
    const startHour = new Date(startTime).getHours();
    hourCounts[startHour] = (hourCounts[startHour] || 0) + 1;
  }

  let peakHour: number | null = null;
  let maxCount = 0;

  for (const [hour, count] of Object.entries(hourCounts)) {
    if (count >= 3 && count > maxCount) {
      maxCount = count;
      peakHour = parseInt(hour, 10);
    }
  }

  return peakHour;
}

// ============================================================================
// Evening Insight (Local Fallback)
// ============================================================================

/**
 * Generate a local evening insight sentence.
 * Used as fallback when AI is unavailable or for Free tier.
 */
export function generateLocalEveningInsight(ctx: EveningInsightContext): string {
  if (ctx.totalParticles === 0) {
    return 'A quiet day. Tomorrow\'s a fresh page.';
  }

  if (ctx.reactiveCount === 0) {
    return 'Fully aligned. Every particle served your intention.';
  }

  if (ctx.alignedCount === 0) {
    return 'Life happened. Tomorrow\'s a fresh page.';
  }

  // Mixed: some aligned, some reactive
  const reactiveLabel =
    ctx.reactiveTasks.length > 0
      ? ctx.reactiveTasks.slice(0, 2).map((t) => `"${t}"`).join(' and ') + ' took the rest'
      : 'the rest was reactive';

  return `${ctx.alignedCount} of ${ctx.totalParticles} aligned. ${reactiveLabel[0].toUpperCase() + reactiveLabel.slice(1)}.`;
}

// ============================================================================
// Helpers
// ============================================================================

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}
