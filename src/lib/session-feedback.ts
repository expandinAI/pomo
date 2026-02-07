/**
 * Session Feedback - Contextual feedback after session completion
 *
 * "Centered shows reports. Forest shows trees. We show a sentence."
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
  qualityLabel?: string;
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
 * English text, minimalist, one line.
 */
export function formatFeedbackMessage(feedback: SessionFeedback): string {
  const suffix = feedback.qualityLabel ? ` · ${feedback.qualityLabel}` : '';

  switch (feedback.type) {
    case 'milestone':
      return getMilestoneMessage(feedback.particleCount!);

    case 'goal-reached':
      return `Daily goal reached · ${feedback.dailyCount} particles${suffix}`;

    case 'task': {
      // Truncate task name if too long
      const task = feedback.taskName!.length > 25
        ? feedback.taskName!.slice(0, 22) + '...'
        : feedback.taskName!;
      return `${task} · One particle${suffix}`;
    }

    case 'first-today':
      return `Your first particle today.${suffix}`;

    case 'overflow':
      return `${feedback.duration} min · +${feedback.overflowMinutes} in flow${suffix}`;

    case 'standard':
      return `A new particle · ${feedback.duration} min focused${suffix}`;

    default:
      return `A new particle · ${feedback.duration} min focused${suffix}`;
  }
}

/**
 * Get milestone-specific message based on particle count.
 */
function getMilestoneMessage(count: number): string {
  switch (count) {
    case 10:
      return "Particle 10 · Your life's work is growing.";
    case 50:
      return '50 particles · Your work is bearing fruit.';
    case 100:
      return '100 particles · A foundation is forming.';
    case 500:
      return '500 particles · Few come this far.';
    case 1000:
      return "1,000 particles · A life's work takes shape.";
    default:
      return `${count} particles · A milestone.`;
  }
}
