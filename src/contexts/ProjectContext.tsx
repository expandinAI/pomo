'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { DBProject } from '@/lib/db/types';
import {
  getStorageMode,
  loadProjectsDB,
  saveProjectDB,
  updateProjectDB,
  deleteProjectDB,
  getActiveProjectsDB,
  getArchivedProjectsDB,
  archiveProjectDB,
  restoreProjectDB,
  isDuplicateNameDB,
  type CreateProjectInput,
  type UpdateProjectInput,
} from '@/lib/db';
import {
  loadProjects as loadProjectsLS,
  createProject as createProjectLS,
  updateProject as updateProjectLS,
  archiveProject as archiveProjectLS,
  restoreProject as restoreProjectLS,
  deleteProject as deleteProjectLS,
  isDuplicateName as isDuplicateNameLS,
  type Project,
  type CreateProjectData,
  type UpdateProjectData,
} from '@/lib/projects';

/**
 * Unified project type that works with both storage backends
 * DBProject extends Project with sync metadata
 */
export type UnifiedProject = DBProject | Project;

/**
 * Project store context value
 */
interface ProjectContextValue {
  /** All projects (cached in memory) */
  projects: UnifiedProject[];

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: Error | null;

  /** Storage mode in use */
  storageMode: 'indexeddb' | 'localstorage';

  // Write operations (async)
  addProject: (data: CreateProjectInput) => Promise<UnifiedProject>;
  updateProject: (
    id: string,
    updates: UpdateProjectInput
  ) => Promise<UnifiedProject | null>;
  archiveProject: (id: string) => Promise<UnifiedProject | null>;
  restoreProject: (id: string) => Promise<UnifiedProject | null>;
  deleteProject: (id: string) => Promise<boolean>;

  // Read operations (from cache)
  getProjectById: (id: string) => UnifiedProject | undefined;
  getActiveProjects: () => UnifiedProject[];
  getArchivedProjects: () => UnifiedProject[];

  // Utilities
  checkDuplicateName: (name: string, excludeId?: string) => Promise<boolean>;

