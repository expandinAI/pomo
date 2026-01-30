// src/lib/db/projects.ts

import { getDB } from './database';
import type { DBProject } from './types';
import { withSyncMetadata, markAsUpdated, markAsDeleted } from './types';
import {
  DEFAULT_BRIGHTNESS,
  MAX_PROJECT_NAME_LENGTH,
  MIN_BRIGHTNESS,
  MAX_BRIGHTNESS,
} from '@/lib/projects/types';

/**
 * Generate a unique ID for a new project
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
 * Load all projects from IndexedDB
 * Returns all non-deleted projects, ordered by name
 */
export async function loadProjects(): Promise<DBProject[]> {
  const db = getDB();
  const projects = await db.projects
    .filter(p => !p.deleted)
    .toArray();
  // Sort by name alphabetically
  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a project by ID
 */
export async function getProjectById(id: string): Promise<DBProject | undefined> {
  const db = getDB();
  const project = await db.projects.get(id);
  if (project?.deleted) return undefined;
  return project;
}

/**
 * Get all active (non-archived) projects
 */
export async function getActiveProjects(): Promise<DBProject[]> {
  const db = getDB();
  const projects = await db.projects
    .where('archived')
    .equals(0) // Dexie stores boolean as 0/1
    .filter(p => !p.deleted)
    .toArray();

  // Fallback: filter by archived property in case index uses boolean
  const active = projects.length > 0
    ? projects
    : (await loadProjects()).filter(p => !p.archived);

  return active.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get all archived projects
 */
export async function getArchivedProjects(): Promise<DBProject[]> {
  const projects = await loadProjects();
  return projects.filter(p => p.archived);
}

/**
 * Input data for creating a new project
 */
export interface CreateProjectInput {
  name: string;
  brightness?: number;
}

/**
 * Create and save a new project
 */
export async function saveProject(input: CreateProjectInput): Promise<DBProject> {
  const db = getDB();

  // Validate and sanitize name
  const name = input.name.trim().slice(0, MAX_PROJECT_NAME_LENGTH);
  if (!name) {
    throw new Error('Project name is required');
  }

  // Validate brightness
  const brightness = input.brightness ?? DEFAULT_BRIGHTNESS;
  if (brightness < MIN_BRIGHTNESS || brightness > MAX_BRIGHTNESS) {
    throw new Error(`Brightness must be between ${MIN_BRIGHTNESS} and ${MAX_BRIGHTNESS}`);
  }

  const timestamp = now();

  const project: DBProject = {
    ...withSyncMetadata({
      id: generateId(),
      name,
      brightness,
      archived: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    }),
  };

  await db.projects.add(project);
  return project;
}

/**
 * Input for updating an existing project
 */
export interface UpdateProjectInput {
  name?: string;
  brightness?: number;
  archived?: boolean;
}

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  updates: UpdateProjectInput
): Promise<DBProject | null> {
  const db = getDB();
  const project = await db.projects.get(id);

  if (!project || project.deleted) {
    return null;
  }

  // Validate name if provided
  let name = project.name;
  if (updates.name !== undefined) {
    name = updates.name.trim().slice(0, MAX_PROJECT_NAME_LENGTH);
    if (!name) {
      throw new Error('Project name cannot be empty');
    }
  }

  // Validate brightness if provided
  let brightness = project.brightness;
  if (updates.brightness !== undefined) {
    if (updates.brightness < MIN_BRIGHTNESS || updates.brightness > MAX_BRIGHTNESS) {
      throw new Error(`Brightness must be between ${MIN_BRIGHTNESS} and ${MAX_BRIGHTNESS}`);
    }
    brightness = updates.brightness;
  }

  const updated = markAsUpdated({
    ...project,
    name,
    brightness,
    archived: updates.archived ?? project.archived,
    updatedAt: now(),
  });

  await db.projects.put(updated);
  return updated;
}

/**
 * Archive a project (soft delete for UI)
 */
export async function archiveProject(id: string): Promise<DBProject | null> {
  return updateProject(id, { archived: true });
}

/**
 * Restore an archived project
 */
export async function restoreProject(id: string): Promise<DBProject | null> {
  return updateProject(id, { archived: false });
}

/**
 * Delete a project (soft delete for sync compatibility)
 */
export async function deleteProject(id: string): Promise<boolean> {
  const db = getDB();
  const project = await db.projects.get(id);

  if (!project) {
    return false;
  }

  // Soft delete for sync
  const deleted = markAsDeleted({
    ...project,
    updatedAt: now(),
  });
  await db.projects.put(deleted);
  return true;
}

/**
 * Hard delete a project (for local cleanup, not sync)
 */
export async function hardDeleteProject(id: string): Promise<boolean> {
  const db = getDB();
  const count = await db.projects.where('id').equals(id).delete();
  return count > 0;
}

/**
 * Check if a project name already exists (case-insensitive)
 * Used for duplicate warnings (not blocking)
 *
 * @param name - Name to check
 * @param excludeId - Optional ID to exclude (for updates)
 * @returns true if duplicate exists
 */
export async function isDuplicateName(name: string, excludeId?: string): Promise<boolean> {
  const projects = await loadProjects();
  const normalizedName = name.trim().toLowerCase();

  return projects.some(
    p => p.name.toLowerCase() === normalizedName && p.id !== excludeId
  );
}

/**
 * Get projects that need to be synced
 */
export async function getPendingSyncProjects(): Promise<DBProject[]> {
  const db = getDB();
  return db.projects
    .where('syncStatus')
    .anyOf(['local', 'pending'])
    .toArray();
}

/**
 * Clear all projects (for testing)
 */
export async function clearAllProjects(): Promise<void> {
  const db = getDB();
  await db.projects.clear();
}
