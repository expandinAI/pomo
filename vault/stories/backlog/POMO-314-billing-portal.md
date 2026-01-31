---
type: story
status: backlog
priority: p2
effort: 2
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [payment, stripe, billing]
---

# POMO-314: Billing Portal Integration

## User Story

> Als **Flow-Abonnent**
> möchte ich **mein Abo selbst verwalten können**,
> damit **ich Plan wechseln, kündigen oder Rechnungen sehen kann**.

## Kontext

Link zum Feature: [[features/payment-integration]]

Stripe Billing Portal = Self-Service. Weniger Support-Tickets.

## Akzeptanzkriterien

- [ ] "Abo verwalten" Button im Account-Bereich
- [ ] Klick öffnet Stripe Billing Portal
- [ ] User kann Plan wechseln (Monthly ↔ Yearly)
- [ ] User kann kündigen
- [ ] User kann Rechnungen einsehen/downloaden
- [ ] User kann Zahlungsmethode ändern

## Technische Details

### Betroffene Dateien
```
src/
├── app/api/stripe/
│   └── create-portal-session/route.ts  # NEU
└── components/
    └── account/
        └── SubscriptionSection.tsx     # Button hinzufügen
```

### Implementierungshinweise
- Stripe Billing Portal in Dashboard konfigurieren
- Portal-Session mit customer_id erstellen
- Redirect zu Portal-URL
- Return-URL zurück zur App

### API-Änderungen
```typescript
// POST /api/stripe/create-portal-session
interface PortalSessionResponse {
  portalUrl: string;
}
```

## UI/UX

Im Account-View:
```
┌─────────────────────────────────────────┐
│ Subscription                            │
│                                         │
│ Plan: Flow (Yearly)                     │
│ Nächste Zahlung: 15. Feb 2027           │
│                                         │
│ [Abo verwalten]                         │
└─────────────────────────────────────────┘
```

## Definition of Done

- [ ] Portal-Session Endpoint implementiert
- [ ] Button im Account-Bereich
- [ ] Portal öffnet sich korrekt
- [ ] Änderungen werden via Webhook verarbeitet
