---
type: idea
status: validated
source: 10x-analysis
effort_guess: s
priority: p2
created: 2026-02-03
updated: 2026-02-03
tags: [10x, quick-win, retention, gentle]
---

# "Still There?" — Sanfter Wiedereinstieg

## Kernidee

> Wenn Pause > 30 Minuten: Sanfter Hinweis "Bereit für das nächste Partikel?" — keine Push-Notification, nur beim App-Öffnen.

## Problem

- Nach langer Pause ist Wiedereinstieg schwer
- Keine Erinnerung ohne Push-Notifications
- Push-Notifications widersprechen der Anti-Ablenkung-Philosophie

## Lösung

- **Trigger:** Letzte Session > 30 Minuten her
- **UI:** Sanfte Message beim App-Öffnen
- **Text:** "Bereit für dein nächstes Partikel?"
- **KEIN Push:** Nur in-app, wenn User selbst kommt
- **Dismiss:** Einmal X klicken, weg für heute

## Validierung

### Markt/Bedarf
- [x] Wiedereinstieg ist echtes Problem
- [x] Anti-Push-Notification Haltung ist Differenzierung
- [x] "Sanft" passt zur Philosophie

### Machbarkeit
- [x] Einfacher Zeit-Check
- [x] Ein Toast/Banner
- [x] 1 Stunde Implementierung

### Business Value
- [x] Hilft bei Retention
- [x] Zeigt "Particle kümmert sich" ohne aufdringlich zu sein
- [x] Differenzierung von aggressiven Apps

## Notizen

- Nicht nerven: Max 1x pro Session
- Timing: Nach 30min, 1h, 2h (eskaliert nicht)
- Text-Varianten:
  - "Bereit für das nächste Partikel?"
  - "Willkommen zurück. Zeit für Fokus?"
  - "Dein nächster Partikel wartet."
- Kein Schuld-Ton: Nie "Du hast lange nicht gearbeitet"

## Entscheidung

**Status:** `validated`

**Begründung:** Sanfte Retention-Hilfe ohne die Anti-Notification-Philosophie zu brechen. Nice-to-have.

**Nächster Schritt:** Nach wichtigeren Features
