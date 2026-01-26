---
type: story
status: backlog
priority: p1
effort: 8
feature: ambient-effects
created: 2025-01-21
updated: 2025-01-21
done_date: null
tags: [animation, celebration, emotional-design, apple-design-award]
---

# POMO-131: Particle Convergence Animation

## User Story

> Als **Nutzer, der gerade einen Partikel abgeschlossen hat**,
> möchte ich **sehen, wie alle schwebenden Partikel in meinen Partikel-Container fliegen**,
> damit **ich einen magischen, befriedigenden Moment erlebe, der meinen Stolz auf die geleistete Arbeit visuell manifestiert**.

## Kontext

**Die Vision:** Am Ende einer Work-Session (letzte 2-3 Sekunden) konvergieren alle sichtbaren schwebenden Partikel und fliegen gemeinsam in den nächsten freien Slot des Session Counters. Sie werden dort "gesammelt" – mit einem finalen Glow-Effekt.

**Warum ist das wichtig:**
- Die schwebenden Partikel werden von Dekoration zu *Bedeutung* – sie SIND die Arbeit
- Der Nutzer sieht buchstäblich, wie seine Arbeit "eingefangen" wird
- Narrativer Bogen: Anfang (entstehen) → Mitte (schweben) → Ende (sammeln)
- **First Impression:** Nach dem ersten Partikel denkt der Nutzer "Wow, da hat sich jemand Gedanken gemacht"
- **Apple Design Award Material:** Animation als Bedeutungsträger, nicht Gimmick

## Akzeptanzkriterien

### Animation Trigger
- [ ] **Given** Timer läuft im Work-Modus, **When** 3 Sekunden verbleiben, **Then** startet die Convergence-Animation
- [ ] **Given** Nutzer skippt die Session (S-Taste), **When** Session war >60s, **Then** keine Convergence (war kein vollständiger Partikel)

### Partikel-Bewegung
- [ ] **Given** Partikel schweben auf verschiedenen Z-Ebenen, **When** Convergence startet, **Then** bewegen sich ALLE sichtbaren Partikel zum Ziel
- [ ] **Given** Partikel haben unterschiedliche Abstände zum Ziel, **When** Animation läuft, **Then** passen Geschwindigkeiten sich an, sodass alle GLEICHZEITIG ankommen
- [ ] **Given** Partikel sind auf verschiedenen Z-Tiefen, **When** sie sich bewegen, **Then** normalisiert sich die Z-Tiefe smooth auf einen einheitlichen Wert

### Ziel-Container
- [ ] **Given** Session Counter zeigt z.B. ●●○○, **When** Convergence endet, **Then** ist das Ziel der dritte (erste leere) Slot
- [ ] **Given** alle Partikel erreichen den Slot, **When** sie "einschlagen", **Then** erscheint ein Glow-Effekt
- [ ] **Given** Glow-Effekt erscheint, **When** er ausklingt, **Then** ist der Slot gefüllt (● statt ○)

### Timing & Easing
- [ ] **Given** Convergence dauert 2-3 Sekunden, **When** Timer bei 0:00 ankommt, **Then** ist Animation abgeschlossen
- [ ] **Given** Partikel bewegen sich, **When** Animation läuft, **Then** nutzen sie ease-out Kurven (beschleunigen, dann sanft abbremsen)

### Edge Cases
- [ ] **Given** Timer wird während Convergence pausiert, **When** Pause aktiv, **Then** friert Animation ein
- [ ] **Given** Timer wird während Convergence resumed, **When** Resume, **Then** setzt Animation fort
- [ ] **Given** Nutzer wechselt Tab während Convergence, **When** Tab wieder aktiv, **Then** ist Animation graceful beendet

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   ├── effects/
│   │   └── AmbientEffects.tsx      # Partikel-Rendering erweitern
│   └── timer/
│       ├── Timer.tsx               # Trigger bei 3s remaining
│       └── SessionCounter.tsx      # Glow-Effekt Target
├── contexts/
│   └── AmbientEffectsContext.tsx   # Convergence State
└── lib/
    └── particle-physics.ts         # (neu) Convergence-Berechnungen
