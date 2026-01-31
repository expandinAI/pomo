---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-29
done_date: null
tags: [feature, tiers, monetization]
---

# POMO-303: Tier System & Feature Flags

## User Story

> Als **Produkt**
> möchte ich **Features basierend auf Account-Tier freischalten**,
> damit **wir Particle und Flow Nutzer unterschiedlich behandeln können**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

**Vorgänger:** POMO-302 (Auth UI)

### Tier-Architektur

| Modus | Account | Sync | Features | Kosten |
|-------|---------|------|----------|--------|
| **Lokal** | Kein | ✗ | Alle Basis-Features | Kostenlos |
| **Particle** | Ja | ✓ | Basis + Sync | Kostenlos |
| **Particle Flow** | Ja | ✓ | Alles | 9€/Monat |

**Wichtig:**
- "Lokal" ist kein Tier – es ist die App ohne Account
- Tier-Werte in der DB sind `'free'` und `'flow'`
- Ohne Account existiert kein DB-Eintrag in `users`

**Reihenfolge:** POMO-302 → **POMO-303** → POMO-304 → ...

## Akzeptanzkriterien

- [ ] **Given** kein Account (Lokal), **When** App geladen, **Then** sind alle Basis-Features verfügbar
- [ ] **Given** Particle Account, **When** Premium-Feature genutzt, **Then** wird Upgrade-Prompt gezeigt
- [ ] **Given** Flow Account, **When** App geladen, **Then** sind alle Features verfügbar
- [ ] **Given** Trial aktiv, **When** Trial abläuft, **Then** wechselt Tier automatisch zu Particle (free)

## Technische Details

### Dateistruktur

```
src/lib/tiers/
├── index.ts              # NEU: Public exports
├── config.ts             # NEU: Tier Definitions
├── hooks.ts              # NEU: useTier, useFeature, useTierLimit
└── FeatureGate.tsx       # NEU: Feature Gate Component
```

### Tier Configuration

```typescript
// src/lib/tiers/config.ts

/**
 * Tier-Typen für authentifizierte User.
 * "Lokal" (ohne Account) ist kein Tier – es ist einfach `null`.
 */
export type Tier = 'free' | 'flow';

/**
 * Auth-Status für die gesamte App.
 */
export type AuthMode = 'local' | 'free' | 'flow';

export interface TierFeatures {
  /** Cloud Sync aktiviert */
  sync: boolean;
  /** Jahresansicht in History */
  yearView: boolean;
  /** Erweiterte Statistiken */
  advancedStats: boolean;
  /** Unbegrenzte aktive Projekte */
  unlimitedProjects: boolean;
  /** Alle Ambient Sounds (nicht nur Basis) */
  allAmbientSounds: boolean;
  /** Alle Themes (nicht nur Basis) */
  allThemes: boolean;
}

export interface TierLimits {
  /** Maximale Anzahl aktive Projekte */
  maxActiveProjects: number;
  /** Maximale Anzahl Custom Presets */
  maxPresets: number;
  /** Anzahl verfügbarer Basis-Ambient-Sounds */
  baseAmbientSounds: number;
  /** Anzahl verfügbarer Basis-Themes */
  baseThemes: number;
  /** Session-Retention in Tagen ('unlimited' = nie löschen) */
  sessionsRetention: number | 'unlimited';
}

export interface TierConfig {
  name: string;
  description: string;
  features: TierFeatures;
  limits: TierLimits;
}

/**
 * Konfiguration für Lokal-Modus (ohne Account).
 * Volle App-Funktionalität, aber keine Cloud-Features.
 */
export const LOCAL_CONFIG: TierConfig = {
  name: 'Lokal',
  description: 'Alle Daten auf diesem Gerät',
  features: {
    sync: false,
    yearView: false,
    advancedStats: false,
    unlimitedProjects: false,
    allAmbientSounds: false,
    allThemes: false,
  },
  limits: {
    maxActiveProjects: 5,
    maxPresets: 3,
    baseAmbientSounds: 2,  // Stille, Weißes Rauschen
    baseThemes: 1,         // Default Theme
    sessionsRetention: 365, // 1 Jahr
  },
};

/**
 * Konfiguration für Particle (kostenloser Account).
 * Hauptvorteil: Cloud Sync.
 */
export const FREE_CONFIG: TierConfig = {
  name: 'Particle',
  description: 'Cloud Sync auf allen Geräten',
  features: {
    sync: true,
    yearView: false,
    advancedStats: false,
    unlimitedProjects: false,
    allAmbientSounds: false,
    allThemes: false,
  },
  limits: {
    maxActiveProjects: 5,
    maxPresets: 5,
    baseAmbientSounds: 2,  // Stille, Weißes Rauschen
    baseThemes: 2,         // Default + 1 Alternative
    sessionsRetention: 'unlimited',
  },
};

/**
 * Konfiguration für Flow (bezahlter Premium-Account).
 * Alle Features, keine Limits.
 */
export const FLOW_CONFIG: TierConfig = {
  name: 'Particle Flow',
  description: 'Das volle Particle-Erlebnis',
  features: {
    sync: true,
    yearView: true,
    advancedStats: true,
    unlimitedProjects: true,
    allAmbientSounds: true,
    allThemes: true,
  },
  limits: {
    maxActiveProjects: Infinity,
    maxPresets: Infinity,
    baseAmbientSounds: Infinity,  // Alle Sounds
    baseThemes: Infinity,         // Alle Themes
    sessionsRetention: 'unlimited',
  },
};

/**
 * Mapping von AuthMode zu Config.
 */
export const TIER_CONFIGS: Record<AuthMode, TierConfig> = {
  local: LOCAL_CONFIG,
  free: FREE_CONFIG,
  flow: FLOW_CONFIG,
};

/**
 * Feature-Namen für UI-Anzeige.
 */
export const FEATURE_LABELS: Record<keyof TierFeatures, string> = {
  sync: 'Cloud Sync',
  yearView: 'Jahresansicht',
  advancedStats: 'Erweiterte Statistiken',
  unlimitedProjects: 'Unbegrenzte Projekte',
  allAmbientSounds: 'Alle Ambient Sounds',
  allThemes: 'Alle Themes',
};
```

