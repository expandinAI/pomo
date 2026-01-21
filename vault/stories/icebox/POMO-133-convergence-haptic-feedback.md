---
type: story
status: icebox
priority: p2
effort: 2
feature: ambient-effects
created: 2025-01-21
updated: 2025-01-21
done_date: null
tags: [haptics, mobile, celebration, emotional-design]
depends_on: [POMO-131]
---

# POMO-133: Convergence Haptic Feedback

## User Story

> Als **Mobile-Nutzer, dessen Partikel gerade konvergieren**,
> möchte ich **ein zufriedenstellendes haptisches Feedback spüren, wenn die Partikel ankommen**,
> damit **der Moment physisch erlebbar wird und sich wie eine echte Belohnung anfühlt**.

## Kontext

Abhängig von: [[POMO-131-particle-convergence-animation]]

Mobile Devices haben Haptic Engines (Taptic Engine auf iOS, Vibration API auf Android). Diese sollten den Convergence-Moment verstärken.

## Akzeptanzkriterien

- [ ] **Given** Convergence-Animation endet auf Mobile, **When** Partikel ankommen, **Then** Haptic Feedback
- [ ] **Given** Device unterstützt keine Haptics, **When** Convergence, **Then** graceful fallback (kein Error)
- [ ] **Given** User hat Haptics deaktiviert (System oder App), **When** Convergence, **Then** kein Feedback

## Haptic-Konzept

**Impact-Pattern:**
```typescript
// iOS: UIImpactFeedbackGenerator
// Web: navigator.vibrate()

// Muster: kurzer Impact beim Einschlag
vibrate('medium'); // Bestehender useHaptics Hook

// Oder: Custom Pattern für mehr "Sammeln"-Gefühl
// Leichtes Crescendo: soft → medium → soft
vibrate([10, 50, 20, 30, 10]); // ms pattern
```

**Timing:**
- Synchron mit Glow-Effekt
- Nicht vor der Animation (würde Überraschung ruinieren)

## Technische Details

- Nutzt bestehenden `useHaptics` Hook
- Respektiert System-Einstellungen
- Neues Pattern: `convergence` (neben `light`, `medium`, `heavy`, `double`)

## Notizen

- Apple Watch hat noch bessere Haptics – für zukünftige watchOS App merken
- Android Vibration API ist weniger nuanciert als iOS Taptic
