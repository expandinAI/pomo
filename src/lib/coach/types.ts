/**
 * Type definitions for the AI Coach library
 */

/**
 * Summary of user's session statistics
 */
export interface SessionSummary {
  /** Total particles collected (all time) */
  totalParticles: number;
  /** Total minutes of focus (all time) */
  totalMinutes: number;
  /** Particles collected today */
  todayParticles: number;
  /** Minutes of focus today */
  todayMinutes: number;
  /** Particles collected this week */
  weekParticles: number;
  /** Minutes of focus this week */
  weekMinutes: number;
  /** Average session duration in minutes */
  averageSessionMinutes: number;
}

/**
 * Breakdown of focus time by project
 */
export interface ProjectBreakdown {
  /** Project ID */
  projectId: string;
  /** Project name */
  projectName: string;
  /** Number of particles for this project */
  particles: number;
  /** Total minutes for this project */
  minutes: number;
  /** Percentage of total focus time */
  percentage: number;
}

/**
 * Types of patterns the coach can detect
 */
export type PatternType =
  | 'time_of_day'
  | 'day_of_week'
  | 'project_focus'
  | 'session_length';

/**
 * A detected pattern in user's focus behavior
 */
export interface DetectedPattern {
  /** Type of pattern */
  type: PatternType;
  /** Human-readable description */
  description: string;
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Recent activity information
 */
export interface RecentActivity {
  /** Most recent session completed */
  lastSession: {
    projectName?: string;
    task?: string;
    durationMinutes: number;
    completedAt: Date;
  } | null;
  /** Sessions in the last 24 hours */
  last24Hours: number;
  /** Active project (most worked on this week) */
  activeProject: string | null;
  /** Recent tasks (from last 7 days, unique, max 10) */
  recentTasks: string[];
}

/**
 * Weekly summary for trend comparison
 */
export interface WeeklySummary {
  /** Week label (e.g., "Jan 20-26") */
  label: string;
  /** Start date of the week */
  startDate: string;
  /** Number of particles this week */
  particles: number;
  /** Total minutes this week */
  minutes: number;
  /** Top project name (if any) */
  topProject: string | null;
  /** Top project percentage */
  topProjectPercent: number;
}

/**
 * Daily summary for recent trend analysis
 */
export interface DailySummary {
  /** Date label (e.g., "Mon Jan 27") */
  label: string;
  /** ISO date string */
  date: string;
  /** Number of particles this day */
  particles: number;
  /** Total minutes this day */
  minutes: number;
}

/**
 * Task frequency information
 */
export interface TaskFrequency {
  /** Task name */
  task: string;
  /** Number of sessions with this task */
  count: number;
  /** Total minutes spent on this task */
  minutes: number;
  /** Associated project (if consistent) */
  project: string | null;
}

/**
 * Complete context for the coach
 */
export interface CoachContext {
  /** Session statistics */
  sessionSummary: SessionSummary;
  /** Focus time broken down by project */
  projectBreakdown: ProjectBreakdown[];
  /** Detected behavioral patterns */
  patterns: DetectedPattern[];
  /** Recent activity information */
  recentActivity: RecentActivity;
  /** Weekly summaries for trend comparison (last 4-6 weeks) */
  weeklyTrend: WeeklySummary[];
  /** Daily summaries for recent activity (last 7-14 days) */
  dailyTrend: DailySummary[];
  /** Task frequency analysis */
  taskFrequency: TaskFrequency[];
  /** Today's intention and alignment data (if set) */
  todayIntention?: IntentionContext;
}

/**
 * Context about today's daily intention
 */
export interface IntentionContext {
  /** Intention text */
  text: string;
  /** Particle goal (1-9, or null if no goal) */
  particleGoal: number | null;
  /** Current status */
  status: string;
  /** Alignment breakdown */
  alignment: {
    totalParticles: number;
    alignedCount: number;
    reactiveCount: number;
    /** Alignment percentage (0-100) */
    percentage: number;
  };
}

/**
 * Request for a chat message
 */
export interface ChatRequest {
  /** User's message */
  message: string;
  /** Current context */
  context: CoachContext;
  /** Previous messages in conversation (optional) */
  history?: Array<{
    role: 'user' | 'coach';
    content: string;
  }>;
}

/**
 * Request for an insight
 */
export interface InsightRequest {
  /** Type of insight to generate */
  type: 'daily' | 'weekly' | 'session' | 'pattern';
  /** Current context */
  context: CoachContext;
}
