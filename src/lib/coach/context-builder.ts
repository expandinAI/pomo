/**
 * Context builder for the AI Coach
 *
 * Builds a complete context from IndexedDB session and project data.
 * This context is used to personalize the coach's responses.
 */

import {
  loadSessions,
  getSessionsFromDays,
  getTodaySessions,
} from '@/lib/db/sessions';
import { loadProjects } from '@/lib/db/projects';
import { getTodayIntention, getIntentionsForWeek } from '@/lib/intentions/storage';
import { getWeekBoundaries } from '@/lib/session-analytics';
import type { DBSession, DBProject, DBIntention } from '@/lib/db/types';
import { detectAllPatterns } from './patterns';
import type {
  CoachContext,
  SessionSummary,
  ProjectBreakdown,
  DetectedPattern,
  RecentActivity,
  WeeklySummary,
  DailySummary,
  TaskFrequency,
  IntentionContext,
  WeeklyIntentionSummary,
  DailyIntentionEntry,
  DeferredChain,
} from './types';

/**
 * Number of days to consider for pattern detection and context
 */
const CONTEXT_DAYS = 30;

/**
 * Number of weeks to include in weekly trend
 */
const WEEKLY_TREND_WEEKS = 6;

/**
 * Number of days to include in daily trend
 */
const DAILY_TREND_DAYS = 14;

/**
 * Build the complete coach context from local data
 *
 * This is the main entry point for building context.
 * Currently runs client-side against IndexedDB.
 * For cloud users, this will later be replaced with server-side context building.
 */
export async function buildCoachContext(): Promise<CoachContext> {
  // Load all required data
  const [
    allSessions,
    recentSessions,
    todaySessions,
    projects,
    todayIntention,
    thisWeekIntentions,
    lastWeekIntentions,
  ] = await Promise.all([
    loadSessions(),
    getSessionsFromDays(CONTEXT_DAYS),
    getTodaySessions(),
    loadProjects(),
    getTodayIntention(),
    getIntentionsForWeek(getMondayDateString(0)),
    getIntentionsForWeek(getMondayDateString(-1)),
  ]);

  // Build each part of the context
  const sessionSummary = buildSessionSummary(
    allSessions,
    recentSessions,
    todaySessions
  );
  const projectBreakdown = buildProjectBreakdown(recentSessions, projects);
  const patterns = detectAllPatterns(recentSessions, projects);
  const recentActivity = buildRecentActivity(recentSessions, projects);
  const weeklyTrend = buildWeeklyTrend(recentSessions, projects);
  const dailyTrend = buildDailyTrend(recentSessions);
  const taskFrequency = buildTaskFrequency(recentSessions, projects);

  // Build intention context if set
  const intentionContext = buildIntentionContext(
    todayIntention ?? null,
    todaySessions
  );

  // Build weekly intention summaries
  const weeklyIntentions = buildWeeklyIntentions(
    thisWeekIntentions,
    lastWeekIntentions,
    recentSessions
  );

  return {
    sessionSummary,
    projectBreakdown,
    patterns,
    recentActivity,
    weeklyTrend,
    dailyTrend,
    taskFrequency,
    ...(intentionContext ? { todayIntention: intentionContext } : {}),
    ...(weeklyIntentions.length > 0 ? { weeklyIntentions } : {}),
  };
}

/**
 * Build session summary statistics
 */
function buildSessionSummary(
  allSessions: DBSession[],
  recentSessions: DBSession[],
  todaySessions: DBSession[]
): SessionSummary {
  // Filter to work sessions only
  const allWork = allSessions.filter((s) => s.type === 'work');
  const recentWork = recentSessions.filter((s) => s.type === 'work');

  // Calculate totals
  const totalParticles = allWork.length;
  const totalMinutes = allWork.reduce((sum, s) => sum + s.duration, 0) / 60;

  // Today
  const todayParticles = todaySessions.length;
  const todayMinutes =
    todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60;

  // Last 7 days (rolling window, not calendar week)
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartIso = weekStart.toISOString();

  const weekSessions = recentWork.filter(
    (s) => s.completedAt >= weekStartIso
  );
  const weekParticles = weekSessions.length;
  const weekMinutes =
    weekSessions.reduce((sum, s) => sum + s.duration, 0) / 60;

  // Average session length (from recent sessions for relevance)
  const averageSessionMinutes =
    recentWork.length > 0
      ? recentWork.reduce((sum, s) => sum + s.duration, 0) / recentWork.length / 60
      : 0;

  return {
    totalParticles,
    totalMinutes: Math.round(totalMinutes * 10) / 10,
    todayParticles,
    todayMinutes: Math.round(todayMinutes * 10) / 10,
    weekParticles,
    weekMinutes: Math.round(weekMinutes * 10) / 10,
    averageSessionMinutes: Math.round(averageSessionMinutes),
  };
}

