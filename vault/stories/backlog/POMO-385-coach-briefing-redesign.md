# POMO-385: Coach Briefing Redesign — Unified, Compact, Beautiful

**Status:** Backlog
**Priority:** High
**Epic:** AI Coach UX
**Estimated Effort:** M (1-2 Tage)

---

## Problem

Der Coach-View zeigt aktuell **drei separate Informationsblöcke** übereinander gestapelt:

1. **Weekly Narrative** — 3-Satz-Zusammenfassung der Woche + Statistik-Zeile
2. **Particle of the Week** — Golden-Karte mit 3-teiliger Erzählung + Session-Info-Box
3. **Insight Card** — KI-generierte Empfehlung mit Titel, Text und Highlights

### Kernprobleme

| Problem | Auswirkung |
|---------|------------|
| **~400-500px vertikaler Raum** | User muss scrollen, bevor er zum Chat kommt |
| **Drei Karten sehen zu ähnlich aus** | Nicht sofort klar, was welche Karte bedeutet |
| **Informationsdichte zu hoch** | 3 Textblöcke hintereinander = cognitive overload |
| **Kein visuelles Hierarchy** | Alle drei Blöcke haben gleiches visuelles Gewicht |
| **Wirkt unfertig** | Statt "polished product" wirkt es wie "Feature-Sammlung" |

### Ziel

Eine **einheitliche, kompakte Coach-Briefing-Fläche**, die:
- Alle drei Informationen auf einen Blick erfassbar macht
- Sofort klar kommuniziert, was was ist
- Maximal ~150-200px vertikalen Raum einnimmt
- Elegant und premium aussieht (Apple Design Award worthy)
- Den Chat als Hauptinteraktion in den Vordergrund rückt

---

## Konzept: "Coach Briefing"

### Kernidee

Die drei Informationstypen dienen **verschiedenen kognitiven Zwecken** — das Design muss das widerspiegeln:

| Information | Zeitrichtung | Zweck | Emotion |
|------------|-------------|-------|---------|
| Weekly Narrative | Rückblick | Reflexion | Stolz |
| Particle of the Week | Highlight | Feier | Freude |
| Insight | Vorausblick | Handlung | Neugier |

Statt drei gleichförmige Karten → **ein einheitlicher Briefing-Block** mit drei klar unterscheidbaren Zonen.

### Layout-Konzept

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  This Week              12 particles · 8h · 3 pr │  ← Stats-Zeile (kompakt, 1 Zeile)
│                                                  │
│  ✧ Tue, 52 min deep     ✨ Peak focus at 3pm    │  ← Zwei Spalten: POTW + Insight
│    work on API design      Try morning sessions  │     als kompakte Einzeiler
│    [Best of the week]      for deep thinking     │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Die drei Zonen

#### Zone 1: Stats-Ticker (oberste Zeile)

Ersetzt die gesamte Weekly Narrative durch eine **einzeilige Zusammenfassung**:

```
This Week    12 particles · 8h 45m · 3 projects
```

- Keine 3-Satz-Erzählung mehr oben — die Narrative wird stattdessen als **expandierbarer Text** darunter verfügbar (Chevron/Tap zum Aufklappen) oder fließt in die Chat-Begrüßung ein
- Maximale Informationsdichte bei minimaler Fläche
- `text-xs uppercase tracking-wider` für Label, Stats rechts aligned

#### Zone 2: Zwei-Spalten-Layout (POTW + Insight)

Statt zwei volle Karten untereinander → **nebeneinander in 50/50-Spalten**:

**Linke Spalte — Particle of the Week:**
- Golden Accent-Streifen (links, 2px) statt voller Gradient-Hintergrund
- Einzeiler: `"Tue, 52 min · API design"`
- Darunter: 1 kurzer Satz (die `meaning` aus der Narrative)
- Kein verschachtelter Session-Info-Block

**Rechte Spalte — Insight:**
- Accent-Streifen (subtil, z.B. Sparkle-Icon) zur Differenzierung
- Titel als Einzeiler: `"Peak focus at 3pm"`
- Darunter: 1 kurzer Action-Satz
- Keine Highlight-Liste (oder max. 1 Bullet)

#### Expand-Interaktion (optional)

Jede Zone kann bei Tap/Click expandieren, um die vollständigen Details zu zeigen. So bleibt die kompakte Ansicht als Default, aber kein Informationsverlust.

### Visuelle Differenzierung