### Hooks

```typescript
// src/lib/tiers/hooks.ts

import { useMemo } from 'react';
import { useParticleAuth } from '@/lib/auth/hooks';
import {
  type AuthMode,
  type TierFeatures,
  type TierLimits,
  TIER_CONFIGS,
} from './config';

/**
 * Gibt den aktuellen Auth-Modus zurück.
 * - 'local': Kein Account
 * - 'free': Kostenloser Account (Particle)
 * - 'flow': Premium Account oder Trial
 */
export function useAuthMode(): AuthMode {
  const auth = useParticleAuth();

  return useMemo(() => {
    if (auth.status !== 'authenticated') {
      return 'local';
    }
    return auth.tier;
  }, [auth]);
}

/**
 * Prüft ob ein Feature verfügbar ist.
 */
export function useFeature(feature: keyof TierFeatures): boolean {
  const mode = useAuthMode();
  return TIER_CONFIGS[mode].features[feature];
}

/**
 * Gibt ein Limit für den aktuellen Tier zurück.
 */
export function useTierLimit<K extends keyof TierLimits>(limit: K): TierLimits[K] {
  const mode = useAuthMode();
  return TIER_CONFIGS[mode].limits[limit];
}

/**
 * Gibt die vollständige Tier-Config zurück.
 */
export function useTierConfig() {
  const mode = useAuthMode();
  return TIER_CONFIGS[mode];
}

/**
 * Prüft ob User eingeloggt ist (Particle oder Flow).
 */
export function useIsAuthenticated(): boolean {
  const mode = useAuthMode();
  return mode !== 'local';
}

/**
 * Prüft ob User Premium hat (Flow oder aktiver Trial).
 */
export function useIsPremium(): boolean {
  const mode = useAuthMode();
  return mode === 'flow';
}
```

### Feature Gate Component

