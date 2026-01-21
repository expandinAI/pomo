'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  loadProjects,
  getActiveProjects,
  getArchivedProjects,
  createProject,
  updateProject,
  archiveProject,
  restoreProject,
  getProject,
  isDuplicateName,
  getAllProjectsWithStats,
  getRecentProjectIds,
  type Project,
  type CreateProjectData,
  type UpdateProjectData,
  type ProjectWithStats,
} from '@/lib/projects';

interface UseProjectsReturn {
  /** All projects (including archived) */
  projects: Project[];

  /** Active (non-archived) projects only */
  activeProjects: Project[];

  /** Archived projects only */
  archivedProjects: Project[];

  /** Active projects with computed statistics */
  projectsWithStats: ProjectWithStats[];

  /** Currently selected project ID (for timer) */
  selectedProjectId: string | null;

  /** Select a project for the current session */
  selectProject: (projectId: string | null) => void;

  /** Create a new project */
  create: (data: CreateProjectData) => Project;

  /** Update an existing project */
  update: (id: string, data: UpdateProjectData) => Project | null;

  /** Archive a project (soft delete) */
  archive: (id: string) => Project | null;

  /** Restore an archived project */
  restore: (id: string) => Project | null;

  /** Get a single project by ID */
  getById: (id: string) => Project | null;

  /** Check if a name already exists */
  checkDuplicateName: (name: string, excludeId?: string) => boolean;

  /** Recent project IDs (for P 1-9 shortcuts) */
  recentProjectIds: string[];

  /** Refresh projects from storage */
  refresh: () => void;

  /** Loading state */
  isLoading: boolean;
}

const SELECTED_PROJECT_KEY = 'particle_selected_project';

/**
 * Hook for managing projects
 *
 * Provides CRUD operations and state management for projects.
 * The selected project persists across sessions.
 *
 * @example
 * ```tsx
 * const { activeProjects, selectedProjectId, selectProject, create } = useProjects();
 *
 * // Create a new project
 * const project = create({ name: 'My Project', brightness: 0.7 });
 *
 * // Select it for the current session
 * selectProject(project.id);
 * ```
 */
export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load projects and selected project from storage
  useEffect(() => {
    setProjects(loadProjects());

    // Load selected project from localStorage
    const stored = localStorage.getItem(SELECTED_PROJECT_KEY);
    if (stored) {
      // Verify the project still exists
      const project = getProject(stored);
      if (project && !project.archived) {
        setSelectedProjectId(stored);
      } else {
        localStorage.removeItem(SELECTED_PROJECT_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  // Refresh projects from storage
  const refresh = useCallback(() => {
    setProjects(loadProjects());
  }, []);

  // Derived state
  const activeProjects = useMemo(
    () => projects.filter(p => !p.archived),
    [projects]
  );

  const archivedProjects = useMemo(
    () => projects.filter(p => p.archived),
    [projects]
  );

  const projectsWithStats = useMemo(
    () => getAllProjectsWithStats(false),
    [projects] // Re-compute when projects change
  );

  const recentProjectIds = useMemo(
    () => getRecentProjectIds(9),
    [projects]
  );

  // Select a project for the current session
  const selectProject = useCallback((projectId: string | null) => {
    setSelectedProjectId(projectId);

    if (projectId) {
      localStorage.setItem(SELECTED_PROJECT_KEY, projectId);
    } else {
      localStorage.removeItem(SELECTED_PROJECT_KEY);
    }
  }, []);

  // CRUD operations
  const create = useCallback((data: CreateProjectData): Project => {
    const project = createProject(data);
    refresh();
    return project;
  }, [refresh]);

  const update = useCallback((id: string, data: UpdateProjectData): Project | null => {
    const project = updateProject(id, data);
    if (project) {
      refresh();
    }
    return project;
  }, [refresh]);

  const archive = useCallback((id: string): Project | null => {
    const project = archiveProject(id);
    if (project) {
      // Deselect if the archived project was selected
      if (selectedProjectId === id) {
        selectProject(null);
      }
      refresh();
    }
    return project;
  }, [refresh, selectedProjectId, selectProject]);

  const restore = useCallback((id: string): Project | null => {
    const project = restoreProject(id);
    if (project) {
      refresh();
    }
    return project;
  }, [refresh]);

  const getById = useCallback((id: string): Project | null => {
    return getProject(id);
  }, []);

  const checkDuplicateName = useCallback((name: string, excludeId?: string): boolean => {
    return isDuplicateName(name, excludeId);
  }, []);

  return {
    projects,
    activeProjects,
    archivedProjects,
    projectsWithStats,
    selectedProjectId,
    selectProject,
    create,
    update,
    archive,
    restore,
    getById,
    checkDuplicateName,
    recentProjectIds,
    refresh,
    isLoading,
  };
}
