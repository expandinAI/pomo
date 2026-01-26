'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from '@/components/timer/Timer';
import { ActionBar } from '@/components/ui/ActionBar';
import { useTheme } from '@/hooks/useTheme';
import { useCommandPalette } from '@/contexts/CommandPaletteContext';
import { useGPrefixNavigation } from '@/hooks/useGPrefixNavigation';
import { TimelineOverlay } from '@/components/timeline';
import { MilestoneProvider, useMilestones } from '@/components/milestones';

// Lazy load non-critical modal components
const ShortcutsHelp = dynamic(
  () => import('@/components/ui/ShortcutsHelp').then(mod => ({ default: mod.ShortcutsHelp })),
  { ssr: false }
);
const TimerSettings = dynamic(
  () => import('@/components/settings/TimerSettings').then(mod => ({ default: mod.TimerSettings })),
  { ssr: false }
);
const StatisticsDashboard = dynamic(
  () => import('@/components/insights/StatisticsDashboard').then(mod => ({ default: mod.StatisticsDashboard })),
  { ssr: false }
);
const YearViewModal = dynamic(
  () => import('@/components/year-view/YearViewModal').then(mod => ({ default: mod.YearViewModal })),
  { ssr: false }
);
const ProjectListModal = dynamic(
  () => import('@/components/projects/ProjectListModal').then(mod => ({ default: mod.ProjectListModal })),
  { ssr: false }
);
const RhythmView = dynamic(
  () => import('@/components/rhythm/RhythmView').then(mod => ({ default: mod.RhythmView })),
  { ssr: false }
);

/**
 * Inner component that uses milestone context
 */
function HomeContent() {
  // Timeline overlay state
  const [showTimeline, setShowTimeline] = useState(false);

  // Rhythm view state
  const [showRhythm, setShowRhythm] = useState(false);

  // Theme and command palette
  const { theme, toggleTheme } = useTheme();
  const { open: openCommandPalette } = useCommandPalette();

  // Milestones
  const { setShowJourney } = useMilestones();

  // G-prefix navigation callbacks
  const gPrefixCallbacks = useMemo(
    () => ({
      onTimeline: () => {
        setShowTimeline(true);
      },
      onStats: () => {
        window.dispatchEvent(new CustomEvent('particle:open-dashboard'));
      },
      onHistory: () => {
        // Open Statistics Dashboard with History tab
        window.dispatchEvent(new CustomEvent('particle:open-history'));
      },
      onSettings: () => {
        window.dispatchEvent(new CustomEvent('particle:open-settings'));
      },
      onYear: () => {
        window.dispatchEvent(new CustomEvent('particle:open-year'));
      },
      onProjects: () => {
        window.dispatchEvent(new CustomEvent('particle:open-projects'));
      },
      onGoals: () => {
        window.dispatchEvent(new CustomEvent('particle:open-goals'));
      },
      onRhythm: () => {
        setShowRhythm(true);
      },
      onMilestones: () => {
        setShowJourney(true);
      },
    }),
    [setShowJourney]
  );

  const { isGPressed } = useGPrefixNavigation(gPrefixCallbacks);

  // Listen for timeline open event (from Command Palette)
  useEffect(() => {
    function handleOpenTimeline() {
      setShowTimeline(true);
    }

    window.addEventListener('particle:open-timeline', handleOpenTimeline);
    return () => window.removeEventListener('particle:open-timeline', handleOpenTimeline);
  }, []);

  // Listen for rhythm open event (from Command Palette)
  useEffect(() => {
    function handleOpenRhythm() {
      setShowRhythm(true);
    }

    window.addEventListener('particle:open-rhythm', handleOpenRhythm);
    return () => window.removeEventListener('particle:open-rhythm', handleOpenRhythm);
  }, []);

  // Listen for milestones open event (from Command Palette)
  useEffect(() => {
    function handleOpenMilestones() {
      setShowJourney(true);
    }

    window.addEventListener('particle:open-milestones', handleOpenMilestones);
    return () => window.removeEventListener('particle:open-milestones', handleOpenMilestones);
  }, [setShowJourney]);

  // Global keyboard shortcut for Cmd+, to open settings
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd+, (Mac) or Ctrl+, (Windows/Linux) to open settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('particle:open-settings'));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main
      id="main-timer"
      tabIndex={-1}
      className="relative min-h-screen flex flex-col items-center justify-center p-4 safe-area-inset-top safe-area-inset-bottom focus:outline-none"
    >
      {/* Action Bar - Discoverable entry point for all features */}
      <div className="absolute top-4 right-4">
        <ActionBar
          onOpenTimeline={() => setShowTimeline(true)}
          onOpenRhythm={() => setShowRhythm(true)}
          onOpenProjects={() => window.dispatchEvent(new CustomEvent('particle:open-projects'))}
          onOpenGoals={() => window.dispatchEvent(new CustomEvent('particle:open-goals'))}
          onOpenStats={() => window.dispatchEvent(new CustomEvent('particle:open-dashboard'))}
          onOpenCommands={openCommandPalette}
          onOpenSettings={() => window.dispatchEvent(new CustomEvent('particle:open-settings'))}
          onToggleTheme={toggleTheme}
          theme={theme}
        />
      </div>

      {/* TimerSettings modal - hidden trigger, responds to events */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <TimerSettings />
      </div>

      {/* Statistics Dashboard (opened via ActionBar or G+S) */}
      <StatisticsDashboard />

      {/* Year View Modal (opened via G+Y keyboard shortcut) */}
      <YearViewModal />

      {/* Project List Modal (opened via G+P keyboard shortcut) */}
      <ProjectListModal />

      {/* Rhythm View (opened via G+R keyboard shortcut or Command Palette) */}
      <RhythmView isOpen={showRhythm} onClose={() => setShowRhythm(false)} />

      {/* Timeline Overlay (opened via G+T, timer click, or Command Palette) */}
      <TimelineOverlay
        isOpen={showTimeline}
        onClose={() => setShowTimeline(false)}
      />

      <Timer onTimelineOpen={() => setShowTimeline(true)} />

      {/* Shortcuts help in bottom-left corner */}
      <div className="absolute bottom-4 left-4">
        <ShortcutsHelp />
      </div>

      {/* G-prefix indicator */}
      <AnimatePresence>
        {isGPressed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-4 right-4 px-3 py-1.5 bg-surface/90 light:bg-surface-dark/90 backdrop-blur-sm rounded-lg border border-tertiary/20 light:border-tertiary-dark/20 shadow-lg z-50"
          >
            <span className="text-sm font-medium text-secondary light:text-secondary-dark">
              G...
            </span>
            <span className="ml-2 text-xs text-tertiary light:text-tertiary-dark">
              t/r/s/h/y/p/o/m/,
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/**
 * Main page component with MilestoneProvider wrapper
 */
export default function Home() {
  return (
    <MilestoneProvider>
      <HomeContent />
    </MilestoneProvider>
  );
}
