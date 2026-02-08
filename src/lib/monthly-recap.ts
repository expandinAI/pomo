import type { CompletedSession } from '@/lib/session-storage';

// =============================================================================
// TYPES
// =============================================================================

export type MonthlyHighlightCriterion = 'longest' | 'overflow' | 'early_bird';

export interface MonthlyHighlight {
  session: CompletedSession;
  criterion: MonthlyHighlightCriterion;
  narrative: string;
}

export interface MonthlyRecap {
  monthLabel: string;
  totalSeconds: number;
  particleCount: number;
  activeDays: number;
  comparison: {
    prevMonthLabel: string;
    prevMonthSeconds: number;
    trend: 'up' | 'down' | 'same';
    trendDelta: number;
  } | null;
  highlight: MonthlyHighlight | null;
}

// =============================================================================
// DATE UTILITIES
// =============================================================================

/**
 * Get the start and end boundaries for a month.
 * @param monthOffset 0 = current month, -1 = last month, etc.
 */
export function getMonthBoundaries(monthOffset: number = 0): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + monthOffset;

  const start = new Date(year, month, 1, 0, 0, 0, 0);

  // Day 0 of next month = last day of target month
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return { start, end };
}

/**
 * Filter sessions to only include those within a specific month.
 */
export function getSessionsForMonth(
  sessions: CompletedSession[],
  monthOffset: number = 0
): CompletedSession[] {
  const { start, end } = getMonthBoundaries(monthOffset);

  return sessions.filter(session => {
    const sessionDate = new Date(session.completedAt);
    return sessionDate >= start && sessionDate <= end;
  });
}

// =============================================================================
// HIGHLIGHT SELECTION
// =============================================================================

/**
 * Select the standout session of the month and generate a single-sentence narrative.
 * Picks the longest work session, then determines criterion by properties.
 */
export function selectMonthlyHighlight(
  sessions: CompletedSession[]
): MonthlyHighlight | null {
  const workSessions = sessions.filter(s => s.type === 'work');
  if (workSessions.length === 0) return null;

  // Find the longest session
  const longest = workSessions.reduce((max, s) =>
    s.duration > max.duration ? s : max
  );

  // Determine criterion
  let criterion: MonthlyHighlightCriterion = 'longest';

  // Check for significant overflow (>10 min extra)
  if (longest.overflowDuration && longest.overflowDuration > 600) {
    criterion = 'overflow';
  }

  // Check for early bird (started before 7am)
  const completedDate = new Date(longest.completedAt);
  const startTime = new Date(completedDate.getTime() - longest.duration * 1000);
  if (startTime.getHours() < 7) {
    criterion = 'early_bird';
  }

  // Generate narrative
  const narrative = generateNarrative(longest, criterion);

  return { session: longest, criterion, narrative };
}

function generateNarrative(
  session: CompletedSession,
  criterion: MonthlyHighlightCriterion
): string {
  const duration = Math.round(session.duration / 60);
  const completedDate = new Date(session.completedAt);
  const day = completedDate.toLocaleDateString('en-US', { weekday: 'long' });
  const time = completedDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  switch (criterion) {
    case 'overflow': {
      const planned = Math.round((session.estimatedDuration || session.duration) / 60);
      const extra = Math.round((session.overflowDuration || 0) / 60);
      return `You planned ${planned}m but kept going \u2014 ${extra} extra minutes in flow`;
    }
    case 'early_bird': {
      const startTime = new Date(completedDate.getTime() - session.duration * 1000);
      const startStr = startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
      return `${startStr} start \u2014 you focused before the day began`;
    }
    case 'longest':
    default:
      return `Your deepest focus: ${duration}m on ${day} at ${time}`;
  }
}

// =============================================================================
// BUILD RECAP
// =============================================================================

/**
 * Build the complete monthly recap from all sessions.
 * Returns null if no work sessions exist in the current month.
 */
export function buildMonthlyRecap(
  sessions: CompletedSession[]
): MonthlyRecap | null {
  const currentMonthSessions = getSessionsForMonth(sessions, 0);
  const workSessions = currentMonthSessions.filter(s => s.type === 'work');

  if (workSessions.length === 0) return null;

  // Current month stats
  const totalSeconds = workSessions.reduce((sum, s) => sum + s.duration, 0);
  const particleCount = workSessions.length;

  // Active days: unique YYYY-MM-DD dates
  const uniqueDays = new Set(
    workSessions.map(s => {
      const d = new Date(s.completedAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })
  );
  const activeDays = uniqueDays.size;

  // Month label
  const { start } = getMonthBoundaries(0);
  const monthLabel = start.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Previous month comparison
  const prevMonthSessions = getSessionsForMonth(sessions, -1);
  const prevWorkSessions = prevMonthSessions.filter(s => s.type === 'work');

  let comparison: MonthlyRecap['comparison'] = null;
  if (prevWorkSessions.length > 0) {
    const prevMonthSeconds = prevWorkSessions.reduce((sum, s) => sum + s.duration, 0);
    const delta = totalSeconds - prevMonthSeconds;
    const { start: prevStart } = getMonthBoundaries(-1);
    const prevMonthLabel = prevStart.toLocaleDateString('en-US', { month: 'long' });

    comparison = {
      prevMonthLabel,
      prevMonthSeconds,
      trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'same',
      trendDelta: delta,
    };
  }

  // Highlight
  const highlight = selectMonthlyHighlight(workSessions);

  return {
    monthLabel,
    totalSeconds,
    particleCount,
    activeDays,
    comparison,
    highlight,
  };
}
