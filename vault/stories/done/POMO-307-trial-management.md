---
type: story
status: done
priority: p1
effort: 3
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-31
done_date: 2026-01-31
tags: [feature, trial, monetization]
---

# POMO-307: Trial Management (14 Tage Flow)

## User Story

> Als **Particle-Nutzer**
> möchte ich **Particle Flow 14 Tage kostenlos testen**,
> damit **ich entscheiden kann, ob sich das Upgrade lohnt**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

**Vorgänger:** POMO-306 (Conflict Resolution)

Der Trial ist ein wichtiger Conversion-Hebel. Nutzer sollen Premium-Features erleben, ohne vorher zu zahlen. Keine Kreditkarte erforderlich.

**Trial-Regeln:**
- Nur für Particle-User (haben bereits Account)
- 14 Tage volle Flow-Features
- Einmalig pro Account
- Automatischer Downgrade zu Particle nach Ablauf

**Reihenfolge:** POMO-306 → **POMO-307** → POMO-308

## Akzeptanzkriterien

- [ ] **Given** Particle-Account ohne Trial, **When** Trial gestartet, **Then** werden 14 Tage Flow aktiviert
- [ ] **Given** Trial aktiv, **When** App geladen, **Then** zeigt Header "Trial: X Tage übrig"
- [ ] **Given** Trial endet in 3 Tagen, **When** App geladen, **Then** zeigt Reminder-Badge (orange)
- [ ] **Given** Trial abgelaufen, **When** App geladen, **Then** zeigt Upgrade-Modal

## Technische Details

### Dateistruktur

```
src/
├── lib/
│   └── trial/
│       ├── index.ts              # NEU: Exports
│       ├── trial-service.ts      # NEU: Trial-Logik
│       └── hooks.ts              # NEU: useTrial Hook
├── components/
│   └── trial/
│       ├── index.ts              # NEU: Exports
│       ├── TrialBadge.tsx        # NEU: Header-Badge
│       ├── TrialStartModal.tsx   # NEU: Trial starten
│       └── TrialEndModal.tsx     # NEU: Trial beendet
└── app/
    └── api/
        └── cron/
            └── check-trials/
                └── route.ts      # NEU: Cron für Trial-Ablauf
```

### Trial Service

```typescript
// src/lib/trial/trial-service.ts

import { createSupabaseClient } from '@/lib/supabase/client';

const TRIAL_DURATION_DAYS = 14;

export interface TrialStatus {
  isActive: boolean;
  hasUsed: boolean;
  daysRemaining: number;
  endsAt: string | null;
}

/**
 * Startet einen 14-Tage-Trial.
 * Wirft Fehler wenn Trial bereits genutzt wurde.
 */
export async function startTrial(
  supabase: ReturnType<typeof createSupabaseClient>,
  userId: string
): Promise<{ endsAt: string }> {
  // Prüfen ob bereits Trial genutzt
  const { data: user } = await supabase
    .from('users')
    .select('trial_started_at')
    .eq('id', userId)
    .single();

  if (user?.trial_started_at) {
    throw new Error('Trial bereits verwendet');
  }

  const now = new Date();
  const endsAt = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

  // Supabase Update
  const { error } = await supabase
    .from('users')
    .update({
      tier: 'flow',
      trial_started_at: now.toISOString(),
      trial_ends_at: endsAt.toISOString(),
      subscription_status: 'trialing',
    })
    .eq('id', userId);

  if (error) throw error;

  return { endsAt: endsAt.toISOString() };
}

/**
 * Berechnet verbleibende Trial-Tage.
 */
export function getTrialDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;

  const now = new Date();
  const ends = new Date(trialEndsAt);
  const diff = ends.getTime() - now.getTime();

  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

/**
 * Prüft ob Trial aktiv ist.
 */
export function isTrialActive(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt) > new Date();
}

/**
 * Prüft ob User Trial bereits genutzt hat.
 */
export function hasUsedTrial(trialStartedAt: string | null): boolean {
  return trialStartedAt !== null;
}
```

### Trial Hooks

