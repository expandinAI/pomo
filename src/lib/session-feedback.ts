/**
 * Session Feedback - Kontextuelles Feedback nach Session-Completion
 *
 * "Centered zeigt Reports. Forest zeigt Bäume. Wir zeigen einen Satz."
 */

export type SessionFeedbackType =
  | 'milestone'
  | 'goal-reached'
  | 'task'
  | 'first-today'
  | 'overflow'
  | 'standard';

export interface SessionFeedback {
  type: SessionFeedbackType;
  particleCount?: number;
  dailyCount?: number;
  duration: number; // in minutes
  overflowMinutes?: number;
  taskName?: string;
}

// Milestones that trigger special messages
const MILESTONES = [10, 50, 100, 500, 1000];

/**
 * Calculate the appropriate feedback type based on session context.
 *
 * Priority order:
 * 1. Milestone (10, 50, 100, 500, 1000 total particles)
 * 2. Daily Goal reached
 * 3. With Task (task name displayed)
 * 4. First particle of the day
 * 5. With Overflow (>60s in flow)
 * 6. Standard
 */
export function calculateSessionFeedback(
  todayCount: number,
  totalCount: number,
  durationMinutes: number,
  overflowSeconds: number,
  taskName?: string,
  dailyGoal?: number | null
): SessionFeedback {
  // 1. Check for milestone
  if (MILESTONES.includes(totalCount)) {
    return {
      type: 'milestone',
      particleCount: totalCount,
      duration: durationMinutes,
    };
  }

  // 2. Check for daily goal reached (exact match, not already exceeded)
  if (dailyGoal !== null && dailyGoal !== undefined && todayCount === dailyGoal) {
    return {
      type: 'goal-reached',
      dailyCount: todayCount,
      duration: durationMinutes,
    };
  }

  // 3. Check for task
  if (taskName && taskName.trim()) {
    return {
      type: 'task',
      taskName: taskName.trim(),
      duration: durationMinutes,
    };
  }

  // 4. Check for first of day
  if (todayCount === 1) {
    return {
      type: 'first-today',
      duration: durationMinutes,
    };
  }

  // 5. Check for overflow (>60s)
  const overflowMinutes = Math.round(overflowSeconds / 60);
  if (overflowMinutes >= 1) {
    return {
      type: 'overflow',
      duration: durationMinutes,
      overflowMinutes,
    };
  }

  // 6. Standard
  return {
    type: 'standard',
    duration: durationMinutes,
  };
}

/**
 * Format the feedback message for display.
 *
 * German text, minimalist, one line.
 */
export function formatFeedbackMessage(feedback: SessionFeedback): string {
  switch (feedback.type) {
    case 'milestone':
      return getMilestoneMessage(feedback.particleCount!);

    case 'goal-reached':
      return `Tagesziel erreicht · ${feedback.dailyCount} Partikel`;

    case 'task':
      // Truncate task name if too long
      const task = feedback.taskName!.length > 25
        ? feedback.taskName!.slice(0, 22) + '...'
        : feedback.taskName!;
      return `${task} · Ein Partikel`;

    case 'first-today':
      return 'Dein erster Partikel heute.';

    case 'overflow':
      return `${feedback.duration} min · +${feedback.overflowMinutes} im Flow`;

    case 'standard':
      return `Ein neuer Partikel · ${feedback.duration} min fokussiert`;

    default:
      return `Ein neuer Partikel · ${feedback.duration} min fokussiert`;
  }
}

/**
 * Get milestone-specific message based on particle count.
 */
function getMilestoneMessage(count: number): string {
  switch (count) {
    case 10:
      return 'Partikel 10 · Dein Lebenswerk wächst.';
    case 50:
      return '50 Partikel · Die Arbeit trägt Früchte.';
    case 100:
      return '100 Partikel · Ein Fundament entsteht.';
    case 500:
      return '500 Partikel · Wenige kommen so weit.';
    case 1000:
      return '1.000 Partikel · Ein Lebenswerk nimmt Form an.';
    default:
      return `${count} Partikel · Ein Meilenstein.`;
  }
}
