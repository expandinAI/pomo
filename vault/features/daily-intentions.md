# Daily Intentions — Dein Kompass für den Tag

> "Was zählt heute?"

---

## Die 10x-Vision

**Feature-Denken:** "User kann eine Intention setzen"

**10x-Denken:** "Particle zeigt dir den Gap zwischen dem, was du wolltest, und dem, was du getan hast — und macht diesen Gap sichtbar, fühlbar, lernbar."

---

## Der 10x-Kern

**Niemand zeigt dir den Gap zwischen Intention und Realität.**

- Journaling-Apps: "Was ist dein Ziel?" ✓
- Timer-Apps: "Du hast 4h gearbeitet" ✓
- **Particle:** "Du wolltest X. Du hast Y gemacht. Hier ist der Unterschied — als Bild."

---

## Zwei Arten von Arbeit

| Typ | Symbol | Beschreibung |
|-----|--------|--------------|
| **Intentional** | ● | Arbeit die du dir vorgenommen hast |
| **Reaktiv** | ○ | Arbeit die "passiert ist" |

```
Dein Tag:    ●  ●  ●  ○  ●

             4 aligned · 1 reaktiv
```

**Keine Wertung.** Ein reaktiver Partikel ist nicht "schlecht". Email beantworten war nötig. Aber du siehst: Das war nicht deine Intention.

---

## Hierarchie

```
DAILY INTENTION (Der Kompass)
└── "Präsentation fertig machen"
    │
    ├── PARTIKEL 1 · ● "Struktur"      ← aligned
    ├── PARTIKEL 2 · ● "Grafiken"      ← aligned
    ├── PARTIKEL 3 · ○ "Email"         ← reaktiv
    └── PARTIKEL 4 · ● "Üben"          ← aligned

    → 75% Alignment
```

---

## User Flow

### 1. Morgen-Ritual: "Der erste Atemzug"

**Trigger:** Erstes Öffnen der App am Tag (oder `I`)

**Phase 1: Stille**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                          ·                                  │  ← Particle, still
│                                                             │
│                                                             │
│                                                             │
│               Bevor der Tag beginnt.                        │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
*2 Sekunden Stille. Der Moment markiert den Übergang.*

**Phase 2: Die Frage**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │  ← Particle pulsiert sanft
│                                                             │
│                                                             │
│              Was zählt heute?                               │
│                                                             │
│         ┌─────────────────────────────────────┐            │
│         │ _                                   │            │  ← Cursor blinkt
│         └─────────────────────────────────────┘            │
│                                                             │
│                        ↵                                    │  ← Kein Button. Nur Enter.
│                                                             │
│                                                             │
│                  Ohne Intention starten                     │  ← Subtle opt-out
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Phase 3: Bestätigung**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │  ← Particle leuchtet kurz auf
│                                                             │
│                                                             │
│              Präsentation fertig machen.                    │
│                                                             │
│              Dein Tag hat eine Richtung.                    │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
*Fade to Timer nach 2 Sekunden.*

**Design-Prinzipien:**
- Stille zuerst. Dann die Frage.
- Kein Button — nur Enter. Maximale Reduktion.
- Das Particle reagiert (leuchtet bei Commit)
- Opt-out ist subtil, nicht prominent

**Nicht nerven:**
- Einmal pro Tag anbieten
- Wenn "Ohne Intention" → nicht nochmal fragen heute
- User kann jederzeit via `I` setzen/ändern

---

### 2. Während des Tages: Intention sichtbar

**Unter dem Timer:**
```
                    25:00

          Präsentation fertig machen
```

Die Intention ist immer da. Jeder Blick auf den Timer erinnert: *Dafür bin ich hier.*

**Optional in Settings:** Intention ausblenden (für Minimalisten)

---

### 3. Aligned vs. Reaktiv: Visuelle Sprache

**Überall wo Partikel erscheinen:**

| Aligned | Reaktiv |
|---------|---------|
| ● | ○ |
| Gefüllter Kreis | Ring/Outline |
| Weiß, leuchtend | Weiß, transparent |
| "Dort wo du sein wolltest" | "Passiert, nicht geplant" |

**Session Counter:**
```
        ●●●○●

    4 aligned · 1 reaktiv
```

**Timeline:**
```
6am         12pm         6pm         12am
├────────────┼────────────┼────────────┤
    ●    ●       ○    ●        ●
```