```typescript
// src/lib/trial/hooks.ts

'use client';

import { useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  getTrialDaysRemaining,
  isTrialActive,
  hasUsedTrial,
  type TrialStatus,
} from './trial-service';

/**
 * Hook für Trial-Status.
 */
export function useTrial(): TrialStatus {
  const { user } = useUser();

  return useMemo(() => {
    if (!user) {
      return {
        isActive: false,
        hasUsed: false,
        daysRemaining: 0,
        endsAt: null,
      };
    }

    const trialEndsAt = user.publicMetadata?.trialEndsAt as string | null;
    const trialStartedAt = user.publicMetadata?.trialStartedAt as string | null;

    return {
      isActive: isTrialActive(trialEndsAt),
      hasUsed: hasUsedTrial(trialStartedAt),
      daysRemaining: getTrialDaysRemaining(trialEndsAt),
      endsAt: trialEndsAt,
    };
  }, [user]);
}

/**
 * Hook der prüft ob Trial bald endet (≤3 Tage).
 */
export function useTrialExpiringSoon(): boolean {
  const { isActive, daysRemaining } = useTrial();
  return isActive && daysRemaining <= 3;
}

/**
 * Hook der prüft ob Trial gerade abgelaufen ist.
 * (Für Trial-End-Modal)
 */
export function useTrialJustExpired(): boolean {
  const { user } = useUser();

  return useMemo(() => {
    if (!user) return false;

    const trialEndsAt = user.publicMetadata?.trialEndsAt as string | null;
    if (!trialEndsAt) return false;

    const ends = new Date(trialEndsAt);
    const now = new Date();

    // Trial in den letzten 24h abgelaufen
    const hoursSinceExpiry = (now.getTime() - ends.getTime()) / (1000 * 60 * 60);
    return hoursSinceExpiry > 0 && hoursSinceExpiry < 24;
  }, [user]);
}
```

### Trial Badge

```typescript
// src/components/trial/TrialBadge.tsx

'use client';

import { useTrial, useTrialExpiringSoon } from '@/lib/trial/hooks';

export function TrialBadge() {
  const { isActive, daysRemaining } = useTrial();
  const isExpiringSoon = useTrialExpiringSoon();

  if (!isActive) return null;

  return (
    <div
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
        ${isExpiringSoon
          ? 'bg-orange-500/20 text-orange-400'
          : 'bg-white/10 text-white'}
      `}
    >
      Trial: {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
    </div>
  );
}
```

### Trial Start Modal

```typescript
// src/components/trial/TrialStartModal.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles } from 'lucide-react';
import { startTrial } from '@/lib/trial/trial-service';
import { useSupabase } from '@/lib/supabase/client';
import { useAuth, useUser } from '@clerk/nextjs';

interface TrialStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStarted: () => void;
}

const FLOW_FEATURES = [
  'Jahresansicht',
  'Erweiterte Statistiken',
  'Alle Themes',
  'Unbegrenzte Presets',
  'Ambient Sounds',
];

