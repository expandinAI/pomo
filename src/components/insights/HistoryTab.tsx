'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { prefersReducedMotion } from '@/lib/utils';
import type { CompletedSession } from '@/lib/session-storage';
import { getActiveProjects } from '@/lib/projects';
import { ParticleSearchBar } from './ParticleSearchBar';
import { ParticleFilterBar } from './ParticleFilterBar';
import { ParticleList } from './ParticleList';
import { ParticleDetailOverlay } from '@/components/timer/ParticleDetailOverlay';

type TypeFilter = 'all' | 'work' | 'break';

interface HistoryTabProps {
  sessions: CompletedSession[];
  onSessionUpdate: () => void;
}

const INITIAL_VISIBLE_COUNT = 50;
const LOAD_MORE_INCREMENT = 50;

/**
 * History Tab - Search and filter all particles with edit capability
 * Provides search, type filter, project filter, and pagination
 */
export function HistoryTab({ sessions, onSessionUpdate }: HistoryTabProps) {
  const reducedMotion = prefersReducedMotion();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [projectFilter, setProjectFilter] = useState<string | null>(null);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  // Edit overlay state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Get projects for the overlay
  const projects = useMemo(() => getActiveProjects(), []);

  // Get recent project IDs from sessions for sorting
  const recentProjectIds = useMemo(() => {
    return sessions
      .filter((s) => s.projectId)
      .map((s) => s.projectId as string)
      .slice(0, 20);
  }, [sessions]);

  // Filter sessions based on all criteria
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Type filter
      if (typeFilter === 'work' && session.type !== 'work') return false;
      if (typeFilter === 'break' && session.type === 'work') return false;

      // Project filter
      if (projectFilter && session.projectId !== projectFilter) return false;

      // Search filter (case-insensitive task name match)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const task = (session.task || '').toLowerCase();
        if (!task.includes(query)) return false;
      }

      return true;
    });
  }, [sessions, typeFilter, projectFilter, searchQuery]);

  // Reset pagination when filters change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, []);

  const handleTypeFilterChange = useCallback((value: TypeFilter) => {
    setTypeFilter(value);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, []);

  const handleProjectFilterChange = useCallback((value: string | null) => {
    setProjectFilter(value);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + LOAD_MORE_INCREMENT);
  }, []);

  const handleEdit = useCallback((session: CompletedSession) => {
    setEditingSessionId(session.id);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditingSessionId(null);
  }, []);

  const handleSessionUpdated = useCallback(() => {
    onSessionUpdate();
  }, [onSessionUpdate]);

  const handleSessionDeleted = useCallback(() => {
    onSessionUpdate();
    setEditingSessionId(null);
  }, [onSessionUpdate]);

  // Determine empty state messaging
  const hasFilters = searchQuery || typeFilter !== 'all' || projectFilter;
  const emptyMessage = hasFilters
    ? 'No particles found'
    : 'No particles yet';
  const emptyDescription = hasFilters
    ? 'Try adjusting your search or filters'
    : 'Complete a focus session to see it here';

  return (
    <>
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.gentle }}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
        role="tabpanel"
        aria-label="History tab"
      >
        {/* Search and Filters */}
        <div className="flex-shrink-0 p-4 space-y-3 border-b border-tertiary/10 light:border-tertiary-dark/10">
          <ParticleSearchBar
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <ParticleFilterBar
            typeFilter={typeFilter}
            onTypeFilterChange={handleTypeFilterChange}
            projectFilter={projectFilter}
            onProjectFilterChange={handleProjectFilterChange}
          />
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4">
          <ParticleList
            sessions={filteredSessions}
            visibleCount={visibleCount}
            onLoadMore={handleLoadMore}
            onEdit={handleEdit}
            emptyMessage={emptyMessage}
            emptyDescription={emptyDescription}
          />
        </div>

        {/* Keyboard Hint */}
        <div className="flex-shrink-0 px-4 py-2 border-t border-tertiary/10 light:border-tertiary-dark/10">
          <p className="text-xs text-tertiary light:text-tertiary-dark text-center">
            Press <kbd className="px-1.5 py-0.5 mx-0.5 rounded bg-tertiary/10 light:bg-tertiary-dark/10 font-mono">/</kbd> to search
          </p>
        </div>
      </motion.div>

      {/* Edit Overlay */}
      <ParticleDetailOverlay
        isOpen={editingSessionId !== null}
        sessionId={editingSessionId}
        onClose={handleCloseEdit}
        onSessionUpdated={handleSessionUpdated}
        onSessionDeleted={handleSessionDeleted}
        projects={projects}
        recentProjectIds={recentProjectIds}
      />
    </>
  );
}
