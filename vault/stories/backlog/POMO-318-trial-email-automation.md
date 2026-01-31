---
type: story
status: backlog
priority: p2
effort: 3
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [payment, email, trial]
---

# POMO-318: Trial Email Automation

## User Story

> Als **Trial-User**
> möchte ich **hilfreiche E-Mails während meines Trials bekommen**,
> damit **ich die Features kennenlerne und eine informierte Entscheidung treffe**.

## Kontext

Link zum Feature: [[features/payment-integration]]

E-Mail-Sequenz während der 14 Tage Trial. Nicht pushy, sondern hilfreich.

## Akzeptanzkriterien

- [ ] Tag 1: Willkommens-E-Mail mit Coach-Intro
- [ ] Tag 7: "Deine erste Woche" - Insights-Zusammenfassung
- [ ] Tag 12: Reminder - Trial endet in 2 Tagen
- [ ] Tag 14: Trial beendet - Upgrade-CTA
- [ ] E-Mails können in Settings deaktiviert werden
- [ ] Unsubscribe-Link in jeder E-Mail

## Technische Details

### E-Mail-Provider
- Option A: Resend (einfach, günstig)
- Option B: Supabase Edge Functions + SMTP
- Option C: Stripe Billing Emails (für Payment-relevante)

### Betroffene Dateien
```
src/
├── lib/
│   └── email/
│       ├── send.ts               # NEU: E-Mail Client
│       └── templates/
│           ├── trial-welcome.tsx # NEU
│           ├── trial-week1.tsx   # NEU
│           └── trial-ending.tsx  # NEU
└── app/api/cron/
    └── trial-emails/route.ts     # NEU: Scheduled Job
```

### E-Mail-Trigger

| Tag | Trigger | Template |
|-----|---------|----------|
| 1 | Trial Start | trial-welcome |
| 7 | Cron (trial_started_at + 7d) | trial-week1 |
| 12 | Cron (trial_started_at + 12d) | trial-ending |
| 14 | Cron (trial_started_at + 14d) | trial-ended |

### Datenbank
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  trial_started_at TIMESTAMPTZ,
  trial_emails_enabled BOOLEAN DEFAULT TRUE;
```

## E-Mail-Inhalte (Konzept)

**Tag 1: Willkommen**
- "Dein Coach ist bereit"
- Quick-Start: 3 Dinge die du ausprobieren solltest
- Link zur App

**Tag 7: Erste Woche**
- Personalisierte Insights (wenn Daten vorhanden)
- "Das hast du diese Woche geschafft"
- Highlight: Was der Coach über dich gelernt hat

**Tag 12: Reminder**
- "Dein Trial endet in 2 Tagen"
- Zusammenfassung was du verlieren würdest
- Upgrade-CTA (nicht pushy)

**Tag 14: Beendet**
- "Dein Trial ist beendet"
- Letzte Chance: Upgrade-Link
- "Du kannst weiterhin kostenlos nutzen, aber..."

## Definition of Done

- [ ] E-Mail-Provider eingerichtet
- [ ] 4 E-Mail-Templates erstellt
- [ ] Cron-Job für Scheduling
- [ ] Unsubscribe-Funktion
- [ ] E-Mails getestet (Preview)
