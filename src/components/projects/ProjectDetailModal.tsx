'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pencil } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { ProjectParticleViz } from './ProjectParticleViz';
import { ProjectStatsCards } from './ProjectStatsCards';
import { ProjectSessionList } from './ProjectSessionList';
import { ProjectForm } from './ProjectForm';
import { ParticleDetailOverlay } from '@/components/timer/ParticleDetailOverlay';
import { useSessionStore, type UnifiedSession } from '@/contexts/SessionContext';
import { useProjectStore } from '@/contexts/ProjectContext';
import type { Project, ProjectWithStats } from '@/lib/projects';

interface ProjectDetailModalProps {
  /** The project to display (null for "No Project" view) */
  project: Project | ProjectWithStats | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Called when edit is requested */
  onEdit?: (id: string) => void;
  /** Called when update is performed */
  onUpdate?: (id: string, data: { name?: string; brightness?: number }) => void;
  /** Check if a name is duplicate */
  checkDuplicateName?: (name: string, excludeId?: string) => boolean;
}

/**
 * Modal showing detailed view of a single project
 *
 * Features:
 * - Particle visualization (dot grid)
 * - Stats breakdown (This Week / This Month / All Time)
 * - Recent session history grouped by date
 * - Edit button (E shortcut)
 * - Back navigation (Escape, Backspace)
 */
