---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/ambient-effects]]"
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [effects, particles, animation, settings, ux]
---

# Particle Pace Modes

## User Story

> Als **User**
> möchte ich **die Geschwindigkeit der Partikelanimationen anpassen können**,
> damit **die visuelle Atmosphäre zu meinem Fokus-Stil passt**.

## Kontext

Aktuell haben alle Partikel eine feste Basis-Geschwindigkeit. Manche User bevorzugen träumerischere, langsamere Animationen für tiefe Konzentration. Andere mögen etwas mehr visuelle Energie.

Drei Modi geben Kontrolle ohne Überforderung – im Einklang mit unserem Reduktions-Prinzip.

## Die drei Modi

| Mode | Gefühl | Multiplikator | Basis-Duration (Work) |
|------|--------|---------------|----------------------|
| **Drift** | Träumerisch, meditativ | 1.4x | ~35s |
| **Flow** | Ausbalanciert, natürlich | 1.0x | 25s (aktuell) |
| **Pulse** | Energetischer, fokussiert | 0.7x | ~17.5s |

### Wichtig: Calm bleibt Calm

Selbst "Pulse" mit 0.7x Multiplikator bedeutet ~17 Sekunden pro Animation-Zyklus. Das ist immer noch **ruhig und fokussiert** – nur mit etwas mehr Lebendigkeit. Keine hektischen Bewegungen.

## Technische Umsetzung

### 1. useParticleStyle.ts erweitern

```typescript
export type ParticlePace = 'drift' | 'flow' | 'pulse';

const PACE_STORAGE_KEY = 'particle_pace';
const DEFAULT_PACE: ParticlePace = 'flow';

// Pace multipliers (höher = langsamer)
const PACE_MULTIPLIERS: Record<ParticlePace, number> = {
  drift: 1.4,
  flow: 1.0,
  pulse: 0.7,
};

// State hinzufügen
const [pace, setPaceState] = useState<ParticlePace>(DEFAULT_PACE);

// Return erweitern
return { ..., pace, setPace, paceMultiplier: PACE_MULTIPLIERS[pace] };
```

### 2. ParticleField.tsx anpassen

```typescript
interface ParticleFieldProps {
  // ... existing
  paceMultiplier?: number;
}

// In der Partikel-Generierung
const duration = baseDuration * durationMultiplier * paceMultiplier;
```

### 3. AmbientEffectsContext.tsx erweitern

```typescript
// Interface
pace: ParticlePace;
setPace: (pace: ParticlePace) => void;
paceMultiplier: number;

// Durchreichen aus useParticleStyle
```

### 4. VisualEffectsSettings.tsx – Segmented Control

```tsx
{/* Particle Pace Selector */}
{effectsEnabled && visualMode !== 'minimal' && (
  <div className="space-y-2">
    <label className="...">
      <Gauge className="w-3 h-3" />
      Particle Pace
    </label>
    <div className="grid grid-cols-3 gap-2">
      {PACE_OPTIONS.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => setPace(option.value)}
          className={/* selected/unselected styles */}
        >
          <span>{option.label}</span>
          <span className="text-[10px]">{option.description}</span>
        </motion.button>
      ))}
    </div>
  </div>
)}
```

### Pace Options

```typescript
const PACE_OPTIONS = [
  { value: 'drift', label: 'Drift', description: 'dreamy' },
  { value: 'flow', label: 'Flow', description: 'natural' },
  { value: 'pulse', label: 'Pulse', description: 'lively' },
];
```

---

## UI Design

```
┌─────────────────────────────────┐
│ PARTICLE PACE                   │
│ ┌─────────┬─────────┬─────────┐ │
│ │  Drift  │  Flow   │  Pulse  │ │
│ │ dreamy  │ natural │ lively  │ │
│ └─────────┴─────────┴─────────┘ │
└─────────────────────────────────┘
```

- 3-spaltige Segmented Control
- Gleicher Stil wie Visual Mode Selector
- Kleine Beschreibung unter jedem Label

---

## Interaktion mit anderen Features

### Parallax Depth
Pace-Multiplikator wird **vor** dem Parallax-Multiplikator angewendet:
```
finalDuration = baseDuration * paceMultiplier * parallaxMultiplier
```

So bleibt die Tiefenwirkung (nah=schneller, fern=langsamer) bei jedem Pace erhalten.

### Break Mode
Break Mode hat bereits einen langsameren baseDuration (50s vs 25s). Der Pace-Multiplikator wirkt additiv:
- Drift + Break = sehr meditativ (~70s)
- Pulse + Break = immer noch ruhig (~35s)

---

## Akzeptanzkriterien

- [ ] **Given** Settings, **When** Pace auf Drift, **Then** Partikel bewegen sich 1.4x langsamer
- [ ] **Given** Settings, **When** Pace auf Flow, **Then** aktuelle Geschwindigkeit (1.0x)
- [ ] **Given** Settings, **When** Pace auf Pulse, **Then** Partikel bewegen sich 0.7x schneller
- [ ] **Given** Pace-Änderung, **When** Timer läuft, **Then** neue Partikel nutzen neue Pace
- [ ] **Given** Pace + Parallax, **When** beide aktiv, **Then** Multiplikatoren kombinieren sich
- [ ] **Given** Pace, **When** Browser Refresh, **Then** Einstellung bleibt erhalten
- [ ] **Given** Settings, **When** Minimal Mode, **Then** Pace-Selector nicht sichtbar

---

## Implementierungs-Schritte

### Phase 1: State & Logic (20 min)
1. `ParticlePace` Type und `PACE_MULTIPLIERS` definieren
2. `pace` State in `useParticleStyle` mit Persistence
3. `paceMultiplier` durch Context exponieren

### Phase 2: ParticleField Integration (10 min)
1. `paceMultiplier` Prop hinzufügen
2. Duration-Berechnung anpassen
3. In `AmbientEffects.tsx` durchreichen

### Phase 3: Settings UI (20 min)
1. `PACE_OPTIONS` Array definieren
2. Segmented Control nach Visual Mode Selector
3. Styling konsistent mit bestehendem Design

### Phase 4: Test & Polish (10 min)
1. Alle drei Modi visuell testen
2. Kombination mit Parallax testen
3. Break Mode testen

---

## Die Prüffrage

> "Würde ein einzelner weißer Punkt auf schwarzem Grund stolz sein, Teil davon zu sein?"

Ja. Die drei Modi respektieren unterschiedliche Fokus-Stile, ohne das Prinzip der Ruhe zu verletzen. Drift für tiefe Meditation, Flow für natürliches Arbeiten, Pulse für energetische Sessions – alle drei bleiben calm.

---

## Definition of Done

- [ ] Drei Pace-Modi implementiert (Drift/Flow/Pulse)
- [ ] Segmented Control in Settings UI
- [ ] Kombiniert korrekt mit Parallax-Multiplikator
- [ ] Einstellung persistiert in localStorage
- [ ] TypeScript strict mode
- [ ] Visuell getestet mit allen Animationsmodi
