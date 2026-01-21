/**
 * Project Storage
 *
 * localStorage-based persistence for projects.
 * Follows the same patterns as session-storage.ts.
 */

import type {
  Project,
  CreateProjectData,
  UpdateProjectData,
} from './types';
import { DEFAULT_BRIGHTNESS, MAX_PROJECT_NAME_LENGTH } from './types';

const STORAGE_KEY = 'particle_projects';

/**
 * Generate a unique ID for a project
 */
function generateId(): string {
  return `proj_${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get current ISO timestamp
 */
function now(): string {
  return new Date().toISOString();
}

/**
 * Load all projects from localStorage
 */
export function loadProjects(): Project[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

/**
 * Save projects to localStorage
 */
export function saveProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/**
 * Get a single project by ID
 */
export function getProject(id: string): Project | null {
  const projects = loadProjects();
  return projects.find(p => p.id === id) ?? null;
}

/**
 * Get all active (non-archived) projects
 */
export function getActiveProjects(): Project[] {
  return loadProjects().filter(p => !p.archived);
}

/**
 * Get all archived projects
 */
export function getArchivedProjects(): Project[] {
  return loadProjects().filter(p => p.archived);
}

/**
 * Create a new project
 *
 * @param data - Project creation data
 * @returns The created project
 */
export function createProject(data: CreateProjectData): Project {
  const projects = loadProjects();

  // Validate and sanitize name
  const name = data.name.trim().slice(0, MAX_PROJECT_NAME_LENGTH);
  if (!name) {
    throw new Error('Project name is required');
  }

  // Validate brightness
  const brightness = data.brightness ?? DEFAULT_BRIGHTNESS;
  if (brightness < 0.3 || brightness > 1.0) {
    throw new Error('Brightness must be between 0.3 and 1.0');
  }

  const project: Project = {
    id: generateId(),
    name,
    brightness,
    archived: false,
    createdAt: now(),
    updatedAt: now(),
  };

  projects.push(project);
  saveProjects(projects);

  return project;
}

/**
 * Update an existing project
 *
 * @param id - Project ID to update
 * @param data - Fields to update
 * @returns The updated project or null if not found
 */
export function updateProject(id: string, data: UpdateProjectData): Project | null {
  const projects = loadProjects();
  const index = projects.findIndex(p => p.id === id);

  if (index === -1) {
    return null;
  }

  const project = projects[index];

  // Update fields if provided
  if (data.name !== undefined) {
    const name = data.name.trim().slice(0, MAX_PROJECT_NAME_LENGTH);
    if (!name) {
      throw new Error('Project name cannot be empty');
    }
    project.name = name;
  }

  if (data.brightness !== undefined) {
    if (data.brightness < 0.3 || data.brightness > 1.0) {
      throw new Error('Brightness must be between 0.3 and 1.0');
    }
    project.brightness = data.brightness;
  }

  if (data.archived !== undefined) {
    project.archived = data.archived;
  }

  project.updatedAt = now();
  projects[index] = project;
  saveProjects(projects);

  return project;
}

/**
 * Archive a project (soft delete)
 *
 * @param id - Project ID to archive
 * @returns The archived project or null if not found
 */
export function archiveProject(id: string): Project | null {
  return updateProject(id, { archived: true });
}

/**
 * Restore an archived project
 *
 * @param id - Project ID to restore
 * @returns The restored project or null if not found
 */
export function restoreProject(id: string): Project | null {
  return updateProject(id, { archived: false });
}

/**
 * Permanently delete a project
 * Note: This is rarely used - prefer archiveProject for soft delete
 *
 * @param id - Project ID to delete
 * @returns true if deleted, false if not found
 */
export function deleteProject(id: string): boolean {
  const projects = loadProjects();
  const index = projects.findIndex(p => p.id === id);

  if (index === -1) {
    return false;
  }

  projects.splice(index, 1);
  saveProjects(projects);

  return true;
}

/**
 * Check if a project name already exists (case-insensitive)
 * Used for duplicate warnings (not blocking)
 *
 * @param name - Name to check
 * @param excludeId - Optional ID to exclude (for updates)
 * @returns true if duplicate exists
 */
export function isDuplicateName(name: string, excludeId?: string): boolean {
  const projects = loadProjects();
  const normalizedName = name.trim().toLowerCase();

  return projects.some(
    p => p.name.toLowerCase() === normalizedName && p.id !== excludeId
  );
}

/**
 * Get projects sorted by most recently used (based on sessions)
 * This is useful for the P 1-9 quick selection
 *
 * @param sessionProjectIds - Array of projectIds from recent sessions
 * @returns Projects sorted by recent usage
 */
export function getProjectsByRecentUsage(sessionProjectIds: string[]): Project[] {
  const projects = getActiveProjects();

  // Count occurrences of each project in sessions
  const usageCount = new Map<string, number>();
  for (const projectId of sessionProjectIds) {
    if (projectId) {
      usageCount.set(projectId, (usageCount.get(projectId) ?? 0) + 1);
    }
  }

  // Sort by usage count (descending), then by name
  return projects.sort((a, b) => {
    const aCount = usageCount.get(a.id) ?? 0;
    const bCount = usageCount.get(b.id) ?? 0;

    if (aCount !== bCount) {
      return bCount - aCount; // Higher count first
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Clear all projects (for testing/reset)
 */
export function clearProjects(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
