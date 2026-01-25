/**
 * Smart Task Input Parser
 *
 * Parses user input to extract task name and duration.
 * Supports patterns like "Meeting 30", "30m Meeting", "1h", etc.
 */

export interface ParsedInput {
  /** The task name, or null if only duration was specified */
  taskName: string | null;
  /** Duration in seconds, or null if no duration pattern detected */
  durationSeconds: number | null;
  /** True if duration was capped at maximum (180 min) */
  wasLimited: boolean;
  /** Original input string */
  raw: string;
}

export interface ParsedTask {
  /** Original line or parsed task name */
  text: string;
  /** Duration in minutes, 0 if no time detected */
  duration: number;
  /** Whether task is marked as completed (prefixed with -) */
  completed: boolean;
}

export interface MultiLineResult {
  tasks: ParsedTask[];
  totalMinutes: number;
  /** Total minutes of completed tasks */
  completedMinutes: number;
  /** Number of completed tasks */
  completedCount: number;
}

const MIN_DURATION_MINUTES = 1;
const MAX_DURATION_MINUTES = 180;

/**
 * Parse smart input to extract task name and duration
 *
 * Patterns:
 * - "Meeting 30" or "Meeting 30m" → Task "Meeting", 30 min
 * - "Meeting 1h" → Task "Meeting", 60 min
 * - "30 Meeting" or "30m Meeting" → Task "Meeting", 30 min
 * - "30" or "30m" → No task, 30 min
 * - "1h" → No task, 60 min
 * - "Meeting30" (no space) → Regular task, no duration (preset used)
 * - "Meeting" → Regular task, no duration (preset used)
 */
export function parseSmartInput(input: string): ParsedInput {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      taskName: null,
      durationSeconds: null,
      wasLimited: false,
      raw: input,
    };
  }

  // Pattern: Duration at the end (with space separator)
  // e.g., "Meeting 30", "Meeting 30m", "Meeting 1h", "Meeting 1.5h"
  const endPattern = /^(.+?)\s+(\d+(?:\.\d+)?)(m|h)?$/i;
  const endMatch = trimmed.match(endPattern);

  if (endMatch) {
    const [, taskPart, numberStr, unit] = endMatch;
    const parsed = parseDuration(numberStr, unit);

    if (parsed.durationSeconds !== null) {
      return {
        taskName: taskPart.trim() || null,
        durationSeconds: parsed.durationSeconds,
        wasLimited: parsed.wasLimited,
        raw: input,
      };
    }
  }

  // Pattern: Duration at the start (with space separator)
  // e.g., "30 Meeting", "30m Meeting", "1h Meeting"
  const startPattern = /^(\d+(?:\.\d+)?)(m|h)?\s+(.+)$/i;
  const startMatch = trimmed.match(startPattern);

  if (startMatch) {
    const [, numberStr, unit, taskPart] = startMatch;
    const parsed = parseDuration(numberStr, unit);

    if (parsed.durationSeconds !== null) {
      return {
        taskName: taskPart.trim() || null,
        durationSeconds: parsed.durationSeconds,
        wasLimited: parsed.wasLimited,
        raw: input,
      };
    }
  }

  // Pattern: Duration only (no task)
  // e.g., "30", "30m", "1h", "1.5h"
  const durationOnlyPattern = /^(\d+(?:\.\d+)?)(m|h)?$/i;
  const durationOnlyMatch = trimmed.match(durationOnlyPattern);

  if (durationOnlyMatch) {
    const [, numberStr, unit] = durationOnlyMatch;
    const parsed = parseDuration(numberStr, unit);

    if (parsed.durationSeconds !== null) {
      return {
        taskName: null,
        durationSeconds: parsed.durationSeconds,
        wasLimited: parsed.wasLimited,
        raw: input,
      };
    }
  }

  // No duration pattern detected - treat as regular task
  return {
    taskName: trimmed,
    durationSeconds: null,
    wasLimited: false,
    raw: input,
  };
}

/**
 * Parse a number and optional unit into duration in seconds
 */
function parseDuration(
  numberStr: string,
  unit: string | undefined
): { durationSeconds: number | null; wasLimited: boolean } {
  const num = parseFloat(numberStr);

  if (isNaN(num) || num <= 0) {
    return { durationSeconds: null, wasLimited: false };
  }

  // Convert to minutes based on unit
  let minutes: number;
  if (unit?.toLowerCase() === 'h') {
    minutes = num * 60;
  } else {
    // Default to minutes (no unit or 'm')
    minutes = num;
  }

  // Apply limits
  let wasLimited = false;

  if (minutes < MIN_DURATION_MINUTES) {
    minutes = MIN_DURATION_MINUTES;
    wasLimited = true;
  }

  if (minutes > MAX_DURATION_MINUTES) {
    minutes = MAX_DURATION_MINUTES;
    wasLimited = true;
  }

  // Convert to seconds and round to nearest whole second
  const durationSeconds = Math.round(minutes * 60);

  return { durationSeconds, wasLimited };
}

/**
 * Format duration for display in preview
 */
export function formatDurationPreview(seconds: number): string {
  const minutes = Math.round(seconds / 60);

  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours}h`;
  }

  return `${minutes} min`;
}

/**
 * Parse multi-line input, one task per line
 * Lines starting with "-" are marked as completed (e.g., "- Emails 5" or "-Emails 5")
 */
export function parseMultiLineInput(input: string): MultiLineResult {
  const lines = input.split('\n').filter(line => line.trim());

  const tasks: ParsedTask[] = lines.map(line => {
    const trimmed = line.trim();

    // Check for completion marker at start (- or -<space>)
    const isCompleted = trimmed.startsWith('-');

    // Remove marker for parsing (handle both "- task" and "-task")
    const cleanLine = isCompleted
      ? trimmed.replace(/^-\s*/, '')
      : trimmed;

    const parsed = parseSmartInput(cleanLine);

    return {
      text: parsed.taskName || cleanLine.trim(),
      duration: parsed.durationSeconds ? Math.round(parsed.durationSeconds / 60) : 0,
      completed: isCompleted,
    };
  });

  const totalMinutes = tasks.reduce((sum, t) => sum + t.duration, 0);
  const completedMinutes = tasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + t.duration, 0);
  const completedCount = tasks.filter(t => t.completed).length;

  return { tasks, totalMinutes, completedMinutes, completedCount };
}

/**
 * Format total time for display
 */
export function formatTotalTime(minutes: number): string {
  if (minutes === 0) return '';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}