export function TrialStartModal({ isOpen, onClose, onStarted }: TrialStartModalProps) {
  const supabase = useSupabase();
  const { userId } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStartTrial() {
    if (!supabase || !userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { endsAt } = await startTrial(supabase, userId);

      // Clerk Metadata aktualisieren (für Client-Cache)
      await user?.update({
        publicMetadata: {
          ...user.publicMetadata,
          tier: 'flow',
          trialEndsAt: endsAt,
          trialStartedAt: new Date().toISOString(),
        },
      });

      onStarted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Starten');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-surface border border-tertiary/20 rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-tertiary/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <h2 className="text-lg font-medium text-white">Particle Flow</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center
                           text-tertiary hover:text-secondary hover:bg-tertiary/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <p className="text-secondary mb-6">
                14 Tage kostenlos alle Premium-Features testen.
                Keine Kreditkarte erforderlich.
              </p>

              {/* Feature List */}
              <div className="space-y-3 mb-6">
                {FLOW_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleStartTrial}
                  disabled={isLoading}
                  className="w-full py-3 bg-white text-black rounded-xl font-medium
                             hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Activating...' : 'Start 14-Day Trial'}
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2 text-tertiary hover:text-secondary text-sm"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Trial End Modal

```typescript
// src/components/trial/TrialEndModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTrialJustExpired } from '@/lib/trial/hooks';

interface TrialEndModalProps {
  onUpgrade: () => void;
  onDismiss: () => void;
}

export function TrialEndModal({ onUpgrade, onDismiss }: TrialEndModalProps) {
  const justExpired = useTrialJustExpired();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage für "bereits gesehen"
  useEffect(() => {
    const dismissed = localStorage.getItem('particle_trial_end_dismissed');
    if (dismissed) setIsDismissed(true);
  }, []);

  function handleDismiss() {
    localStorage.setItem('particle_trial_end_dismissed', 'true');
    setIsDismissed(true);
    onDismiss();
  }

  const isOpen = justExpired && !isDismissed;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-surface border border-tertiary/20 rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-tertiary/10">
              <h2 className="text-lg font-medium text-white">Your trial has ended</h2>
              <button
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full flex items-center justify-center
                           text-tertiary hover:text-secondary hover:bg-tertiary/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <p className="text-secondary mb-6">
                Thanks for trying Particle Flow.
                To continue using all premium features, you can upgrade.
              </p>

              {/* TODO: Trial-Statistiken hier anzeigen */}
              {/* "In den letzten 14 Tagen hast du..." */}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={onUpgrade}
                  className="w-full py-3 bg-white text-black rounded-xl font-medium
                             hover:bg-zinc-200 transition-colors"
                >
                  Keep Particle Flow
                </button>

                <button
                  onClick={handleDismiss}
                  className="w-full py-2 text-tertiary hover:text-secondary text-sm"
                >
                  Continue with Particle
                </button>
              </div>

              <p className="text-tertiary text-xs text-center mt-4">
                Your data will be preserved. Cloud Sync continues to work.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Cron Job für Trial-Ablauf

```typescript
// src/app/api/cron/check-trials/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { clerkClient } from '@clerk/nextjs/server';

// Supabase Admin Client (mit Service Role Key)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find expired trials
    const { data: expiredUsers, error } = await supabase
      .from('users')
      .select('id, clerk_id')
      .eq('subscription_status', 'trialing')
      .lt('trial_ends_at', new Date().toISOString());

    if (error) throw error;

    let processed = 0;

    for (const user of expiredUsers || []) {
      // Update Supabase
      await supabase
        .from('users')
        .update({
          tier: 'free',
          subscription_status: 'none',
        })
        .eq('id', user.id);

      // Update Clerk Metadata
      await clerkClient.users.updateUser(user.clerk_id, {
        publicMetadata: {
          tier: 'free',
          trialEndsAt: null,
        },
      });

      processed++;
    }

    return NextResponse.json({
      success: true,
      processed,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[Cron] check-trials error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Exports

```typescript
// src/lib/trial/index.ts

export {
  startTrial,
  getTrialDaysRemaining,
  isTrialActive,
  hasUsedTrial,
  type TrialStatus,
} from './trial-service';

export {
  useTrial,
  useTrialExpiringSoon,
  useTrialJustExpired,
} from './hooks';
```

```typescript
// src/components/trial/index.ts

export { TrialBadge } from './TrialBadge';
export { TrialStartModal } from './TrialStartModal';
export { TrialEndModal } from './TrialEndModal';
```

## UI Design

### Trial Start Modal

```
┌─────────────────────────────────────────────────────────────┐
│  ✦ Particle Flow                                       [×]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Try all premium features free for 14 days.                 │
│  No credit card required.                                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ○ Year View                                         │   │
│  │  ○ Advanced Statistics                               │   │
│  │  ○ All Themes                                        │   │
│  │  ○ Unlimited Presets                                 │   │
│  │  ○ Ambient Sounds                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Start 14-Day Trial                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│                    [Maybe Later]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Trial Badge im Header

```
Normal (>3 days):
┌─────────────────────────┐
│  Trial: 12 days         │  ← White/Gray
└─────────────────────────┘

Expiring Soon (≤3 days):
┌─────────────────────────┐
│  Trial: 2 days          │  ← Orange
└─────────────────────────┘
```

## Testing

### Manuell zu testen

- [ ] Trial starten → Tier wechselt zu Flow
- [ ] Trial Badge zeigt korrekte Tage
- [ ] Premium-Features sind während Trial verfügbar
- [ ] Badge wird orange bei ≤3 Tagen
- [ ] Nach Trial-Ende: Trial-End-Modal erscheint
- [ ] Nach Trial-Ende: Tier wechselt zu Particle (free)
- [ ] Nach Trial-Ende: Premium-Features gesperrt
- [ ] Trial kann nur einmal pro Account gestartet werden

### Automatisierte Tests

```typescript
describe('Trial Service', () => {
  it('calculates days remaining correctly', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    expect(getTrialDaysRemaining(tomorrow)).toBe(1);

    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(getTrialDaysRemaining(nextWeek)).toBe(7);

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(getTrialDaysRemaining(yesterday)).toBe(0);
  });

  it('detects active trial', () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    expect(isTrialActive(future)).toBe(true);

    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(isTrialActive(past)).toBe(false);

    expect(isTrialActive(null)).toBe(false);
  });

  it('prevents double trial', async () => {
    // User hat bereits Trial genutzt
    mockSupabase.from('users').select.mockResolvedValue({
      data: { trial_started_at: '2024-01-01T00:00:00Z' },
    });

    await expect(startTrial(mockSupabase, 'user-123')).rejects.toThrow(
      'Trial bereits verwendet'
    );
  });
});
```

## Definition of Done

- [ ] `startTrial()` implementiert
- [ ] `useTrial()` Hook funktioniert
- [ ] TrialBadge im Header (normal + expiring soon)
- [ ] TrialStartModal implementiert
- [ ] TrialEndModal implementiert
- [ ] Cron Job für Trial-Ablauf
- [ ] Clerk Metadata Sync
- [ ] Trial nur einmal pro Account
- [ ] Tests geschrieben & grün

## Notizen

**Cron-Frequenz:**
- Täglich um 00:00 UTC reicht
- Alternative: Vercel Cron oder Supabase Edge Functions

**Warum Clerk Metadata?**
- Client braucht schnellen Zugriff auf Trial-Status
- Supabase-Query bei jedem Render wäre zu langsam
- Clerk cacht Metadata im JWT

**Trial-Ende Handling:**
- Modal erscheint nur einmal (localStorage Flag)
- Kein "Nag Screen" bei jedem Besuch
- Respektvoller Downgrade zu Particle

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
