// src/lib/intentions/index.ts

// Types
export type {
  IntentionStatus,
  IntentionAlignment,
  DBIntention,
  DailyIntention,
  CreateIntentionInput,
  UpdateIntentionInput,
} from './types';

// Storage operations
export {
  // Utilities
  getTodayDateString,
  // CRUD
  saveIntention,
  getIntentionById,
  updateIntention,
  deleteIntention,
  hardDeleteIntention,
  // Queries
  getIntentionForDate,
  getTodayIntention,
  getIntentionsForWeek,
  loadIntentions,
  getIntentionsByStatus,
  getActiveIntentions,
  getPendingSyncIntentions,
  clearAllIntentions,
} from './storage';

// Particle color utilities
export {
  getParticleColorClass,
  getParticleHexColor,
  isReactiveParticle,
  getParticleLightModeClass,
  getParticleClasses,
} from './utils';
