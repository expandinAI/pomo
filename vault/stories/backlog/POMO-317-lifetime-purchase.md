---
type: story
status: backlog
priority: p2
effort: 2
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [payment, stripe, lifetime]
---

# POMO-317: Lifetime Purchase Flow

## User Story

> Als **Free-User mit Promo-Link**
> möchte ich **Lifetime für 99€ kaufen können**,
> damit **ich einmal zahle und für immer Flow habe**.

## Kontext

Link zum Feature: [[features/payment-integration]]

Lifetime ist nur über spezielle Promo-Links verfügbar, nicht öffentlich auf der Website.

## Akzeptanzkriterien

- [ ] Promo-Link führt zu Lifetime-Checkout
- [ ] Stripe Checkout mit One-Time Payment (kein Abo)
- [ ] Nach Kauf: `is_lifetime: true` am User
- [ ] Lifetime-User haben dauerhaft Flow-Features
- [ ] Kein Ablaufdatum, kein Renewal
- [ ] Webhook verarbeitet One-Time Payment korrekt

## Technische Details

### URL-Struktur
```
/upgrade/lifetime?promo=EARLY2026
```

### Betroffene Dateien
```
src/
├── app/upgrade/lifetime/
│   └── page.tsx                  # NEU: Lifetime Landing
└── app/api/stripe/
    └── create-checkout/route.ts  # Erweitern für one-time
```

### Implementierungshinweise
- Stripe Checkout mit `mode: 'payment'` statt `subscription`
- Promo-Code validieren (optional, für Tracking)
- `is_lifetime: true` statt `subscription_id`
- Kein Grace Period nötig

### Datenbank
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  is_lifetime BOOLEAN DEFAULT FALSE;
```

## UI/UX

Lifetime Landing Page:
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    Lifetime Access                               │
│                                                                   │
│                       99€                                        │
│                    einmalig                                      │
│                                                                   │
│  Du zahlst einmal und hast für immer Zugang zu:                 │
│                                                                   │
│  ✓ AI Coach (300 Insights/Monat)                                │
│  ✓ Year View                                                     │
│  ✓ Alle zukünftigen Features                                    │
│                                                                   │
│              [Jetzt kaufen]                                      │
│                                                                   │
│         Dieses Angebot ist zeitlich begrenzt                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Definition of Done

- [ ] Lifetime-Produkt in Stripe angelegt
- [ ] Landing Page implementiert
- [ ] One-Time Checkout funktioniert
- [ ] Webhook verarbeitet Lifetime korrekt
- [ ] is_lifetime Flag gesetzt nach Kauf
