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
} from './types';

/**
 * Number of days to consider for pattern detection and context
 */
const CONTEXT_DAYS = 30;

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

  return {
    sessionSummary,
    projectBreakdown,
    patterns,
    recentActivity,
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

  // Last session
  const lastSession = workSessions[0];
  const lastSessionInfo = lastSession
    ? {
        projectName: lastSession.projectId
          ? projects.find((p) => p.id === lastSession.projectId)?.name
          : undefined,
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
    (s) => new Date(s.completedAt) >= weekStart && s.projectId
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

  return {
    lastSession: lastSessionInfo,
    last24Hours,
    activeProject,
  };
}

/**
 * Format context as a string for the prompt
 *
 * This creates a human-readable summary of the user's data
 * that gets inserted into the system prompt.
 */
export function formatContextForPrompt(context: CoachContext): string {
  const { sessionSummary, projectBreakdown, patterns, recentActivity } =
    context;

  const lines: string[] = [];

  // Overall stats
  lines.push('## Your Data (Last 30 Days)');
  lines.push('');
  lines.push(
    `**Overall:** ${sessionSummary.totalParticles} particles, ${formatHours(sessionSummary.totalMinutes)} of focus`
  );
  lines.push(
    `**This Week:** ${sessionSummary.weekParticles} particles, ${formatHours(sessionSummary.weekMinutes)}`
  );
  lines.push(
    `**Today:** ${sessionSummary.todayParticles} particles, ${formatHours(sessionSummary.todayMinutes)}`
  );

  // Project breakdown (top 5)
  if (projectBreakdown.length > 0) {
    lines.push('');
    lines.push('**Projects:**');
    const topProjects = projectBreakdown.slice(0, 5);
    for (const project of topProjects) {
      lines.push(
        `- ${project.projectName}: ${project.particles} particles (${project.percentage}%)`
      );
    }
  }

  // Patterns
  if (patterns.length > 0) {
    lines.push('');
    lines.push('**Patterns I noticed:**');
    for (const pattern of patterns) {
      lines.push(`- ${pattern.description}`);
    }
  }

  // Session length info
  if (sessionSummary.averageSessionMinutes > 0) {
    lines.push('');
    lines.push(
      `**Average session:** ${sessionSummary.averageSessionMinutes} minutes`
    );
  }

  // Recent activity
  if (recentActivity.lastSession) {
    lines.push('');
    const { lastSession } = recentActivity;
    const projectInfo = lastSession.projectName
      ? ` on "${lastSession.projectName}"`
      : '';
    lines.push(
      `**Recent:** You just completed a ${lastSession.durationMinutes}-minute focus session${projectInfo}`
    );
  }

  return lines.join('\n');
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
