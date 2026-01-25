---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/celebration]]"
created: 2026-01-23
updated: 2026-01-25
done_date: null
tags: [celebration, animation, adhd-friendly, accessibility, p1]
---

# POMO-142: Particle Burst Animation

## User Story

> Als **Nutzer mit ADHD oder Bedarf an positiver Verstärkung**
> möchte ich **eine optionale Celebration-Animation sehen, wenn ich einen Partikel abschließe**,
> damit **ich einen Dopamin-Hit bekomme und motiviert bleibe**.

## Kontext

Link zum Feature: [[features/celebration]]

**Warum dieses Feature:**
- ADHD-Gehirne profitieren von sofortiger, visueller Belohnung
- Die Animation verstärkt das Gefühl von Accomplishment
- Opt-in statt Opt-out: Wer Reduktion will, bekommt Reduktion

**Design-Prinzip:**
> Der Particle selbst explodiert – dein gebündelter Fokus wird sichtbar als viele kleine Partikel, die sich ausbreiten.

**Kein Standard-Confetti.** Keine bunten Rechtecke von oben. Stattdessen: Weiße Partikel, die aus dem Zentrum nach außen fließen – physikalisch, smooth, on-brand.

## Akzeptanzkriterien

### Settings (Opt-in)

- [ ] **Given** Settings, **When** Celebration Section, **Then** "Celebration Animation" Toggle (default: OFF)
- [ ] **Given** Animation aktiviert, **When** Settings, **Then** Trigger-Auswahl:
  - "Bei Tagesziel" (nur wenn Daily Goal erreicht)
  - "Nach jeder Session" (jeder Work-Particle)
- [ ] **Given** Animation aktiviert, **When** Settings, **Then** Intensität-Auswahl:
  - "Subtle" (wenige Partikel, kurze Dauer)
  - "Full" (mehr Partikel, längere Dauer)

### Trigger-Logik

- [ ] **Given** Trigger = "Nach jeder Session", **When** Work-Particle abgeschlossen, **Then** Animation spielt
- [ ] **Given** Trigger = "Bei Tagesziel", **When** Daily Goal erreicht (z.B. 4/4), **Then** Animation spielt
- [ ] **Given** Session übersprungen (Skip), **When** kein natürlicher Abschluss, **Then** keine Animation
- [ ] **Given** Pause-Session endet, **When** Break vorbei, **Then** keine Animation (nur Work-Particles)

### Animation-Timing

- [ ] **Given** Session endet, **When** Particle in Counter "fällt", **Then** Animation startet exakt in diesem Moment
- [ ] **Given** Animation, **When** Particle-Position, **Then** Burst-Origin = Position des fallenden Particles

### Animation-Design

