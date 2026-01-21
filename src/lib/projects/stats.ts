/**
 * Project Statistics
 *
 * Functions for calculating project-related statistics from sessions.
 */

import type { CompletedSession } from '@/lib/session-storage';
import { loadSessions } from '@/lib/session-storage';
import type { Project, ProjectWithStats, ProjectBreakdown } from './types';
import { loadProjects, getActiveProjects } from './storage';

/**
 * Check if a date is within this week (Monday-Sunday)
 */
function isThisWeek(date: Date): boolean {
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? 6 : day - 1; // Adjust for Monday start
  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return date >= startOfWeek;
}

/**
 * Check if a date is within this month
 */
function isThisMonth(date: Date): boolean {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/**
 * Get work sessions only
 */
function getWorkSessions(sessions: CompletedSession[]): CompletedSession[] {
  return sessions.filter(s => s.type === 'work');
}

/**
 * Get sessions for a specific project
 *
 * @param projectId - Project ID (or null for unassigned sessions)
 * @param sessions - Optional sessions array (loads from storage if not provided)
 */
export function getSessionsForProject(
  projectId: string | null,
  sessions?: CompletedSession[]
): CompletedSession[] {
  const allSessions = sessions ?? loadSessions();
  const workSessions = getWorkSessions(allSessions);

  if (projectId === null) {
    // Get sessions without a project
    return workSessions.filter(s => !s.projectId);
  }

  return workSessions.filter(s => s.projectId === projectId);
}

/**
 * Calculate statistics for a single project
 *
 * @param project - The project
 * @param sessions - Optional sessions array
 * @returns Project with computed statistics
 */
export function getProjectStats(
  project: Project,
  sessions?: CompletedSession[]
): ProjectWithStats {
  const projectSessions = getSessionsForProject(project.id, sessions);

  let weekCount = 0;
  let monthCount = 0;
  let totalDuration = 0;

  for (const session of projectSessions) {
    const date = new Date(session.completedAt);
    totalDuration += session.duration;

    if (isThisWeek(date)) {
      weekCount++;
    }
    if (isThisMonth(date)) {
      monthCount++;
    }
  }

  return {
    ...project,
    particleCount: projectSessions.length,
    totalDuration,
    weekParticleCount: weekCount,
    monthParticleCount: monthCount,
  };
}

/**
 * Get all projects with their statistics
 *
 * @param includeArchived - Whether to include archived projects
 * @returns Array of projects with statistics
 */
export function getAllProjectsWithStats(
  includeArchived = false
): ProjectWithStats[] {
  const sessions = loadSessions();
  const projects = includeArchived ? loadProjects() : getActiveProjects();

  return projects.map(p => getProjectStats(p, sessions));
}

/**
 * Get statistics for unassigned sessions (no project)
 */
export function getUnassignedStats(sessions?: CompletedSession[]): {
  particleCount: number;
  totalDuration: number;
  weekParticleCount: number;
  monthParticleCount: number;
} {
  const unassignedSessions = getSessionsForProject(null, sessions);

  let weekCount = 0;
  let monthCount = 0;
  let totalDuration = 0;

  for (const session of unassignedSessions) {
    const date = new Date(session.completedAt);
    totalDuration += session.duration;

    if (isThisWeek(date)) {
      weekCount++;
    }
    if (isThisMonth(date)) {
      monthCount++;
    }
  }

  return {
    particleCount: unassignedSessions.length,
    totalDuration,
    weekParticleCount: weekCount,
    monthParticleCount: monthCount,
  };
}

/**
 * Calculate project breakdown for statistics display
 *
 * @param timeRange - Filter by time range ('week' | 'month' | 'all')
 * @returns Array of project breakdowns with percentages
 */
export function getProjectBreakdown(
  timeRange: 'week' | 'month' | 'all' = 'week'
): ProjectBreakdown[] {
  const sessions = loadSessions();
  const workSessions = getWorkSessions(sessions);
  const projects = getActiveProjects();

  // Filter sessions by time range
  const filteredSessions = workSessions.filter(s => {
    if (timeRange === 'all') return true;

    const date = new Date(s.completedAt);
    if (timeRange === 'week') return isThisWeek(date);
    if (timeRange === 'month') return isThisMonth(date);
    return true;
  });

  // Group by project
  const projectMap = new Map<string | null, { count: number; duration: number }>();

  for (const session of filteredSessions) {
    const key = session.projectId ?? null;
    const existing = projectMap.get(key) ?? { count: 0, duration: 0 };
    existing.count++;
    existing.duration += session.duration;
    projectMap.set(key, existing);
  }

  // Calculate total for percentages
  const totalCount = filteredSessions.length;

  // Build breakdown array
  const breakdown: ProjectBreakdown[] = [];

  // Add projects
  for (const project of projects) {
    const stats = projectMap.get(project.id);
    if (stats && stats.count > 0) {
      breakdown.push({
        projectId: project.id,
        projectName: project.name,
        brightness: project.brightness,
        particleCount: stats.count,
        totalDuration: stats.duration,
        percentage: totalCount > 0 ? (stats.count / totalCount) * 100 : 0,
      });
    }
  }

  // Add "No Project" if there are unassigned sessions
  const unassigned = projectMap.get(null);
  if (unassigned && unassigned.count > 0) {
    breakdown.push({
      projectId: null,
      projectName: 'No Project',
      brightness: 0.4, // Dim for unassigned
      particleCount: unassigned.count,
      totalDuration: unassigned.duration,
      percentage: totalCount > 0 ? (unassigned.count / totalCount) * 100 : 0,
    });
  }

  // Sort by particle count (descending)
  breakdown.sort((a, b) => b.particleCount - a.particleCount);

  return breakdown;
}

/**
 * Get total particle count across all projects
 */
export function getTotalParticleCount(): number {
  const sessions = loadSessions();
  return getWorkSessions(sessions).length;
}

/**
 * Get the most used project (for defaults/suggestions)
 */
export function getMostUsedProject(): Project | null {
  const sessions = loadSessions();
  const workSessions = getWorkSessions(sessions);
  const projects = getActiveProjects();

  if (projects.length === 0) return null;

  // Count sessions per project
  const counts = new Map<string, number>();
  for (const session of workSessions) {
    if (session.projectId) {
      counts.set(session.projectId, (counts.get(session.projectId) ?? 0) + 1);
    }
  }

  // Find the project with most sessions
  let maxCount = 0;
  let mostUsed: Project | null = null;

  for (const project of projects) {
    const count = counts.get(project.id) ?? 0;
    if (count > maxCount) {
      maxCount = count;
      mostUsed = project;
    }
  }

  return mostUsed;
}

/**
 * Get recent project IDs from sessions (for P 1-9 ordering)
 *
 * @param limit - Maximum number of recent project IDs to return
 */
export function getRecentProjectIds(limit = 9): string[] {
  const sessions = loadSessions();
  const workSessions = getWorkSessions(sessions);

  const seen = new Set<string>();
  const recent: string[] = [];

  for (const session of workSessions) {
    if (session.projectId && !seen.has(session.projectId)) {
      seen.add(session.projectId);
      recent.push(session.projectId);
      if (recent.length >= limit) break;
    }
  }

  return recent;
}