| Zone | Visuelles Signal | Farbe |
|------|-----------------|-------|
| Stats-Ticker | Keine Box, reiner Text | `text-tertiary` |
| POTW | Goldener Left-Border-Accent | `#FFD700` |
| Insight | `✨` Icon + subtiler Border | `text-secondary` |

**Warum das funktioniert:**
- Drei völlig verschiedene visuelle Behandlungen
- Sofort scanbar: Gold = Highlight der Woche, Sparkle = KI-Empfehlung, Zahlen = Statistik
- Kein Scrolling nötig — alles above-the-fold

### Responsive Verhalten

- **Desktop (>400px Modal):** Zwei-Spalten-Layout für POTW + Insight
- **Schmal (<400px):** Stack, aber weiterhin kompakt (1-2 Zeilen pro Abschnitt)

---

## Acceptance Criteria

- [ ] Alle drei Informationsquellen (Weekly Stats, POTW, Insight) sind in einem einheitlichen Briefing-Block zusammengefasst
- [ ] Der Briefing-Block nimmt maximal **~150-200px** vertikalen Raum ein (statt ~400-500px)
- [ ] Die drei Informationstypen sind **visuell sofort unterscheidbar** (unterschiedliche Farbe/Icon/Behandlung)
- [ ] Der Chat-Bereich ist ohne Scrollen sichtbar (bei normaler Viewport-Höhe)
- [ ] POTW wird auf 1-2 Zeilen komprimiert (kein 3-teiliger Narrative-Block mehr)
- [ ] Insight wird auf Titel + 1 Satz komprimiert
- [ ] Weekly Stats als Einzeiler statt 3-Satz-Erzählung
- [ ] Optional: Expand-Interaktion für Details bei Tap/Click
- [ ] Loading-States (Skeleton) für alle drei Zonen
- [ ] Dark Mode und Light Mode
- [ ] Keyboard-accessible (Tab-Navigation durch Zonen)
- [ ] Reduced-Motion Support
- [ ] Keine Regression: Alle Datenquellen (useWeeklyNarrative, useParticleOfWeek, useCoach) bleiben unverändert

---

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `src/components/coach/CoachView.tsx` | Briefing-Block statt 3 separate Sections |
| `src/components/coach/WeeklyNarrative.tsx` | Refactor zu Stats-Ticker-Zeile |
| `src/components/coach/InsightCard.tsx` | Compact-Variante (1-2 Zeilen) |
| `src/components/coach/CoachView.tsx` (POTW inline) | Compact POTW-Zeile statt voller Karte |
| (Neu) `src/components/coach/CoachBriefing.tsx` | Neuer unified Briefing-Container |

---

## Design-Entscheidungen

### Warum keine Tabs?
Tabs verstecken Information. Der Sinn des Briefings ist: **alles auf einen Blick**. Tabs würden bedeuten, dass der User aktiv klicken muss, um alle drei Infos zu sehen.

### Warum Zwei-Spalten statt Drei?
Stats-Ticker steht als Kontext-Zeile oben. POTW und Insight sind die zwei inhaltlichen Hauptblöcke — nebeneinander gibt ihnen gleichen Raum, spart 50% vertikale Fläche.

### Warum die 3-Satz-Narrative kürzen?
Die Narrative diente als „Einstimmung". Aber in einem kompakten Briefing-Format reichen die Zahlen + 1 kurzer Satz. Die volle Narrative kann in den Chat-Kontext fließen (Coach nutzt sie als Gesprächsstarter).

---

## Nicht im Scope

- Änderungen an der Daten-Generierung (Coach-Logik bleibt unverändert)
- Neue Coach-Features
- Chat-UI-Änderungen
- CoachParticle-Button-Änderungen

---

## Mockup (ASCII)

### Kompakt-Ansicht (Default)

```
┌──────────────────────────────────────────────────────┐
│  This Week                  12 particles · 8h · 3 pr │
├────────────────────────┬─────────────────────────────┤
│  ✧                     │  ✨                         │
│  52 min deep work      │  Peak focus around 3pm     │
│  Tue · API design      │  Morning sessions could    │
│  "That's flow."        │  unlock even more depth.   │
│                        │                             │
│  ▸ Details             │  ▸ Details                  │
└────────────────────────┴─────────────────────────────┘
```

### Expanded (nach Tap auf "Details")

Zeigt die vollen Inhalte inline an — gleicher Platz, mehr Text, sanft animiert.

---

*"Der Coach spricht leise, aber klar." — Particle Design Principle*
