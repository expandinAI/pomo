---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [feature, trial, monetization]
---

# Trial Start/End Flow

## User Story

> Als **Plus-Nutzer**
> möchte ich **Particle Flow 14 Tage kostenlos testen**,
> damit **ich entscheiden kann, ob sich das Upgrade lohnt**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

Der Trial ist ein wichtiger Conversion-Hebel. Nutzer sollen Premium-Features erleben, ohne vorher zu zahlen.

## Akzeptanzkriterien

- [ ] **Given** Plus-Account ohne Trial, **When** Trial gestartet, **Then** werden 14 Tage aktiviert
- [ ] **Given** Trial aktiv, **When** App geladen, **Then** zeigt Header "Trial: X Tage übrig"
- [ ] **Given** Trial endet in 3 Tagen, **When** App geladen, **Then** zeigt Reminder
- [ ] **Given** Trial abgelaufen, **When** App geladen, **Then** zeigt Upgrade-Modal

## Technische Details

### Trial Start Modal

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              Particle Flow                      │
│                                                 │
│     14 Tage kostenlos alle Premium-Features     │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │  ✓ Jahresansicht                        │   │
│   │  ✓ Erweiterte Statistiken               │   │
│   │  ✓ Alle Themes                          │   │
│   │  ✓ Unbegrenzte Presets                  │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   Keine Kreditkarte erforderlich.               │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │       14-Tage Trial starten             │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   [Vielleicht später]                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Trial End Modal

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         Dein Trial ist beendet                  │
│                                                 │
│   In den letzten 14 Tagen hast du:              │
│                                                 │
│   • 89 Partikel gesammelt                       │
│   • Die Jahresansicht 12x geöffnet              │
│   • 3 neue Themes ausprobiert                   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │       Particle Flow behalten            │   │
│   │       9€/Monat oder 79€/Jahr            │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   [Mit Particle Plus weitermachen]              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Implementierungshinweise

```typescript
// src/lib/trial/trial-service.ts

export async function startTrial(userId: string): Promise<void> {
  const now = new Date();
  const endsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  await supabase
    .from('users')
    .update({
      tier: 'flow',
      trial_started_at: now.toISOString(),
      trial_ends_at: endsAt.toISOString(),
      subscription_status: 'trialing',
    })
    .eq('id', userId);

  // Update Clerk metadata for client-side access
  await clerk.users.updateUser(userId, {
    publicMetadata: {
      tier: 'flow',
      trialEndsAt: endsAt.toISOString(),
    },
  });
}

export function getTrialDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;

  const now = new Date();
  const ends = new Date(trialEndsAt);
  const diff = ends.getTime() - now.getTime();

  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

// Cron Job / Edge Function für Trial-Ende
export async function checkExpiredTrials(): Promise<void> {
  const { data: expiredUsers } = await supabase
    .from('users')
    .select('id, clerk_id')
    .eq('subscription_status', 'trialing')
    .lt('trial_ends_at', new Date().toISOString());

  for (const user of expiredUsers || []) {
    await supabase
      .from('users')
      .update({
        tier: 'plus',
        subscription_status: 'none',
      })
      .eq('id', user.id);

    await clerk.users.updateUser(user.clerk_id, {
      publicMetadata: {
        tier: 'plus',
        trialEndsAt: null,
      },
    });
  }
}
```

### Trial Badge in Header

```typescript
// src/components/auth/TrialBadge.tsx

export function TrialBadge() {
  const { user } = useAuth();
  const trialEndsAt = user?.publicMetadata?.trialEndsAt as string | null;
  const daysRemaining = getTrialDaysRemaining(trialEndsAt);

  if (daysRemaining <= 0) return null;

  return (
    <Badge variant={daysRemaining <= 3 ? 'warning' : 'default'}>
      Trial: {daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'}
    </Badge>
  );
}
```

## Testing

### Manuell zu testen
- [ ] Trial starten → Tier wechselt zu Flow
- [ ] Trial Badge zeigt korrekte Tage
- [ ] Premium-Features sind während Trial verfügbar
- [ ] Nach Trial-Ende: Tier wechselt zu Plus
- [ ] Nach Trial-Ende: Premium-Features gesperrt

### Automatisierte Tests
- [ ] Unit Test: `getTrialDaysRemaining()`
- [ ] Unit Test: Trial Start Logik
- [ ] Integration Test: Trial Ende Cron Job

## Definition of Done

- [ ] Trial Start Modal implementiert
- [ ] Trial Badge im Header
- [ ] Trial Ende Modal
- [ ] Cron Job für Trial-Ablauf
- [ ] Clerk Metadata sync
