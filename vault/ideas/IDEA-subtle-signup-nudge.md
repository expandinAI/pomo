# Subtle Sign-up Nudge

**Status:** Idea
**Created:** 2025-01-31
**Tags:** conversion, onboarding, animation, growth

---

## The Concept

A **subtle, magical pulsing glow** on the ParticleMenu dot that draws attention without being annoying. Combined with **rotating messages** in the menu that speak to different motivations.

## Why It Fits Particle

| Principle | How It Aligns |
|-----------|---------------|
| Calm over Anxiety | No popups, no pressure – just a gentle invitation |
| Emotional Depth | Animation feels like magic, not marketing |
| Reduction | One subtle element, not banners or badges |
| Stolz statt Schuld | Celebrates work, doesn't threaten loss |

---

## Part 1: The Subtle Glow

### Behavior

The menu dot occasionally pulses with a soft, warm glow – like it's "breathing" or has something to share.

### Frequency Options

| Option | Frequency | Trigger | Feeling |
|--------|-----------|---------|---------|
| **Time-based** | Every 20-30 min | Random interval | Gentle reminder |
| **Milestone-based** | After 5, 10, 25 particles | Achievement | Celebratory |
| **Session-based** | Once per focus session | After completion | Contextual |
| **Hybrid** | Milestone + time cap | Smart | Balanced |

**Recommendation:** Start with **Milestone-based** (after 5, 10, 25 particles) – it ties the nudge to accomplishment, which feels celebratory rather than salesy.

### Animation Spec

```
Duration: 2-3 seconds
Easing: ease-in-out (breathing feel)
Glow color: accent color at 30% opacity
Pulse count: 2-3 gentle pulses, then stop
Cooldown: Don't repeat within 5 minutes
```

### Respects User Choice

- Once user has seen the menu (clicked on dot), reset the glow trigger
- If user signs in, never show glow again
- If user dismisses X times, reduce frequency

---

## Part 2: Rotating Messages

Instead of always showing "Protect your work", the menu cycles through different messages that speak to different motivations.

### Message Pool

| Message | Motivation | Emotion |
|---------|------------|---------|
| **Protect your work** | Safety | Security |
| **Access anywhere** | Flexibility | Freedom |
| **Never lose progress** | Safety | Relief |
| **Your work, everywhere** | Sync | Convenience |
| **Keep it safe** | Safety | Care |
| **Continue on any device** | Sync | Flexibility |

### Rotation Logic

- Random selection on each menu open
- Or: Cycle through in order
- Or: Weight by what converts best (A/B test later)

### Future Extensions

| Phase | Message Type | Example |
|-------|--------------|---------|
| Phase 1 | Sign-up focused | "Protect your work" |
| Phase 2 | Premium teaser | "Unlock deeper insights" |
| Phase 3 | Feature highlight | "Track your rhythm" |

---

## Implementation Notes

### Components Affected

- `ParticleMenu.tsx` – Add glow animation to trigger button
- `ParticleMenu.tsx` – Add message rotation for anonymous users
- New hook: `useSignupNudge.ts` – Track particles, manage glow state

### Storage

```typescript
// Track nudge state
localStorage['particle:signup-nudge-last-shown'] = timestamp
localStorage['particle:signup-nudge-dismiss-count'] = number
localStorage['particle:total-particles-anonymous'] = number
```

### Glow Animation (Framer Motion)

```tsx
<motion.div
  className="w-2 h-2 rounded-full bg-secondary"
  animate={shouldGlow ? {
    boxShadow: [
      '0 0 0 0 rgba(accent, 0)',
      '0 0 20px 4px rgba(accent, 0.3)',
      '0 0 0 0 rgba(accent, 0)',
    ],
  } : {}}
  transition={{
    duration: 2,
    repeat: 2,
    ease: 'easeInOut',
  }}
/>
```

---

## Open Questions

1. **Glow color:** Accent color? White? Something warmer?
2. **Sound:** Subtle chime when glowing? (Probably not – too intrusive)
3. **A/B testing:** How do we measure conversion impact?
4. **Dismiss behavior:** How many times before we stop showing?

---

## Success Metrics

- **Primary:** Anonymous → Signed-in conversion rate
- **Secondary:** Menu open rate for anonymous users
- **Guard:** User annoyance (measured by dismiss count, feedback)

---

## Next Steps

1. Decide on glow frequency (milestone vs time-based)
2. Finalize message pool
3. Design the glow animation in Figma/code
4. Implement as feature flag for A/B testing
