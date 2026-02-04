---
type: idea
status: validated
source: 10x-analysis
effort_guess: m
priority: p1
created: 2026-02-03
updated: 2026-02-03
tags: [10x, intention, daily, coach]
---

# Intent Setting — "Was ist heute dein Fokus?"

## Kernidee

> Jeden Morgen fragt Particle: "Was ist heute dein wichtigstes Ziel?" Ein Satz. Wird am Ende des Tages reflektiert.

## Problem

- Particle trackt Zeit, aber nicht WARUM du arbeitest
- Keine Verbindung zwischen Intention und Ergebnis
- Coach kann nicht auf Ziele Bezug nehmen

## Lösung

- **Morgens:** "Was ist heute dein Fokus?" (ein Textfeld)
- **Tagsüber:** Intention wird subtil angezeigt (z.B. unter Timer)
- **Abends/Coach:** "Dein Ziel war X. Du hast 4h an Y gearbeitet. Passt das?"
- **Optional:** Intention mit Projekt verknüpfen
- **History:** Vergangene Intentionen einsehbar

## Validierung

### Markt/Bedarf
- [x] "Daily Intentions" sind ein Journaling-Trend
- [x] Keine Timer-App macht das
- [x] Verbindet Produktivität mit Achtsamkeit

### Machbarkeit
- [x] Ein Textfeld + localStorage/Supabase
- [x] Coach-Prompt erweitern
- [x] Minimaler UI-Aufwand
- [x] Keine Abhängigkeiten

### Business Value
- [x] Tägliche Gewohnheit = höhere Retention
- [x] Tiefere Bedeutung pro Session
- [x] Coach wird relevanter (Kontext!)
- [x] Differenzierung von reinen Timer-Apps

## Notizen

- Nicht nerven: Wenn User schließt, nicht nochmal fragen
- Shortcut: `I` für "Set Intention"
- Placeholder-Texte rotieren:
  - "Was ist heute wichtig?"
  - "Worauf konzentrierst du dich?"
  - "Dein Fokus für heute?"
- Coach-Integration:
  - "Du wolltest 'Präsentation fertig machen'. Du hast 3h an 'Präsentation' gearbeitet. Geschafft?"

## Entscheidung

**Status:** `validated`

**Begründung:** Verwandelt Particle von Timer zu Intentions-App. Minimaler Aufwand, aber transformativ für die Bedeutung der App.

**Nächster Schritt:** UI-Design, dann Coach-Integration
