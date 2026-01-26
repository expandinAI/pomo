/**
 * Milestone Storage
 *
 * Persists earned milestones to localStorage.
 * Each milestone is stored once with the moment it was earned.
 */

const STORAGE_KEY = 'particle-milestones';

export interface EarnedMilestone {
  id: string;
  earnedAt: string; // ISO date string
  particleCount: number; // Total particles at time of earning
  totalHours: number; // Total hours at time of earning
}

export interface MilestoneStore {
  earned: EarnedMilestone[];
}

/**
 * Load all earned milestones from storage
 */
export function loadMilestones(): EarnedMilestone[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as MilestoneStore;
      if (parsed && Array.isArray(parsed.earned)) {
        return parsed.earned;
      }
    }
  } catch {
    // Ignore parsing errors
  }
  return [];
}

/**
 * Save a newly earned milestone
 * @param earnedAt - Optional ISO date string for historically accurate dates
 */
export function saveMilestone(
  milestoneId: string,
  particleCount: number,
  totalHours: number,
  earnedAt?: string
): EarnedMilestone {
  const milestone: EarnedMilestone = {
    id: milestoneId,
    earnedAt: earnedAt ?? new Date().toISOString(),
    particleCount,
    totalHours,
  };

  const earned = loadMilestones();

  // Don't save duplicates
  if (earned.some((m) => m.id === milestoneId)) {
    return milestone;
  }

  earned.push(milestone);

  const store: MilestoneStore = { earned };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

  return milestone;
}

/**
 * Check if a milestone has already been earned
 */
export function hasMilestone(milestoneId: string): boolean {
  const earned = loadMilestones();
  return earned.some((m) => m.id === milestoneId);
}

/**
 * Get a specific earned milestone by ID
 */
export function getEarnedMilestone(milestoneId: string): EarnedMilestone | undefined {
  const earned = loadMilestones();
  return earned.find((m) => m.id === milestoneId);
}

/**
 * Get earned milestone IDs as a Set for quick lookup
 */
export function getEarnedMilestoneIds(): Set<string> {
  const earned = loadMilestones();
  return new Set(earned.map((m) => m.id));
}

/**
 * Clear all milestones (for testing/reset)
 */
export function clearMilestones(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Unlock all milestones (for demo/testing)
 * Simulates earning all milestones with realistic dates spread over time
 */
export function unlockAllMilestones(milestoneIds: string[]): void {
  if (typeof window === 'undefined') return;

  const now = new Date();
  const earned: EarnedMilestone[] = milestoneIds.map((id, index) => {
    // Spread dates over the past year for realistic feel
    const daysAgo = Math.floor((milestoneIds.length - index) * 30); // ~30 days apart
    const earnedDate = new Date(now);
    earnedDate.setDate(earnedDate.getDate() - daysAgo);

    return {
      id,
      earnedAt: earnedDate.toISOString(),
      particleCount: (index + 1) * 100, // Simulated particle counts
      totalHours: (index + 1) * 10, // Simulated hours
    };
  });

  const store: MilestoneStore = { earned };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/**
 * Format the date an earned milestone was achieved
 */
export function formatEarnedDate(earnedAt: string): string {
  const date = new Date(earnedAt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const earnedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.floor((today.getTime() - earnedDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}
