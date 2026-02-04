---
type: idea
status: validated
source: 10x-analysis
effort_guess: xl
priority: p2
created: 2026-02-03
updated: 2026-02-03
tags: [10x, teams, collaboration, body-doubling]
---

# Particle Teams — Gemeinsamer Fokus ohne Social Bloat

## Kernidee

> "Co-Focus": Zwei Menschen arbeiten gleichzeitig, sehen nur einen kleinen Indikator dass der andere auch fokussiert ist. Keine Chat, keine Ablenkung.

## Problem

- Remote-Work: Niemand sieht ob du arbeitest
- "Body Doubling" ist wissenschaftlich effektiv (besonders bei ADHD)
- Accountability ohne Gamification fehlt

## Lösung

- **Invite-System:** "Fokus mit mir" Link generieren
- **Presence Indicator:** Kleiner Punkt neben dem Timer zeigt "Partner fokussiert auch"
- **KEIN Chat:** Bewusste Entscheidung — Fokus ist heilig
- **Session-Ende:** "Ihr habt gemeinsam 2h fokussiert"
- **Optional:** Sanfter Sound wenn Partner startet/endet

## Validierung

### Markt/Bedarf
- [x] "Body Doubling" ist bekannt, besonders in ADHD-Community
- [x] Focusmate existiert (Video-Calls) — wir sind stiller
- [x] Remote-Teams suchen async Accountability

### Machbarkeit
- [ ] Realtime-Sync (WebSockets oder Supabase Realtime)
- [ ] Neue Datenmodelle (Invite, Partner-Status)
- [ ] Privacy: Nur Start/Stop teilen, keine Details
- [ ] Aufwand: Hoch, aber machbar

### Business Value
- [x] Teams-Pricing-Tier möglich
- [x] Workplace-Adoption: "Mein Team nutzt Particle"
- [x] Retention: Soziale Bindung = weniger Churn
- [ ] Risiko: "Focus is personal" Philosophie aufweichen?

## Notizen

- Anti-Social by Design: KEINE Features die ablenken
- Opt-in: Man muss aktiv jemanden einladen
- Privacy-first: Partner sieht nur "fokussiert ja/nein"
- Max 1 Partner: Kein Gruppen-Feature (zu sozial)
- Name: "Focus Partner" oder "Co-Pilot"

## Entscheidung

**Status:** `validated`

**Begründung:** Strategisch wertvoll für Teams-Pricing und Retention. Aber: Vorsichtig umsetzen, die "Focus is personal" Philosophie muss bleiben.

**Nächster Schritt:** Nach Core-Features, dann vorsichtiges MVP testen
