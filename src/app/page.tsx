'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from '@/components/timer/Timer';
import { ActionBar } from '@/components/ui/ActionBar';
import { CommandButton, BottomRightControls } from '@/components/ui/CornerControls';
import { useTimerSettingsContext } from '@/contexts/TimerSettingsContext';
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
const LearnPanel = dynamic(
  () => import('@/components/learn/LearnPanel').then(mod => ({ default: mod.LearnPanel })),
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

  // Learn panel state
  const [showLearn, setShowLearn] = useState(false);

  // Night mode, presets, and command palette
  const { nightModeEnabled, setNightModeEnabled, activePresetId, applyPreset } = useTimerSettingsContext();
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
      onLearn: () => {
        setShowLearn(true);
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

  // Listen for learn open event (from Command Palette)
  useEffect(() => {
    function handleOpenLearn() {
      setShowLearn(true);
    }

    window.addEventListener('particle:open-learn', handleOpenLearn);
    return () => window.removeEventListener('particle:open-learn', handleOpenLearn);
  }, []);

  // Global L key to toggle Learn Panel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      // Don't trigger if any modifier is pressed
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setShowLearn(prev => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      {/* Action Bar - Functional navigation (top-right) */}
      <div className="absolute top-4 right-4">
        <ActionBar
          onOpenTimeline={() => setShowTimeline(true)}
          onOpenRhythm={() => setShowRhythm(true)}
          onOpenProjects={() => window.dispatchEvent(new CustomEvent('particle:open-projects'))}
          onOpenGoals={() => window.dispatchEvent(new CustomEvent('particle:open-goals'))}
          onOpenStats={() => window.dispatchEvent(new CustomEvent('particle:open-dashboard'))}
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

      {/* Bottom-left: Command Palette + Keyboard Shortcuts */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1">
        <CommandButton onOpenCommands={openCommandPalette} />
        <ShortcutsHelp />
      </div>

      {/* Bottom-right: Learn + Night Mode + Settings */}
      <div className="absolute bottom-4 right-4">
        <BottomRightControls
          onOpenLearn={() => setShowLearn(true)}
          onToggleNightMode={() => setNightModeEnabled(!nightModeEnabled)}
          onOpenSettings={() => window.dispatchEvent(new CustomEvent('particle:open-settings'))}
          nightModeEnabled={nightModeEnabled}
        />
      </div>

      {/* Learn Panel */}
      <AnimatePresence>
        {showLearn && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowLearn(false)}
            />
            <LearnPanel
              onClose={() => setShowLearn(false)}
              currentPresetId={activePresetId}
              onPresetChange={applyPreset}
            />
          </>
        )}
      </AnimatePresence>

      {/* G-prefix indicator - positioned above bottom-right controls */}
      <AnimatePresence>
        {isGPressed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-16 right-4 px-3 py-1.5 bg-surface/90 light:bg-surface-dark/90 backdrop-blur-sm rounded-lg border border-tertiary/20 light:border-tertiary-dark/20 shadow-lg z-50"
          >
            <span className="text-sm font-medium text-secondary light:text-secondary-dark">
              G...
            </span>
            <span className="ml-2 text-xs text-tertiary light:text-tertiary-dark">
              t/r/s/h/y/p/o/m/l/,
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
