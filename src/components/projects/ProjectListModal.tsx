'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Eye, EyeOff } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useProjects } from '@/hooks/useProjects';
import { ProjectListItem } from './ProjectListItem';
import { ProjectEmptyState } from './ProjectEmptyState';
import { ProjectForm } from './ProjectForm';
import { ProjectArchiveDialog } from './ProjectArchiveDialog';
import { ProjectDetailModal } from './ProjectDetailModal';
import { getUnassignedStats } from '@/lib/projects';

/**
 * Modal displaying all projects with stats
 *
 * Features:
 * - List of all active projects with particle counts
 * - "No Project" category for unassigned particles
 * - Show/hide archived projects toggle
 * - Keyboard navigation (J/K, arrows, Enter, E, A, N)
 * - Create, Edit, Archive actions
 *
 * Opens via G P shortcut or custom event 'particle:open-projects'
 */
export function ProjectListModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [archivingProject, setArchivingProject] = useState<string | null>(null);
  const [viewingProject, setViewingProject] = useState<string | null | 'no-project'>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    activeProjects,
    archivedProjects,
    projectsWithStats,
    create,
    update,
    archive,
    restore,
    getById,
    checkDuplicateName,
    refresh,
  } = useProjects();

  // Get unassigned particle stats
  const unassignedStats = useMemo(() => getUnassignedStats(), [projectsWithStats]);

  // Build list items: active projects + (archived if shown) + "No Project"
  const listItems = useMemo(() => {
    const items: Array<{
      type: 'project' | 'noProject';
      id: string | null;
      name: string;
      brightness: number;
      particleCount: number;
      weekParticleCount: number;
      isArchived: boolean;
    }> = [];

    // Active projects with stats
    for (const project of projectsWithStats) {
      items.push({
        type: 'project',
        id: project.id,
        name: project.name,
        brightness: project.brightness,
        particleCount: project.particleCount,
        weekParticleCount: project.weekParticleCount,
        isArchived: false,
      });
    }

    // Archived projects if toggle is on
    if (showArchived) {
      for (const project of archivedProjects) {
        // Get stats for archived project
        const stats = projectsWithStats.find(p => p.id === project.id);
        items.push({
          type: 'project',
          id: project.id,
          name: project.name,
          brightness: project.brightness,
          particleCount: stats?.particleCount ?? 0,
          weekParticleCount: stats?.weekParticleCount ?? 0,
          isArchived: true,
        });
      }
    }

    // "No Project" category (only if there are unassigned particles)
    if (unassignedStats.particleCount > 0) {
      items.push({
        type: 'noProject',
        id: null,
        name: 'No Project',
        brightness: 0.4,
        particleCount: unassignedStats.particleCount,
        weekParticleCount: unassignedStats.weekParticleCount,
        isArchived: false,
      });
    }

    return items;
  }, [projectsWithStats, archivedProjects, showArchived, unassignedStats]);

  // Open modal via event
  useEffect(() => {
    function handleOpen() {
      setIsOpen(true);
      setFocusedIndex(0);
      refresh();
    }

    window.addEventListener('particle:open-projects', handleOpen);
    return () => window.removeEventListener('particle:open-projects', handleOpen);
  }, [refresh]);

  // Focus trap
  useFocusTrap(modalRef, isOpen && !showCreateForm && !editingProject && !archivingProject && !viewingProject, {
    initialFocusRef: closeButtonRef,
  });

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || showCreateForm || editingProject || archivingProject || viewingProject) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Close on Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      // Navigation
      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, listItems.length - 1));
          break;

        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;

        case 'Enter':
          e.preventDefault();
          if (listItems[focusedIndex]) {
            const item = listItems[focusedIndex];
            if (item.type === 'project' && item.id) {
              // Open detail view
              setViewingProject(item.id);
            } else if (item.type === 'noProject') {
              // Open detail view for "No Project"
              setViewingProject('no-project');
            }
          }
          break;

        case 'e':
        case 'E':
          e.preventDefault();
          if (listItems[focusedIndex]?.type === 'project' && listItems[focusedIndex]?.id) {
            setEditingProject(listItems[focusedIndex].id);
          }
          break;

        case 'a':
        case 'A':
          e.preventDefault();
          if (listItems[focusedIndex]?.type === 'project' && listItems[focusedIndex]?.id) {
            const item = listItems[focusedIndex];
            if (item.isArchived) {
              // Restore if already archived
              restore(item.id!);
              refresh();
            } else {
              setArchivingProject(item.id);
            }
          }
          break;

        case 'n':
        case 'N':
          e.preventDefault();
          setShowCreateForm(true);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showCreateForm, editingProject, archivingProject, viewingProject, focusedIndex, listItems, restore, refresh]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && listRef.current && focusedIndex >= 0) {
      const focusedEl = listRef.current.children[focusedIndex] as HTMLElement;
      focusedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, focusedIndex]);

  // Handlers
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleCreateProject = useCallback(
    (data: { name: string; brightness?: number }) => {
      create(data);
      setShowCreateForm(false);
      refresh();
    },
    [create, refresh]
  );

  const handleUpdateProject = useCallback(
    (id: string, data: { name?: string; brightness?: number }) => {
      update(id, data);
      setEditingProject(null);
      refresh();
    },
    [update, refresh]
  );

  const handleArchiveProject = useCallback(
    (id: string) => {
      archive(id);
      setArchivingProject(null);
      refresh();
    },
    [archive, refresh]
  );

  const handleArchiveFromForm = useCallback(
    (id: string) => {
      setEditingProject(null);
      setArchivingProject(id);
    },
    []
  );

  // Get project being edited, archived, or viewed
  const projectBeingEdited = editingProject ? getById(editingProject) : null;
  const projectBeingArchived = archivingProject
    ? projectsWithStats.find((p) => p.id === archivingProject) ?? getById(archivingProject)
    : null;
  const projectBeingViewed =
    viewingProject === 'no-project'
      ? null
      : viewingProject
        ? projectsWithStats.find((p) => p.id === viewingProject) ?? getById(viewingProject)
        : undefined;

  // Handler for updates from detail view
  const handleUpdateFromDetail = useCallback(
    (id: string, data: { name?: string; brightness?: number }) => {
      update(id, data);
      refresh();
    },
    [update, refresh]
  );

  const hasProjects = activeProjects.length > 0 || archivedProjects.length > 0;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 light:bg-black/40"
              onClick={handleClose}
            >
              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: 'spring', ...SPRING.gentle }}
                className="w-[90vw] max-w-lg max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  ref={modalRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="projects-title"
                  className="flex flex-col bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-tertiary/10 light:border-tertiary-dark/10">
                    <h2
                      id="projects-title"
                      className="text-lg font-semibold text-primary light:text-primary-dark"
                    >
                      Projects
                    </h2>
                    <div className="flex items-center gap-2">
                      {/* New Project button */}
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent light:bg-accent-dark text-background light:text-background-light hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Plus className="w-4 h-4" />
                        New
                        <kbd className="ml-1 text-xs opacity-70">N</kbd>
                      </button>

                      {/* Close button */}
                      <button
                        ref={closeButtonRef}
                        onClick={handleClose}
                        className="p-1.5 rounded-lg text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto">
                    {!hasProjects && unassignedStats.particleCount === 0 ? (
                      <ProjectEmptyState onCreateNew={() => setShowCreateForm(true)} />
                    ) : (
                      <div ref={listRef} className="p-3 space-y-1">
                        {listItems.map((item, idx) => (
                          <ProjectListItem
                            key={item.id ?? 'no-project'}
                            id={item.id}
                            name={item.name}
                            brightness={item.brightness}
                            particleCount={item.particleCount}
                            weekParticleCount={item.weekParticleCount}
                            isArchived={item.isArchived}
                            isFocused={idx === focusedIndex}
                            index={idx}
                            onClick={() => {
                              setFocusedIndex(idx);
                              if (item.type === 'project' && item.id) {
                                setViewingProject(item.id);
                              } else if (item.type === 'noProject') {
                                setViewingProject('no-project');
                              }
                            }}
                            onEdit={
                              item.type === 'project' && item.id
                                ? () => setEditingProject(item.id!)
                                : undefined
                            }
                            onArchive={
                              item.type === 'project' && item.id && !item.isArchived
                                ? () => setArchivingProject(item.id!)
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer: Show Archived toggle */}
                  {archivedProjects.length > 0 && (
                    <div className="px-6 py-3 border-t border-tertiary/10 light:border-tertiary-dark/10">
                      <button
                        onClick={() => setShowArchived(!showArchived)}
                        className="flex items-center gap-2 text-sm text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors"
                      >
                        {showArchived ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        {showArchived ? 'Hide' : 'Show'} Archived ({archivedProjects.length})
                      </button>
                    </div>
                  )}

                  {/* Keyboard hints */}
                  <div className="px-6 py-2 border-t border-tertiary/10 light:border-tertiary-dark/10 text-xs text-tertiary light:text-tertiary-dark flex items-center gap-4">
                    <span>
                      <kbd className="px-1 rounded bg-tertiary/10">J/K</kbd> navigate
                    </span>
                    <span>
                      <kbd className="px-1 rounded bg-tertiary/10">↵</kbd> open
                    </span>
                    <span>
                      <kbd className="px-1 rounded bg-tertiary/10">E</kbd> edit
                    </span>
                    <span>
                      <kbd className="px-1 rounded bg-tertiary/10">A</kbd> archive
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Form Modal */}
      <ProjectForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onCreate={handleCreateProject}
        checkDuplicateName={checkDuplicateName}
      />

      {/* Edit Form Modal */}
      <ProjectForm
        project={projectBeingEdited ?? undefined}
        isOpen={!!editingProject && !!projectBeingEdited}
        onClose={() => setEditingProject(null)}
        onUpdate={handleUpdateProject}
        onArchive={handleArchiveFromForm}
        checkDuplicateName={checkDuplicateName}
      />

      {/* Archive Dialog */}
      <ProjectArchiveDialog
        project={projectBeingArchived}
        isOpen={!!archivingProject}
        onConfirm={() => archivingProject && handleArchiveProject(archivingProject)}
        onCancel={() => setArchivingProject(null)}
      />

      {/* Detail Modal */}
      <ProjectDetailModal
        project={projectBeingViewed === undefined ? null : projectBeingViewed}
        isOpen={!!viewingProject}
        onClose={() => setViewingProject(null)}
        onUpdate={handleUpdateFromDetail}
        checkDuplicateName={checkDuplicateName}
      />
    </>
  );
}
