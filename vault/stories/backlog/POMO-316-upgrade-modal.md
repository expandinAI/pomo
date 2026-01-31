---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [payment, ui, upgrade]
---

# POMO-316: Upgrade UI Modal

## User Story

> Als **Plus-User**
> möchte ich **ein überzeugendes Upgrade-Angebot sehen**,
> damit **ich verstehe was Flow bietet und einfach upgraden kann**.

## Kontext

Link zum Feature: [[features/payment-integration]]

Das Upgrade-Modal ist der wichtigste Conversion-Point. Muss überzeugend aber nicht pushy sein.

## Akzeptanzkriterien

- [ ] Modal zeigt Monthly und Yearly Optionen
- [ ] Yearly zeigt Ersparnis ("Spare 35%")
- [ ] Feature-Liste ist klar und überzeugend
- [ ] AI Coach wird prominent hervorgehoben
- [ ] "14 Tage kostenlos testen" CTA
- [ ] Modal öffnet sich bei Klick auf gesperrte Features
- [ ] Keyboard: Escape schließt

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── upgrade/
│       ├── UpgradeModal.tsx      # NEU
│       └── PricingCard.tsx       # NEU
└── hooks/
    └── useUpgradeModal.ts        # NEU: Modal-State
```

## UI/UX

```
┌─────────────────────────────────────────────────────────────────┐
│                                                           [×]    │
│                                                                   │
│                      Upgrade to Flow                             │
│                                                                   │
│  ┌─────────────────────┐    ┌─────────────────────┐             │
│  │      Monthly        │    │       Yearly        │             │
│  │                     │    │                     │             │
│  │       4,99€         │    │        39€          │             │
│  │      /Monat         │    │       /Jahr         │             │
│  │                     │    │    ┌──────────┐    │             │
│  │                     │    │    │ Spare 35%│    │             │
│  │                     │    │    └──────────┘    │             │
│  │   [Auswählen]       │    │   [Auswählen]      │             │
│  └─────────────────────┘    └─────────────────────┘             │
│                                                                   │
│  ✓ AI Coach - Dein persönlicher Produktivitäts-Coach            │
│  ✓ Year View - Dein Jahr auf einen Blick                        │
│  ✓ Advanced Statistics - Tiefe Einblicke                        │
│  ✓ Alle Themes                                                   │
│  ✓ Unbegrenzte Presets                                          │
│  ✓ Export für Abrechnungen                                       │
│                                                                   │
│              14 Tage kostenlos testen                            │
│         Jederzeit kündbar · Keine versteckten Kosten            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Trigger-Punkte

| Trigger | Verhalten |
|---------|-----------|
| Klick auf Year View (Plus) | Modal öffnet sich |
| Klick auf gesperrtes Theme | Modal öffnet sich |
| "Upgrade" im Account-Menü | Modal öffnet sich |
| Trial abgelaufen | Modal öffnet sich automatisch |

## Definition of Done

- [ ] Modal-Komponente implementiert
- [ ] Beide Pricing-Optionen dargestellt
- [ ] Checkout-Integration (ruft POMO-311 auf)
- [ ] Alle Trigger-Punkte implementiert
- [ ] Responsive (Mobile + Desktop)
- [ ] Keyboard-Accessible
