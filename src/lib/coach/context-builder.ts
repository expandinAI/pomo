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
import type { DBSession, DBProject } from '@/lib/db/types';
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
  const [allSessions, recentSessions, todaySessions, projects] =
    await Promise.all([
      loadSessions(),
      getSessionsFromDays(CONTEXT_DAYS),
      getTodaySessions(),
      loadProjects(),
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

  return {
    sessionSummary,
    projectBreakdown,
    patterns,
    recentActivity,
    weeklyTrend,
    dailyTrend,
    taskFrequency,
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

  // This week (last 7 days)
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
    `Week: ${sessionSummary.weekParticles} particles | ` +
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