export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onUpdate,
  checkDuplicateName,
}: ProjectDetailModalProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);

  // Use contexts for unified storage access
  const { sessions } = useSessionStore();
  const { getActiveProjects } = useProjectStore();

  const isNoProject = project === null;

  // Get all projects for the overlay
  const allProjects = useMemo(() => getActiveProjects(), [getActiveProjects]);

  // Get sessions for this project (from context, filtered)
  const projectSessions = useMemo((): UnifiedSession[] => {
    if (!isOpen) return [];

    // Filter work sessions for this project
    const workSessions = sessions.filter(s => s.type === 'work');

    if (project === null) {
      // "No Project" - sessions without a projectId
      return workSessions.filter(s => !s.projectId);
    }

    return workSessions.filter(s => s.projectId === project.id);
  }, [isOpen, project, sessions]);

  // Get recent project IDs from sessions for sorting in overlay
  const recentProjectIds = useMemo(() => {
    return projectSessions
      .filter((s) => s.projectId)
      .map((s) => s.projectId as string)
      .slice(0, 10);
  }, [projectSessions]);

  // Calculate detailed stats
  const detailedStats = useMemo(() => {
    const now = new Date();

    // Week start (Monday)
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = day === 0 ? 6 : day - 1;
    weekStart.setDate(weekStart.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);

    // Month start
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let weekParticles = 0;
    let weekDuration = 0;
    let monthParticles = 0;
    let monthDuration = 0;
    let totalParticles = 0;
    let totalDuration = 0;

    for (const session of projectSessions) {
      const sessionDate = new Date(session.completedAt);
      totalParticles++;
      totalDuration += session.duration;

      if (sessionDate >= weekStart) {
        weekParticles++;
        weekDuration += session.duration;
      }
      if (sessionDate >= monthStart) {
        monthParticles++;
        monthDuration += session.duration;
      }
    }

    return {
      thisWeek: { particles: weekParticles, duration: weekDuration },
      thisMonth: { particles: monthParticles, duration: monthDuration },
      allTime: { particles: totalParticles, duration: totalDuration },
    };
  }, [projectSessions]);

  // Focus trap
  useFocusTrap(modalRef, isOpen && !showEditForm, {
    initialFocusRef: backButtonRef,
  });

  // Keyboard shortcuts
  // Keyboard navigation - capture phase + stopImmediatePropagation prevents Timer interference
  useEffect(() => {
    // Don't handle keys when editing project or session
    if (!isOpen || showEditForm || editingSessionId) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Close on Escape or Backspace
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
        return;
      }

      // Edit on E (only for real projects)
      if ((e.key === 'e' || e.key === 'E') && !isNoProject) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setShowEditForm(true);
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, showEditForm, editingSessionId, isNoProject, onClose]);

  // Handlers
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleUpdateProject = useCallback(
    (id: string, data: { name?: string; brightness?: number }) => {
      onUpdate?.(id, data);
      setShowEditForm(false);
    },
    [onUpdate]
  );

  // Session editing handlers
  const handleEditSession = useCallback((session: UnifiedSession) => {
    setEditingSessionId(session.id);
  }, []);

  const handleCloseSessionEdit = useCallback(() => {
    setEditingSessionId(null);
  }, []);

  const handleSessionUpdated = useCallback(() => {
    // Sessions are automatically refreshed via SessionContext
  }, []);

  const handleSessionDeleted = useCallback(() => {
    setEditingSessionId(null);
    // Sessions are automatically refreshed via SessionContext
  }, []);

  // Get display values
  const displayName = isNoProject ? 'No Project' : project?.name ?? '';
  const displayBrightness = isNoProject ? 0.4 : project?.brightness ?? 0.7;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, pointerEvents: 'auto' as const }}
              exit={{ opacity: 0, pointerEvents: 'none' as const }}
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
                className="w-[90vw] max-w-lg max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  ref={modalRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="project-detail-title"
                  className="flex flex-col bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-tertiary/10 light:border-tertiary-dark/10">
                    <div className="flex items-center gap-3">
                      <button
                        ref={backButtonRef}
                        onClick={handleClose}
                        className="p-1.5 -ml-1.5 rounded-lg text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        aria-label="Back to project list"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: isNoProject
                              ? 'transparent'
                              : `rgba(255, 255, 255, ${displayBrightness})`,
                            border: isNoProject ? '1px solid rgba(255,255,255,0.3)' : 'none',
                          }}
                        />
                        <h2
                          id="project-detail-title"
                          className="text-lg font-semibold text-primary light:text-primary-dark"
                        >
                          {displayName}
                        </h2>
                      </div>
                    </div>

                    {/* Edit button (only for real projects) */}
                    {!isNoProject && (
                      <button
                        onClick={() => setShowEditForm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-secondary light:text-secondary-dark hover:text-primary light:hover:text-primary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                        <kbd className="ml-1 text-xs text-tertiary light:text-tertiary-dark">E</kbd>
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto">
                    {/* Particle Visualization */}
                    <div className="border-b border-tertiary/10 light:border-tertiary-dark/10">
                      <ProjectParticleViz
                        particleCount={detailedStats.allTime.particles}
                        brightness={displayBrightness}
                        totalDuration={detailedStats.allTime.duration}
                      />
                    </div>

                    {/* Stats Cards */}
                    <div className="px-6 py-6 border-b border-tertiary/10 light:border-tertiary-dark/10">
                      <ProjectStatsCards
                        thisWeek={detailedStats.thisWeek}
                        thisMonth={detailedStats.thisMonth}
                        allTime={detailedStats.allTime}
                      />
                    </div>

                    {/* Session List */}
                    <div className="px-6 py-6">
                      <ProjectSessionList
                        sessions={projectSessions}
                        onEdit={handleEditSession}
                      />
                    </div>
                  </div>

                  {/* Footer: Keyboard hints */}
                  <div className="px-6 py-2 border-t border-tertiary/10 light:border-tertiary-dark/10 text-xs text-tertiary light:text-tertiary-dark">
                    <kbd className="px-1 rounded bg-tertiary/10">Esc</kbd> back
                    {!isNoProject && (
                      <>
                        <span className="mx-2">·</span>
                        <kbd className="px-1 rounded bg-tertiary/10">E</kbd> edit
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Form Modal */}
      {project && !isNoProject && (
        <ProjectForm
          project={project}
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onUpdate={handleUpdateProject}
          checkDuplicateName={checkDuplicateName}
        />
      )}

      {/* Particle Detail Overlay */}
      <ParticleDetailOverlay
        isOpen={editingSessionId !== null}
        sessionId={editingSessionId}
        onClose={handleCloseSessionEdit}
        onSessionUpdated={handleSessionUpdated}
        onSessionDeleted={handleSessionDeleted}
        projects={allProjects}
        recentProjectIds={recentProjectIds}
      />
    </>
  );
}