/**
 * Build project breakdown with percentages
 */
function buildProjectBreakdown(
  sessions: DBSession[],
  projects: DBProject[]
): ProjectBreakdown[] {
  const workSessions = sessions.filter((s) => s.type === 'work');

  // Calculate time per project
  const projectStats: Record<
    string,
    { particles: number; minutes: number }
  > = {};

  let totalMinutes = 0;

  for (const session of workSessions) {
    const projectId = session.projectId || 'unassigned';
    if (!projectStats[projectId]) {
      projectStats[projectId] = { particles: 0, minutes: 0 };
    }
    projectStats[projectId].particles++;
    projectStats[projectId].minutes += session.duration / 60;
    totalMinutes += session.duration / 60;
  }

  // Convert to array with project names
  const breakdown: ProjectBreakdown[] = [];

  for (const [projectId, stats] of Object.entries(projectStats)) {
    const project = projects.find((p) => p.id === projectId);
    const projectName =
      projectId === 'unassigned' ? 'Unassigned' : project?.name || 'Unknown';

    breakdown.push({
      projectId,
      projectName,
      particles: stats.particles,
      minutes: Math.round(stats.minutes * 10) / 10,
      percentage:
        totalMinutes > 0 ? Math.round((stats.minutes / totalMinutes) * 100) : 0,
    });
  }

  // Sort by percentage descending
  return breakdown.sort((a, b) => b.percentage - a.percentage);
}

/**
 * Build recent activity information
 */
function buildRecentActivity(
  sessions: DBSession[],
  projects: DBProject[]
): RecentActivity {
  const workSessions = sessions
    .filter((s) => s.type === 'work')
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

  // Last session (including task)
  const lastSession = workSessions[0];
  const lastSessionInfo = lastSession
    ? {
        projectName: lastSession.projectId
          ? projects.find((p) => p.id === lastSession.projectId)?.name
          : undefined,
        task: lastSession.task || undefined,
        durationMinutes: Math.round(lastSession.duration / 60),
        completedAt: new Date(lastSession.completedAt),
      }
    : null;

  // Last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const last24Hours = workSessions.filter(
    (s) => new Date(s.completedAt) >= twentyFourHoursAgo
  ).length;

  // Active project (most worked on in last 7 days)
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekSessions = workSessions.filter(
    (s) => new Date(s.completedAt) >= weekStart
  );

  const projectMinutes: Record<string, number> = {};
  for (const session of weekSessions) {
    if (session.projectId) {
      projectMinutes[session.projectId] =
        (projectMinutes[session.projectId] || 0) + session.duration / 60;
    }
  }

  let activeProjectId: string | null = null;
  let maxMinutes = 0;
  for (const [projectId, minutes] of Object.entries(projectMinutes)) {
    if (minutes > maxMinutes) {
      maxMinutes = minutes;
      activeProjectId = projectId;
    }
  }

  const activeProject = activeProjectId
    ? projects.find((p) => p.id === activeProjectId)?.name || null
    : null;

  // Recent tasks (unique, from last 7 days, max 10)
  const recentTasks: string[] = [];
  const seenTasks = new Set<string>();
  for (const session of weekSessions) {
    if (session.task && !seenTasks.has(session.task)) {
      seenTasks.add(session.task);
      recentTasks.push(session.task);
      if (recentTasks.length >= 10) break;
    }
  }

  return {
    lastSession: lastSessionInfo,
    last24Hours,
    activeProject,
    recentTasks,
  };
}

/**
 * Build intention context from today's intention and sessions
 */