**Marking-Flow (beim Task eingeben):**
```
┌─────────────────────────────────────────┐
│  Was hast du gemacht?                   │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Email beantworten                 │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Deine Intention: "Präsentation"        │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ ● Aligned   │  │ ○ Reaktiv   │      │  ← Default: Reaktiv wenn nicht matching
│  └─────────────┘  └─────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

**Auto-Detection (V2):**
- Projekt-Match → wahrscheinlich aligned
- Keyword-Match → wahrscheinlich aligned
- Sonst → User entscheidet oder default reaktiv

---

### 4. Abend-Reflexion: "Der Tages-Abschluss"

**Trigger:**
- Nach letztem Partikel wenn > 18:00
- Oder beim Schließen der App abends
- Oder manuell

**Phase 1: Dein Tag**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │
│                                                             │
│                                                             │
│                       Dein Tag.                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
*Kurze Pause. Dann erscheint das Ergebnis.*

**Phase 2: Das Ergebnis**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│              "Präsentation fertig machen"                   │
│                                                             │
│                    ●  ●  ●  ○  ●                            │
│                                                             │
│              4 Stunden. 5 Partikel.                         │
│              4 davon genau dort, wo du sein wolltest.       │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
*Die Partikel-Reihe macht es visuell. Positive Sprache.*

**Phase 3: Die Frage**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│              Wie fühlt sich das an?                         │
│                                                             │
│      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│      │             │ │             │ │             │       │
│      │  Geschafft  │ │  Teilweise  │ │   Morgen    │       │
│      │      ✓      │ │      ◐      │ │      →      │       │
│      └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Status-Bedeutung:**
| Status | Symbol | Bedeutung |
|--------|--------|-----------|
| Geschafft | ✓ | Intention erfüllt |
| Teilweise | ◐ | Fortschritt, aber nicht fertig |
| Morgen | → | Wird morgen fortgesetzt |

**"Morgen" → Intention erscheint als Vorschlag am nächsten Tag**

---

### 5. Der Gap sichtbar: Wochen-Intention-View

**Zugang:** `G I` oder via Coach

```
┌─────────────────────────────────────────────────────────────┐
│  Intentions                                            ✕    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Diese Woche                                                │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  Mo   "Präsentation"        ●●●○●           80%            │
│  Di   "Feedback"            ●○○●            50%            │
│  Mi   —                     ○○○○○           —              │
│  Do   "Launch"              ●●●●●●          100%           │
│  Fr   "Dokumentation"       ●●○             67%            │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  Diese Woche: 73% intentional                               │
│  Ohne Intention: 0% aligned (Mittwoch)                      │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  Erkenntnis:                                                │
│  An Tagen mit Intention ist dein Alignment 74%.             │
│  An Tagen ohne: alles reaktiv.                              │
│  Die Intention macht den Unterschied.                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Der Aha-Moment:**
> "Mittwoch hatte ich keine Intention — und siehe da: Alles war reaktiv."

Das SIEHT man. Das FÜHLT man.

---

## Coach-Integration

### Prompt-Erweiterung

```
KONTEXT FÜR HEUTE:
- Intention: "Präsentation fertig machen"
- Bisherige Partikel: 5 (4 aligned ●, 1 reaktiv ○)
- Alignment: 80%

INTENTION-HISTORIE:
- Diese Woche: 4 Intentionen, 3 geschafft
- Durchschnittliches Alignment: 73%
- Häufigstes Thema: "Präsentation" (3 Tage)

Beziehe dich auf die Intention wenn relevant.
Beobachte Patterns zwischen Intention und Realität.
```

### Beispiel-Insights

**Täglich:**
> "Du wolltest 'Präsentation fertig machen'. 4 deiner 5 Partikel waren genau dort. Das eine Email-Partikel? Passiert. 80% Alignment ist stark."

**Wöchentlich:**
> "Diese Woche: 4 Intentionen, 3 davon geschafft. Dein Alignment lag bei 73%. Auffällig: Mittwoch ohne Intention — alles war reaktiv. Die Intention macht den Unterschied."

**Pattern-Erkennung:**
> "'Buch schreiben' taucht seit 3 Wochen in deinen Intentionen auf, wird aber oft zu 'Teilweise'. Vielleicht zu groß? Versuch: 'Ein Kapitel schreiben' statt 'Buch schreiben'."

---

## Datenmodell

### Intention

```typescript
interface DailyIntention {
  id: string;
  date: string;                    // "2026-02-04"
  text: string;                    // "Präsentation fertig machen"
  projectId?: string;              // Optional: verknüpftes Projekt
  status: 'active' | 'completed' | 'partial' | 'deferred' | 'skipped';
  createdAt: number;
  completedAt?: number;

  // Für "Morgen" / deferred
  deferredFrom?: string;           // Datum der ursprünglichen Intention
}
```

### Session-Erweiterung

```typescript
interface CompletedSession {
  // ... existing fields ...

  // NEU: Alignment zur Tages-Intention
  intentionAlignment: 'aligned' | 'reactive' | 'none';
  // 'none' = keine Intention an diesem Tag gesetzt
}
```

### Storage

- **IndexedDB:** Neue `intentions` Collection
- **Supabase:** Neue `intentions` Tabelle (für Sync)

---

## Visuelle Sprache

### Partikel-Darstellung

```css
/* Aligned Particle */
.particle-aligned {
  background: white;
  opacity: 1;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

/* Reactive Particle */
.particle-reactive {
  background: transparent;
  border: 1.5px solid white;
  opacity: 0.7;
}
```

