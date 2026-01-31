---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [payment, stripe, checkout]
---

# POMO-311: Stripe Setup & Checkout

## User Story

> Als **Flow-Interessent**
> möchte ich **einfach auf "Upgrade" klicken und bezahlen können**,
> damit **ich sofort Zugang zu Flow-Features bekomme**.

## Kontext

Link zum Feature: [[features/payment-integration]]

Stripe Checkout (hosted) als einfachste Lösung. Kein Custom Payment Form nötig.

## Akzeptanzkriterien

- [ ] Stripe Account konfiguriert (Test + Live Keys)
- [ ] Produkte in Stripe angelegt (Flow Monthly 4,99€, Flow Yearly 39€)
- [ ] Checkout-Session kann erstellt werden
- [ ] User wird zu Stripe Checkout weitergeleitet
- [ ] Nach erfolgreicher Zahlung: Redirect zurück zur App
- [ ] Stripe Customer ID wird am User gespeichert

## Technische Details

### Betroffene Dateien
```
src/
├── app/api/stripe/
│   └── create-checkout/route.ts  # NEU
├── lib/
│   └── stripe.ts                 # NEU: Stripe Client
└── .env.local                    # Stripe Keys
```

### Implementierungshinweise
- `stripe` npm Package installieren
- Stripe Client als Singleton
- Checkout-Session mit `mode: 'subscription'`
- `success_url` und `cancel_url` konfigurieren
- Customer-ID aus Clerk-Metadata oder neu erstellen

### API-Änderungen
```typescript
// POST /api/stripe/create-checkout
interface CreateCheckoutRequest {
  priceId: string; // 'price_monthly' | 'price_yearly'
}

interface CreateCheckoutResponse {
  checkoutUrl: string;
}
```

## Testing

### Manuell zu testen
- [ ] Klick auf "Upgrade" → Stripe Checkout öffnet sich
- [ ] Test-Kreditkarte funktioniert (4242...)
- [ ] Nach Zahlung: Redirect zurück zur App
- [ ] Cancel: Redirect zurück ohne Änderung

## Definition of Done

- [ ] Stripe Account eingerichtet
- [ ] API-Endpoint implementiert
- [ ] Lokal mit Test-Keys getestet
- [ ] Dokumentation für Stripe-Setup

---

## Notizen

Stripe Test-Karten: https://stripe.com/docs/testing
