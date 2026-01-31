---
type: story
status: backlog
priority: p1
effort: 5
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [payment, stripe, webhook]
---

# POMO-312: Payment Webhook Handler

## User Story

> Als **System**
> möchte ich **Stripe-Events zuverlässig verarbeiten**,
> damit **User-Tiers automatisch aktualisiert werden**.

## Kontext

Link zum Feature: [[features/payment-integration]]

Webhooks sind der zuverlässigste Weg, Payment-Events zu verarbeiten. Nicht auf Client-Redirects verlassen!

## Akzeptanzkriterien

- [ ] Webhook-Endpoint erstellt und in Stripe registriert
- [ ] Signature-Verification implementiert
- [ ] `checkout.session.completed` → Tier upgrade zu Flow
- [ ] `customer.subscription.deleted` → Tier downgrade zu Plus
- [ ] `invoice.payment_failed` → Grace Period starten
- [ ] `invoice.paid` → Grace Period beenden
- [ ] Idempotenz: Gleicher Event darf mehrfach kommen

## Technische Details

### Betroffene Dateien
```
src/
├── app/api/stripe/
│   └── webhook/route.ts          # NEU
└── lib/
    └── stripe-events.ts          # NEU: Event-Handler
```

### Implementierungshinweise
- Raw body für Signature-Check (kein JSON-Parse vorher)
- Stripe Webhook Secret in ENV
- Supabase-Update bei erfolgreichem Event
- Clerk Metadata sync (optional)
- Logging für Debugging

### Datenbank-Änderungen
```sql
-- User-Tabelle erweitern (falls nicht schon)
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  subscription_status TEXT DEFAULT 'none',
  subscription_id TEXT,
  stripe_customer_id TEXT,
  grace_period_until TIMESTAMPTZ;
```

### Webhook Events

| Event | Aktion |
|-------|--------|
| `checkout.session.completed` | tier → 'flow', subscription_status → 'active' |
| `customer.subscription.deleted` | tier → 'plus', subscription_status → 'canceled' |
| `invoice.payment_failed` | grace_period_until → NOW() + 7 days |
| `invoice.paid` | grace_period_until → NULL |
| `customer.subscription.updated` | Plan-Wechsel verarbeiten |

## Testing

### Manuell zu testen
- [ ] Stripe CLI: `stripe trigger checkout.session.completed`
- [ ] User-Tier wird aktualisiert
- [ ] Gleicher Event zweimal → keine Duplikate
- [ ] Ungültiger Signature → 400 Error

## Definition of Done

- [ ] Webhook-Endpoint implementiert
- [ ] Alle Events verarbeitet
- [ ] Stripe CLI Tests erfolgreich
- [ ] Webhook in Stripe Dashboard registriert