### In der Timeline

```
Aligned:    ●  (gefüllt, leuchtet leicht)
Reaktiv:    ○  (Ring, subtiler)
```

### Im Counter

```
●●●○●  statt  •••••
```

---

## Keyboard Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `I` | Intention setzen/bearbeiten |
| `G I` | Intentions-View (Wochen-Übersicht) |
| `Shift+I` | Intention für heute löschen |

---

## UI-Komponenten

### Neue Komponenten

```
src/components/intentions/
├── IntentionRitual.tsx        # Morgen-Ritual (3 Phasen)
├── IntentionDisplay.tsx       # Anzeige unter Timer
├── IntentionReview.tsx        # Abend-Reflexion (3 Phasen)
├── IntentionHistory.tsx       # Wochen-View mit Gap-Visualisierung
├── AlignmentIndicator.tsx     # ●●●○● Darstellung
├── AlignmentToggle.tsx        # Aligned/Reaktiv Auswahl
└── index.ts
```

### Bestehende Komponenten erweitern

- `SessionCounter.tsx` — Zeigt ●○ statt nur ●
- `TimelineTrack.tsx` — Aligned/Reaktiv Styling
- `ParticleDetailOverlay.tsx` — Alignment-Toggle
- `CoachView.tsx` — Intention im Kontext

---

## Stories (Umsetzung)

### Phase 1: Core Ritual (MVP)

| Story | Beschreibung | Effort |
|-------|--------------|--------|
| POMO-350 | Intention Datenmodell & Storage | 3 |
| POMO-351 | Morgen-Ritual UI (3 Phasen) | 8 |
| POMO-352 | Intention Display unter Timer | 2 |
| POMO-353 | Keyboard Shortcut `I` | 1 |

**Phase 1 Total: 14 SP**

### Phase 2: Visuelle Sprache

| Story | Beschreibung | Effort |
|-------|--------------|--------|
| POMO-354 | Aligned/Reaktiv Partikel-Styling | 5 |
| POMO-355 | Alignment-Toggle in ParticleDetail | 3 |
| POMO-356 | Session Counter mit ●○ | 2 |
| POMO-357 | Timeline mit Alignment-Styling | 3 |

**Phase 2 Total: 13 SP**

### Phase 3: Reflexion & Gap

| Story | Beschreibung | Effort |
|-------|--------------|--------|
| POMO-358 | Abend-Reflexion UI (3 Phasen) | 8 |
| POMO-359 | Intention-Status (completed/partial/deferred) | 2 |
| POMO-360 | Wochen-Intentions-View mit Gap | 8 |
| POMO-361 | "Morgen" → Intention-Vorschlag | 3 |

**Phase 3 Total: 21 SP**

### Phase 4: Intelligence

| Story | Beschreibung | Effort |
|-------|--------------|--------|
| POMO-362 | Coach Prompt Integration | 3 |
| POMO-363 | Auto-Alignment Detection (Projekt-Match) | 5 |
| POMO-364 | Alignment-Statistiken für Coach | 5 |
| POMO-365 | Supabase Sync für Intentions | 3 |

**Phase 4 Total: 16 SP**

---

## Gesamtaufwand

| Phase | SP | Fokus |
|-------|----|----|
| Phase 1 | 14 | Core Ritual |
| Phase 2 | 13 | Visuelle Sprache |
| Phase 3 | 21 | Reflexion & Gap |
| Phase 4 | 16 | Intelligence |
| **Total** | **64 SP** | |

*Bei ~5 SP/Woche: ~13 Wochen*

---

## 10x-Checkliste

- ✅ **Morgen-Ritual** — Stille → Frage → Bestätigung (nicht Formular)
- ✅ **Visuelle Sprache** — ● aligned vs ○ reaktiv (überall)
- ✅ **Abend-Reflexion** — Würdigung, dann Frage (nicht Checkbox)
- ✅ **Gap sichtbar** — Wochen-View zeigt Intention vs. Realität
- ✅ **Aha-Moment** — "Ohne Intention = alles reaktiv"
- ✅ **Coach-Integration** — Bezieht sich auf Intention & Alignment

---

## Particle-Philosophie Check

- ✅ **Reduziert genug?** — Ein Satz. Enter. Fertig.
- ✅ **Dreht es sich um Partikel?** — Ja, ● vs ○ ist die Kernsprache
- ✅ **Stolz statt Schuld?** — "4 davon genau dort, wo du sein wolltest"
- ✅ **Keyboard-first?** — `I` für alles
- ✅ **Emotionale Tiefe?** — Morgen = Ritual, Abend = Würdigung

---

## Der Unterschied

**Vorher:** "Ich habe 5 Partikel gemacht."

**Nachher:** "Ich wollte die Präsentation fertig machen. 4 von 5 Partikeln waren genau dort. Das fühlt sich richtig an."

---

*Particle — Wo Intention sichtbar wird.*
