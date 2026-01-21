/**
 * Projects Module
 *
 * Project tracking for Particle - group your focus sessions by project.
 *
 * @example
 * ```typescript
 * import {
 *   createProject,
 *   getActiveProjects,
 *   getProjectStats,
 * } from '@/lib/projects';
 *
 * // Create a new project
 * const project = createProject({ name: 'Website Redesign' });
 *
 * // Get all projects with stats
 * const projects = getAllProjectsWithStats();
 * ```
 */

// Types
export type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectWithStats,
  ProjectBreakdown,
} from './types';

export {
  BRIGHTNESS_PRESETS,
  DEFAULT_BRIGHTNESS,
  MAX_PROJECT_NAME_LENGTH,
  MIN_BRIGHTNESS,
  MAX_BRIGHTNESS,
} from './types';

// Storage CRUD operations
export {
  loadProjects,
  saveProjects,
  getProject,
  getActiveProjects,
  getArchivedProjects,
  createProject,
  updateProject,
  archiveProject,
  restoreProject,
  deleteProject,
  isDuplicateName,
  getProjectsByRecentUsage,
  clearProjects,
} from './storage';

// Statistics
export {
  getSessionsForProject,
  getProjectStats,
  getAllProjectsWithStats,
  getUnassignedStats,
  getProjectBreakdown,
  getTotalParticleCount,
  getMostUsedProject,
  getRecentProjectIds,
} from './stats';