```typescript
// src/lib/tiers/FeatureGate.tsx

'use client';

import { type ReactNode } from 'react';
import { useFeature, useAuthMode } from './hooks';
import type { TierFeatures } from './config';

interface FeatureGateProps {
  /** Feature das geprüft werden soll */
  feature: keyof TierFeatures;
  /** Content wenn Feature verfügbar */
  children: ReactNode;
  /** Alternative wenn Feature nicht verfügbar (optional) */
  fallback?: ReactNode;
  /** Wenn true, wird bei fehlender Berechtigung nichts gerendert */
  hideIfLocked?: boolean;
}

/**
 * Rendert Content nur wenn das Feature verfügbar ist.
 *
 * @example
 * <FeatureGate feature="yearView">
 *   <YearView />
 * </FeatureGate>
 *
 * @example
 * <FeatureGate feature="advancedStats" fallback={<UpgradePrompt />}>
 *   <AdvancedStats />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  hideIfLocked = false,
}: FeatureGateProps) {
  const hasFeature = useFeature(feature);

  if (hasFeature) {
    return <>{children}</>;
  }

  if (hideIfLocked) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: Show upgrade prompt
  return <UpgradePrompt feature={feature} />;
}

/**
 * Standard-Upgrade-Prompt für gesperrte Features.
 */
function UpgradePrompt({ feature }: { feature: keyof TierFeatures }) {
  const mode = useAuthMode();

  const messages: Record<keyof TierFeatures, string> = {
    sync: 'Cloud Sync synchronisiert deine Daten auf allen Geräten.',
    yearView: 'Die Jahresansicht zeigt alle deine Partikel auf einen Blick.',
    advancedStats: 'Erweiterte Statistiken geben tiefere Einblicke.',
    unlimitedProjects: 'Erstelle unbegrenzt viele aktive Projekte.',
    allAmbientSounds: 'Entspanne mit allen Ambient Sounds: Regen, Café, Wald und mehr.',
    allThemes: 'Wähle aus allen verfügbaren Themes.',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-secondary mb-4">{messages[feature]}</p>

      {mode === 'local' ? (
        <button
          onClick={() => (window.location.href = '/sign-in')}
          className="px-4 py-2 bg-white text-black rounded-lg font-medium
                     hover:bg-zinc-200 transition-colors"
        >
          Account erstellen
        </button>
      ) : (
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent('particle:open-trial'))
          }
          className="px-4 py-2 bg-white text-black rounded-lg font-medium
                     hover:bg-zinc-200 transition-colors"
        >
          14 Tage Flow testen
        </button>
      )}
    </div>
  );
}
```

### Public Exports

```typescript
// src/lib/tiers/index.ts

export {
  type Tier,
  type AuthMode,
  type TierFeatures,
  type TierLimits,
  type TierConfig,
  LOCAL_CONFIG,
  FREE_CONFIG,
  FLOW_CONFIG,
  TIER_CONFIGS,
  FEATURE_LABELS,
} from './config';

export {
  useAuthMode,
  useFeature,
  useTierLimit,
  useTierConfig,
  useIsAuthenticated,
  useIsPremium,
} from './hooks';

export { FeatureGate } from './FeatureGate';
```

### Verwendungsbeispiele

```typescript
// Feature-gated Content
<FeatureGate feature="yearView">
  <YearView sessions={sessions} />
</FeatureGate>

// Conditional Rendering ohne Fallback
<FeatureGate feature="ambientSounds" hideIfLocked>
  <AmbientSoundPicker />
</FeatureGate>

// Limit-basierte Logik (Presets)
function PresetList() {
  const maxPresets = useTierLimit('maxPresets');
  const presets = usePresets();

  const canAddMore = presets.length < maxPresets;

  return (
    <div>
      {presets.map(preset => <PresetCard key={preset.id} {...preset} />)}
      {canAddMore ? (
        <AddPresetButton />
      ) : (
        <UpgradeHint>Upgrade für mehr Presets</UpgradeHint>
      )}
    </div>
  );
}

// Limit-basierte Logik (Projekte)
function ProjectList() {
  const maxProjects = useTierLimit('maxActiveProjects');
  const projects = useProjects();
  const activeProjects = projects.filter(p => !p.archived);

  const canAddMore = activeProjects.length < maxProjects;

  return (
    <div>
      {projects.map(project => <ProjectCard key={project.id} {...project} />)}
      {canAddMore ? (
        <AddProjectButton />
      ) : (
        <UpgradeHint>
          You have {maxProjects} active projects.
          Archive one or upgrade to Flow.
        </UpgradeHint>
      )}
    </div>
  );
}

// Auth-Mode Check
function SyncIndicator() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) return null;

  return <CloudSyncStatus />;
}
```

## Feature-Matrix

| Feature | Lokal | Particle | Particle Flow |
|---------|-------|----------|---------------|
| Timer & Breaks | ✓ | ✓ | ✓ |
| History (30 Tage lokal, unbegrenzt mit Sync) | ✓ | ✓ | ✓ |
| **Aktive Projekte** | 5 | 5 | ∞ |
| Custom Presets | 3 | 5 | ∞ |
| **Cloud Sync** | ✗ | ✓ | ✓ |
| **Ambient Sounds** | 2 Basis | 2 Basis | Alle (8+) |
| **Themes** | 1 | 2 | Alle |
| Year View | ✗ | Preview | ✓ |
| Advanced Stats | ✗ | ✗ | ✓ |

### Upgrade-Trigger (Conversion-Strategie)

| Von → Nach | Haupt-Trigger |
|------------|---------------|
| Lokal → Particle | "Ich will meine Daten auf allen Geräten" → **Sync** |
| Particle → Flow | "Ich will mehr Projekte / Year View / bessere Sounds" |

### Flow Value Proposition

