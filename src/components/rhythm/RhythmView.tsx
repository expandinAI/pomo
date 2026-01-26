'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useProjects } from '@/hooks/useProjects';
import { loadSessions } from '@/lib/session-storage';
import {
  calculateRhythm,
  calculateProjectRhythms,
  getParticlesWithEstimate,
} from '@/lib/rhythm';
import { RHYTHM_NOT_ENOUGH_DATA_HINT } from '@/lib/rhythm-texts';
import { RhythmCard } from './RhythmCard';
import { ProjectRhythmList } from './ProjectRhythmList';
import { ProjectFilterDropdown } from '@/components/insights/ProjectFilterDropdown';

interface RhythmViewProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Rhythm View Modal
 * Shows global rhythm and per-project rhythm breakdown
 */
export function RhythmView({ isOpen, onClose }: RhythmViewProps) {
  const { activeProjects, isLoading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Load sessions
  const [sessions, setSessions] = useState<ReturnType<typeof loadSessions>>([]);

  useEffect(() => {
    if (isOpen) {
      setSessions(loadSessions());
    }
  }, [isOpen]);

  // Filter sessions by selected project
  const filteredSessions = useMemo(() => {
    if (!selectedProjectId) return sessions;
    return sessions.filter((s) => s.projectId === selectedProjectId);
  }, [sessions, selectedProjectId]);

  // Calculate global rhythm
  const globalRhythm = useMemo(() => {
    return calculateRhythm(filteredSessions);
  }, [filteredSessions]);

  // Calculate per-project rhythms (only when viewing all projects)
  const projectRhythms = useMemo(() => {
    if (selectedProjectId) return []; // Don't show breakdown when filtering
    return calculateProjectRhythms(sessions, activeProjects);
  }, [sessions, activeProjects, selectedProjectId]);

  // Count particles with estimate
  const particlesWithEstimate = useMemo(() => {
    return getParticlesWithEstimate(filteredSessions).length;
  }, [filteredSessions]);

  // Handle escape key - capture phase + stopImmediatePropagation prevents Timer interference
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (projectsLoading) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', ...SPRING.snappy }}
            className="relative w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl bg-surface light:bg-surface-dark shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-tertiary/10 light:border-tertiary-dark/10">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-primary light:text-primary-dark">
                  Rhythm
                </h2>
                <ProjectFilterDropdown
                  value={selectedProjectId}
                  onChange={setSelectedProjectId}
                  projects={activeProjects}
                />
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-64px)] p-6 space-y-6">

              {/* Main content */}
              {globalRhythm.hasEnoughData ? (
                <>
                  {/* Global Rhythm Card */}
                  <RhythmCard rhythm={globalRhythm} />

                  {/* Per-Project List (only when showing all) */}
                  {!selectedProjectId && projectRhythms.length > 0 && (
                    <ProjectRhythmList projectRhythms={projectRhythms} />
                  )}
                </>
              ) : (
                /* Not enough data message */
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', ...SPRING.gentle }}
                  className="py-12 px-6 rounded-xl bg-tertiary/5 light:bg-tertiary-dark/5 border border-tertiary/10 light:border-tertiary-dark/10 text-center"
                >
                  <div className="text-5xl font-light text-primary/20 light:text-primary-dark/20 mb-4 tabular-nums">
                    {particlesWithEstimate > 0 ? `${particlesWithEstimate}/5` : '0/5'}
                  </div>
                  <p className="text-sm text-tertiary light:text-tertiary-dark max-w-[240px] mx-auto leading-relaxed">
                    {RHYTHM_NOT_ENOUGH_DATA_HINT}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
