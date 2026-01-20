---
type: story
status: active
priority: p1
effort: 8
feature: "[[features/ambient-effects]]"
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [effects, particles, animation, premium]
---

# Particle Animation Modes

## User Story

> Als **User**
> möchte ich **zwischen verschiedenen Partikel-Animationsstilen wählen können**,
> damit **ich die visuelle Erfahrung an meine Stimmung und Vorlieben anpassen kann**.

## Kontext

Aktuell gibt es eine feste Animation: Partikel steigen im Work-Modus auf und sinken im Break-Modus. Diese Erweiterung führt wählbare Animations-Modi ein, die alle dem Prinzip folgen: **Work = Energie aufbauen, Break = Energie loslassen**.

## Die drei Animations-Modi

### 1. Rise & Fall (Standard)
**Metapher:** Einatmen und Ausatmen, vertikale Energie

| Modus | Verhalten | Gefühl |
|-------|-----------|--------|
| Work | Partikel steigen von unten nach oben | Energie steigt, Fokus baut sich auf |
| Break | Partikel sinken von oben nach unten | Loslassen, zur Ruhe kommen |

**Implementierung:** ✅ Bereits vorhanden

---

### 2. Shine & Gather
**Metapher:** Sonne und Gravitation, radiale Energie

| Modus | Verhalten | Gefühl |
|-------|-----------|--------|
| Work | Partikel strahlen vom Zentrum nach außen | Energie expandiert, Ausstrahlung |
| Break | Partikel kehren langsam zur Mitte zurück | Sammeln, Zentrieren, nach Hause kommen |

**Technische Details:**
```typescript
// Work: Radial outward from center
@keyframes particleShine {
  0% {
    transform: translate(0, 0) scale(0.5);
    opacity: 0;
  }
  10% {
    opacity: var(--particle-opacity);
  }
  100% {
    transform: translate(
      calc(var(--particle-angle-x) * 50vw),
      calc(var(--particle-angle-y) * 50vh)
    ) scale(1);
    opacity: 0;
  }
}

// Break: Slowly return to center
@keyframes particleGather {
  0% {
    transform: translate(
      calc(var(--particle-angle-x) * 50vw),
      calc(var(--particle-angle-y) * 50vh)
    );
    opacity: 0;
  }
  10% {
    opacity: var(--particle-opacity);
  }
  100% {
    transform: translate(0, 0);
    opacity: 0;
  }
}
```

**Partikel-Generierung:**
- Jedes Partikel bekommt einen zufälligen Winkel (0-360°)
- `--particle-angle-x: cos(angle)`, `--particle-angle-y: sin(angle)`
- Startposition: Bildschirmmitte (50vw, 50vh)

---

### 3. Orbit & Drift
**Metapher:** Elektron und freies Schweben, zirkuläre Energie

| Modus | Verhalten | Gefühl |
|-------|-----------|--------|
| Work | Partikel kreisen um das Zentrum (Timer) | Fokussierte Bewegung, Konzentration |
| Break | Partikel treiben ziellos, langsam | Freiheit, kein Ziel, einfach sein |

**Technische Details:**
```typescript
// Work: Orbital motion around center
@keyframes particleOrbit {
  0% {
    transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg);
  }
}

// Break: Random drift (Brownian motion)
@keyframes particleDrift {
  0%, 100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(
      calc(var(--drift-x) * 30px),
      calc(var(--drift-y) * 30px)
    );
  }
  50% {
    transform: translate(
      calc(var(--drift-x) * -20px),
      calc(var(--drift-y) * 40px)
    );
  }
  75% {
    transform: translate(
      calc(var(--drift-x) * 25px),
      calc(var(--drift-y) * -15px)
    );
  }
}
```

**Partikel-Generierung:**
- Verschiedene Orbit-Radien (100px - 300px)
- Verschiedene Geschwindigkeiten (15s - 40s pro Umlauf)
- Im Break-Modus: zufällige Drift-Vektoren

---

## UI für Modus-Auswahl

