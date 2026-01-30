'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import {
  type MilestoneDefinition,
  type EarnedMilestone,
  type MilestoneStats,
  loadMilestones,
  saveMilestone,
  getEarnedMilestoneIds,
  checkForNewMilestone,
  getAllEarnedMilestones,
  calculateMilestoneEarnedDate,
  buildMilestoneStats,
} from '@/lib/milestones';
import { useSessionStore } from '@/contexts/SessionContext';
import type { CompletedSession } from '@/lib/session-storage';
import { MilestoneMoment } from './MilestoneMoment';
import { MilestoneJourney } from './MilestoneJourney';

interface MilestoneContextValue {
  /** List of earned milestones */
  earnedMilestones: EarnedMilestone[];
  /** Milestone waiting to be shown (pending acknowledgment) */
  pendingMilestone: MilestoneDefinition | null;
  /** Check for new milestones after a session */
  checkForMilestones: (options?: {
    lastSessionDurationSeconds?: number;
    isFirstProject?: boolean;
  }) => MilestoneDefinition | undefined;
  /** Acknowledge and dismiss the pending milestone */
  acknowledgeMilestone: () => void;
  /** Relive a previously earned milestone */
  relive: (milestoneId: string) => void;
  /** Whether the journey modal is showing */
  showJourney: boolean;
  /** Open/close the journey modal */
  setShowJourney: (show: boolean) => void;
  /** Refresh earned milestones from storage */
  refreshMilestones: () => void;
}

const MilestoneContext = createContext<MilestoneContextValue | null>(null);

interface MilestoneProviderProps {
  children: ReactNode;
}

/**
 * MilestoneProvider
 *
 * Provides milestone state and management to the app.
 * Renders the MilestoneMoment and MilestoneJourney modals.
 */
export function MilestoneProvider({ children }: MilestoneProviderProps) {
  // Get sessions from SessionContext
  const { sessions } = useSessionStore();

  // Earned milestones from storage
  const [earnedMilestones, setEarnedMilestones] = useState<EarnedMilestone[]>(() =>
    loadMilestones()
  );

  // Pending milestone to show
  const [pendingMilestone, setPendingMilestone] = useState<MilestoneDefinition | null>(
    null
  );

  // Milestone being relived
  const [relivingMilestone, setRelivingMilestone] = useState<MilestoneDefinition | null>(
    null
  );

  // Journey modal state
  const [showJourney, setShowJourney] = useState(false);

  // Track if startup check has been done
  const [startupCheckDone, setStartupCheckDone] = useState(false);

  // Startup check: catch up on any missed milestones
  useEffect(() => {
    if (startupCheckDone) return;

    // Build current stats using sessions from context
    const stats = buildMilestoneStats({}, sessions as CompletedSession[]);
    const earnedIds = getEarnedMilestoneIds();

    // Get all milestones that should be earned but aren't
    const missedMilestones = getAllEarnedMilestones(stats, earnedIds);

    if (missedMilestones.length > 0) {
      // Save all missed milestones with historically accurate dates
      for (const milestone of missedMilestones) {
        const earnedAt = calculateMilestoneEarnedDate(
          milestone.id,
          milestone.threshold,
          milestone.category,
          sessions as CompletedSession[]
        );
        saveMilestone(milestone.id, stats.totalParticles, stats.totalHours, earnedAt);
      }

      // Refresh the list
      setEarnedMilestones(loadMilestones());

      // Show the highest/most significant milestone as celebration
      // (last one in the list, which is the highest threshold)
      const highestMilestone = missedMilestones[missedMilestones.length - 1];
      setPendingMilestone(highestMilestone);
    }

    setStartupCheckDone(true);
  }, [startupCheckDone, sessions]);

  // Refresh milestones from storage
  const refreshMilestones = useCallback(() => {
    const earned = loadMilestones();
    setEarnedMilestones(earned);
  }, []);

  // Check for new milestones
  const checkForMilestones = useCallback(
    (options?: {
      lastSessionDurationSeconds?: number;
      isFirstProject?: boolean;
    }): MilestoneDefinition | undefined => {
      const earnedIds = getEarnedMilestoneIds();
      const stats: MilestoneStats = buildMilestoneStats(
        {
          lastSessionDurationSeconds: options?.lastSessionDurationSeconds,
          isFirstProject: options?.isFirstProject,
        },
        sessions as CompletedSession[]
      );

      const newMilestone = checkForNewMilestone(stats, earnedIds);

      if (newMilestone) {
        // Save the milestone
        saveMilestone(newMilestone.id, stats.totalParticles, stats.totalHours);

        // Update local state
        refreshMilestones();

        // Set as pending to trigger the moment
        setPendingMilestone(newMilestone);

        return newMilestone;
      }

      return undefined;
    },
    [refreshMilestones, sessions]
  );

  // Acknowledge pending milestone
  const acknowledgeMilestone = useCallback(() => {
    setPendingMilestone(null);
  }, []);

  // Relive a milestone
  const relive = useCallback(
    (milestoneId: string) => {
      const earned = earnedMilestones.find((m) => m.id === milestoneId);
      if (!earned) return;

      // Import milestone definition dynamically to avoid circular deps
      import('@/lib/milestones').then(({ getMilestoneById }) => {
        const milestone = getMilestoneById(milestoneId);
        if (milestone) {
          // Close journey first
          setShowJourney(false);
          // Then show moment
          setTimeout(() => {
            setRelivingMilestone(milestone);
          }, 200);
        }
      });
    },
    [earnedMilestones]
  );

  // Dismiss reliving milestone
  const handleDismissRelive = useCallback(() => {
    setRelivingMilestone(null);
    // Reopen journey after dismissing
    setTimeout(() => {
      setShowJourney(true);
    }, 100);
  }, []);

  // Handle relive from journey
  const handleReliveFromJourney = useCallback(
    (milestone: MilestoneDefinition) => {
      relive(milestone.id);
    },
    [relive]
  );

  const value = useMemo(
    (): MilestoneContextValue => ({
      earnedMilestones,
      pendingMilestone,
      checkForMilestones,
      acknowledgeMilestone,
      relive,
      showJourney,
      setShowJourney,
      refreshMilestones,
    }),
    [
      earnedMilestones,
      pendingMilestone,
      checkForMilestones,
      acknowledgeMilestone,
      relive,
      showJourney,
      refreshMilestones,
    ]
  );

  return (
    <MilestoneContext.Provider value={value}>
      {children}

      {/* Pending milestone moment (new milestone earned) */}
      <MilestoneMoment
        milestone={pendingMilestone}
        isOpen={pendingMilestone !== null}
        onDismiss={acknowledgeMilestone}
        isRelive={false}
      />

      {/* Reliving milestone moment */}
      <MilestoneMoment
        milestone={relivingMilestone}
        isOpen={relivingMilestone !== null}
        onDismiss={handleDismissRelive}
        isRelive={true}
      />

      {/* Journey modal */}
      <MilestoneJourney
        isOpen={showJourney}
        onClose={() => setShowJourney(false)}
        onRelive={handleReliveFromJourney}
        onRefresh={refreshMilestones}
      />
    </MilestoneContext.Provider>
  );
}

/**
 * Hook to use milestone context
 */
export function useMilestones(): MilestoneContextValue {
  const context = useContext(MilestoneContext);
  if (!context) {
    throw new Error('useMilestones must be used within a MilestoneProvider');
  }
  return context;
}
