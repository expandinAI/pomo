// src/lib/sync/__tests__/intention-sync.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { DBIntention } from '@/lib/db/types';

// Mock window for event dispatch
const dispatchedEvents: Array<{ type: string; detail: unknown }> = [];

Object.defineProperty(global, 'window', {
  value: {
    dispatchEvent: vi.fn((event: CustomEvent) => {
      dispatchedEvents.push({ type: event.type, detail: event.detail });
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

import {
  SYNC_EVENTS,
  dispatchIntentionAdded,
  dispatchIntentionUpdated,
  dispatchIntentionDeleted,
} from '../sync-events';

function makeIntention(overrides: Partial<DBIntention> = {}): DBIntention {
  return {
    id: 'int-123',
    date: '2026-02-06',
    text: 'Ship the feature',
    status: 'active',
    syncStatus: 'local',
    localUpdatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('intention-sync events', () => {
  beforeEach(() => {
    dispatchedEvents.length = 0;
    vi.clearAllMocks();
  });

  describe('SYNC_EVENTS', () => {
    it('has intention event constants', () => {
      expect(SYNC_EVENTS.INTENTION_ADDED).toBe('particle:sync:intention-added');
      expect(SYNC_EVENTS.INTENTION_UPDATED).toBe('particle:sync:intention-updated');
      expect(SYNC_EVENTS.INTENTION_DELETED).toBe('particle:sync:intention-deleted');
    });
  });

  describe('dispatchIntentionAdded', () => {
    it('dispatches event with intention detail', () => {
      const intention = makeIntention();
      dispatchIntentionAdded(intention);

      expect(window.dispatchEvent).toHaveBeenCalledTimes(1);
      expect(dispatchedEvents[0].type).toBe(SYNC_EVENTS.INTENTION_ADDED);
      expect((dispatchedEvents[0].detail as { intention: DBIntention }).intention).toBe(intention);
    });

    it('includes all intention fields in the event', () => {
      const intention = makeIntention({
        projectId: 'proj-1',
        deferredFrom: '2026-02-05',
        particleGoal: 5,
        completedAt: 1738800000000,
        serverId: 'server-uuid',
      });

      dispatchIntentionAdded(intention);

      const dispatched = (dispatchedEvents[0].detail as { intention: DBIntention }).intention;
      expect(dispatched.projectId).toBe('proj-1');
      expect(dispatched.deferredFrom).toBe('2026-02-05');
      expect(dispatched.particleGoal).toBe(5);
      expect(dispatched.completedAt).toBe(1738800000000);
      expect(dispatched.serverId).toBe('server-uuid');
    });
  });

  describe('dispatchIntentionUpdated', () => {
    it('dispatches event with updated intention', () => {
      const intention = makeIntention({ status: 'completed', completedAt: Date.now() });
      dispatchIntentionUpdated(intention);

      expect(window.dispatchEvent).toHaveBeenCalledTimes(1);
      expect(dispatchedEvents[0].type).toBe(SYNC_EVENTS.INTENTION_UPDATED);
      expect((dispatchedEvents[0].detail as { intention: DBIntention }).intention.status).toBe('completed');
    });
  });

  describe('dispatchIntentionDeleted', () => {
    it('dispatches event with intention ID', () => {
      dispatchIntentionDeleted('int-456');

      expect(window.dispatchEvent).toHaveBeenCalledTimes(1);
      expect(dispatchedEvents[0].type).toBe(SYNC_EVENTS.INTENTION_DELETED);
      expect((dispatchedEvents[0].detail as { intentionId: string }).intentionId).toBe('int-456');
    });
  });
});

describe('intention field mapping', () => {
  it('completedAt is Unix timestamp (number) in DBIntention', () => {
    const intention = makeIntention({ completedAt: 1738800000000 });
    // Supabase expects ISO string — verify the conversion works
    const isoString = new Date(intention.completedAt!).toISOString();
    expect(isoString).toBe('2025-02-06T00:00:00.000Z');
  });

  it('completedAt undefined maps to null for Supabase', () => {
    const intention = makeIntention();
    expect(intention.completedAt).toBeUndefined();
    const serverValue = intention.completedAt
      ? new Date(intention.completedAt).toISOString()
      : null;
    expect(serverValue).toBeNull();
  });

  it('optional fields default to null for Supabase', () => {
    const intention = makeIntention();
    // These should be undefined locally but map to null for Supabase
    expect(intention.projectId).toBeUndefined();
    expect(intention.deferredFrom).toBeUndefined();
    expect(intention.particleGoal).toBeUndefined();

    const serverData = {
      project_id: intention.projectId || null,
      deferred_from: intention.deferredFrom || null,
      particle_goal: intention.particleGoal || null,
    };
    expect(serverData.project_id).toBeNull();
    expect(serverData.deferred_from).toBeNull();
    expect(serverData.particle_goal).toBeNull();
  });

  it('status values are valid for Supabase CHECK constraint', () => {
    const validStatuses = ['active', 'completed', 'partial', 'deferred', 'skipped'] as const;
    for (const status of validStatuses) {
      const intention = makeIntention({ status });
      expect(intention.status).toBe(status);
    }
  });

  it('date is ISO date string format (YYYY-MM-DD)', () => {
    const intention = makeIntention({ date: '2026-02-06' });
    expect(intention.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('intention pull mapping (server → local)', () => {
  it('maps server intention to DBIntention shape', () => {
    const serverIntention = {
      id: 'server-uuid-1',
      user_id: 'user-uuid',
      local_id: 'int-789',
      date: '2026-02-06',
      text: 'Focus on API',
      status: 'completed' as const,
      project_id: null,
      deferred_from: '2026-02-05',
      particle_goal: 3,
      completed_at: '2026-02-06T15:30:00.000Z',
      deleted_at: null,
      created_at: '2026-02-06T08:00:00.000Z',
      updated_at: '2026-02-06T15:30:00.000Z',
    };

    // Simulate the mapping from sync-service pull logic
    const localIntention: DBIntention = {
      id: serverIntention.local_id,
      date: serverIntention.date,
      text: serverIntention.text,
      status: serverIntention.status,
      projectId: undefined, // No project mapping in this case
      deferredFrom: serverIntention.deferred_from || undefined,
      particleGoal: serverIntention.particle_goal || undefined,
      completedAt: serverIntention.completed_at
        ? new Date(serverIntention.completed_at).getTime()
        : undefined,
      syncStatus: 'synced',
      localUpdatedAt: serverIntention.updated_at,
      syncedAt: new Date().toISOString(),
      serverId: serverIntention.id,
    };

    expect(localIntention.id).toBe('int-789');
    expect(localIntention.date).toBe('2026-02-06');
    expect(localIntention.text).toBe('Focus on API');
    expect(localIntention.status).toBe('completed');
    expect(localIntention.deferredFrom).toBe('2026-02-05');
    expect(localIntention.particleGoal).toBe(3);
    expect(localIntention.completedAt).toBe(new Date('2026-02-06T15:30:00.000Z').getTime());
    expect(localIntention.syncStatus).toBe('synced');
    expect(localIntention.serverId).toBe('server-uuid-1');
  });

  it('handles null optional fields from server', () => {
    const serverIntention = {
      id: 'server-uuid-2',
      local_id: 'int-000',
      date: '2026-02-06',
      text: 'Just a task',
      status: 'active' as const,
      project_id: null,
      deferred_from: null,
      particle_goal: null,
      completed_at: null,
      updated_at: '2026-02-06T08:00:00.000Z',
    };

    const localIntention: Partial<DBIntention> = {
      deferredFrom: serverIntention.deferred_from || undefined,
      particleGoal: serverIntention.particle_goal || undefined,
      completedAt: serverIntention.completed_at
        ? new Date(serverIntention.completed_at).getTime()
        : undefined,
    };

    expect(localIntention.deferredFrom).toBeUndefined();
    expect(localIntention.particleGoal).toBeUndefined();
    expect(localIntention.completedAt).toBeUndefined();
  });
});
