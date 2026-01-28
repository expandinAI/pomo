---
type: feature
status: ready
priority: p1
effort: m
business_value: high
origin: "Marktforschung & Modi-Mapping"
stories:
  - "[[stories/backlog/POMO-161-learn-panel-ui]]"
  - "[[stories/backlog/POMO-162-rhythm-content]]"
  - "[[stories/backlog/POMO-163-smart-onboarding]]"
  - "[[stories/backlog/POMO-164-contextual-hints]]"
  - "[[stories/backlog/POMO-165-learn-command-palette]]"
  - "[[stories/backlog/POMO-166-learn-keyboard-shortcuts]]"
  - "[[stories/backlog/POMO-180-breaks-content]]"
  - "[[stories/backlog/POMO-181-science-content]]"
  - "[[stories/backlog/POMO-182-philosophy-content]]"
created: 2026-01-27
updated: 2026-01-27
tags: [education, onboarding, ux, retention]
---

# Learn Section

> *"Wissen vermitteln, ohne zu belehren. Begleiten, ohne zu stören."*

## Übersicht

Die Learn Section ist Particle's Weg, Menschen zu helfen, ihre Fokusarbeit zu verstehen – ohne die Philosophie zu brechen.

**Keine Tutorials. Keine Pop-ups. Keine Belehrung.**

Stattdessen: Ein ruhiger Raum, der da ist, wenn du ihn brauchst.

## Problem

Nutzer verstehen nicht intuitiv:
- Warum es drei verschiedene Rhythmen gibt
- Welcher Rhythmus zu ihrer Arbeitsweise passt
- Wie sie das Beste aus Particle herausholen

**Folge:** Niedrigere Retention, da Nutzer keinen persönlichen Bezug entwickeln.

## Lösung

Ein Learn-Bereich, der:
- Auf Nachfrage verfügbar ist (nicht aufdringlich)
- Im Particle-Voice erklärt (poetisch, kurz, keine Buzzwords)
- Keyboard-accessible ist (`L` für Learn)
- Dezente, kontextuelle Hinweise gibt (max. 1x/Woche)

## Positionierung

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     [📅] [📊] [📁] [🎯] [📈]   ← ActionBar  │
│                                                             │
│                         25:00                               │
│                                                             │
│  [⌘K] [?]                                     [📖] [☾] [⚙]  │
│  └─────┘                                      └───────────┘ │
│  Command + Shortcuts                    Learn + Night + Set │
└─────────────────────────────────────────────────────────────┘
```

**Position:** Unten rechts, vor Night Mode und Settings
**Layout:** `[L] [D] [⚙]` – Learn, Day/Night, Settings
**Shortcut:** `L`

## Kernfunktionen

### 1. Learn Panel
- Slide-In Panel von rechts (400px, fullscreen auf Mobile)
- Menü mit Themen: "Die drei Rhythmen", "Warum Pausen wichtig sind", "Die Wissenschaft"
- Keyboard-navigierbar

### 2. Rhythmus-Erklärungen
Jeder Rhythmus wird im Particle-Voice erklärt:

**Classic (25 Min):**
> *"Der Ursprung. Francesco Cirillo nannte es 'Pomodoro' – nach seiner Küchenuhr."*

**Deep Work (52 Min):**
> *"Die DeskTime-Studie fand heraus: Die produktivsten 10% arbeiten 52 Minuten."*

**Ultradian (90 Min):**
> *"Dein Körper folgt einem 90-Minuten-Rhythmus. Nathaniel Kleitman entdeckte ihn."*

### 3. Smart Onboarding
Eine einzige Frage beim ersten Start:

> "Wie arbeitest du am liebsten?"
> - Kurze Sprints (→ Classic 25)
> - Längere Blöcke (→ Deep Work 52)
> - Ich bin mir nicht sicher (→ Classic 25)

### 4. Contextual Hints
Dezente Hinweise basierend auf Nutzungsverhalten:

| Trigger | Hinweis |
|---------|---------|
| 3x über 25 Min gearbeitet | "Vielleicht passt der 90-Min-Rhythmus zu dir?" |
| 3x vor 25 Min abgebrochen | "Manchmal sind kürzere Einheiten besser." |
| Erste Woche vorbei | "Eine Woche Partikel. Welcher Rhythmus passt zu dir?" |

**Regeln:**
- Max. 1 Hint pro Woche
- Nie während einer Session
- Immer per `Esc` schließbar

### 5. Command Palette Integration
Learn-Inhalte sind per `⌘K` erreichbar:
- "Die drei Rhythmen" → Öffnet Learn Panel
- "Was ist 52/17?" → Zeigt Erklärung
- "Welcher Rhythmus passt zu mir?" → Startet Onboarding

## Design-Prinzipien

| Prinzip | Umsetzung |
|---------|-----------|
| Keyboard-First | `L` öffnet, `Esc` schließt, `1/2/3` wechselt |
| Nicht aufdringlich | Nur auf Nachfrage, keine Pop-ups |
| Poetisch | Kurze Sätze, Storytelling, keine Buzzwords |
| Privacy | Kein Tracking von Hint-Klicks |

## Erfolgsmetriken

| Metrik | Ziel | Messung |
|--------|------|---------|
| Rhythmus-Wechsel nach Onboarding | >30% | Aggregiert, anonym |
| Learn Section geöffnet | >10% der Nutzer | Aggregiert |
| Retention nach 7 Tagen | +5% | A/B Test |

## Abgrenzung

**Nicht Teil dieses Features:**
- Interaktive Tutorials
- Achievement-System
- Gamification
- Externe Links zu Dokumentation

## Technische Abhängigkeiten

- Command Palette (bereits implementiert)
- Preset-System (bereits implementiert)
- Local Storage für Onboarding-State

## Referenz

Detaillierte Spec: [[specs/Feature-Learn-Section.md]]

---

*Particle – Where focus becomes visible.*