  // Refresh
  refresh: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

interface ProjectProviderProps {
  children: ReactNode;
}

/**
 * Project Provider
 *
 * Provides unified access to projects regardless of storage backend.
 * Automatically detects and uses IndexedDB when available, falls back to localStorage.
 */
export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projects, setProjects] = useState<UnifiedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [storageMode, setStorageMode] = useState<'indexeddb' | 'localstorage'>(
    'localstorage'
  );

  // Initialize: detect storage mode and load projects
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        setError(null);

        const mode = getStorageMode();
        setStorageMode(mode);

        if (mode === 'indexeddb') {
          const loadedProjects = await loadProjectsDB();
          setProjects(loadedProjects);
        } else {
          const loadedProjects = loadProjectsLS();
          setProjects(loadedProjects);
        }
      } catch (err) {
        console.error('[ProjectProvider] Init error:', err);
        setError(err instanceof Error ? err : new Error('Failed to load projects'));
        // Fallback to localStorage on error
        try {
          const loadedProjects = loadProjectsLS();
          setProjects(loadedProjects);
          setStorageMode('localstorage');
        } catch {
          setProjects([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // Listen for project changes from other hook instances (localStorage only)
  useEffect(() => {
    function handleProjectsChanged() {
      // Re-fetch from storage when notified
      if (storageMode === 'localstorage') {
        setProjects(loadProjectsLS());
      }
    }

    window.addEventListener('particle:projects-changed', handleProjectsChanged);
    return () => window.removeEventListener('particle:projects-changed', handleProjectsChanged);
  }, [storageMode]);

  // Notify other hook instances of changes (for localStorage compatibility)
  const notifyChange = useCallback(() => {
    window.dispatchEvent(new CustomEvent('particle:projects-changed'));
  }, []);

  // Refresh projects from storage
  const refresh = useCallback(async () => {
    try {
      if (storageMode === 'indexeddb') {
        const loadedProjects = await loadProjectsDB();
        setProjects(loadedProjects);
      } else {
        const loadedProjects = loadProjectsLS();
        setProjects(loadedProjects);
      }
    } catch (err) {
      console.error('[ProjectProvider] Refresh error:', err);
    }
  }, [storageMode]);

  // Add project
  const addProject = useCallback(
    async (data: CreateProjectInput): Promise<UnifiedProject> => {
      if (storageMode === 'indexeddb') {
        const newProject = await saveProjectDB(data);
        setProjects((prev) => [...prev, newProject].sort((a, b) => a.name.localeCompare(b.name)));
        return newProject;
      } else {
        const lsData: CreateProjectData = {
          name: data.name,
          brightness: data.brightness,
        };
        const newProject = createProjectLS(lsData);
        setProjects((prev) => [...prev, newProject]);
        notifyChange();
        return newProject;
      }
    },
    [storageMode, notifyChange]
  );

  // Update project
  const updateProject = useCallback(
    async (
      id: string,
      updates: UpdateProjectInput
    ): Promise<UnifiedProject | null> => {
      if (storageMode === 'indexeddb') {
        const updated = await updateProjectDB(id, updates);
        if (updated) {
          setProjects((prev) =>
            prev.map((p) => (p.id === id ? updated : p)).sort((a, b) => a.name.localeCompare(b.name))
          );
        }
        return updated;
      } else {
        const lsUpdates: UpdateProjectData = {
          name: updates.name,
          brightness: updates.brightness,
          archived: updates.archived,
        };
        const updated = updateProjectLS(id, lsUpdates);
        if (updated) {
          setProjects((prev) =>
            prev.map((p) => (p.id === id ? updated : p))
          );
          notifyChange();
        }
        return updated;
      }
    },
    [storageMode, notifyChange]
  );

  // Archive project
  const archiveProject = useCallback(
    async (id: string): Promise<UnifiedProject | null> => {
      if (storageMode === 'indexeddb') {
        const archived = await archiveProjectDB(id);
        if (archived) {
          setProjects((prev) =>
            prev.map((p) => (p.id === id ? archived : p))
          );
        }
        return archived;
      } else {
        const archived = archiveProjectLS(id);
        if (archived) {
          setProjects((prev) =>
            prev.map((p) => (p.id === id ? archived : p))
          );
          notifyChange();
        }
        return archived;
      }
    },
    [storageMode, notifyChange]
  );

  // Restore project
  const restoreProject = useCallback(
    async (id: string): Promise<UnifiedProject | null> => {
      if (storageMode === 'indexeddb') {
        const restored = await restoreProjectDB(id);
        if (restored) {
          setProjects((prev) =>
            prev.map((p) => (p.id === id ? restored : p))
          );
        }
        return restored;
      } else {
        const restored = restoreProjectLS(id);
        if (restored) {
          setProjects((prev) =>
            prev.map((p) => (p.id === id ? restored : p))
          );
          notifyChange();
        }
        return restored;
      }
    },
    [storageMode, notifyChange]
  );

  // Delete project
  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      if (storageMode === 'indexeddb') {
        const success = await deleteProjectDB(id);
        if (success) {
          // Soft delete in IndexedDB - remove from visible list
          setProjects((prev) => prev.filter((p) => p.id !== id));
        }
        return success;
      } else {
        const success = deleteProjectLS(id);
        if (success) {
          setProjects((prev) => prev.filter((p) => p.id !== id));
          notifyChange();
        }
        return success;
      }
    },
    [storageMode, notifyChange]
  );

  // Get project by ID (from cached projects)
  const getProjectById = useCallback(
    (id: string): UnifiedProject | undefined => {
      return projects.find((p) => p.id === id);
    },
    [projects]
  );

  // Get active (non-archived) projects (from cached projects)
  const getActiveProjects = useCallback((): UnifiedProject[] => {
    return projects.filter((p) => !p.archived);
  }, [projects]);

  // Get archived projects (from cached projects)
  const getArchivedProjects = useCallback((): UnifiedProject[] => {
    return projects.filter((p) => p.archived);
  }, [projects]);

  // Check for duplicate name
  const checkDuplicateName = useCallback(
    async (name: string, excludeId?: string): Promise<boolean> => {
      if (storageMode === 'indexeddb') {
        return isDuplicateNameDB(name, excludeId);
      } else {
        return isDuplicateNameLS(name, excludeId);
      }
    },
    [storageMode]
  );

  const value = useMemo(
    (): ProjectContextValue => ({
      projects,
      isLoading,
      error,
      storageMode,
      addProject,
      updateProject,
      archiveProject,
      restoreProject,
      deleteProject,
      getProjectById,
      getActiveProjects,
      getArchivedProjects,
      checkDuplicateName,
      refresh,
    }),
    [
      projects,
      isLoading,
      error,
      storageMode,
      addProject,
      updateProject,
      archiveProject,
      restoreProject,
      deleteProject,
      getProjectById,
      getActiveProjects,
      getArchivedProjects,
      checkDuplicateName,
      refresh,
    ]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

/**
 * Hook to access project store
 *
 * @example
 * ```tsx
 * const { addProject, getActiveProjects, isLoading } = useProjectStore();
 *
 * // Add a new project
 * await addProject({ name: 'My Project' });
 *
 * // Get active projects
 * const activeProjects = getActiveProjects();
 * ```
 */
export function useProjectStore(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectStore must be used within a ProjectProvider');
  }
  return context;
}

/**
 * Hook to access just the projects array
 * Useful when you only need to read projects
 */
export function useProjectsArray(): UnifiedProject[] {
  const { projects } = useProjectStore();
  return projects;
}
