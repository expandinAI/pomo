---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [payment, tier, flow]
---

# POMO-313: Tier Upgrade Logic

## User Story

> Als **frisch bezahlter Flow-User**
> möchte ich **sofort Zugang zu allen Flow-Features haben**,
> damit **ich die Premium-Features nutzen kann**.

## Kontext

Link zum Feature: [[features/payment-integration]]

Nach Webhook muss die App den neuen Tier-Status reflektieren. Features müssen entsperrt werden.

## Akzeptanzkriterien

- [ ] App erkennt neuen Tier-Status (Polling oder Realtime)
- [ ] Year View wird entsperrt
- [ ] Alle Themes werden entsperrt
- [ ] Advanced Stats werden entsperrt
- [ ] Coach-Feature wird entsperrt (300/Monat Limit)
- [ ] UI zeigt "Flow" Badge
- [ ] Celebration-Animation bei erstem Flow-Zugang

## Technische Details

### Betroffene Dateien
```
src/
├── contexts/
│   └── UserContext.tsx           # Tier-State erweitern
├── hooks/
│   └── useFeatureAccess.ts       # NEU: Feature-Gates
├── components/
│   └── FlowCelebration.tsx       # NEU: Upgrade-Animation
```

### Implementierungshinweise
- `useFeatureAccess('yearView')` → boolean
- Supabase Realtime für Tier-Updates ODER
- Polling alle 30s nach Checkout-Redirect
- LocalStorage-Flag für "hat gerade upgraded" → Celebration

### Feature-Gates
```typescript
const FLOW_FEATURES = [
  'yearView',
  'advancedStats',
  'allThemes',
  'unlimitedPresets',
  'aiCoach',
  'export',
] as const;

function useFeatureAccess(feature: FlowFeature): boolean {
  const { tier } = useUser();
  return tier === 'flow' || tier === 'lifetime';
}
```

## UI/UX

**Celebration Animation:**
- Confetti oder Particle-Explosion
- "Welcome to Flow ✨" Message
- Kurz (2-3 Sekunden)
- Nur einmal zeigen

## Testing

### Manuell zu testen
- [ ] Nach Upgrade: Year View zugänglich
- [ ] Nach Upgrade: Alle Themes sichtbar
- [ ] Celebration-Animation spielt
- [ ] Downgrade: Features wieder gesperrt

## Definition of Done

- [ ] Feature-Gates implementiert
- [ ] Alle Flow-Features entsperrt bei tier='flow'
- [ ] Celebration-Animation
- [ ] Downgrade-Pfad getestet
