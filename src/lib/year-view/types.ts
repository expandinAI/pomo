/**
 * Year View Data Types
 *
 * Data structures for the 365-day year view visualization.
 * All durations are in seconds (consistent with codebase convention).
 */

/**
 * Data for a single day in the year view
 */
export interface YearViewDay {
  /** The date for this day */
  date: Date;
  /** Number of work sessions (particles) completed */
  particleCount: number;
  /** Total focus duration in seconds */
  totalDuration: number;
  /** The task with the most focus time this day (if any) */
  topTask?: string;
  /** The project with the most focus time (prepared for future use) */
  topProject?: { id: string; name: string };
  /** Whether this is the peak day of the year */
  isPeakDay: boolean;
}

/**
 * Summary statistics for the entire year
 */
export interface YearViewSummary {
  /** Total number of work sessions (particles) */
  totalParticles: number;
  /** Total focus duration in seconds */
  totalDuration: number;
  /** Longest streak of consecutive days with focus sessions */
  longestStreak: number;
  /** Number of days with at least one focus session */
  activeDays: number;
  /** Average particles per active day */
  averagePerActiveDay: number;
}

/**
 * Complete year view data structure
 */
export interface YearViewData {
  /** The year this data represents */
  year: number;
  /** All days in the year (365 or 366 entries) */
  days: YearViewDay[];
  /** Aggregated summary statistics */
  summary: YearViewSummary;
  /** The highest particle count achieved in a single day */
  personalMax: number;
  /** The date of the peak day */
  peakDate: Date;
}

/**
 * Internal type for day aggregation during processing
 */
export interface DayAggregation {
  particleCount: number;
  totalDuration: number;
  taskDurations: Map<string, number>;
}
