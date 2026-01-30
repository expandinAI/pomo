---
type: feature
status: draft
priority: p1
effort: m
business_value: critical
origin: "Monetization Strategy"
decisions:
  - "[[decisions/ADR-001-multi-platform-architecture]]"
depends_on:
  - "[[features/cloud-sync-accounts]]"
stories: []
created: 2026-01-28
updated: 2026-01-28
tags: [monetization, payment, stripe, p1]
---

# Payment Integration

## Zusammenfassung

> Stripe-Integration für Particle Flow Subscriptions. Nutzer können nach dem 14-Tage-Trial ein Abo abschließen (monatlich oder jährlich).

## Kontext & Problem

Nach dem Trial brauchen Nutzer eine Möglichkeit, für Particle Flow zu bezahlen. Ohne Payment kein Revenue.

## Bekannte Anforderungen

### Preismodell (vorläufig)

| Plan | Preis | Billing |
|------|-------|---------|
| Monatlich | 9€/Monat | Monatlich |
| Jährlich | 79€/Jahr | Jährlich (spart ~27%) |

### Muss erreicht werden

- [ ] Stripe Checkout für Subscription
- [ ] Webhook-Handler für Payment Events
- [ ] Tier-Upgrade nach erfolgreichem Payment
- [ ] Subscription-Management (kündigen, Plan wechseln)
- [ ] Rechnungen/Invoices zugänglich machen

### Sollte erreicht werden

- [ ] Apple In-App Purchase für iOS App (später)
- [ ] Promo Codes / Discounts
- [ ] Team/Family Plans (viel später)

### Nicht im Scope

- Einmalzahlungen
- Lifetime Deals (vorerst)
- Crypto/Alternative Payments

## Technische Überlegungen

### Tech Stack

- **Stripe** für Web-Payments
- **Stripe Billing Portal** für Self-Service
- **Supabase Edge Functions** für Webhooks

### Architektur-Skizze

```
User klickt "Upgrade"
        │
        ▼
┌─────────────────┐
│ Stripe Checkout │
│    (Hosted)     │
└─────────────────┘
        │
        ▼ (Webhook)
┌─────────────────┐
│ Supabase Edge   │
│   Function      │
│                 │
│ - Verify Event  │
│ - Update User   │
│ - Sync to Clerk │
└─────────────────┘
        │
        ▼
User hat Particle Flow
```

### Webhook Events

| Event | Aktion |
|-------|--------|
| `checkout.session.completed` | Tier → Flow |
| `customer.subscription.deleted` | Tier → Plus |
| `invoice.payment_failed` | Email senden, Grace Period |
| `customer.subscription.updated` | Plan-Wechsel verarbeiten |

## Offene Fragen

- [ ] Genaue Preise festlegen
- [ ] Grace Period bei fehlgeschlagener Zahlung?
- [ ] Refund Policy?
- [ ] Wie mit Apple 30% Cut umgehen? (für iOS)

## Abhängigkeiten

- **Cloud Sync & Accounts** muss fertig sein
- Stripe Account muss eingerichtet werden
- AGB / Datenschutz für Zahlungen

## Grobe Aufwandsschätzung

~13-18 Story Points (nach genauerer Spezifikation)

## Notizen

Stripe Checkout (hosted) ist der einfachste Weg. Kein Custom Payment Form nötig. Später kann Stripe Elements für bessere UX evaluiert werden.
