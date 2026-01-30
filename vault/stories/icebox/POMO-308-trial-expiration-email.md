---
type: story
status: icebox
priority: p3
effort: 2
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-30
updated: 2026-01-30
done_date: null
tags: [trial, email, notifications, flow]
---

# POMO-308: Trial Expiration Email Reminder

## User Story

> Als **Flow-Trial Nutzer**
> möchte ich **3 Tage vor Ablauf meines Trials eine Email erhalten**,
> damit **ich rechtzeitig entscheiden kann, ob ich upgraden möchte**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

**Voraussetzungen:**
- POMO-307 (Trial Management) ✅

## Akzeptanzkriterien

- [ ] Email wird 3 Tage vor Trial-Ablauf gesendet
- [ ] Email enthält: verbleibende Tage, Feature-Highlights, Upgrade-Link
- [ ] Email wird nur einmal pro Trial gesendet
- [ ] Tracking: `trial_reminder_sent_at` Spalte in users Tabelle

## Technische Details

### Option A: Vercel Cron Job (Empfohlen)
- Täglicher Cron der `trial_ends_at` prüft
- Findet User mit `trial_ends_at` in 3 Tagen
- Sendet Email via Resend/SendGrid

### Option B: Supabase Edge Function
- Scheduled Function in Supabase
- Direkter DB-Zugriff ohne API

### Email Service
- Resend (einfach, günstig)
- SendGrid (mehr Features)
- Postmark (hohe Deliverability)

## Design

Email sollte dem Particle-Stil folgen:
- Minimalistisch, schwarz-weiß
- Ein klarer CTA: "Upgrade to Flow"
- Feature-Reminder (Year View, Advanced Stats, etc.)

## Nicht im Scope

- Marketing-Emails
- Newsletter
- Mehrere Reminder-Emails
