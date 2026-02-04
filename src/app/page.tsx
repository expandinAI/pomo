'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from '@/components/timer/Timer';
import { ParticleMenu } from '@/components/ui/ParticleMenu';
import { CommandButton, LibraryButton } from '@/components/ui/CornerControls';
import { CoachParticle } from '@/components/coach';
import { useTimerSettingsContext } from '@/contexts/TimerSettingsContext';
import { useCommandPalette } from '@/contexts/CommandPaletteContext';
import { useGPrefixNavigation } from '@/hooks/useGPrefixNavigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useUpgradeFlow } from '@/hooks/useUpgradeFlow';
import { useFlowCelebration } from '@/hooks/useFlowCelebration';
import { useIntro, usePrefersReducedMotion } from '@/hooks/useIntro';
import { useEasterEggs } from '@/hooks/useEasterEgg';
import { TimelineOverlay } from '@/components/timeline';
import { MilestoneProvider, useMilestones } from '@/components/milestones';
import { isIndexedDBAvailable, hasPendingMigrations, runMigrations } from '@/lib/db';
import { useParticleAuth } from '@/lib/auth/hooks';
import { AccountMenu } from '@/components/auth';
import type { LearnView } from '@/components/learn/LearnMenu';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/contexts/SessionContext';
import { exportCurrentWeekAsCSV } from '@/lib/export-utils';

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
const UpgradeModal = dynamic(
  () => import('@/components/upgrade').then(mod => ({ default: mod.UpgradeModal })),
  { ssr: false }
);
const TrialStartModal = dynamic(
  () => import('@/components/trial').then(mod => ({ default: mod.TrialStartModal })),
  { ssr: false }
);
const PricingModal = dynamic(
  () => import('@/components/pricing').then(mod => ({ default: mod.PricingModal })),
  { ssr: false }
);
const FlowCelebration = dynamic(
  () => import('@/components/celebration').then(mod => ({ default: mod.FlowCelebration })),
  { ssr: false }
);
const CoachView = dynamic(
  () => import('@/components/coach').then(mod => ({ default: mod.CoachView })),
  { ssr: false }
);
const HallOfFameModal = dynamic(
  () => import('@/components/hall-of-fame').then(mod => ({ default: mod.HallOfFameModal })),
  { ssr: false }
);
// IntroExperience is NOT lazy-loaded - must be ready immediately on first visit
import { IntroExperience } from '@/components/intro';
import { TrialExpiredBanner } from '@/components/trial';
import { useTrialExpirationCheck, useTrial } from '@/lib/trial';

/**
 * Inner component that uses milestone context
 */
