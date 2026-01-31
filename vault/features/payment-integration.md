---
type: feature
status: refined
priority: p1
effort: m
business_value: critical
origin: "Monetization Strategy"
decisions:
  - "[[decisions/ADR-001-multi-platform-architecture]]"
depends_on:
  - "[[features/cloud-sync-accounts]]"
stories:
  - "[[stories/backlog/POMO-311-stripe-setup-checkout]]"
  - "[[stories/backlog/POMO-312-payment-webhook-handler]]"
  - "[[stories/backlog/POMO-313-tier-upgrade-logic]]"
  - "[[stories/backlog/POMO-314-billing-portal]]"
  - "[[stories/backlog/POMO-315-ai-query-counter]]"
  - "[[stories/backlog/POMO-316-upgrade-modal]]"
  - "[[stories/backlog/POMO-317-lifetime-purchase]]"
  - "[[stories/backlog/POMO-318-trial-email-automation]]"
created: 2026-01-28
updated: 2026-01-31
tags: [monetization, payment, stripe, ai-coach, p1]
---

# Payment Integration

## Zusammenfassung

> Stripe-Integration für Particle Flow Subscriptions mit AI Coach. Nutzer können nach dem 14-Tage-Trial ein Abo abschließen (monatlich, jährlich, oder Lifetime bei Special Promotions).

## Kontext & Problem

Nach dem Trial brauchen Nutzer eine Möglichkeit, für Particle Flow zu bezahlen. Flow enthält ab Launch den AI Coach - das zentrale Differenzierungsmerkmal.

---

## Preisstruktur (ENTSCHIEDEN)

### Tiers

| Tier | Preis | AI Coach | AI-Limit |
|------|-------|----------|----------|
| **Free** | 0€ | ❌ | — |
| **Plus** | 0€ (Account) | ❌ | — |
| **Flow Monthly** | 4,99€/Monat | ✅ | 300/Monat |
| **Flow Yearly** | 39€/Jahr | ✅ | 300/Monat |
| **Flow Lifetime** | 99€ | ✅ | 300/Monat |

### Preisphilosophie

- **4,99€/Monat** = Unter 5€ Schmerzgrenze, Impulskauf-freundlich
- **39€/Jahr** = 35% Ersparnis vs. monatlich, unter 40€ Psychologie-Grenze
- **99€ Lifetime** = 2,5× Jahrespreis, nur bei Special Promotions

### Lifetime-Strategie

- **Nicht öffentlich verfügbar** auf der Website
- Per E-Mail an Free-Nutzer während Special Promotions
- Immer zeitlich begrenzt (z.B. "Nur diese Woche")
- Erzeugt Urgency ohne dauerhaft Marge zu verschenken

---

## AI Coach in Flow

### Was der Coach kann

- Analyse von Arbeitsmustern (Tasks, Dauer, Pausen)
- Proaktive Hinweise ("Du machst weniger Pausen als letzte Woche")
- Insights über Mental Load und Effizienz
- Export von Arbeitsdaten für Abrechnungen

### Technische Umsetzung

| Aspekt | Entscheidung |
|--------|--------------|
| **Modell** | Claude Haiku (reicht für qualitative Fragen) |
| **Limit** | 300 Anfragen/Monat (flexibel, nicht täglich) |
| **Kosten** | ~$0.002/Anfrage = max. $7.20/Jahr bei Heavy Use |

### Kostenrechnung

```
Worst Case (300 Anfragen jeden Monat):
- AI-Kosten: ~6,50€/Jahr

Flow Yearly (39€/Jahr):
  39€ - 6,50€ AI - 1,17€ Stripe = 31,33€ Marge (80%) ✅

Flow Lifetime (99€, 5 Jahre Heavy Use):
  99€ - 32,50€ AI - 2,97€ Stripe = 63,53€ Marge (64%) ✅
```

### Zukünftiger Upgrade-Path

Falls Heavy User mehr brauchen:

| Add-on | Preis | Was |
|--------|-------|-----|
| **Coach Pro** | +2,99€/Monat | 1000/Monat + besseres Modell |
| **Coach Unlimited** | +9,99€/Monat | Unbegrenzt + Priority |

---

## Trial & Grace Period

| Aspekt | Entscheidung |
|--------|--------------|
| **Trial-Länge** | 14 Tage |
| **Grace Period** | 7 Tage bei fehlgeschlagener Zahlung |
| **Nach Grace** | Downgrade zu Plus (behält Sync) |

### Trial-Kommunikation

- Tag 1: Willkommen, Coach-Feature erklären
- Tag 7: "Deine erste Woche" Insights-Mail
- Tag 12: Erinnerung, Trial endet bald
- Tag 14: Trial beendet, Upgrade-CTA

---

## Refund Policy

**30 Tage no-questions-asked**

- Premium-Feel, reduziert Kaufangst
- Bei Lifetime: Anteilige Rückerstattung nach 30 Tagen
- Passt zur "Calm, no anxiety"-Philosophie

---

## Technische Anforderungen

### Muss erreicht werden (MVP)

