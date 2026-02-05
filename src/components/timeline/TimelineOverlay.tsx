'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useTimelineData } from '@/hooks/useTimelineData';
import { TimelineHeader } from './TimelineHeader';
import { TimelineTrack } from './TimelineTrack';
import { TimelineStats } from './TimelineStats';
import { ParticleDetailOverlay } from '@/components/timer/ParticleDetailOverlay';
import { useProjects } from '@/hooks/useProjects';

interface TimelineOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * TimelineOverlay
 *
 * The flagship day view feature showing a horizontal timeline
 * of all sessions for the selected day.
 *
 * Access:
 * - Click on timer display
 * - G T keyboard shortcut
 * - Command palette "Open Timeline"
 */
export function TimelineOverlay({ isOpen, onClose }: TimelineOverlayProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Timeline data
  const {
    date,
    sessions,
    particleCount,
    totalFocusSeconds,
    firstStart,
    lastEnd,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    canGoForward,
    isToday,
    refresh,
    averageParticlesPerDay,
  } = useTimelineData();

  // Projects for particle detail overlay
  const { activeProjects, recentProjectIds } = useProjects();

  // Particle detail overlay state
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Focus trap - focus the modal container itself to avoid visible ring on close button
  useFocusTrap(modalRef, isOpen && !selectedSessionId, { initialFocusRef: modalRef });

  // Refresh data when overlay opens to ensure fresh session data
  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

  // Handle keyboard shortcuts - capture phase + stopImmediatePropagation prevents Timer interference
  useEffect(() => {
    if (!isOpen || selectedSessionId) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopImmediatePropagation();
        goToPreviousDay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopImmediatePropagation();
        goToNextDay();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        e.stopImmediatePropagation();
        goToToday();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, selectedSessionId, onClose, goToPreviousDay, goToNextDay, goToToday]);

  // Handle block click - open particle detail
  const handleBlockClick = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId);
  }, []);

  // Handle particle detail close
  const handleDetailClose = useCallback(() => {
    setSelectedSessionId(null);
  }, []);

  // Handle session updated
  const handleSessionUpdated = useCallback(() => {
    refresh();
  }, [refresh]);

  // Handle session deleted
  const handleSessionDeleted = useCallback(() => {
    setSelectedSessionId(null);
    refresh();
  }, [refresh]);

  // Get particle index for detail overlay
  const getParticleIndex = useCallback((sessionId: string): number | undefined => {
    const workSessions = sessions.filter(s => s.type === 'work');
    const index = workSessions.findIndex(s => s.id === sessionId);
    return index >= 0 ? index + 1 : undefined;
  }, [sessions]);

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
              onClick={onClose}
            >
              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: 'spring', ...SPRING.gentle }}
                className="w-[95vw] max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  ref={modalRef}
                  tabIndex={-1}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="timeline-title"
                  className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 focus:outline-none"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-tertiary/10 light:border-tertiary-dark/10">
                    <h2
                      id="timeline-title"
                      className="text-lg font-semibold text-primary light:text-primary-dark"
                    >
                      Timeline
                    </h2>
                    <button
                      onClick={onClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 py-6 sm:p-6 sm:py-8 overflow-visible">
                    {/* Day navigation */}
                    <TimelineHeader
                      date={date}
                      isToday={isToday}
                      canGoForward={canGoForward}
                      onPreviousDay={goToPreviousDay}
                      onNextDay={goToNextDay}
                      onToday={goToToday}
                    />

                    {/* Timeline track */}
                    <TimelineTrack
                      sessions={sessions}
                      onBlockClick={handleBlockClick}
                      isToday={isToday}
                    />

                    {/* Stats */}
                    <TimelineStats
                      particleCount={particleCount}
                      totalFocusSeconds={totalFocusSeconds}
                      firstStart={firstStart}
                      lastEnd={lastEnd}
                      averagePerDay={averageParticlesPerDay}
                    />
                  </div>

                  {/* Footer hint - desktop: keyboard shortcuts */}
                  <div className="hidden sm:block px-6 py-3 border-t border-tertiary/10 light:border-tertiary-dark/10">
                    <p className="text-xs text-tertiary light:text-tertiary-dark text-center">
                      Click a particle for details
                      <span className="mx-2 opacity-50">&middot;</span>
                      <kbd className="px-1 rounded bg-tertiary/10 light:bg-tertiary-dark/10">←</kbd>
                      <kbd className="px-1 rounded bg-tertiary/10 light:bg-tertiary-dark/10 ml-0.5">→</kbd>
                      <span className="ml-1">navigate days</span>
                      <span className="mx-2 opacity-50">&middot;</span>
                      <kbd className="px-1 rounded bg-tertiary/10 light:bg-tertiary-dark/10">T</kbd>
                      <span className="ml-1">for today</span>
                    </p>
                  </div>

                  {/* Footer hint - mobile: touch hint */}
                  <div className="block sm:hidden px-4 py-3 border-t border-tertiary/10 light:border-tertiary-dark/10">
                    <p className="text-xs text-tertiary light:text-tertiary-dark text-center">
                      Tap a particle for details
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Particle Detail Overlay */}
      <ParticleDetailOverlay
        isOpen={selectedSessionId !== null}
        sessionId={selectedSessionId}
        particleIndex={selectedSessionId ? getParticleIndex(selectedSessionId) : undefined}
        onClose={handleDetailClose}
        onSessionUpdated={handleSessionUpdated}
        onSessionDeleted={handleSessionDeleted}
        projects={activeProjects}
        recentProjectIds={recentProjectIds}
      />
    </>
  );
}
