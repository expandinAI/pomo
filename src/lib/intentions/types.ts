// src/lib/intentions/types.ts

/**
 * Re-export types from db/types for convenience
 * These are the canonical types - this file provides domain-specific aliases
 */
export type { IntentionStatus, IntentionAlignment, DBIntention } from '@/lib/db/types';

/**
 * DailyIntention is an alias for DBIntention
 * Used in application code for clarity
 */
export type { DBIntention as DailyIntention } from '@/lib/db/types';

/**
 * Input for creating a new intention
 */
export interface CreateIntentionInput {
  text: string;
  date: string; // "2026-02-04" (ISO date only)
  projectId?: string;
  deferredFrom?: string;
}

/**
 * Input for updating an existing intention
 */
export interface UpdateIntentionInput {
  text?: string;
  projectId?: string | null;
  status?: 'active' | 'completed' | 'partial' | 'deferred' | 'skipped';
  completedAt?: number;
  deferredFrom?: string;
}
