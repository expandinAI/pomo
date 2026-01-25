import type { CompletedSession } from './session-storage';
import type { Project } from './projects';

/**
 * Rhythm Type
 * - flow: User takes more time than planned (ratio > 1.1)
 * - structure: User finishes faster than planned (ratio < 0.9)
 * - precision: User matches their estimate closely (0.9 - 1.1)
 */
export type RhythmType = 'flow' | 'structure' | 'precision';

export interface RhythmResult {
  type: RhythmType;
  averageEstimated: number; // Seconds
  averageActual: number; // Seconds
  ratio: number; // actual / estimated (1.0 = perfect match)
  particleCount: number;
  hasEnoughData: boolean;
}

export interface ProjectRhythm {
  projectId: string;
  projectName: string;
  rhythm: RhythmResult;
}

const MIN_PARTICLES_FOR_RHYTHM = 5;

/**
 * Filter sessions that can be used for rhythm calculation
 *
 * Sessions need either:
 * 1. Explicit estimatedDuration (new sessions)
 * 2. No overflow (old sessions where duration = estimated)
 *
 * Sessions with overflow but no estimatedDuration are excluded
 * (we don't know what the original estimate was)
 */
export function getParticlesWithEstimate(sessions: CompletedSession[]): CompletedSession[] {
  return sessions.filter((s) => {
    if (s.type !== 'work') return false;

    // New sessions with explicit estimate
    if (s.estimatedDuration !== undefined && s.estimatedDuration > 0) {
      return true;
    }

    // Old sessions without overflow: duration = estimated
    // (they completed exactly as planned)
    if (!s.overflowDuration || s.overflowDuration === 0) {
      return true;
    }

    return false;
  });
}

/**
 * Get the estimated duration for a session
 * Falls back to duration for old sessions without overflow
 */
export function getEstimatedDuration(session: CompletedSession): number {
  if (session.estimatedDuration !== undefined && session.estimatedDuration > 0) {
    return session.estimatedDuration;
  }
  // For old sessions without overflow, duration = estimated
  if (!session.overflowDuration || session.overflowDuration === 0) {
    return session.duration;
  }
  // Fallback (shouldn't happen with proper filtering)
  return session.duration;
}

/**
 * Determine rhythm type from actual/estimated ratio
 */
function getRhythmType(ratio: number): RhythmType {
  if (ratio > 1.1) return 'flow';
  if (ratio < 0.9) return 'structure';
  return 'precision';
}

/**
 * Calculate rhythm for a set of sessions
 */
export function calculateRhythm(sessions: CompletedSession[]): RhythmResult {
  const validSessions = getParticlesWithEstimate(sessions);

  if (validSessions.length < MIN_PARTICLES_FOR_RHYTHM) {
    return {
      type: 'precision',
      averageEstimated: 0,
      averageActual: 0,
      ratio: 1,
      particleCount: validSessions.length,
      hasEnoughData: false,
    };
  }

  const totalEstimated = validSessions.reduce(
    (sum, s) => sum + getEstimatedDuration(s),
    0
  );
  const totalActual = validSessions.reduce((sum, s) => sum + s.duration, 0);

  const averageEstimated = totalEstimated / validSessions.length;
  const averageActual = totalActual / validSessions.length;
  const ratio = averageEstimated > 0 ? averageActual / averageEstimated : 1;

  return {
    type: getRhythmType(ratio),
    averageEstimated,
    averageActual,
    ratio,
    particleCount: validSessions.length,
    hasEnoughData: true,
  };
}

/**
 * Calculate rhythm for each project
 * Only includes projects with enough data
 */
export function calculateProjectRhythms(
  sessions: CompletedSession[],
  projects: Project[]
): ProjectRhythm[] {
  const projectMap = new Map<string, Project>();
  for (const p of projects) {
    projectMap.set(p.id, p);
  }

  // Group sessions by project
  const sessionsByProject = new Map<string, CompletedSession[]>();
  for (const session of sessions) {
    if (session.projectId) {
      const existing = sessionsByProject.get(session.projectId) || [];
      existing.push(session);
      sessionsByProject.set(session.projectId, existing);
    }
  }

  const results: ProjectRhythm[] = [];

  sessionsByProject.forEach((projectSessions, projectId) => {
    const project = projectMap.get(projectId);
    if (!project) return;

    const rhythm = calculateRhythm(projectSessions);

    // Only include if enough data
    if (rhythm.hasEnoughData) {
      results.push({
        projectId,
        projectName: project.name,
        rhythm,
      });
    }
  });

  // Sort by particle count descending (most data first)
  return results.sort((a, b) => b.rhythm.particleCount - a.rhythm.particleCount);
}

/**
 * Format duration as human-readable (e.g., "32 min")
 */
export function formatRhythmDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

/**
 * Format ratio as percentage difference (e.g., "+15%" or "-20%")
 */
export function formatRhythmDifference(ratio: number): string {
  const diff = (ratio - 1) * 100;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${Math.round(diff)}%`;
}