- [ ] **Given** Burst startet, **When** animiert, **Then** kleine weiße Kreise explodieren aus dem Zentrum
- [ ] **Given** Partikel, **When** Bewegung, **Then** radial nach außen mit physikalischer Verzögerung
- [ ] **Given** Partikel, **When** Bewegung, **Then** leichtes Fade-out zum Rand hin
- [ ] **Given** Animation, **When** Farbpalette, **Then** nur Weiß + optional subtle Gray (#888)
- [ ] **Given** Animation, **When** Dauer, **Then** Subtle = ~800ms, Full = ~1.5s
- [ ] **Given** Reduced Motion, **When** System-Preference, **Then** Animation = sofortiges Fade statt Burst

### Kein Sound

- [ ] **Given** Animation, **When** spielt, **Then** kein Sound (separates Feature später)

## Technische Details

### Settings-Datenmodell

```typescript
interface CelebrationSettings {
  enabled: boolean;              // Default: false
  trigger: 'daily-goal' | 'every-session';  // Default: 'every-session'
  intensity: 'subtle' | 'full'; // Default: 'subtle'
}
```

### Animation-Konzept (Framer Motion)

```typescript
interface ParticleBurstProps {
  origin: { x: number; y: number };  // Position des Particle-Counters
  intensity: 'subtle' | 'full';
  onComplete: () => void;
}

const PARTICLE_CONFIG = {
  subtle: {
    count: 12,
    duration: 0.8,
    radius: 80,
  },
  full: {
    count: 24,
    duration: 1.5,
    radius: 150,
  },
};

const ParticleBurst = ({ origin, intensity, onComplete }: ParticleBurstProps) => {
  const config = PARTICLE_CONFIG[intensity];
  const particles = Array.from({ length: config.count });

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((_, i) => {
        const angle = (i / config.count) * Math.PI * 2;
        const randomOffset = Math.random() * 0.3; // Leichte Variation

        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white"
            style={{ left: origin.x, top: origin.y }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * config.radius * (1 + randomOffset),
              y: Math.sin(angle) * config.radius * (1 + randomOffset),
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: config.duration,
              ease: [0.25, 0.46, 0.45, 0.94], // Smooth physics
              delay: i * 0.02, // Staggered start
            }}
          />
        );
      })}
    </div>
  );
};
```

### Integration mit Timer

```typescript
// In Timer.tsx oder ParticleCounter.tsx

const handleSessionComplete = () => {
  const settings = getCelebrationSettings();

  if (!settings.enabled) return;

  const shouldCelebrate =
    settings.trigger === 'every-session' ||
    (settings.trigger === 'daily-goal' && isDailyGoalJustReached());

  if (shouldCelebrate) {
    const counterPosition = getParticleCounterPosition();
    triggerParticleBurst(counterPosition, settings.intensity);
  }
};
```

### UI Mockup – Settings

```
┌─────────────────────────────────────────────┐
│  Celebration                                │
│  ───────────────────────────────────────    │
│                                             │
│  Animation                      [  OFF  ]   │
│                                             │
│  ┌─ Wenn aktiviert: ─────────────────────┐  │
│  │                                       │  │
│  │  Wann feiern?                         │  │
│  │  ○ Bei Tagesziel erreicht             │  │
│  │  ● Nach jeder Session                 │  │
│  │                                       │  │
│  │  Intensität                           │  │
│  │  ● Subtle    ○ Full                   │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ℹ️ Für ADHD-Nutzer: Visuelle Belohnung     │
│     kann die Motivation steigern.           │
└─────────────────────────────────────────────┘
```

### UI Mockup – Animation

```
Particle fällt in Counter:

       ○ ←── Particle landet
       │
       ▼
    ┌─────┐
    │  4  │ ←── Counter
    └─────┘

Burst-Moment:

         ·   ·
       ·   ○   ·
         ·   ·
    ┌─────┐
    │  4  │
    └─────┘

Partikel fließen nach außen:

     ·           ·
         ·   ·
           ○
         ·   ·
     ·           ·
    ┌─────┐
    │  4  │
    └─────┘
```

## Nicht im Scope (v1)

- Sound bei Animation (separates Feature)
- Verschiedene Animation-Styles
- Farb-Varianten
- Haptic Feedback bei Animation
- Animation bei Skip

## Accessibility

- [ ] `prefers-reduced-motion`: Fade statt Burst
- [ ] Animation blockiert keine Interaktion (pointer-events: none)
- [ ] Keine blinkenden Elemente (Epilepsie-sicher)

## Testing

### Manuell zu testen

- [ ] Animation spielt nur wenn Setting aktiviert
- [ ] Trigger "daily-goal" funktioniert korrekt
- [ ] Trigger "every-session" funktioniert korrekt
- [ ] Intensität "subtle" vs "full" sichtbar unterschiedlich
- [ ] Animation startet an korrekter Position (Particle-Counter)
- [ ] Reduced Motion wird respektiert
- [ ] Keine Performance-Probleme (60fps)
- [ ] Animation bei Skip wird NICHT gespielt

## Definition of Done

- [ ] Settings-UI implementiert (Toggle, Trigger, Intensität)
- [ ] Particle Burst Animation mit Framer Motion
- [ ] Integration mit Session-Complete Event
- [ ] Position-Sync mit Particle-Counter
- [ ] Reduced Motion Support
- [ ] Default = OFF
- [ ] Code Review abgeschlossen
