'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from '@/components/timer/Timer';
import { ActionBar } from '@/components/ui/ActionBar';
import { CommandButton, BottomRightControls } from '@/components/ui/CornerControls';
import { useTimerSettingsContext } from '@/contexts/TimerSettingsContext';
import { useCommandPalette } from '@/contexts/CommandPaletteContext';
import { useGPrefixNavigation } from '@/hooks/useGPrefixNavigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useIntro, usePrefersReducedMotion } from '@/hooks/useIntro';
import { useEasterEggs } from '@/hooks/useEasterEgg';
import { TimelineOverlay } from '@/components/timeline';
import { MilestoneProvider, useMilestones } from '@/components/milestones';
import { isIndexedDBAvailable, hasPendingMigrations, runMigrations } from '@/lib/db';
import type { LearnView } from '@/components/learn/LearnMenu';

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
const RhythmOnboarding = dynamic(
  () => import('@/components/onboarding/RhythmOnboarding').then(mod => ({ default: mod.RhythmOnboarding })),
  { ssr: false }
);
// IntroExperience is NOT lazy-loaded - must be ready immediately on first visit
import { IntroExperience } from '@/components/intro';

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
  const [learnInitialView, setLearnInitialView] = useState<LearnView | undefined>();

  // Reset initialView when panel closes
  const handleLearnClose = useCallback(() => {
    setShowLearn(false);
    setLearnInitialView(undefined);
  }, []);

  // Night mode, presets, and command palette
  const { nightModeEnabled, setNightModeEnabled, activePresetId, applyPreset } = useTimerSettingsContext();
  const { open: openCommandPalette } = useCommandPalette();

  // First-run intro - shows on very first app open
  const {
    isReady: introReady,
    showIntro,
    phase: introPhase,
    currentIntention,
    isOriginalIntro,
    skip: skipIntro,
    markComplete: markIntroComplete,
    replay: replayIntro,
    showInspiration,
  } = useIntro();

  // Reduced motion preference
  const prefersReducedMotion = usePrefersReducedMotion();

  // Track intro transitions for re-triggering entrance animation
  // Only trigger entrance animation after ORIGINAL intro, not after daily intentions
  const prevShowIntroRef = useRef(showIntro);
  const prevIsOriginalRef = useRef(isOriginalIntro);
  const [entranceKey, setEntranceKey] = useState(0);

  useEffect(() => {
    // Only increment key (retrigger entrance animation) after original intro completes
    // Daily intentions/inspirations should NOT trigger entrance animation
    if (prevShowIntroRef.current && !showIntro && prevIsOriginalRef.current) {
      setEntranceKey(prev => prev + 1);
    }
    prevShowIntroRef.current = showIntro;
    prevIsOriginalRef.current = isOriginalIntro;
  }, [showIntro, isOriginalIntro]);

  // Easter eggs:
  // - "intro" → Replay the original intro
  // - "focus" → Show a random inspiration
  // Easter eggs - words that trigger special actions when typed
  // Note: Avoid letters used in G-prefix shortcuts (t,s,h,y,p,o,r,m,l)
  // to prevent conflicts with keyboard navigation
  useEasterEggs([
    { word: 'zen', onTrigger: showInspiration },
  ]);

  // Run IndexedDB migrations on app start
  useEffect(() => {
    if (isIndexedDBAvailable() && hasPendingMigrations()) {
      runMigrations().then(summary => {
        if (summary.totalMigrated > 0) {
          console.log(
            `[Storage] Migration completed: ${summary.totalMigrated} items migrated in ${summary.duration.toFixed(0)}ms`
          );
        }
        if (summary.totalErrors > 0) {
          console.warn('[Storage] Migration errors:', summary.results.flatMap(r => r.errors));
        }
      }).catch(error => {
        console.error('[Storage] Migration failed:', error);
      });
    }
  }, []);

  // Onboarding - shows on first start attempt (after intro)
  const { hasCompletedOnboarding, isOnboardingVisible, showOnboarding, completeOnboarding } = useOnboarding();

  // Intercept first start attempt to show onboarding
  const handleBeforeStart = useCallback(() => {
    if (!hasCompletedOnboarding) {
      showOnboarding();
      return false; // Prevent timer start
    }
    return true; // Allow timer start
  }, [hasCompletedOnboarding, showOnboarding]);

  // After onboarding: apply preset, mark complete, start timer, show welcome
  const handleOnboardingComplete = useCallback((presetId: string) => {
    applyPreset(presetId);
    completeOnboarding();
    // Start the timer after a brief moment for the fade-out to feel complete
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('particle:start-timer'));
      // Show welcome message after timer starts
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('particle:show-welcome'));
      }, 500);
    }, 100);
  }, [applyPreset, completeOnboarding]);

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
        setLearnInitialView(undefined); // Reset to menu for G+L navigation
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

  // Listen for replay intro event (from Command Palette)
  useEffect(() => {
    function handleReplayIntro() {
      replayIntro();
    }

    window.addEventListener('particle:replay-intro', handleReplayIntro);
    return () => window.removeEventListener('particle:replay-intro', handleReplayIntro);
  }, [replayIntro]);

  // Listen for show inspiration event (from Command Palette)
  useEffect(() => {
    function handleShowInspiration() {
      showInspiration();
    }

    window.addEventListener('particle:show-inspiration', handleShowInspiration);
    return () => window.removeEventListener('particle:show-inspiration', handleShowInspiration);
  }, [showInspiration]);

  // Listen for learn open event (from Command Palette)
  useEffect(() => {
    function handleOpenLearn(e: Event) {
      const customEvent = e as CustomEvent<{ section?: string }>;
      const section = customEvent.detail?.section;
      if (section) {
        setLearnInitialView(section as LearnView);
      }
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
        if (showLearn) {
          handleLearnClose();
        } else {
          setLearnInitialView(undefined); // Reset to menu for L key
          setShowLearn(true);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLearn, handleLearnClose]);

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

  // First-time intro: show fullscreen (no timer in background)
  // This only happens once, on the very first app open
  if (showIntro && isOriginalIntro) {
    return (
      <IntroExperience
        phase={introPhase}
        intention={currentIntention}
        onSkip={skipIntro}
        onComplete={markIntroComplete}
      />
    );
  }

  // Show black screen until we know whether to show intro
  if (!introReady) {
    return <div className="min-h-screen bg-black" />;
  }

  // Daily intention / Show Inspiration: rendered as overlay below (timer continues)

  // Entrance animation variants - soft, gentle reveal
  const entranceVariants = {
    hidden: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.96,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0.3 : 2,
        ease: [0.25, 0.1, 0.25, 1], // ease-out (smooth, gentle)
      },
    },
  };

  return (
    <motion.main
      key={entranceKey}
      id="main-timer"
      tabIndex={-1}
      className="relative min-h-screen flex flex-col items-center justify-center p-4 safe-area-inset-top safe-area-inset-bottom focus:outline-none"
      initial="hidden"
      animate="visible"
      variants={entranceVariants}
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

      <Timer
        onTimelineOpen={() => setShowTimeline(true)}
        onBeforeStart={handleBeforeStart}
      />

      {/* Bottom-left: Command Palette + Keyboard Shortcuts */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1">
        <CommandButton onOpenCommands={openCommandPalette} />
        <ShortcutsHelp />
      </div>

      {/* Bottom-right: Learn + Night Mode + Settings */}
      <div className="absolute bottom-4 right-4">
        <BottomRightControls
          onOpenLearn={() => {
            setLearnInitialView(undefined);
            setShowLearn(true);
          }}
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
              onClick={handleLearnClose}
            />
            <LearnPanel
              onClose={handleLearnClose}
              currentPresetId={activePresetId}
              onPresetChange={applyPreset}
              initialView={learnInitialView}
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

      {/* First-run rhythm onboarding - appears on first start attempt */}
      <AnimatePresence>
        {isOnboardingVisible && (
          <RhythmOnboarding onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {/* Daily Intention / Show Inspiration overlay - timer continues in background */}
      <AnimatePresence>
        {showIntro && !isOriginalIntro && (
          <IntroExperience
            phase={introPhase}
            intention={currentIntention}
            onSkip={skipIntro}
            onComplete={markIntroComplete}
          />
        )}
      </AnimatePresence>

    </motion.main>
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