```

### Implementierungshinweise

**1. Partikel-Tracking:**
- Jedes Partikel braucht eine ID und aktuelle Position (x, y, z)
- Beim Convergence-Start: Snapshot aller Positionen
- Zielposition: getBoundingClientRect() des Target-Slots

**2. Synchronisiertes Ankommen:**
```typescript
// Alle Partikel sollen in genau `duration` ms ankommen
// Weiter entfernte Partikel bewegen sich schneller

function calculateVelocity(particle: Particle, target: Point, duration: number) {
  const distance = getDistance(particle.position, target);
  const baseVelocity = distance / duration;

  // Ease-out: schnell starten, sanft enden
  return {
    velocity: baseVelocity,
    easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)' // ease-out
  };
}
```

**3. Z-Depth Transition:**
```typescript
// Z normalisiert sich von [0.3 - 1.0] auf 1.0 während der Animation
const normalizedZ = lerp(particle.z, 1.0, progress);
```

**4. Glow-Effekt:**
```css
@keyframes particle-glow {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
  50% { box-shadow: 0 0 20px 10px rgba(255, 255, 255, 0.8); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}
```

### State-Erweiterung
```typescript
interface AmbientEffectsState {
  visualState: 'idle' | 'focus' | 'break' | 'completed' | 'converging'; // NEU
  convergenceTarget: { x: number; y: number } | null;
  convergenceProgress: number; // 0-1
}
```

## UI/UX

**Visueller Flow:**

```
[Normal Work Mode]
    ○ ○ ○ ○           ← Partikel schweben
   ○   ○   ○          ← verschiedene Z-Tiefen
  ○ ○   ○             ← Parallax-Effekt

        ↓ (3 Sekunden remaining)

[Convergence Start]
      ↘ ↓ ↙           ← Alle Partikel bewegen sich
       ↘↓↙            ← zum gleichen Punkt
        ↓

[Convergence End]
        ◉             ← Glow-Effekt
   ●●●○               ← Slot gefüllt
```

**Timing:**
- 0:03 → Convergence startet (subtle, kein abrupter Wechsel)
- 0:01 → Partikel erreichen Target
- 0:00 → Glow-Peak, dann Celebration-Screen

## Testing

### Manuell zu testen
- [ ] Volle 25-min Session laufen lassen, Convergence beobachten
- [ ] Verschiedene Anzahl Partikel auf Screen (wenige vs. viele)
- [ ] Pause während Convergence
- [ ] Tab wechseln während Convergence
- [ ] Verschiedene Viewport-Größen (mobile vs. desktop)
- [ ] Reduced Motion Präferenz respektiert?

### Performance
- [ ] FPS während Animation messen (sollte 60fps halten)
- [ ] Memory-Footprint prüfen (keine Leaks)
- [ ] Animation smooth auf Low-End Devices

## Definition of Done

- [ ] Convergence-Animation implementiert
- [ ] Synchrones Ankommen aller Partikel
- [ ] Z-Depth Normalisierung smooth
- [ ] Glow-Effekt im Target-Slot
- [ ] Pause/Resume funktioniert
- [ ] Reduced Motion: Instant-Transition statt Animation
- [ ] Keine Performance-Regression
- [ ] Lokal getestet auf Desktop & Mobile Viewport

## Notizen

**Inspiration:**
- Apple Watch Activity Rings Completion
- Duolingo Celebration Animations (aber ohne Guilt!)
- iOS App Store Download Animation (Konvergenz-Gefühl)

**Offene Fragen:**
- Sound-Effekt beim Einschlag? (evtl. separates POMO-Ticket)
- Haptic Feedback auf Mobile beim Glow?

---

## Arbeitsverlauf

### Erstellt: 2025-01-21
Idee entstanden in Diskussion: "Am Ende einer Session fliegen alle Partikel in den Container – der emotionale Payoff, der die App verkauft."