function buildIntentionContext(
  intention: DBIntention | null,
  todaySessions: DBSession[]
): IntentionContext | undefined {
  if (!intention) return undefined;

  const workSessions = todaySessions.filter((s) => s.type === 'work');
  const aligned = workSessions.filter(
    (s) => s.intentionAlignment === 'aligned'
  ).length;
  const reactive = workSessions.filter(
    (s) => s.intentionAlignment === 'reactive'
  ).length;
  const total = workSessions.length;

  return {
    text: intention.text,
    particleGoal: intention.particleGoal ?? null,
    status: intention.status,
    alignment: {
      totalParticles: total,
      alignedCount: aligned,
      reactiveCount: reactive,
      percentage: total > 0 ? Math.round((aligned / total) * 100) : 0,
    },
  };
}

/**
 * Format context as a string for the prompt
 *
 * This creates a human-readable summary of the user's data
 * that gets inserted into the system prompt.
 */
export function formatContextForPrompt(context: CoachContext): string {
  const {
    sessionSummary,
    projectBreakdown,
    patterns,
    recentActivity,
    weeklyTrend,
    dailyTrend,
    taskFrequency,
  } = context;

  const lines: string[] = [];

  // Overall stats
  lines.push('## Summary');
  lines.push(
    `Total: ${sessionSummary.totalParticles} particles, ${formatHours(sessionSummary.totalMinutes)} | ` +
    `Last 7 days: ${sessionSummary.weekParticles} particles | ` +
    `Today: ${sessionSummary.todayParticles} particles`
  );

  // Weekly trend (compact format for token efficiency)
  if (weeklyTrend.length > 0) {
    lines.push('');
    lines.push('## Weekly Trend');
    for (const week of weeklyTrend) {
      const projectInfo = week.topProject ? ` [${week.topProject} ${week.topProjectPercent}%]` : '';
      lines.push(
        `${week.label}: ${week.particles}p, ${formatHours(week.minutes)}${projectInfo}`
      );
    }
  }

  // Daily trend (last 7 days only for tokens, but we have 14 available)
  if (dailyTrend.length > 0) {
    lines.push('');
    lines.push('## Last 7 Days');
    const recentDays = dailyTrend.slice(0, 7);
    for (const day of recentDays) {
      lines.push(`${day.label}: ${day.particles}p, ${formatHours(day.minutes)}`);
    }
  }

  // Project breakdown (top 5, compact)
  if (projectBreakdown.length > 0) {
    lines.push('');
    lines.push('## Projects (30d)');
    const topProjects = projectBreakdown.slice(0, 5);
    lines.push(
      topProjects
        .map((p) => `${p.projectName}: ${p.percentage}%`)
        .join(' | ')
    );
  }

  // Task frequency (recurring work)
  if (taskFrequency.length > 0) {
    lines.push('');
    lines.push('## Recurring Tasks');
    for (const tf of taskFrequency.slice(0, 5)) {
      const projectInfo = tf.project ? ` (${tf.project})` : '';
      lines.push(`- "${tf.task}": ${tf.count}x, ${formatHours(tf.minutes)}${projectInfo}`);
    }
  }

  // Patterns (compact)
  if (patterns.length > 0) {
    lines.push('');
    lines.push('## Patterns');
    for (const pattern of patterns) {
      lines.push(`- ${pattern.description}`);
    }
  }

  // Recent session
  if (recentActivity.lastSession) {
    lines.push('');
    const { lastSession } = recentActivity;
    const projectInfo = lastSession.projectName ? ` on "${lastSession.projectName}"` : '';
    const taskInfo = lastSession.task ? `: "${lastSession.task}"` : '';
    lines.push(`## Last Session: ${lastSession.durationMinutes}min${projectInfo}${taskInfo}`);
  }

  // Today's intention
  if (context.todayIntention) {
    const { todayIntention: ti } = context;
    lines.push('');
    lines.push('## Today\'s Intention');
    const goalInfo = ti.particleGoal ? ` (goal: ${ti.particleGoal} particles)` : '';
    lines.push(`"${ti.text}"${goalInfo}`);
    const { alignment: a } = ti;
    if (a.totalParticles > 0) {
      lines.push(`Progress: ${a.totalParticles}p (${a.alignedCount} aligned, ${a.reactiveCount} reactive) — ${a.percentage}% aligned`);
    }
  }

  // Weekly intention patterns
  if (context.weeklyIntentions && context.weeklyIntentions.length > 0) {
    lines.push('');
    lines.push('## Intention Patterns');
    for (const week of context.weeklyIntentions) {
      const label = week.weekLabel === 'current' ? 'This week' : 'Last week';
      const alignPct = week.alignmentPct !== null ? `${week.alignmentPct}% aligned` : 'no particles';
      lines.push(`${label}: ${week.daysWithIntention}/7 days with intention, ${week.totalParticles}p, ${alignPct}`);
      for (const day of week.days) {
        if (day.text || day.particles > 0) {
          const intentionText = day.text ? `"${day.text}"` : '(no intention)';
          const statusInfo = day.status ? ` [${day.status}]` : '';
          const deferInfo = day.deferralDepth > 0 ? ` (deferred ${day.deferralDepth}x)` : '';
          const alignInfo = day.particles > 0
            ? ` — ${day.particles}p ${day.alignmentPct !== null ? `${day.alignmentPct}%` : ''}`
            : '';
          lines.push(`  ${day.dayLabel}: ${intentionText}${statusInfo}${deferInfo}${alignInfo}`);
        }
      }
      // Deferred chains
      for (const chain of week.deferredChains) {
        lines.push(`  ⚠ "${chain.text}" deferred ${chain.deferralCount}x (since ${chain.originalDate})`);
      }
      // Top reactive tasks
      if (week.topReactiveTasks.length > 0) {
        const reactiveParts = week.topReactiveTasks.map(t => `"${t.task}" ${t.count}x`);
        lines.push(`  Reactive: ${reactiveParts.join(', ')}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Build weekly trend for the last N weeks
 */
function buildWeeklyTrend(
  sessions: DBSession[],
  projects: DBProject[]
): WeeklySummary[] {
  const workSessions = sessions.filter((s) => s.type === 'work');
  const weeks: WeeklySummary[] = [];

  // Generate week boundaries (Monday-Sunday)
  const now = new Date();

  for (let i = 0; i < WEEKLY_TREND_WEEKS; i++) {
    // Calculate week start (Monday) and end (Sunday)
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - (i * 7) - now.getDay() + (now.getDay() === 0 ? -6 : 1) - 1);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    // For current week, use today as end
    const effectiveEnd = i === 0 ? now : weekEnd;

    // Filter sessions for this week
    const weekSessions = workSessions.filter((s) => {
      const date = new Date(s.completedAt);
      return date >= weekStart && date <= effectiveEnd;
    });

    // Calculate stats
    const particles = weekSessions.length;
    const minutes = weekSessions.reduce((sum, s) => sum + s.duration, 0) / 60;

    // Find top project
    const projectMinutes: Record<string, number> = {};
    for (const session of weekSessions) {
      const pid = session.projectId || 'unassigned';
      projectMinutes[pid] = (projectMinutes[pid] || 0) + session.duration / 60;
    }

    let topProject: string | null = null;
    let topProjectPercent = 0;
    let maxMinutes = 0;

    for (const [pid, mins] of Object.entries(projectMinutes)) {
      if (mins > maxMinutes) {
        maxMinutes = mins;
        topProject = pid === 'unassigned'
          ? null
          : projects.find((p) => p.id === pid)?.name || null;
        topProjectPercent = minutes > 0 ? Math.round((mins / minutes) * 100) : 0;
      }
    }

    // Format label (e.g., "Jan 20-26")
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const label = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}-${weekEnd.getDate()}`;

    weeks.push({
      label,
      startDate: weekStart.toISOString().split('T')[0],
      particles,
      minutes: Math.round(minutes * 10) / 10,
      topProject,
      topProjectPercent,
    });
  }

  return weeks;
}

/**
 * Build daily trend for the last N days
 */
function buildDailyTrend(sessions: DBSession[]): DailySummary[] {
  const workSessions = sessions.filter((s) => s.type === 'work');
  const days: DailySummary[] = [];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < DAILY_TREND_DAYS; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    // Filter sessions for this day
    const daySessions = workSessions.filter((s) => {
      const sDate = new Date(s.completedAt);
      return sDate >= date && sDate <= dateEnd;
    });

    const particles = daySessions.length;
    const minutes = daySessions.reduce((sum, s) => sum + s.duration, 0) / 60;

    // Format label (e.g., "Mon Jan 27")
    const label = `${dayNames[date.getDay()]} ${monthNames[date.getMonth()]} ${date.getDate()}`;

    days.push({
      label,
      date: date.toISOString().split('T')[0],
      particles,
      minutes: Math.round(minutes * 10) / 10,
    });
  }

  return days;
}

/**
 * Build task frequency analysis
 */
function buildTaskFrequency(
  sessions: DBSession[],
  projects: DBProject[]
): TaskFrequency[] {
  const workSessions = sessions.filter((s) => s.type === 'work' && s.task);

  // Group by task
  const taskStats: Record<string, {
    count: number;
    minutes: number;
    projectIds: Record<string, number>;
  }> = {};

  for (const session of workSessions) {
    const task = session.task!.trim();
    if (!task) continue;

    if (!taskStats[task]) {
      taskStats[task] = { count: 0, minutes: 0, projectIds: {} };
    }

    taskStats[task].count++;
    taskStats[task].minutes += session.duration / 60;

    if (session.projectId) {
      taskStats[task].projectIds[session.projectId] =
        (taskStats[task].projectIds[session.projectId] || 0) + 1;
    }
  }

  // Convert to array and find dominant project
  const frequencies: TaskFrequency[] = [];

  for (const [task, stats] of Object.entries(taskStats)) {
    // Only include tasks with 2+ occurrences (recurring work)
    if (stats.count < 2) continue;

    // Find most common project for this task
    let dominantProject: string | null = null;
    let maxProjectCount = 0;

    for (const [pid, count] of Object.entries(stats.projectIds)) {
      if (count > maxProjectCount) {
        maxProjectCount = count;
        dominantProject = projects.find((p) => p.id === pid)?.name || null;
      }
    }

    frequencies.push({
      task,
      count: stats.count,
      minutes: Math.round(stats.minutes * 10) / 10,
      project: dominantProject,
    });
  }

  // Sort by count descending, take top 10
  return frequencies
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// ============================================
// Weekly Intention Builder Functions
// ============================================

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Format a Date as "YYYY-MM-DD" in **local** timezone.
 * Using toISOString() would convert to UTC and shift the date in timezones ahead of UTC.
 */
function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the Monday date string for a given week offset (0 = this week, -1 = last week)
 */
export function getMondayDateString(weekOffset: number): string {
  const { start } = getWeekBoundaries(weekOffset);
  return toLocalDateString(start);
}

/**
 * Trace a deferral chain backwards from an intention.
 * Returns the depth (number of deferrals) and original date.
 */
export function traceDeferralChain(
  intention: DBIntention,
  allIntentionsMap: Map<string, DBIntention>
): { depth: number; originalDate: string } {
  let depth = 0;
  let originalDate = intention.date;
  let currentId = intention.deferredFrom;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) break; // circular reference guard
    visited.add(currentId);

    // deferredFrom stores the date it was deferred from
    const prev = allIntentionsMap.get(currentId);
    if (!prev) break;

    depth++;
    originalDate = prev.date;
    currentId = prev.deferredFrom;
  }

  return { depth, originalDate };
}

/**
 * Build deferred chains from a week's intentions
 */
export function buildDeferredChains(
  weekIntentions: DBIntention[],
  allIntentionsMap: Map<string, DBIntention>
): DeferredChain[] {
  const chains: DeferredChain[] = [];

  for (const intention of weekIntentions) {
    if (!intention.deferredFrom) continue;

    const { depth, originalDate } = traceDeferralChain(intention, allIntentionsMap);

    chains.push({
      text: intention.text,
      deferralCount: depth,
      originalDate,
      currentDate: intention.date,
      currentStatus: intention.status,
    });
  }

  return chains;
}

/**
 * Build a single week's intention summary
 */
export function buildSingleWeekSummary(
  weekLabel: string,
  weekOffset: number,
  intentions: DBIntention[],
  allIntentionsMap: Map<string, DBIntention>,
  recentSessions: DBSession[]
): WeeklyIntentionSummary | null {
  const { start, end } = getWeekBoundaries(weekOffset);
  const weekStart = toLocalDateString(start);

  // Build a map of intentions by date
  const intentionByDate = new Map<string, DBIntention>();
  for (const int of intentions) {
    intentionByDate.set(int.date, int);
  }

  // Filter work sessions for this week
  const weekWorkSessions = recentSessions.filter((s) => {
    if (s.type !== 'work') return false;
    const d = new Date(s.completedAt);
    return d >= start && d <= end;
  });

  // Build per-day entries
  const days: DailyIntentionEntry[] = [];
  let daysWithIntention = 0;
  let totalParticles = 0;
  let totalAligned = 0;
  let totalReactive = 0;
  const reactiveTaskCounts: Record<string, number> = {};

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + i);
    const dateStr = toLocalDateString(dayDate);
    const dayLabel = DAY_LABELS[i];

    const intention = intentionByDate.get(dateStr) ?? null;

    // Sessions for this specific day
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayDate);
    dayEnd.setHours(23, 59, 59, 999);

    const daySessions = weekWorkSessions.filter((s) => {
      const d = new Date(s.completedAt);
      return d >= dayStart && d <= dayEnd;
    });

    const particles = daySessions.length;
    const aligned = daySessions.filter((s) => s.intentionAlignment === 'aligned').length;
    const reactive = daySessions.filter((s) => s.intentionAlignment === 'reactive').length;

    // Track reactive tasks
    for (const s of daySessions) {
      if (s.intentionAlignment === 'reactive' && s.task) {
        reactiveTaskCounts[s.task] = (reactiveTaskCounts[s.task] || 0) + 1;
      }
    }

    // Trace deferral chain
    let deferralDepth = 0;
    let originalDate: string | null = null;
    if (intention?.deferredFrom) {
      const chain = traceDeferralChain(intention, allIntentionsMap);
      deferralDepth = chain.depth;
      originalDate = chain.originalDate;
    }

    if (intention) daysWithIntention++;
    totalParticles += particles;
    totalAligned += aligned;
    totalReactive += reactive;

    days.push({
      date: dateStr,
      dayLabel,
      text: intention?.text ?? null,
      status: intention?.status ?? null,
      deferralDepth,
      originalDate,
      particles,
      alignedCount: aligned,
      reactiveCount: reactive,
      alignmentPct: particles > 0 ? Math.round((aligned / particles) * 100) : null,
    });
  }

  // Skip entirely empty weeks
  if (daysWithIntention === 0 && totalParticles === 0) return null;

  // Build deferred chains
  const deferredChains = buildDeferredChains(intentions, allIntentionsMap);

  // Top reactive tasks (sorted by count, max 5)
  const topReactiveTasks = Object.entries(reactiveTaskCounts)
    .map(([task, count]) => ({ task, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    weekLabel,
    weekStart,
    days,
    daysWithIntention,
    totalParticles,
    totalAligned,
    totalReactive,
    alignmentPct: totalParticles > 0 ? Math.round((totalAligned / totalParticles) * 100) : null,
    deferredChains,
    topReactiveTasks,
  };
}

/**
 * Build weekly intention summaries for current and previous week
 */
export function buildWeeklyIntentions(
  thisWeekIntentions: DBIntention[],
  lastWeekIntentions: DBIntention[],
  recentSessions: DBSession[]
): WeeklyIntentionSummary[] {
  // Combine all intentions into a shared map for cross-week deferral tracing
  const allIntentionsMap = new Map<string, DBIntention>();
  for (const int of [...thisWeekIntentions, ...lastWeekIntentions]) {
    allIntentionsMap.set(int.date, int);
  }

  const results: WeeklyIntentionSummary[] = [];

  const current = buildSingleWeekSummary(
    'current', 0, thisWeekIntentions, allIntentionsMap, recentSessions
  );
  if (current) results.push(current);

  const previous = buildSingleWeekSummary(
    'previous', -1, lastWeekIntentions, allIntentionsMap, recentSessions
  );
  if (previous) results.push(previous);

  return results;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format minutes as hours or minutes depending on duration
 */
function formatHours(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  }
  const hours = minutes / 60;
  return `${hours.toFixed(1)} hours`;
}