**Funktionaler Mehrwert:**
- Unbegrenzte aktive Projekte (für Freelancer/Profis)
- Year View (emotionaler "Wow"-Moment)
- Alle Ambient Sounds (täglicher Mehrwert)
- Alle Themes (sichtbarer Unterschied)
- Advanced Stats (für Daten-Nerds)

**Identitäts-Mehrwert:**
- Flow-Badge im Profil
- "Indie-Entwickler unterstützen"
- Early Access zu neuen Features

### Zukünftige Flow-Features (Roadmap)
- Erweiterte Projektanalyse (Zeit pro Projekt, Trends)
- Export & Berichte
- Team-Features (später)
- API-Zugang (später)

## Testing

### Manuell zu testen

- [ ] Ohne Login: Basis-Features verfügbar
- [ ] Ohne Login: Sync-Button sichtbar (nicht "Anmelden")
- [ ] Mit Particle: Cloud Sync aktiv, Premium-Features zeigen Upgrade-Prompt
- [ ] Mit Particle Flow: Alle Features verfügbar
- [ ] FeatureGate rendert korrekten Content

### Automatisierte Tests

```typescript
describe('Tier System', () => {
  it('returns local mode when not authenticated', () => {
    mockUseParticleAuth({ status: 'anonymous' });

    const { result } = renderHook(() => useAuthMode());

    expect(result.current).toBe('local');
  });

  it('returns free for authenticated user without premium', () => {
    mockUseParticleAuth({ status: 'authenticated', tier: 'free' });

    const { result } = renderHook(() => useAuthMode());

    expect(result.current).toBe('free');
  });

  it('returns flow for premium user', () => {
    mockUseParticleAuth({ status: 'authenticated', tier: 'flow' });

    const { result } = renderHook(() => useAuthMode());

    expect(result.current).toBe('flow');
  });

  it('FeatureGate shows children when feature available', () => {
    mockUseParticleAuth({ status: 'authenticated', tier: 'flow' });

    render(
      <FeatureGate feature="yearView">
        <div data-testid="year-view">Year View</div>
      </FeatureGate>
    );

    expect(screen.getByTestId('year-view')).toBeInTheDocument();
  });

  it('FeatureGate shows upgrade prompt when feature locked', () => {
    mockUseParticleAuth({ status: 'authenticated', tier: 'free' });

    render(
      <FeatureGate feature="yearView">
        <div>Year View</div>
      </FeatureGate>
    );

    expect(screen.getByText('14 Tage Flow testen')).toBeInTheDocument();
  });
});
```

## Definition of Done

- [ ] Tier Config mit Lokal/Particle/Flow definiert
- [ ] `useAuthMode()` Hook funktioniert
- [ ] `useFeature()` Hook funktioniert
- [ ] `useTierLimit()` Hook funktioniert
- [ ] FeatureGate Component implementiert
- [ ] Alle Premium-Features mit Gate versehen
- [ ] Tests geschrieben & grün

## Notizen

**Warum "Lokal" kein Tier ist:**
- Kein Account = kein DB-Eintrag
- Vereinfacht die Datenbank (nur `free` und `flow` in users.tier)
- Klare Trennung: Auth-Status vs. Subscription-Status

**Feature Strategie:**
- Basis-Features sollen so gut sein, dass man die App liebt
- Premium-Features sind "nice to have", nicht "must have"
- Sync ist der Haupt-Grund für Account-Erstellung (Lokal → Particle)
- Projekte + Year View + Sounds sind die Hebel für Flow

**Upgrade-Philosophie:**
- **Aspiration + Dankbarkeit**, nicht Frustration
- Free-User sollen die App lieben, nicht genervt werden
- Flow ist für Supporter UND für Power-User
- Limits sind großzügig (5 Projekte, 5 Presets reichen für die meisten)

**Projekt-Limit-Strategie:**
- 5 aktive Projekte für Free (archivierte zählen nicht)
- Profis/Freelancer mit vielen Kunden brauchen mehr → Flow
- Archivieren ist immer kostenlos möglich
- Kein hartes "Lösch dein Projekt" - sanfter Upgrade-Prompt

**Ambient Sounds Strategie:**
- 2 Basis-Sounds für alle: Stille + Weißes Rauschen
- Premium-Sounds (Regen, Café, Wald, etc.) nur für Flow
- Daily Touch Point: Jede Session erinnert an den Mehrwert

**Theme Strategie:**
- Lokal: 1 Default-Theme
- Particle: 2 Themes (Default + 1 Alternative)
- Flow: Alle Themes
- Sichtbarer Unterschied ohne funktionale Einschränkung

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
