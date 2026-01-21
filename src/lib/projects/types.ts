/**
 * Project Types
 *
 * Projects are chapters of your life's work - not to-do lists.
 * Each particle (focus session) can optionally belong to a project.
 */

/**
 * Project entity
 *
 * Represents a grouping for particles/sessions.
 * Uses grayscale brightness instead of colors (monochrome philosophy).
 */
export interface Project {
  /** Unique identifier (UUID-like) */
  id: string;

  /** Project name, max 50 characters */
  name: string;

  /**
   * Visual brightness for the project (grayscale)
   * Range: 0.3 (dark) to 1.0 (bright white)
   * Default: 0.7
   */
  brightness: number;

  /** Soft delete flag - archived projects are hidden but data preserved */
  archived: boolean;

  /** ISO date string when project was created */
  createdAt: string;

  /** ISO date string when project was last updated */
  updatedAt: string;
}

/**
 * Data required to create a new project
 */
export interface CreateProjectData {
  name: string;
  brightness?: number;
}

/**
 * Data for updating an existing project
 */
export interface UpdateProjectData {
  name?: string;
  brightness?: number;
  archived?: boolean;
}

/**
 * Project with computed statistics
 */
export interface ProjectWithStats extends Project {
  /** Total number of particles (work sessions) */
  particleCount: number;

  /** Total focus time in seconds */
  totalDuration: number;

  /** Particles this week */
  weekParticleCount: number;

  /** Particles this month */
  monthParticleCount: number;
}

/**
 * Statistics breakdown by project
 */
export interface ProjectBreakdown {
  projectId: string | null; // null = "No Project"
  projectName: string;
  brightness: number;
  particleCount: number;
  totalDuration: number;
  percentage: number;
}

/**
 * Brightness presets for project creation
 * 5 levels as specified in the feature spec
 */
export const BRIGHTNESS_PRESETS = [
  { value: 0.3, label: 'Dark' },
  { value: 0.5, label: 'Dim' },
  { value: 0.7, label: 'Medium' },
  { value: 0.85, label: 'Bright' },
  { value: 1.0, label: 'White' },
] as const;

/** Default brightness for new projects */
export const DEFAULT_BRIGHTNESS = 0.7;

/** Maximum project name length */
export const MAX_PROJECT_NAME_LENGTH = 50;

/** Minimum brightness value */
export const MIN_BRIGHTNESS = 0.3;

/** Maximum brightness value */
export const MAX_BRIGHTNESS = 1.0;