function HomeContent() {
  // Router for navigation
  const router = useRouter();

  // Session data for export
  const { sessions } = useSessionStore();

  // Auth state
  const auth = useParticleAuth();

  // Trial management
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const trial = useTrial();
  useTrialExpirationCheck(); // Check and expire trials on load

  // Upgrade flow (Local → Cloud sync after sign-up)
  const {
    showUpgradeModal,
    upgradeUserId,
    completeUpgrade,
    skipUpgrade,
    triggerUpgrade,
  } = useUpgradeFlow();

  // Flow celebration (after successful Stripe checkout)
  const { showCelebration, dismiss: dismissCelebration } = useFlowCelebration();

  // Timeline overlay state
  const [showTimeline, setShowTimeline] = useState(false);

  // Rhythm view state
  const [showRhythm, setShowRhythm] = useState(false);

  // Learn panel state
  const [showLearn, setShowLearn] = useState(false);
  const [learnInitialView, setLearnInitialView] = useState<LearnView | undefined>();

  // Account panel state (opened via ParticleMenu)
  const [showAccountPanel, setShowAccountPanel] = useState(false);

  // AI Coach state
  const [showCoach, setShowCoach] = useState(false);
  const [hasCoachInsight, setHasCoachInsight] = useState(false);

  // Hall of Fame state
  const [showHallOfFame, setShowHallOfFame] = useState(false);

  // Export message state (for G+E quick export)
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Reset initialView when panel closes
  const handleLearnClose = useCallback(() => {
    setShowLearn(false);
    setLearnInitialView(undefined);
  }, []);

  // Night mode, presets, and command palette
  const { appearanceMode, setAppearanceMode, isDarkMode, activePresetId, applyPreset } = useTimerSettingsContext();
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
      onCoach: () => {
        setShowCoach(true);
      },
      onExport: () => {
        const { success, weekNumber, totalHours } = exportCurrentWeekAsCSV(sessions);
        if (success) {
          setExportMessage(`Exported · Week ${weekNumber} · ${totalHours}h`);
        } else {
          setExportMessage('No particles this week');
        }
      },
      onHallOfFame: () => setShowHallOfFame(true),
    }),
    [setShowJourney, sessions]
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

  // Listen for hall of fame open event (from Command Palette G F)
  useEffect(() => {
    function handleOpenHallOfFame() {
      setShowHallOfFame(true);
    }

    window.addEventListener('particle:open-hall-of-fame', handleOpenHallOfFame);
    return () => window.removeEventListener('particle:open-hall-of-fame', handleOpenHallOfFame);
  }, []);

  // Listen for coach open event (from Command Palette)
  useEffect(() => {
    function handleOpenCoach() {
      setShowCoach(true);
      setHasCoachInsight(false);
    }

    window.addEventListener('particle:open-coach', handleOpenCoach);
    return () => window.removeEventListener('particle:open-coach', handleOpenCoach);
  }, []);

  // Auto-clear export message after 2 seconds
  useEffect(() => {
    if (exportMessage) {
      const timeout = setTimeout(() => setExportMessage(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [exportMessage]);

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

  // Listen for auth open event (from tier system / UpgradePrompt)
  useEffect(() => {
    function handleOpenAuth() {
      router.push('/sign-up');
    }

    window.addEventListener('particle:open-auth', handleOpenAuth);
    return () => window.removeEventListener('particle:open-auth', handleOpenAuth);
  }, [router]);

  // Listen for upgrade event (from FeatureGate / UpgradePrompt)
  // Opens trial modal if user can start trial, otherwise pricing modal
  useEffect(() => {
    function handleOpenUpgrade() {
      if (auth.status === 'authenticated') {
        // If user hasn't used trial yet, show trial modal
        // Otherwise show pricing modal for direct purchase
        if (!trial.hasUsed) {
          setShowTrialModal(true);
        } else {
          setShowPricingModal(true);
        }
      }
    }

    window.addEventListener('particle:open-upgrade', handleOpenUpgrade);
    return () => window.removeEventListener('particle:open-upgrade', handleOpenUpgrade);
  }, [auth.status, trial.hasUsed]);

  // Listen for trigger sync event (from AccountMenu)
  useEffect(() => {
    function handleTriggerSync() {
      triggerUpgrade();
    }

    window.addEventListener('particle:trigger-sync', handleTriggerSync);
    return () => window.removeEventListener('particle:trigger-sync', handleTriggerSync);
  }, [triggerUpgrade]);

  // Listen for insight ready event (from useCoach hook)
  // When an insight is ready, the CoachParticle starts glowing
  useEffect(() => {
    function handleInsightReady() {
      setHasCoachInsight(true);
    }

    window.addEventListener('particle:insight-ready', handleInsightReady);
    return () => window.removeEventListener('particle:insight-ready', handleInsightReady);
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
      {/* Particle Menu (top-right) - single entry point for all navigation */}
      <div className="absolute top-4 right-4">
        <ParticleMenu
          isGPressed={isGPressed}
          authStatus={auth.status}
          planType={auth.status === 'authenticated' ? auth.tier : undefined}
          trialDaysRemaining={trial.isActive ? trial.daysRemaining : null}
          onOpenTimeline={() => setShowTimeline(true)}
          onOpenRhythm={() => setShowRhythm(true)}
          onOpenProjects={() => window.dispatchEvent(new CustomEvent('particle:open-projects'))}
          onOpenGoals={() => window.dispatchEvent(new CustomEvent('particle:open-goals'))}
          onOpenStats={() => window.dispatchEvent(new CustomEvent('particle:open-dashboard'))}
          onOpenHistory={() => window.dispatchEvent(new CustomEvent('particle:open-history'))}
          onOpenYear={() => window.dispatchEvent(new CustomEvent('particle:open-year'))}
          onOpenMilestones={() => setShowJourney(true)}
          onOpenHallOfFame={() => setShowHallOfFame(true)}
          onOpenLearn={() => { setLearnInitialView(undefined); setShowLearn(true); }}
          onOpenAccount={() => setShowAccountPanel(true)}
          onOpenCoach={() => { setShowCoach(true); setHasCoachInsight(false); }}
        />
      </div>

      {/* Account Panel (opened via ParticleMenu for authenticated users) */}
      {auth.status === 'authenticated' && (
        <AccountMenu
          isOpen={showAccountPanel}
          onClose={() => setShowAccountPanel(false)}
          appearanceMode={appearanceMode}
          onAppearanceModeChange={setAppearanceMode}
        />
      )}

      {/* TimerSettings modal - hidden trigger, responds to events */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <TimerSettings />
      </div>

      {/* Statistics Dashboard (opened via RadialMenu or G+S) */}
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
        exportMessage={exportMessage}
      />

      {/* Bottom-left: Command Palette + Keyboard Shortcuts (hidden on mobile) */}
      <div className="hidden sm:flex absolute bottom-4 left-4 items-center gap-1">
        <CommandButton onOpenCommands={openCommandPalette} />
        <ShortcutsHelp />
      </div>

      {/* Bottom-right: Coach (always visible) + Library (desktop only) */}
      <div className="flex absolute bottom-4 right-4 items-center gap-3">
        <CoachParticle
          onOpenCoach={() => {
            setShowCoach(true);
            setHasCoachInsight(false);
          }}
          hasInsight={hasCoachInsight}
        />
        {/* Library only on desktop */}
        <div className="hidden sm:block">
          <LibraryButton
            onOpenLibrary={() => {
              setLearnInitialView(undefined);
              setShowLearn(true);
            }}
          />
        </div>
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

      {/* Upgrade Modal - shown after sign-up if there's local data to sync */}
      <AnimatePresence>
        {showUpgradeModal && upgradeUserId && (
          <UpgradeModal
            isOpen={showUpgradeModal}
            userId={upgradeUserId}
            onComplete={completeUpgrade}
            onSkip={skipUpgrade}
          />
        )}
      </AnimatePresence>

      {/* Trial Start Modal - shown when user wants to try Flow */}
      <TrialStartModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
      />

      {/* Pricing Modal - shown when trial already used */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />

      {/* Trial Expired Banner - shown when trial just expired */}
      <TrialExpiredBanner />

      {/* Flow Celebration - shown after successful Stripe checkout */}
      <FlowCelebration isOpen={showCelebration} onDismiss={dismissCelebration} />

      {/* AI Coach View */}
      <CoachView isOpen={showCoach} onClose={() => setShowCoach(false)} />

      {/* Hall of Fame Modal */}
      <HallOfFameModal
        isOpen={showHallOfFame}
        onClose={() => setShowHallOfFame(false)}
      />

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
