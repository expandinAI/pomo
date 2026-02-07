/**
 * Sync Events
 *
 * Event-based communication between data contexts and sync service.
 * Uses CustomEvents for decoupled sync triggering.
 */

import type { DBSession, DBProject, DBIntention } from '@/lib/db/types';

// Event names
export const SYNC_EVENTS = {
  SESSION_ADDED: 'particle:sync:session-added',
  SESSION_UPDATED: 'particle:sync:session-updated',
  SESSION_DELETED: 'particle:sync:session-deleted',
  PROJECT_ADDED: 'particle:sync:project-added',
  PROJECT_UPDATED: 'particle:sync:project-updated',
  PROJECT_DELETED: 'particle:sync:project-deleted',
  INTENTION_ADDED: 'particle:sync:intention-added',
  INTENTION_UPDATED: 'particle:sync:intention-updated',
  INTENTION_DELETED: 'particle:sync:intention-deleted',
  PULL_COMPLETED: 'particle:sync:pull-completed',
} as const;

// Event detail types
export interface SessionAddedEvent {
  session: DBSession;
}

export interface SessionUpdatedEvent {
  session: DBSession;
}

export interface SessionDeletedEvent {
  sessionId: string;
}

export interface ProjectAddedEvent {
  project: DBProject;
}

export interface ProjectUpdatedEvent {
  project: DBProject;
}

export interface ProjectDeletedEvent {
  projectId: string;
}

/**
 * Dispatch session added event
 */
export function dispatchSessionAdded(session: DBSession): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<SessionAddedEvent>(SYNC_EVENTS.SESSION_ADDED, {
      detail: { session },
    })
  );
}

/**
 * Dispatch session updated event
 */
export function dispatchSessionUpdated(session: DBSession): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<SessionUpdatedEvent>(SYNC_EVENTS.SESSION_UPDATED, {
      detail: { session },
    })
  );
}

/**
 * Dispatch session deleted event
 */
export function dispatchSessionDeleted(sessionId: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<SessionDeletedEvent>(SYNC_EVENTS.SESSION_DELETED, {
      detail: { sessionId },
    })
  );
}

/**
 * Dispatch project added event
 */
export function dispatchProjectAdded(project: DBProject): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<ProjectAddedEvent>(SYNC_EVENTS.PROJECT_ADDED, {
      detail: { project },
    })
  );
}

/**
 * Dispatch project updated event
 */
export function dispatchProjectUpdated(project: DBProject): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<ProjectUpdatedEvent>(SYNC_EVENTS.PROJECT_UPDATED, {
      detail: { project },
    })
  );
}

/**
 * Dispatch project deleted event
 */
export function dispatchProjectDeleted(projectId: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<ProjectDeletedEvent>(SYNC_EVENTS.PROJECT_DELETED, {
      detail: { projectId },
    })
  );
}

// Intention event detail types
export interface IntentionAddedEvent {
  intention: DBIntention;
}

export interface IntentionUpdatedEvent {
  intention: DBIntention;
}

export interface IntentionDeletedEvent {
  intentionId: string;
}

/**
 * Dispatch intention added event
 */
export function dispatchIntentionAdded(intention: DBIntention): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<IntentionAddedEvent>(SYNC_EVENTS.INTENTION_ADDED, {
      detail: { intention },
    })
  );
}

/**
 * Dispatch intention updated event
 */
export function dispatchIntentionUpdated(intention: DBIntention): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<IntentionUpdatedEvent>(SYNC_EVENTS.INTENTION_UPDATED, {
      detail: { intention },
    })
  );
}

/**
 * Dispatch intention deleted event
 */
export function dispatchIntentionDeleted(intentionId: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<IntentionDeletedEvent>(SYNC_EVENTS.INTENTION_DELETED, {
      detail: { intentionId },
    })
  );
}

/**
 * Dispatch pull completed event (triggers data refresh)
 */
export function dispatchPullCompleted(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SYNC_EVENTS.PULL_COMPLETED));
}
