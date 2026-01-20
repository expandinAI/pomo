# POMO-090: Immersive Dark Foundation

> Phase 1 des visuellen Overhauls - Dark-first Design mit Premium-Typografie

## User Story

**Als** Benutzer, der sich auf Deep Work konzentrieren möchte,
**möchte ich** eine visuell immersive, dunkle Oberfläche,
**damit** die App mich in einen fokussierten Zustand versetzt, bevor ich überhaupt beginne.

## Kontext

Die aktuelle App hat:
- Helle Standardfarben (Light Mode dominant)
- Timer-Kreis-Hintergrund, der das minimalistische Design bricht
- Typografie-Probleme: Doppelpunkt ist nicht vertikal zentriert
- Zu graue Dunkeltöne (#0D0D0D statt #000000)

Ziel: Endel/Linear-inspirierte, kompromisslos dunkle Ästhetik.

## Acceptance Criteria

- [ ] **Pure Black Background**: Hintergrund ist `#000000`, nicht grau
- [ ] **Noise/Grain Overlay**: Subtile Film-Grain-Textur über dem Hintergrund (3-5% Opacity)
- [ ] **Timer ohne Kreis**: Timer-Display ohne kreisförmigen Hintergrund, schwebt frei
- [ ] **Colon-Fix**: Doppelpunkt im Timer ist vertikal perfekt zentriert
- [ ] **Font-Weight erhöht**: Timer-Font ist 500-600 statt 400
- [ ] **Vignette**: Subtile radiale Vignette, die Aufmerksamkeit zur Mitte lenkt
- [ ] **Aktualisierte Farbtokens**: Alle Dark-Mode-Farben auf tiefere Werte
- [ ] **Light Mode entfernt oder sekundär**: Dark Mode ist Standard
- [ ] **Performance**: Keine Framerate-Einbrüche, Lighthouse 95+
- [ ] **Reduced Motion**: Grain/Effekte werden bei `prefers-reduced-motion` deaktiviert

## Technische Details

### 1. Neue Farbpalette (globals.css)

```css
:root, .dark {
  --color-background: #000000;
  --color-background-elevated: #080808;
  --color-surface: #0C0C0C;
  --color-surface-hover: #141414;
  --color-border: #1A1A1A;
  --color-border-subtle: #111111;
  --color-text-primary: #FAFAFA;
  --color-text-secondary: #808080;
  --color-text-tertiary: #4A4A4A;
  --color-accent: #4F6EF7;
  --color-accent-glow: rgba(79, 110, 247, 0.2);
}
```

### 2. Noise/Grain Component

```tsx
// components/effects/NoiseOverlay.tsx
export function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,...")`, // SVG noise
        opacity: 0.04,
        mixBlendMode: 'overlay',
      }}
    />
  );
}
```

### 3. Timer Colon Fix

Zwei Optionen:
1. **CSS Fix**: Eigene Breite/Alignment für Colon
2. **Custom Colon**: Zwei gestapelte Punkte statt Zeichen

```tsx
// Option 2: Custom Colon
function TimerColon() {
  return (
    <span className="flex flex-col items-center justify-center gap-3 mx-2 h-full">
      <span className="w-2 h-2 rounded-full bg-current" />
      <span className="w-2 h-2 rounded-full bg-current" />
    </span>
  );
}
```

### 4. Vignette CSS

```css
.vignette {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
}
```

### 5. Timer ohne Kreis

```tsx
// TimerDisplay.tsx - Kreis entfernen
<div className="relative flex flex-col items-center justify-center">
  {/* Kein bg-surface mehr, nur Timer */}
  <motion.div className="timer-display ...">
    {/* Timer content */}
  </motion.div>
</div>
```

## Dateien zu ändern

1. `src/app/globals.css` - Farbpalette
2. `src/app/layout.tsx` - Dark Mode als Standard, Noise-Overlay einbinden
3. `src/components/timer/TimerDisplay.tsx` - Kreis entfernen, Colon fixen
4. `src/styles/design-tokens.ts` - Aktualisierte Werte
5. `tailwind.config.js` - Neue Farbwerte
6. **Neu:** `src/components/effects/NoiseOverlay.tsx`
7. **Neu:** `src/components/effects/Vignette.tsx`

## Design-Mockup (ASCII)

```
┌────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← Subtle grain
│ ░░                                               [⚙] [?] ░░ │
│ ░░                                                       ░░ │
│ ░░                                                       ░░ │
│ ░░                                                       ░░ │
│ ░░                     25 : 00                          ░░ │ ← Floating, no circle
│ ░░                      Focus                           ░░ │
│ ░░                                                       ░░ │
│ ░░                    [  ▶  ]                           ░░ │
│ ░░                                                       ░░ │
│ ░░                                                       ░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Vignette edges
└────────────────────────────────────────────────────────────┘
```

## Nicht in Scope

- Partikel-System (Phase 2)
- Breathing-Glow-Effekte (Phase 2)
- State-basierte visuelle Übergänge (Phase 2)
- WebGL/3D-Shader (Phase 3)

## Estimation

- **Größe:** M (4-6 Stunden)
- **Risiko:** Niedrig (rein visuell, keine Logik-Änderungen)

## Dependencies

- Keine externen Dependencies
- Framer Motion bereits vorhanden

## Testing

- [ ] Visueller Test: Dark Background überall
- [ ] Performance: 60fps bei Grain-Animation
- [ ] Accessibility: Kontrastverhältnis prüfen
- [ ] Mobile: Grain-Performance auf Mobilgeräten
- [ ] Reduced Motion: Alle Effekte respektieren Präferenz

## Referenzen

- Feature-Spec: `vault/features/immersive-visual-experience.md`
- Inspiration: [Endel](https://endel.io), [Linear](https://linear.app)
