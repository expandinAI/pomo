/**
 * Weekly Narrative — Pure functions for generating weekly story summaries
 *
 * Generates a 3-sentence narrative about the user's last completed week.
 * Flow tier: AI-generated via API. Free tier: local templates.
 * Cached in localStorage (1 generation per week).
 */

import {
  getWeekBoundaries,
  getSessionsForWeek,
  buildDailyStats,
  type DailyStats,
} from '@/lib/session-analytics';
import type { CompletedSession } from '@/lib/session-storage';
import type { ParticleOfWeek } from './particle-of-week';

/** Minimal project shape needed for narrative generation */
interface ProjectLike {
  id: string;
  name: string;
}

// =============================================================================
// TYPES
// =============================================================================

export interface WeekDailyBreakdown {
  day: string;           // "Monday"
  date: string;          // "2026-01-26"
  particles: number;
  minutes: number;
  mainProject?: string;  // Name of dominant project that day
}

export interface WeekProjectDistribution {
  name: string;
  percentage: number;    // 0-100
  particles: number;
  minutes: number;
}

export interface WeekData {
  startDate: string;     // ISO date (Monday)
  endDate: string;       // ISO date (Sunday)
  totalParticles: number;
  totalMinutes: number;
  dailyBreakdown: WeekDailyBreakdown[];
  projectDistribution: WeekProjectDistribution[];
  particleOfTheWeek?: {
    task?: string;
    projectName?: string;
    duration: number;
    reason: string;
  };
}

export interface NarrativeStats {
  totalParticles: number;
  totalMinutes: number;
  projectCount: number;
}

