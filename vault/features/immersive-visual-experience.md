# Feature: Immersive Visual Experience

> Endel-inspired, dark-first visual overhaul with generative backgrounds and premium typography

## Vision

Transform Particle from a functional timer into a **visual sanctuary** - a calming, immersive experience that helps users enter a focused state before they even start working. Inspired by [Endel](https://endel.io)'s generative visuals and [Linear](https://linear.app)'s minimal dark aesthetic.

## Design Philosophy

1. **Dark by Default** - Pure black (#000000) as canvas, not dark gray
2. **Generative & Living** - Subtle particle systems, noise textures, breathing animations
3. **Monochrome + One Accent** - Black, white, grays, and minimal blue highlights
4. **Typography as Art** - Timer display as hero element with perfect alignment
5. **Depth through Subtlety** - Grain overlays, soft glows, layered shadows

## Visual Components

### 1. Background Layer
- **Pure Black Canvas** (#000000)
- **Animated Grain/Noise Overlay** - Subtle film grain effect for depth (opacity: 3-5%)
- **Radial Gradient Vignette** - Darkens edges, focuses attention on center
- **Optional: Particle Field** - Slow-moving dots that react to timer state

### 2. Timer Display (Hero)
**Problems to Fix:**
- Colon alignment issue (currently using 0.3em width, visually off-center)
- Font weight feels too light for hero element
- Circle background breaks the minimal aesthetic

**New Design:**
```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│              25 : 00                        │  ← Large, weighted mono font
│              Focus                          │  ← Subtle label below
│                                             │
│          ─────────────────                  │  ← Minimal progress indicator
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

**Typography Fixes:**
- Use true monospace with tabular figures
- Fixed-width colon with proper vertical centering
- Font weight: 500-600 for better presence
- Letter-spacing: -0.03em for tighter kerning
- Size: 120px+ on desktop

### 3. Progress Indicator
**Current:** Circular pulse effect
**New Options:**
- **Linear Bar** - Thin line below timer that fills/empties
- **Arc Progress** - Subtle arc around timer (270° start)
- **Glow Intensity** - Background glow that intensifies as session progresses

### 4. Ambient Effects (During Focus)
- **Breathing Glow** - Soft radial glow that pulses slowly (4s cycle)
- **Particle Drift** - Tiny white dots slowly floating upward
- **Edge Vignette Pulse** - Subtle darkening/lightening of corners

### 5. State-Based Visuals
| State | Background | Timer | Accent |
|-------|-----------|-------|--------|
| Idle | Static grain | Bright white | Minimal |
| Focus Running | Particles active | Slight glow | Pulsing |
| Break | Warmer grain tint | Relaxed weight | Soft |
| Completed | Burst particles | Celebration glow | Bright |

## Typography System

### Timer Font Options
1. **JetBrains Mono** (current) - Good, but needs adjustment
2. **Space Mono** - More character, wider glyphs
3. **IBM Plex Mono** - Professional, excellent colon
4. **Custom Numerals** - Consider using `font-feature-settings: 'ss01'` variants

### Colon Fix
```css
.timer-colon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.4em;
  margin: 0 0.05em;
  font-feature-settings: 'cv01', 'cv02'; /* Use alternate colon if available */
}
```

Or use a custom colon:
```jsx
// Replace ":" with styled dots
<span className="colon flex flex-col gap-2 mx-1">
  <span className="w-2 h-2 rounded-full bg-current opacity-80" />
  <span className="w-2 h-2 rounded-full bg-current opacity-80" />
</span>
```

## Technical Implementation

### 1. Noise/Grain Shader
```jsx
// Canvas-based noise overlay
function NoiseCanvas() {
  // Generate animated noise texture
  // 60fps with requestAnimationFrame
  // Subtle opacity: 0.03-0.05
}
```

### 2. Particle System
```jsx
// Simple particle system with Framer Motion
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocity: { x: number; y: number };
}
```

### 3. CSS Custom Properties Update
```css
:root {
  --color-background: #000000;
  --color-surface: #0A0A0A;
  --color-border: #1A1A1A;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #888888;
  --color-text-tertiary: #444444;
  --color-accent: #4F6EF7;

  /* New tokens */
  --noise-opacity: 0.04;
  --glow-color: rgba(79, 110, 247, 0.15);
  --particle-color: rgba(255, 255, 255, 0.3);
}
```

## Implementation Phases

### Phase 1: Foundation (POMO-090)
- [ ] Switch to pure black background (#000000)
- [ ] Add static noise/grain texture overlay
- [ ] Fix timer typography (colon alignment, font weight)
- [ ] Update color tokens for darker palette
- [ ] Remove circular timer background

### Phase 2: Ambient Effects (POMO-091)
- [ ] Add breathing glow effect
- [ ] Implement subtle vignette
- [ ] Add particle system (opt-in via settings)
- [ ] Implement state-based visual transitions

### Phase 3: Polish (POMO-092)
- [ ] GPU-accelerated noise shader
- [ ] Performance optimization
- [ ] Reduced motion alternatives
- [ ] Mobile-specific adjustments

## Performance Considerations

- Noise texture: Pre-generated canvas, not real-time
- Particles: Limit to 20-30 max, use CSS transforms
- Respect `prefers-reduced-motion`: Disable all ambient effects
- Target: 60fps on mid-range devices, <5% CPU idle

## Inspiration Sources

- [Endel](https://endel.io) - Generative visuals, dark UI
- [Linear](https://linear.app) - Minimal dark aesthetic
- [Pitch](https://pitch.com) - Subtle animations
- [Vercel Dashboard](https://vercel.com) - Dark mode done right
- [Raycast](https://raycast.com) - Monochrome + accent

## Accessibility

- Maintain WCAG AA contrast (4.5:1 minimum)
- All effects respect `prefers-reduced-motion`
- Focus indicators remain visible
- Screen reader announcements unchanged

## Success Metrics

- Users spend more time on the app (engagement)
- Positive feedback on visual design
- No performance degradation (Lighthouse 95+)
- Reduced eye strain in dark environments