- [ ] Stripe Checkout für Subscription (Monthly/Yearly)
- [ ] Webhook-Handler für Payment Events
- [ ] Tier-Upgrade nach erfolgreichem Payment
- [ ] Subscription-Management (kündigen, Plan wechseln)
- [ ] Rechnungen/Invoices via Stripe Billing Portal
- [ ] AI-Query-Counter (300/Monat tracken)
- [ ] Limit-Reached UI ("Du hast diesen Monat 300 Anfragen genutzt")

### Sollte erreicht werden

- [ ] Lifetime-Purchase Flow (separater Checkout)
- [ ] Promo Codes / Discounts für Lifetime-Aktionen
- [ ] Upgrade-Mail-Automation (Trial-Reminders)

### Nicht im Scope

- Apple In-App Purchase (später, für iOS App)
- Einmalzahlungen außer Lifetime
- Crypto/Alternative Payments
- Team/Family Plans

---

## Technische Architektur

### Flow: Subscription Purchase

```
User klickt "Upgrade to Flow"
        │
        ▼
┌─────────────────┐
│ Stripe Checkout │
│    (Hosted)     │
│                 │
│ - Monthly: 4,99€│
│ - Yearly: 39€   │
└─────────────────┘
        │
        ▼ (Webhook: checkout.session.completed)
┌─────────────────┐
│ Supabase Edge   │
│   Function      │
│                 │
│ - Verify Event  │
│ - Update User   │
│   tier → 'flow' │
│ - Reset AI      │
│   counter       │
└─────────────────┘
        │
        ▼
User hat Particle Flow + Coach
```

### Flow: Lifetime Purchase (Promo)

```
User erhält Promo-Mail
        │
        ▼
Klickt Link mit Promo-Code
        │
        ▼
┌─────────────────┐
│ Stripe Checkout │
│  (One-time)     │
│                 │
│ - 99€ Lifetime  │
│ - Promo applied │
└─────────────────┘
        │
        ▼ (Webhook: checkout.session.completed)
┌─────────────────┐
│ Supabase Edge   │
│   Function      │
│                 │
│ - Verify Event  │
│ - Update User   │
│   tier → 'flow' │
│   lifetime: true│
└─────────────────┘
```

### Webhook Events

| Event | Aktion |
|-------|--------|
| `checkout.session.completed` | Tier → Flow, AI-Counter reset |
| `customer.subscription.deleted` | Tier → Plus |
| `invoice.payment_failed` | Grace Period starten, E-Mail senden |
| `customer.subscription.updated` | Plan-Wechsel verarbeiten |
| `invoice.paid` | Grace Period beenden |

---

## Datenmodell-Erweiterung

```sql
-- Erweiterung der users Tabelle
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  stripe_customer_id TEXT,
  subscription_id TEXT,
  subscription_status TEXT, -- 'active', 'past_due', 'canceled'
  is_lifetime BOOLEAN DEFAULT FALSE,
  ai_queries_this_month INTEGER DEFAULT 0,
  ai_queries_reset_at TIMESTAMPTZ;

-- Index für Billing-Queries
CREATE INDEX idx_users_stripe ON users(stripe_customer_id);
```

---

## UI-Komponenten

### Upgrade-Modal

```
┌─────────────────────────────────────────────────────────┐
│                    Upgrade to Flow                       │
│                                                          │
│  ┌─────────────────┐    ┌─────────────────┐             │
│  │    Monthly      │    │     Yearly      │             │
│  │                 │    │                 │             │
│  │    4,99€        │    │      39€        │             │
│  │    /month       │    │      /year      │             │
│  │                 │    │   Save 35%      │             │
│  └─────────────────┘    └─────────────────┘             │
│                                                          │
│  ✓ AI Coach (300 insights/month)                        │
│  ✓ Year View                                             │
│  ✓ Advanced Statistics                                   │
│  ✓ All Themes                                            │
│  ✓ Unlimited Presets                                     │
│                                                          │
│           [ Start 14-day free trial ]                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### AI-Limit-Anzeige (im Coach)

```
┌──────────────────────────────────────┐
│  Coach                    247/300    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░     │
│  Resets in 12 days                   │
└──────────────────────────────────────┘
```

---

## Abhängigkeiten

- [x] **Cloud Sync & Accounts** (POMO-300-306)
- [ ] **Trial Management** (POMO-307)
- [ ] Stripe Account einrichten
- [ ] AGB / Datenschutz für Zahlungen aktualisieren
- [ ] AI Coach Feature spezifizieren (separates Feature-Doc)

---

## Offene Punkte

- [ ] AI Coach Feature-Spec erstellen
- [ ] Stripe Account Setup
- [ ] E-Mail-Templates für Trial/Payment
- [ ] Legal: AGB-Update für Subscriptions

---

## Grobe Aufwandsschätzung

| Bereich | Story Points |
|---------|--------------|
| Stripe Setup & Checkout | 3 |
| Webhook Handler | 5 |
| Tier-Upgrade Logic | 3 |
| Billing Portal Integration | 2 |
| AI-Counter & Limits | 3 |
| Upgrade UI | 3 |
| Lifetime Flow | 2 |
| E-Mail Automation | 3 |
| **Total** | **~24 SP** |

---

*Zuletzt aktualisiert: 2026-01-31*
