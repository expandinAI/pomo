---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [feature, tiers, monetization]
---

# Tier System & Feature Flags

## User Story

> Als **Produkt**
> möchte ich **Features basierend auf Account-Tier freischalten**,
> damit **wir Free, Plus und Flow Nutzer unterschiedlich behandeln können**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

Die drei Tiers (Free, Plus, Flow) haben unterschiedliche Features. Das Tier-System muss sowohl Client-seitig (UI) als auch Server-seitig (RLS) funktionieren.

## Akzeptanzkriterien

- [ ] **Given** kein Account, **When** App geladen, **Then** ist Tier 'free'
- [ ] **Given** Plus Account, **When** Premium-Feature genutzt, **Then** wird Upgrade-Modal gezeigt
- [ ] **Given** Flow Account, **When** App geladen, **Then** sind alle Features verfügbar
- [ ] **Given** Trial aktiv, **When** Trial abläuft, **Then** wechselt Tier automatisch zu Plus

## Technische Details

### Betroffene Dateien
```
src/lib/
├── tiers/
│   ├── config.ts             # NEU: Tier Definitions
│   ├── hooks.ts              # NEU: useTier, useFeature
│   └── guards.tsx            # NEU: FeatureGate Component
```

### Tier Configuration

```typescript
// src/lib/tiers/config.ts

export type Tier = 'free' | 'plus' | 'flow';

export interface TierConfig {
  name: string;
  features: {
    sync: boolean;
    yearView: boolean;
    advancedStats: boolean;
    unlimitedPresets: boolean;
    allThemes: boolean;
  };
  limits: {
    maxPresets: number;
    sessionsRetention: number | 'unlimited';
  };
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  free: {
    name: 'Free',
    features: {
      sync: false,
      yearView: false,
      advancedStats: false,
      unlimitedPresets: false,
      allThemes: false,
    },
    limits: {
      maxPresets: 3,
      sessionsRetention: 365,
    },
  },
  plus: {
    name: 'Particle Plus',
    features: {
      sync: true,
      yearView: false,
      advancedStats: false,
      unlimitedPresets: false,
      allThemes: false,
    },
    limits: {
      maxPresets: 10,
      sessionsRetention: 'unlimited',
    },
  },
  flow: {
    name: 'Particle Flow',
    features: {
      sync: true,
      yearView: true,
      advancedStats: true,
      unlimitedPresets: true,
      allThemes: true,
    },
    limits: {
      maxPresets: Infinity,
      sessionsRetention: 'unlimited',
    },
  },
};
```

### Hooks

```typescript
// src/lib/tiers/hooks.ts

export function useTier(): Tier {
  const { user } = useAuth();

  if (!user) return 'free';

  // Tier from Supabase (cached in user metadata)
  const tier = user.publicMetadata?.tier as Tier;

  // Check if trial is active
  const trialEndsAt = user.publicMetadata?.trialEndsAt;
  if (trialEndsAt && new Date(trialEndsAt) > new Date()) {
    return 'flow';
  }

  return tier || 'plus';
}

export function useFeature(feature: keyof TierConfig['features']): boolean {
  const tier = useTier();
  return TIER_CONFIG[tier].features[feature];
}

export function useTierLimit(limit: keyof TierConfig['limits']): number | 'unlimited' {
  const tier = useTier();
  return TIER_CONFIG[tier].limits[limit];
}
```

### Feature Gate Component

```typescript
// src/lib/tiers/guards.tsx

interface FeatureGateProps {
  feature: keyof TierConfig['features'];
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const hasFeature = useFeature(feature);

  if (hasFeature) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: Show upgrade prompt
  return <UpgradePrompt feature={feature} />;
}

// Usage:
// <FeatureGate feature="yearView">
//   <YearView />
// </FeatureGate>
```

### Upgrade Prompt

```typescript
// src/components/upgrade/UpgradePrompt.tsx

export function UpgradePrompt({ feature }: { feature: string }) {
  const tier = useTier();

  const messages: Record<string, string> = {
    yearView: 'Die Jahresansicht ist ein Flow-Feature.',
    advancedStats: 'Erweiterte Statistiken sind ein Flow-Feature.',
    // ...
  };

  return (
    <div className="upgrade-prompt">
      <p>{messages[feature]}</p>
      {tier === 'free' ? (
        <Button onClick={openSignUp}>
          Kostenlosen Account erstellen
        </Button>
      ) : (
        <Button onClick={openTrialModal}>
          14 Tage Flow testen
        </Button>
      )}
    </div>
  );
}
```

## Testing

### Manuell zu testen
- [ ] Ohne Login: Free Features verfügbar, Premium gesperrt
- [ ] Mit Plus Account: Plus Features, Premium gesperrt
- [ ] Mit Flow Account: Alle Features verfügbar
- [ ] Trial aktiv: Alle Features verfügbar

### Automatisierte Tests
- [ ] Unit Test: `useTier()` gibt korrekten Tier
- [ ] Unit Test: `useFeature()` gibt korrekten Boolean
- [ ] Unit Test: FeatureGate rendert korrekt

## Definition of Done

- [ ] Tier Config definiert
- [ ] Hooks implementiert
- [ ] FeatureGate Component funktioniert
- [ ] Alle Premium-Features mit Gate versehen
