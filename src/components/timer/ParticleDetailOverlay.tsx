'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, Trash2, Zap } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  getSessionById,
  updateSession,
  deleteSession,
  formatTime24h,
  formatDuration,
  formatDate,
  type CompletedSession,
} from '@/lib/session-storage';
import { ProjectDropdown } from '@/components/task/ProjectDropdown';
import type { Project } from '@/lib/projects';

interface ParticleDetailOverlayProps {
  isOpen: boolean;
  sessionId: string | null;
  particleIndex?: number; // 1-based index (e.g., "3rd particle today")
  onClose: () => void;
  onSessionUpdated: () => void;
  onSessionDeleted: () => void;
  projects: Project[];
  recentProjectIds: string[];
}

const MIN_DURATION = 60; // 1 minute
const MAX_DURATION = 180 * 60; // 180 minutes

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', ...SPRING.gentle },
  },
};

/**
 * Particle Detail Overlay
 * View and edit session details (task, project, duration)
 * Click on a filled particle to open this overlay
 */
export function ParticleDetailOverlay({
  isOpen,
  sessionId,
  particleIndex,
  onClose,
  onSessionUpdated,
  onSessionDeleted,
  projects,
  recentProjectIds,
}: ParticleDetailOverlayProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);
  const durationInputRef = useRef<HTMLInputElement>(null);

  // Session data
  const [session, setSession] = useState<CompletedSession | null>(null);

  // Editable fields
  const [task, setTask] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  // Track dirty state
  const [isDirty, setIsDirty] = useState(false);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Quick edit mode for duration
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [durationInput, setDurationInput] = useState('');

  // Focus trap
  useFocusTrap(modalRef, isOpen, { initialFocusRef: taskInputRef });

  // Load session data when opening
  useEffect(() => {
    if (isOpen && sessionId) {
      const loadedSession = getSessionById(sessionId);
      if (loadedSession) {
        setSession(loadedSession);
        setTask(loadedSession.task || '');
        setProjectId(loadedSession.projectId || null);
        setDuration(loadedSession.duration);
        setIsDirty(false);
        setShowDeleteConfirm(false);
        setIsEditingDuration(false);
      }
    }
  }, [isOpen, sessionId]);

  // Save changes before closing
  const handleSaveAndClose = useCallback(() => {
    if (isDirty && sessionId) {
      updateSession(sessionId, {
        task: task || undefined,
        projectId: projectId || undefined,
        duration,
      });
      onSessionUpdated();
    }
    onClose();
  }, [isDirty, sessionId, task, projectId, duration, onSessionUpdated, onClose]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (sessionId) {
      deleteSession(sessionId);
      onSessionDeleted();
      onClose();
    }
  }, [sessionId, onSessionDeleted, onClose]);

  // Commit duration edit (defined before useEffect that uses it)
  const commitDurationEdit = useCallback(() => {
    const minutes = parseInt(durationInput, 10);
    if (!isNaN(minutes) && minutes >= 1 && minutes <= 180) {
      setDuration(minutes * 60);
      setIsDirty(true);
    }
    setIsEditingDuration(false);
  }, [durationInput]);

  // Duration adjusters (defined before useEffect that uses it)
  const adjustDuration = useCallback((delta: number) => {
    setDuration((prev) => {
      const newDuration = Math.max(MIN_DURATION, Math.min(MAX_DURATION, prev + delta));
      return newDuration;
    });
    setIsDirty(true);
  }, []);

  // Handle keyboard shortcuts - capture phase + stopImmediatePropagation prevents Timer interference
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in inputs (except duration input)
      const target = e.target as HTMLElement;
      const isInTextInput = target.tagName === 'INPUT' && target !== durationInputRef.current;

      // Don't intercept when editing duration (except for special keys)
      if (isEditingDuration) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopImmediatePropagation();
          setIsEditingDuration(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          e.stopImmediatePropagation();
          commitDurationEdit();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          handleSaveAndClose();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (showDeleteConfirm) {
          handleDelete();
        } else {
          // Enter = Save and Close (primary action)
          handleSaveAndClose();
        }
      } else if (!isInTextInput) {
        // Duration adjustment shortcuts (only when not typing in task input)
        if (e.key === 'ArrowUp' || e.key === '+' || e.key === '=') {
          e.preventDefault();
          e.stopImmediatePropagation();
          const delta = e.shiftKey ? 5 * 60 : 60; // Shift = +5 min, else +1 min
          adjustDuration(delta);
        } else if (e.key === 'ArrowDown' || e.key === '-') {
          e.preventDefault();
          e.stopImmediatePropagation();
          const delta = e.shiftKey ? -5 * 60 : -60; // Shift = -5 min, else -1 min
          adjustDuration(delta);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, showDeleteConfirm, handleSaveAndClose, handleDelete, isEditingDuration, commitDurationEdit, adjustDuration]);

  // Quick edit duration
  const startDurationEdit = () => {
    setDurationInput(String(Math.round(duration / 60)));
    setIsEditingDuration(true);
    setTimeout(() => {
      durationInputRef.current?.focus();
      durationInputRef.current?.select();
    }, 0);
  };

  // Handle task change
  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTask(e.target.value);
    setIsDirty(true);
  };

  // Handle project change
  const handleProjectChange = (newProjectId: string | null) => {
    setProjectId(newProjectId);
    setIsDirty(true);
  };

  // Format duration as minutes
  const durationMinutes = Math.round(duration / 60);

  // Calculate overflow info
  const hasOverflow = session?.overflowDuration && session.overflowDuration > 0;
  const plannedDuration = hasOverflow
    ? session!.duration - session!.overflowDuration!
    : session?.duration || 0;
  const overflowDuration = session?.overflowDuration || 0;

  // Calculate time span (start → end)
  // End time is completedAt, start time is calculated from duration
  const timeSpan = useMemo(() => {
    if (!session) return null;
    const endTime = new Date(session.completedAt);
    const startTime = new Date(endTime.getTime() - duration * 1000);
    return {
      start: formatTime24h(startTime.toISOString()),
      end: formatTime24h(session.completedAt),
    };
  }, [session, duration]);

  // Date context for header
  const dateContext = useMemo(() => {
    if (!session) return '';
    return formatDate(session.completedAt);
  }, [session]);

  // Ordinal suffix for particle number
  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  if (!session) return null;

  return (
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
            onClick={handleSaveAndClose}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', ...SPRING.gentle }}
              className="w-[90vw] max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="particle-detail-title"
                className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10"
              >
                {/* Header with breathing particle */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-tertiary/10 light:border-tertiary-dark/10">
                  <div className="flex items-center gap-3">
                    {/* Breathing particle dot */}
                    <motion.div
                      className="w-4 h-4 rounded-full bg-primary light:bg-primary-dark"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [1, 0.8, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    {/* Particle context */}
                    <div className="flex flex-col">
                      <span
                        id="particle-detail-title"
                        className="text-sm font-medium text-primary light:text-primary-dark"
                      >
                        {particleIndex
                          ? `${particleIndex}${getOrdinalSuffix(particleIndex)} particle`
                          : 'Particle'}
                      </span>
                      <span className="text-xs text-tertiary light:text-tertiary-dark">
                        {dateContext}
                      </span>
                    </div>
                  </div>
                  {/* Close button */}
                  <button
                    onClick={handleSaveAndClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content with staggered animation */}
                <motion.div
                  className="p-6 space-y-5"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Time span display */}
                  <motion.div
                    variants={itemVariants}
                    className="text-center"
                  >
                    <motion.p
                      key={timeSpan?.start}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="text-base font-mono text-secondary light:text-secondary-dark tabular-nums tracking-wide"
                    >
                      {timeSpan?.start}
                      <span className="mx-2 text-tertiary light:text-tertiary-dark">→</span>
                      {timeSpan?.end}
                    </motion.p>
                  </motion.div>

                  {/* Duration display - hero element */}
                  <motion.div variants={itemVariants} className="text-center py-1">
                    <div className="flex items-center justify-center gap-4">
                      {/* Decrease buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustDuration(-5 * 60)}
                          disabled={durationMinutes <= 5}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-20 disabled:cursor-not-allowed"
                          aria-label="Decrease 5 minutes"
                        >
                          <span className="text-xs">−5</span>
                        </button>
                        <button
                          onClick={() => adjustDuration(-60)}
                          disabled={durationMinutes <= 1}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-20 disabled:cursor-not-allowed"
                          aria-label="Decrease 1 minute"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Duration value - click to edit (fixed layout) */}
                      <div className="relative flex items-baseline justify-center">
                        {/* Fixed width number area */}
                        <div className="w-20 text-center">
                          {isEditingDuration ? (
                            <input
                              ref={durationInputRef}
                              type="number"
                              min="1"
                              max="180"
                              value={durationInput}
                              onChange={(e) => setDurationInput(e.target.value)}
                              onBlur={commitDurationEdit}
                              className="w-full text-center text-5xl font-light text-primary light:text-primary-dark bg-transparent border-b-2 border-accent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          ) : (
                            <motion.button
                              key={durationMinutes}
                              onClick={startDurationEdit}
                              className="w-full text-center text-5xl font-light text-primary light:text-primary-dark tabular-nums hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg border-b-2 border-transparent"
                              title="Click to edit"
                              initial={{ scale: 0.95 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              {durationMinutes}
                            </motion.button>
                          )}
                        </div>
                        {/* Fixed position min label */}
                        <span className="text-sm text-tertiary light:text-tertiary-dark ml-1 self-end pb-2">
                          min
                        </span>
                      </div>

                      {/* Increase buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustDuration(60)}
                          disabled={durationMinutes >= 180}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-20 disabled:cursor-not-allowed"
                          aria-label="Increase 1 minute"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => adjustDuration(5 * 60)}
                          disabled={durationMinutes >= 176}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-20 disabled:cursor-not-allowed"
                          aria-label="Increase 5 minutes"
                        >
                          <span className="text-xs">+5</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Overflow Badge - prominent */}
                  <AnimatePresence>
                    {hasOverflow && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ type: 'spring', ...SPRING.gentle }}
                        className="mx-auto max-w-[280px] px-4 py-3 rounded-xl bg-tertiary/10 light:bg-tertiary-dark/10 border border-tertiary/10 light:border-tertiary-dark/10"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-3.5 h-3.5 text-accent light:text-accent-dark" />
                          <span className="text-sm font-medium text-primary light:text-primary-dark">
                            +{formatDuration(overflowDuration)} overflow
                          </span>
                        </div>
                        <p className="text-xs text-tertiary light:text-tertiary-dark pl-[22px]">
                          {formatDuration(plannedDuration)} planned → {formatDuration(duration)} actual
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Task input */}
                  <motion.div variants={itemVariants}>
                    <label
                      htmlFor="particle-task"
                      className="block text-xs text-tertiary light:text-tertiary-dark mb-2"
                    >
                      Task
                    </label>
                    <input
                      ref={taskInputRef}
                      id="particle-task"
                      type="text"
                      value={task}
                      onChange={handleTaskChange}
                      placeholder="What did you work on?"
                      className="w-full px-4 py-2.5 rounded-xl bg-tertiary/10 light:bg-tertiary-dark/10 text-primary light:text-primary-dark placeholder:text-tertiary light:placeholder:text-tertiary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    />
                  </motion.div>

                  {/* Project dropdown */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-xs text-tertiary light:text-tertiary-dark mb-2">
                      Project
                    </label>
                    <div className="flex justify-end">
                      <ProjectDropdown
                        projectId={projectId}
                        onSelect={handleProjectChange}
                        projects={projects}
                        recentProjectIds={recentProjectIds}
                      />
                    </div>
                  </motion.div>
                </motion.div>

                {/* Footer - Actions */}
                <div className="px-6 py-4 border-t border-tertiary/10 light:border-tertiary-dark/10">
                  <AnimatePresence mode="wait">
                    {showDeleteConfirm ? (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center justify-between"
                      >
                        {/* Cancel - text link (same position as Delete link) */}
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex items-center gap-1.5 text-sm text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                        >
                          Cancel
                        </button>

                        {/* Delete - same size as Done button */}
                        <button
                          onClick={handleDelete}
                          className="px-4 py-2 rounded-xl text-sm font-medium bg-primary light:bg-primary-dark text-background light:text-background-dark hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          Delete
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="actions"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center justify-between"
                      >
                        {/* Delete - subtle text link */}
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-1.5 text-sm text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>

                        {/* Done - primary action */}
                        <button
                          onClick={handleSaveAndClose}
                          className="px-4 py-2 rounded-xl text-sm font-medium bg-primary light:bg-primary-dark text-background light:text-background-dark hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          Done
                          <kbd className="ml-2 text-xs opacity-60">↵</kbd>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
