// src/lib/db/migrations/projects.ts

import { getDB } from '../database';
import type { DBProject } from '../types';
import type { Project } from '@/lib/projects/types';

const MIGRATION_KEY = 'particle_migration_projects_v1';
const LEGACY_STORAGE_KEY = 'particle_projects';

export interface ProjectMigrationResult {
  name: string;
  skipped: boolean;
  migrated: number;
  duplicatesSkipped: number;
  errors: string[];
  duration: number;
}

/**
 * Check if project migration has already been completed
 */
export function isProjectMigrationCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(MIGRATION_KEY) === 'true';
}

/**
 * Get count of projects pending migration
 */
export function countPendingProjects(): number {
  if (typeof window === 'undefined') return 0;
  if (isProjectMigrationCompleted()) return 0;

  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return 0;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Load legacy projects from localStorage
 */
function loadLegacyProjects(): Project[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Convert a localStorage project to IndexedDB format
 * CRITICAL: Preserves original ID for session linkage!
 */
function convertToDBProject(project: Project): DBProject {
  return {
    // CRITICAL: Keep original ID - sessions reference projects via projectId
    id: project.id,
    name: project.name,
    brightness: project.brightness,
    archived: project.archived,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    // Sync metadata
    syncStatus: 'local',
    localUpdatedAt: project.updatedAt || project.createdAt,
  };
}

/**
 * Migrate projects from localStorage to IndexedDB
 *
 * This migration:
 * 1. Checks if already completed (skip if so)
 * 2. Loads all projects from localStorage
 * 3. Inserts each into IndexedDB (skipping duplicates by ID)
 * 4. Sets completion flag
 *
 * CRITICAL: Project IDs are preserved 1:1 to maintain session linkage!
 *
 * Idempotent: Safe to run multiple times
 */
export async function migrateProjectsV1(): Promise<ProjectMigrationResult> {
  const startTime = performance.now();
  const result: ProjectMigrationResult = {
    name: 'projects_v1',
    skipped: false,
    migrated: 0,
    duplicatesSkipped: 0,
    errors: [],
    duration: 0,
  };

  // Check if already migrated
  if (isProjectMigrationCompleted()) {
    result.skipped = true;
    result.duration = performance.now() - startTime;
    return result;
  }

  // Load legacy projects
  const legacyProjects = loadLegacyProjects();

  if (legacyProjects.length === 0) {
    // No projects to migrate, mark as complete
    localStorage.setItem(MIGRATION_KEY, 'true');
    result.duration = performance.now() - startTime;
    return result;
  }

  const db = getDB();

  // Process each project
  for (const project of legacyProjects) {
    try {
      // Validate project has required fields
      if (!project.id || !project.name) {
        result.errors.push(`Project missing id or name: ${JSON.stringify(project).slice(0, 100)}`);
        continue;
      }

      // Check if project already exists in IndexedDB (idempotency)
      const existing = await db.projects.get(project.id);

      if (existing) {
        result.duplicatesSkipped++;
        continue;
      }

      // Convert and insert
      const dbProject = convertToDBProject(project);
      await db.projects.add(dbProject);
      result.migrated++;
    } catch (error) {
      // Log error but continue with other projects
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Project ${project.id}: ${message}`);
    }
  }

  // Mark migration as complete (even if some errors occurred)
  localStorage.setItem(MIGRATION_KEY, 'true');

  result.duration = performance.now() - startTime;
  return result;
}

/**
 * Reset migration state (for testing)
 */
export function resetProjectMigration(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MIGRATION_KEY);
}
