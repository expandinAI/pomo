---
type: story
status: done
priority: p1
effort: 3
feature: "[[features/ambient-effects]]"
created: 2026-01-20
updated: 2026-01-20
done_date: 2026-01-20
tags: [effects, particles, animation, premium, depth]
---

# Parallax Depth Effect

## User Story

> Als **User**
> möchte ich **einen Parallax-Tiefeneffekt bei den Partikeln sehen**,
> damit **die Animation räumlicher und immersiver wirkt**.

## Kontext

Aktuell bewegen sich alle Partikel unabhängig von ihrer Größe mit zufälliger Geschwindigkeit. Das ist visuell flach.

Der Parallax-Effekt nutzt ein natürliches visuelles Prinzip:
- **Nahe Objekte** (groß) bewegen sich **schneller**
- **Ferne Objekte** (klein) bewegen sich **langsamer**

Dieses Prinzip kennt jeder vom Blick aus einem fahrenden Zug: Bäume am Rand rasen vorbei, Berge am Horizont bewegen sich kaum.

## Das Prinzip

```
BILDSCHIRM (Draufsicht)

    [User]
       |
       |  ← Nahe Partikel (groß, schnell)
       |     ○
       |        ○  ← Mittlere Partikel
       |
       |              •  ← Ferne Partikel (klein, langsam)
       |                 •
       ▼
   [Bildschirm-Tiefe]
```

## Technische Umsetzung

### Depth-basierte Eigenschaften

| Depth | Größe | Geschwindigkeit | Opacity | Blur |
|-------|-------|-----------------|---------|------|
| 1.0 (nah) | 6-8px | 0.6x Basis-Duration | 0.7-0.9 | 0 |
| 0.5 (mittel) | 4-5px | 1.0x Basis-Duration | 0.4-0.6 | 0-1px |
| 0.0 (fern) | 2-3px | 1.5x Basis-Duration | 0.2-0.4 | 1-2px |

### Implementierung in ParticleField.tsx

```typescript
interface Particle {
  // ... existing properties
  depth: number;  // 0 (fern) bis 1 (nah)
}

// Partikel-Generierung mit Parallax
const depth = Math.random(); // 0-1

// Größe korreliert mit Tiefe
const minSize = 2;
const maxSize = 8;
const size = minSize + depth * (maxSize - minSize);

// Duration invers zur Tiefe (nah = schneller)
const baseDuration = config.baseDuration;
const durationMultiplier = 1.5 - (depth * 0.9); // 1.5x (fern) bis 0.6x (nah)
const duration = baseDuration * durationMultiplier;

// Opacity korreliert mit Tiefe
const opacity = 0.2 + depth * 0.6; // 0.2 (fern) bis 0.8 (nah)

// Blur invers zur Tiefe
const blur = (1 - depth) * 2; // 2px (fern) bis 0px (nah)
```

### CSS-Anpassungen

Keine neuen Keyframes nötig - die bestehenden Animationen funktionieren mit unterschiedlichen `--particle-duration` Werten automatisch.

---

## Settings UI

### Toggle in Visual Effects

```
┌─────────────────────────────┐
│ Particle Style              │
│ ○ Rise & Fall               │
│ ● Shine & Gather            │
│ ○ Orbit & Drift             │
│ ○ Shuffle                   │
│                             │
│ ─────────────────────────── │
│                             │
│ [✓] Parallax Depth          │
│     Adds 3D depth illusion  │
└─────────────────────────────┘
```

### Persistence

```typescript
const PARALLAX_STORAGE_KEY = 'particle_parallax';
// Default: true (aktiviert für Premium-Feeling)
```

---

## Akzeptanzkriterien

- [x] **Given** Parallax ON, **When** Partikel generiert, **Then** Größe korreliert mit Geschwindigkeit
- [x] **Given** Parallax ON, **When** große Partikel, **Then** bewegen sich schneller
- [x] **Given** Parallax ON, **When** kleine Partikel, **Then** bewegen sich langsamer
- [x] **Given** Parallax ON, **When** kleine Partikel, **Then** sind dezenter (niedrigere Opacity)
- [x] **Given** Parallax OFF, **When** Partikel generiert, **Then** unabhängige Randomisierung (aktuelles Verhalten)
- [x] **Given** Settings, **When** Parallax Toggle, **Then** Einstellung wird persistiert
- [x] **Given** Parallax, **When** alle Animations-Modi, **Then** funktioniert mit Rise/Shine/Orbit

---

## Implementierungs-Schritte

### Phase 1: Core Logic (30 min)
1. `depth` Property zu Particle Interface hinzufügen
2. Korrelation zwischen `depth`, `size`, `duration`, `opacity` implementieren
3. Optional: `blur` basierend auf Depth

### Phase 2: Settings (20 min)
1. `useParallax` Hook oder in `useParticleStyle` integrieren
2. Toggle in VisualEffectsSettings
3. localStorage Persistence

### Phase 3: Polish (10 min)
1. Default auf `true` setzen
2. Feintuning der Werte für optimalen visuellen Effekt
3. Test mit allen 3 Animations-Modi

---

## Die Prüffrage

> "Würde ein einzelner weißer Punkt auf schwarzem Grund stolz sein, Teil davon zu sein?"

Ja. Der Parallax-Effekt verwandelt flache Punkte in ein räumliches Feld mit Tiefe. Jedes Partikel hat seinen Platz in der Tiefe - nah oder fern, schnell oder langsam. Das ist nicht Dekoration, das ist Weltenbau.

---

## Definition of Done

- [x] Depth-basierte Partikel-Eigenschaften implementiert
- [x] Toggle in Settings UI
- [x] Funktioniert mit allen 3 Animations-Modi
- [x] Einstellung persistiert in localStorage
- [x] TypeScript strict mode
- [x] Visuell getestet und feingetunt
