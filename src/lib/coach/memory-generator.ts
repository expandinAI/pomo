// src/lib/coach/memory-generator.ts
//
// Pure functions for generating Particle Memories.
// No React, no API calls — fully local heuristic.

export const MAX_MEMORY_LENGTH = 80;

/**
 * Context needed to generate a memory for a completed session.
 * All fields are pre-computed by the calling hook.
 */
export interface MemoryContext {
  // Session data
  sessionDuration: number;           // seconds
  sessionTask: string | null;
  sessionProjectId: string | null;
  sessionProjectName: string | null;
  sessionCompletedAt: string;        // ISO timestamp
  sessionOverflowDuration: number;   // 0 if no overflow
  sessionEstimatedDuration: number;  // planned duration in seconds

  // Contextual data
  todayWorkCount: number;            // work sessions today BEFORE this one
  allTimeDailyMax: number;           // highest work count in any single day
  daysSinceLastSession: number;      // 0 = had session today/yesterday, 3 = 3-day gap
  longestThisWeekDuration: number;   // seconds, max of work sessions this week
  consecutiveSameProject: number;    // including this session
  lifetimeWorkCount: number;         // total work sessions ever (including this one)
  sessionStartHour: number;          // 0-23, derived from completedAt - duration
}

// ============================================
// Main Entry Point
// ============================================

/**
 * Generate a memory for a completed session.
 * Returns null if no trigger matches (~40-60% of sessions get a memory).
 */
export function generateMemory(ctx: MemoryContext): string | null {
  return (
    tryDailyRecord(ctx) ??
    tryReturnAfterBreak(ctx) ??
    tryDurationMilestone(ctx) ??
    tryDeepWork(ctx) ??
    tryOverflowChampion(ctx) ??
    tryEarlyBird(ctx) ??
    tryNightOwl(ctx) ??
    tryProjectDedication(ctx) ??
    tryMilestoneProximity(ctx) ??
    null
  );
}

// ============================================
// Trigger Generators (Priority Order)
// ============================================

/** 1. Daily Record — more particles today than any previous day */
function tryDailyRecord(ctx: MemoryContext): string | null {
  const newCount = ctx.todayWorkCount + 1;
  if (newCount > ctx.allTimeDailyMax && newCount >= 3) {
    return enforceMaxLength(`${newCount} particles today — a new daily record.`);
  }
  return null;
}

/** 2. Return After Break — first particle after 3+ day gap */
function tryReturnAfterBreak(ctx: MemoryContext): string | null {
  if (ctx.daysSinceLastSession >= 3) {
    return enforceMaxLength(`First particle after ${ctx.daysSinceLastSession} days.`);
  }
  return null;
}

/** 3. Duration Milestone — longest particle this week */
function tryDurationMilestone(ctx: MemoryContext): string | null {
  if (
    ctx.sessionDuration > ctx.longestThisWeekDuration &&
    ctx.longestThisWeekDuration > 0
  ) {
    const suffix = ctx.sessionOverflowDuration > 0 ? ' — with overtime.' : '.';
    return enforceMaxLength(`Longest particle this week${suffix}`);
  }
  return null;
}

/** 4. Deep Work — 45+ min uninterrupted, single task */
function tryDeepWork(ctx: MemoryContext): string | null {
  const minutes = Math.round(ctx.sessionDuration / 60);
  if (minutes >= 45 && isSingleTask(ctx.sessionTask)) {
    return enforceMaxLength(`${minutes} uninterrupted minutes.`);
  }
  return null;
}

/** 5. Overflow Champion — overflow >= 50% of estimated duration */
function tryOverflowChampion(ctx: MemoryContext): string | null {
  if (
    ctx.sessionEstimatedDuration > 0 &&
    ctx.sessionOverflowDuration >= ctx.sessionEstimatedDuration * 0.5
  ) {
    const planned = Math.round(ctx.sessionEstimatedDuration / 60);
    const actual = Math.round(ctx.sessionDuration / 60);
    return enforceMaxLength(`Planned ${planned}m, worked ${actual}m. In the zone.`);
  }
  return null;
}

/** 6. Early Bird — session started before 7am */
function tryEarlyBird(ctx: MemoryContext): string | null {
  if (ctx.sessionStartHour < 7) {
    const time = formatTimeShort(ctx.sessionCompletedAt, ctx.sessionDuration);
    return enforceMaxLength(`${time} — ahead of the world.`);
  }
  return null;
}

/** 7. Night Owl — session started at or after 10pm */
function tryNightOwl(ctx: MemoryContext): string | null {
  if (ctx.sessionStartHour >= 22) {
    const time = formatTimeShort(ctx.sessionCompletedAt, ctx.sessionDuration);
    return enforceMaxLength(`${time} — the quiet hours.`);
  }
  return null;
}

/** 8. Project Dedication — 3+ consecutive sessions on same project */
function tryProjectDedication(ctx: MemoryContext): string | null {
  if (ctx.consecutiveSameProject >= 3 && ctx.sessionProjectName) {
    const name = truncate(ctx.sessionProjectName, 30);
    return enforceMaxLength(`${ctx.consecutiveSameProject}x ${name} in a row.`);
  }
  return null;
}

/** 9. Milestone Proximity — approaching 50/100 milestones */
function tryMilestoneProximity(ctx: MemoryContext): string | null {
  const n = ctx.lifetimeWorkCount;
  // Within 5 of a 100-milestone
  if (n % 100 >= 95) {
    const target = Math.ceil(n / 100) * 100;
    return enforceMaxLength(`Particle #${n}. ${target - n} to go.`);
  }
  // Within 2 of a 50-milestone (but not also a 100-milestone)
  if (n % 50 >= 48 && n % 100 < 95) {
    const target = Math.ceil(n / 50) * 50;
    return enforceMaxLength(`Particle #${n}. Almost there.`);
  }
  return null;
}

// ============================================
// Helper Functions
// ============================================

/** Check if task is a single task (no comma, no multi-line separator) */
function isSingleTask(task: string | null): boolean {
  if (!task) return true; // No task = single focus
  return !task.includes(',') && !task.includes(';') && !task.includes(' / ');
}

/** Truncate text with ellipsis */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

/** Format start time of session as "6:14am" */
function formatTimeShort(completedAt: string, durationSeconds: number): string {
  const endTime = new Date(completedAt);
  const startTime = new Date(endTime.getTime() - durationSeconds * 1000);
  const hours = startTime.getHours();
  const minutes = startTime.getMinutes();
  const ampm = hours < 12 ? 'am' : 'pm';
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, '0');
  return `${h}:${m}${ampm}`;
}

/** Hard cap at MAX_MEMORY_LENGTH */
function enforceMaxLength(text: string): string {
  if (text.length <= MAX_MEMORY_LENGTH) return text;
  return text.slice(0, MAX_MEMORY_LENGTH - 1) + '…';
}