### Settings Integration
```
┌─────────────────────────────┐
│ Particle Style              │
│                             │
│ ○ Rise & Fall    ↑↓         │
│ ● Shine & Gather ✺          │
│ ○ Orbit & Drift  ◯          │
│                             │
│ [Preview Animation]         │
└─────────────────────────────┘
```

### Keyboard Shortcut (optional)
- **V** = Cycle through visual modes (Rise → Shine → Orbit → Rise...)

---

## Akzeptanzkriterien

- [x] **Given** Settings, **When** Particle Style, **Then** 3 Optionen sichtbar
- [x] **Given** Rise & Fall, **When** Work, **Then** Partikel steigen
- [x] **Given** Rise & Fall, **When** Break, **Then** Partikel sinken
- [x] **Given** Shine & Gather, **When** Work, **Then** Partikel strahlen vom Zentrum
- [x] **Given** Shine & Gather, **When** Break, **Then** Partikel kehren zur Mitte zurück
- [ ] **Given** Orbit & Drift, **When** Work, **Then** Partikel kreisen um Zentrum
- [ ] **Given** Orbit & Drift, **When** Break, **Then** Partikel treiben ziellos
- [x] **Given** Modus-Wechsel, **When** während Timer, **Then** sanfter Übergang
- [x] **Given** Einstellung, **When** gespeichert, **Then** persistiert in localStorage
- [x] **Given** prefers-reduced-motion, **When** aktiv, **Then** keine Partikel

---

## Implementierungs-Schritte

### Phase 1: Refactoring
1. `ParticleField.tsx` → `ParticleField/index.tsx` (Ordner-Struktur)
2. Animations-Logik in separate Dateien extrahieren
3. `useParticleAnimation` Hook für Animation-Switching

### Phase 2: Shine & Gather
1. CSS Keyframes für `particleShine` und `particleGather`
2. Winkel-basierte Partikel-Generierung
3. Zentrum-relative Positionierung

### Phase 3: Orbit & Drift
1. CSS Keyframes für `particleOrbit` und `particleDrift`
2. Orbit-Radius und Geschwindigkeits-Varianz
3. Brownsche Bewegung für Drift

### Phase 4: Settings UI
1. Particle Style Selector in Settings
2. Live Preview
3. Persistence

---

## Technische Überlegungen

### Performance
- Alle Animationen CSS-only (GPU-beschleunigt)
- Keine JavaScript-Animation-Loops
- `will-change: transform` für alle Partikel

### Übergangs-Verhalten
- Bei Modus-Wechsel (Work → Break): Neue Partikel mit neuer Animation
- Bestehende Partikel laufen aus (kein abrupter Wechsel)
- Optional: Fade-Übergang zwischen Animationsstilen

### Architektur
```
src/components/effects/
├── ParticleField/
│   ├── index.tsx           # Main component
│   ├── types.ts            # Shared types
│   ├── animations/
│   │   ├── RiseFall.tsx    # Rise & Fall particles
│   │   ├── ShineGather.tsx # Shine & Gather particles
│   │   └── OrbitDrift.tsx  # Orbit & Drift particles
│   └── useParticleConfig.ts
```

---

## Die Prüffrage

> "Würde ein einzelner weißer Punkt auf schwarzem Grund stolz sein, Teil davon zu sein?"

Ja. Jede Animation erzählt eine Geschichte:
- **Rise & Fall:** Aufbau und Loslassen
- **Shine & Gather:** Ausstrahlung und Sammlung
- **Orbit & Drift:** Fokus und Freiheit

Drei Wege, denselben Rhythmus von Arbeit und Pause zu visualisieren.

---

## Definition of Done

- [ ] Drei Animations-Modi implementiert (2/3: Rise & Fall ✓, Shine & Gather ✓)
- [x] Settings UI für Auswahl
- [x] Smooth Transitions zwischen Modi
- [x] Performance-optimiert (CSS-only)
- [x] Reduced Motion respektiert
- [x] Einstellung persistiert
- [x] TypeScript strict mode
- [ ] Getestet auf Mobile
