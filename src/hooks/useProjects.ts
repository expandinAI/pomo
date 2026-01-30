'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProjectStore, type UnifiedProject } from '@/contexts/ProjectContext';
import { useSessionStore } from '@/contexts/SessionContext';
import type {
  Project,
  ProjectWithStats,
} from '@/lib/projects';
import type { CreateProjectInput, UpdateProjectInput } from '@/lib/db';

interface UseProjectsReturn {
  /** All projects (including archived) */
  projects: UnifiedProject[];

  /** Active (non-archived) projects only */
  activeProjects: UnifiedProject[];

  /** Archived projects only */
  archivedProjects: UnifiedProject[];

  /** Active projects with computed statistics */
  projectsWithStats: ProjectWithStats[];

  /** Currently selected project ID (for timer) */
  selectedProjectId: string | null;

  /** Select a project for the current session */
  selectProject: (projectId: string | null) => void;

  /** Create a new project */
  create: (data: CreateProjectInput) => Promise<UnifiedProject>;

  /** Update an existing project */
  update: (id: string, data: UpdateProjectInput) => Promise<UnifiedProject | null>;

  /** Archive a project (soft delete) */
  archive: (id: string) => Promise<UnifiedProject | null>;

  /** Restore an archived project */
  restore: (id: string) => Promise<UnifiedProject | null>;

  /** Get a single project by ID */
  getById: (id: string) => UnifiedProject | undefined;

  /** Check if a name already exists (sync, from cache) */
  checkDuplicateName: (name: string, excludeId?: string) => boolean;

  /** Recent project IDs (for P 1-9 shortcuts) */
  recentProjectIds: string[];

  /** Refresh projects from storage */
  refresh: () => Promise<void>;

  /** Loading state */
  isLoading: boolean;

  /** Storage mode in use */
  storageMode: 'indexeddb' | 'localstorage';
}

const SELECTED_PROJECT_KEY = 'particle_selected_project';

/**
 * Check if a date is within this week (Monday-Sunday)
 */
function isThisWeek(date: Date): boolean {
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? 6 : day - 1; // Adjust for Monday start
  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return date >= startOfWeek;
}

/**
 * Check if a date is within this month
 */
function isThisMonth(date: Date): boolean {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/**
 * Hook for managing projects
 *
 * Provides CRUD operations and state management for projects.
 * Uses ProjectContext for storage abstraction (IndexedDB or localStorage).
 * The selected project persists across sessions.
 *
 * @example
 * ```tsx
 * const { activeProjects, selectedProjectId, selectProject, create } = useProjects();
 *
 * // Create a new project
 * const project = await create({ name: 'My Project', brightness: 0.7 });
 *
 * // Select it for the current session
 * selectProject(project.id);
 * ```
 */
export function useProjects(): UseProjectsReturn {
  const projectStore = useProjectStore();
  const sessionStore = useSessionStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Load selected project from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SELECTED_PROJECT_KEY);
    if (stored) {
      // Verify the project still exists and is not archived
      const project = projectStore.getProjectById(stored);
      if (project && !project.archived) {
        setSelectedProjectId(stored);
      } else {
        localStorage.removeItem(SELECTED_PROJECT_KEY);
      }
    }
    // We intentionally only depend on projects array, not getProjectById
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectStore.projects]);

  // Derived state: active projects
  const activeProjects = useMemo(
    () => projectStore.getActiveProjects(),
    [projectStore]
  );

  // Derived state: archived projects
  const archivedProjects = useMemo(
    () => projectStore.getArchivedProjects(),
    [projectStore]
  );

  // Compute project statistics from sessions
  const projectsWithStats = useMemo((): ProjectWithStats[] => {
    const workSessions = sessionStore.sessions.filter(s => s.type === 'work');

    return activeProjects.map((project) => {
      const projectSessions = workSessions.filter(s => s.projectId === project.id);

      let weekCount = 0;
      let monthCount = 0;
      let totalDuration = 0;

      for (const session of projectSessions) {
        const date = new Date(session.completedAt);
        totalDuration += session.duration;

        if (isThisWeek(date)) {
          weekCount++;
        }
        if (isThisMonth(date)) {
          monthCount++;
        }
      }

      return {
        ...(project as Project),
        particleCount: projectSessions.length,
        totalDuration,
        weekParticleCount: weekCount,
        monthParticleCount: monthCount,
      };
    });
  }, [activeProjects, sessionStore.sessions]);

  // Compute recent project IDs from sessions (for P 1-9 shortcuts)
  const recentProjectIds = useMemo((): string[] => {
    const workSessions = sessionStore.sessions.filter(s => s.type === 'work');

    const seen = new Set<string>();
    const recent: string[] = [];

    for (const session of workSessions) {
      if (session.projectId && !seen.has(session.projectId)) {
        seen.add(session.projectId);
        recent.push(session.projectId);
        if (recent.length >= 9) break;
      }
    }

    return recent;
  }, [sessionStore.sessions]);

  // Select a project for the current session
  const selectProject = useCallback((projectId: string | null) => {
    setSelectedProjectId(projectId);

    if (projectId) {
      localStorage.setItem(SELECTED_PROJECT_KEY, projectId);
    } else {
      localStorage.removeItem(SELECTED_PROJECT_KEY);
    }
  }, []);

  // Wrap archive to also deselect if the archived project was selected
  const archive = useCallback(async (id: string): Promise<UnifiedProject | null> => {
    const result = await projectStore.archiveProject(id);
    if (result && selectedProjectId === id) {
      selectProject(null);
    }
    return result;
  }, [projectStore, selectedProjectId, selectProject]);

  // Synchronous duplicate name check using cached projects
  // This maintains backward compatibility with existing components
  const checkDuplicateName = useCallback((name: string, excludeId?: string): boolean => {
    const normalizedName = name.trim().toLowerCase();
    return projectStore.projects.some(
      p => p.name.toLowerCase() === normalizedName && p.id !== excludeId
    );
  }, [projectStore.projects]);

  return {
    projects: projectStore.projects,
    activeProjects,
    archivedProjects,
    projectsWithStats,
    selectedProjectId,
    selectProject,
    create: projectStore.addProject,
    update: projectStore.updateProject,
    archive,
    restore: projectStore.restoreProject,
    getById: projectStore.getProjectById,
    checkDuplicateName,
    recentProjectIds,
    refresh: projectStore.refresh,
    isLoading: projectStore.isLoading,
    storageMode: projectStore.storageMode,
  };
}
