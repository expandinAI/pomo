# POMO-091: Ambient Visual Effects

> Phase 2 - Breathing Glow, Partikel-System und State-basierte Visuals

## User Story

**Als** Benutzer in einer Focus-Session,
**möchte ich** subtile, lebendige Hintergrund-Effekte sehen,
**damit** ich visuell in einen meditativen Flow-Zustand versetzt werde.

## Kontext

Nach der Dark Foundation (POMO-090) fügen wir "lebendige" Elemente hinzu:
- Partikel, die langsam durch den Raum schweben
- Breathing-Glow, der mit dem Timer pulsiert
- Unterschiedliche Visuels je nach Session-Typ (Focus, Break, etc.)

## Acceptance Criteria

- [ ] **Breathing Glow**: Sanfter radialer Glow hinter dem Timer, pulsiert langsam (4s Zyklus)
- [ ] **Particle Field**: 15-25 kleine Punkte, die langsam aufwärts/diagonal driften
- [ ] **State Visuals**:
  - Idle: Statisch, nur Grain
  - Focus Running: Partikel aktiv, Glow pulsiert
  - Break: Wärmere Tönung, langsamere Bewegung
  - Completed: Partikel-Burst, heller Glow
- [ ] **Settings Toggle**: Benutzer können Ambient-Effekte deaktivieren
- [ ] **Smooth Transitions**: Übergänge zwischen States sind weich animiert
- [ ] **Performance**: <5% CPU bei aktiven Effekten
- [ ] **Reduced Motion**: Alle Effekte deaktiviert bei Präferenz

## Technische Details

### 1. Breathing Glow Component

```tsx
// components/effects/BreathingGlow.tsx
export function BreathingGlow({ isActive, intensity = 1 }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={isActive ? {
        opacity: [0.1, 0.2, 0.1],
        scale: [1, 1.05, 1],
      } : { opacity: 0 }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        background: `radial-gradient(
          ellipse at center,
          var(--color-accent-glow) 0%,
          transparent 60%
        )`,
      }}
    />
  );
}
```

### 2. Particle System

```tsx
// components/effects/ParticleField.tsx
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  velocity: number;
  opacity: number;
}

export function ParticleField({ count = 20, isActive = true }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Initialize particles on mount
  useEffect(() => {
    const initial = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      velocity: 0.02 + Math.random() * 0.03,
      opacity: 0.1 + Math.random() * 0.3,
    }));
    setParticles(initial);
  }, [count]);

  // Animation loop using CSS transforms only
  // ...
}
```

### 3. State-Based Visual Manager

```tsx
// components/effects/VisualStateManager.tsx
type VisualState = 'idle' | 'focus' | 'break' | 'completed';

const stateConfigs: Record<VisualState, VisualConfig> = {
  idle: {
    glowIntensity: 0,
    particlesActive: false,
    grainOpacity: 0.03,
  },
  focus: {
    glowIntensity: 0.8,
    particlesActive: true,
    grainOpacity: 0.04,
  },
  break: {
    glowIntensity: 0.4,
    particlesActive: true,
    grainOpacity: 0.03,
    tint: 'warm',
  },
  completed: {
    glowIntensity: 1,
    particlesActive: true,
    particleBurst: true,
    grainOpacity: 0.02,
  },
};
```

### 4. Particle Burst für Completion

```tsx
// Burst-Effekt bei Session-Ende
function ParticleBurst() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="absolute inset-0 pointer-events-none"
    >
      {/* 30+ particles expanding outward */}
    </motion.div>
  );
}
```

## Dateien zu ändern/erstellen

1. **Neu:** `src/components/effects/BreathingGlow.tsx`
2. **Neu:** `src/components/effects/ParticleField.tsx`
3. **Neu:** `src/components/effects/VisualStateManager.tsx`
4. **Neu:** `src/components/effects/ParticleBurst.tsx`
5. `src/app/page.tsx` - VisualStateManager integrieren
6. `src/components/timer/Timer.tsx` - Visual State an Manager übergeben
7. `src/components/settings/TimerSettings.tsx` - Toggle für Ambient-Effekte

## Performance-Optimierungen

- **CSS-only Particles**: Keine JS-Animation-Loop, nur CSS transforms
- **will-change**: Partikel haben `will-change: transform`
- **GPU Layers**: Effekte auf separaten Compositing-Layers
- **Particle Pool**: Partikel werden recycled, nicht neu erstellt
- **RAF Throttle**: Max 30fps für Particle-Updates

## Design-Mockup (ASCII)

```
┌────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░          ·              ·                         ░░ │ ← Particles
│ ░░       ·                        ·                   ░░ │
│ ░░                ·                                   ░░ │
│ ░░            ╭─────────────╮                        ░░ │ ← Glow
│ ░░           ╱               ╲     ·                  ░░ │
│ ░░          │    25 : 00     │                       ░░ │
│ ░░          │     Focus      │                       ░░ │
│ ░░           ╲               ╱                        ░░ │
│ ░░            ╰─────────────╯                        ░░ │
│ ░░     ·                          ·                   ░░ │
│ ░░                 ·                                  ░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────────────────────────────────┘
       ↑ Particles drift slowly upward/diagonal
```

## Estimation

- **Größe:** L (6-8 Stunden)
- **Risiko:** Mittel (Performance-Tuning erforderlich)

## Dependencies

- POMO-090 (Dark Foundation) muss abgeschlossen sein

## Testing

- [ ] Performance-Test: 60fps mit allen Effekten aktiv
- [ ] CPU-Monitor: <5% im Idle mit Effekten
- [ ] Mobile-Test: Partikel reduzieren auf schwächeren Geräten
- [ ] Reduced Motion: Alle Effekte deaktiviert
- [ ] Settings Toggle: Effekte können ein/ausgeschaltet werden
- [ ] State Transitions: Smooth Übergänge zwischen allen States
