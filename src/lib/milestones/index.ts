/**
 * Milestones Library
 *
 * Core logic for milestone definitions, storage, detection, and sound.
 */

// Types and definitions
export type { MilestoneCategory, MilestoneDefinition } from './milestones';
export {
  MILESTONES,
  getMilestoneById,
  getCountMilestones,
  getTimeMilestones,
  getStreakMilestones,
  getSpecialMilestones,
} from './milestones';

// Storage
export type { EarnedMilestone, MilestoneStore } from './milestone-storage';
export {
  loadMilestones,
  saveMilestone,
  hasMilestone,
  getEarnedMilestone,
  getEarnedMilestoneIds,
  clearMilestones,
  unlockAllMilestones,
  formatEarnedDate,
} from './milestone-storage';

// Checker
export type { MilestoneStats } from './milestone-checker';
export {
  buildMilestoneStats,
  checkForNewMilestone,
  getAllEarnedMilestones,
  calculateMilestoneEarnedDate,
} from './milestone-checker';

// Sound
export { playMilestoneGong, isAudioSupported } from './milestone-sound';