export interface CachedNarrative {
  narrative: string;
  stats: NarrativeStats;
  generatedAt: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const QUIET_WEEK_FALLBACK = "A quiet week. Sometimes rest is the work.";
export const MIN_PARTICLES_FOR_NARRATIVE = 3;

const FULL_DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Build structured week data from sessions, projects, and POTW
 */
export function buildWeekData(
  sessions: CompletedSession[],
  projects: ProjectLike[],
  weekOffset: number,
  potw?: ParticleOfWeek | null,
): WeekData {
  const { start, end } = getWeekBoundaries(weekOffset);
  const weekSessions = getSessionsForWeek(sessions, weekOffset);
  const dailyStats = buildDailyStats(weekSessions, start);

  // Build project lookup
  const projectMap = new Map<string, string>();
  for (const p of projects) {
    projectMap.set(p.id, p.name);
  }

  // Map DailyStats to WeekDailyBreakdown
  const dailyBreakdown = dailyStats.map((ds: DailyStats) => {
    // Find main project for this day
    const daySessions = weekSessions.filter(s => {
      if (s.type !== 'work') return false;
      const d = new Date(s.completedAt);
      return d.toLocaleDateString('en-CA') === ds.date;
    });

    const projectCounts = new Map<string, number>();
    for (const s of daySessions) {
      if (s.projectId) {
        projectCounts.set(s.projectId, (projectCounts.get(s.projectId) || 0) + s.duration);
      }
    }

    let mainProject: string | undefined;
    let maxDuration = 0;
    for (const [pid, dur] of Array.from(projectCounts.entries())) {
      if (dur > maxDuration) {
        maxDuration = dur;
        mainProject = projectMap.get(pid);
      }
    }

    return {
      day: FULL_DAY_NAMES[ds.dayIndex],
      date: ds.date,
      particles: ds.sessionsCount,
      minutes: Math.round(ds.totalSeconds / 60),
      mainProject,
    };
  });

  // Compute project distribution
  const projectTotals = new Map<string, { seconds: number; particles: number }>();
  for (const s of weekSessions) {
    if (s.type !== 'work') continue;
    const pid = s.projectId || '__none__';
    const existing = projectTotals.get(pid) || { seconds: 0, particles: 0 };
    existing.seconds += s.duration;
    existing.particles += 1;
    projectTotals.set(pid, existing);
  }

  const totalSeconds = Array.from(projectTotals.values()).reduce((sum, v) => sum + v.seconds, 0);

  const projectDistribution: WeekProjectDistribution[] = Array.from(projectTotals.entries())
    .map(([pid, data]) => ({
      name: pid === '__none__' ? 'No Project' : (projectMap.get(pid) || 'Unknown'),
      percentage: totalSeconds > 0 ? Math.round((data.seconds / totalSeconds) * 100) : 0,
      particles: data.particles,
      minutes: Math.round(data.seconds / 60),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // POTW data
  let particleOfTheWeek: WeekData['particleOfTheWeek'];
  if (potw) {
    particleOfTheWeek = {
      task: potw.session.task,
      projectName: potw.session.projectId ? projectMap.get(potw.session.projectId) : undefined,
      duration: potw.session.duration,
      reason: potw.criterion,
    };
  }

  const totalParticles = dailyBreakdown.reduce((sum, d) => sum + d.particles, 0);
  const totalMinutes = dailyBreakdown.reduce((sum, d) => sum + d.minutes, 0);

  return {
    startDate: start.toLocaleDateString('en-CA'),
    endDate: end.toLocaleDateString('en-CA'),
    totalParticles,
    totalMinutes,
    dailyBreakdown,
    projectDistribution,
    particleOfTheWeek,
  };
}

/**
 * Generate a local (non-AI) 3-sentence narrative from week data
 */
export function generateLocalNarrative(data: WeekData): string {
  if (data.totalParticles < MIN_PARTICLES_FOR_NARRATIVE) {
    return QUIET_WEEK_FALLBACK;
  }

  const activeDays = data.dailyBreakdown.filter(d => d.particles > 0).length;
  const strongestDay = data.dailyBreakdown.reduce((best, d) =>
    d.particles > best.particles ? d : best
  , data.dailyBreakdown[0]);

  // Sentence 1: Arc
  let arc: string;
  if (activeDays >= 5) {
    arc = `${data.totalParticles} particles across ${activeDays} days — a full week.`;
  } else if (activeDays <= 2) {
    arc = `A focused week. ${activeDays} days, ${data.totalParticles} particles — quality over quantity.`;
  } else {
    arc = `${data.totalParticles} particles spread across ${activeDays} days.`;
  }

  // Sentence 2: Detail
  let detail: string;
  const projectsWithWork = data.projectDistribution.filter(p => p.name !== 'No Project');
  const dominant = data.projectDistribution[0];

  if (projectsWithWork.length === 1) {
    detail = `All dedicated to ${projectsWithWork[0].name}.`;
  } else if (dominant && dominant.percentage >= 60) {
    detail = `${dominant.name} dominated with ${dominant.percentage}% of your time.`;
  } else if (projectsWithWork.length >= 3) {
    detail = `Split across ${projectsWithWork.length} projects — a week of variety.`;
  } else {
    detail = `${strongestDay.day} was your strongest with ${strongestDay.particles} particles.`;
  }

  // Sentence 3: Highlight
  let highlight: string;
  if (data.particleOfTheWeek?.projectName) {
    const mins = Math.round(data.particleOfTheWeek.duration / 60);
    highlight = `Standout moment: ${mins} minutes on ${data.particleOfTheWeek.projectName}.`;
  } else if (data.particleOfTheWeek) {
    const mins = Math.round(data.particleOfTheWeek.duration / 60);
    highlight = `Standout moment: a ${mins}-minute deep session.`;
  } else {
    highlight = `${strongestDay.day} was the highlight with ${strongestDay.particles} particles.`;
  }

  return `${arc} ${detail} ${highlight}`;
}

/**
 * Compute stats summary from week data
 */
export function computeNarrativeStats(data: WeekData): NarrativeStats {
  return {
    totalParticles: data.totalParticles,
    totalMinutes: data.totalMinutes,
    projectCount: data.projectDistribution.filter(p => p.name !== 'No Project').length,
  };
}

/**
 * Get display label for the narrative week
 * On Monday the "last week" just completed, so say "This Week".
 * Other days, say "Last Week".
 */
export function getWeekLabel(): string {
  const day = new Date().getDay();
  // 1 = Monday
  return day === 1 ? 'This Week' : 'Last Week';
}

// =============================================================================
// CACHE HELPERS
// =============================================================================

export function getCacheKey(weekStart: string): string {
  return `particle:weekly-narrative:${weekStart}`;
}

export function getCachedNarrative(weekStart: string): CachedNarrative | null {
  try {
    const raw = localStorage.getItem(getCacheKey(weekStart));
    if (!raw) return null;
    return JSON.parse(raw) as CachedNarrative;
  } catch {
    return null;
  }
}

export function saveCachedNarrative(weekStart: string, data: CachedNarrative): void {
  try {
    localStorage.setItem(getCacheKey(weekStart), JSON.stringify(data));
  } catch {
    // Silently fail — localStorage might be full
  }
}
