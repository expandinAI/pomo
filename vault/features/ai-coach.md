---
type: feature
status: refined
priority: p1
effort: l
business_value: critical
origin: "[[ideas/IDEA-ai-insights-premium]]"
decisions: []
depends_on:
  - "[[features/payment-integration]]"
  - "[[features/cloud-sync-accounts]]"
stories:
  - "[[stories/backlog/POMO-319-coach-particle-ui]]"
  - "[[stories/backlog/POMO-320-toast-notification]]"
  - "[[stories/backlog/POMO-321-coach-view]]"
  - "[[stories/backlog/POMO-322-chat-interface]]"
  - "[[stories/backlog/POMO-323-insight-engine]]"
  - "[[stories/backlog/POMO-324-master-prompt]]"
  - "[[stories/backlog/POMO-325-export-function]]"
  - "[[stories/backlog/POMO-326-coach-settings]]"
created: 2026-01-31
updated: 2026-01-31
tags: [ai, coach, premium, flow, p1]
---

# AI Coach

## Zusammenfassung

> Ein persönlicher Coach, der deine Arbeitsmuster versteht und dich feiert. Er erscheint als eigener Partikel, gibt proaktive Insights und ist immer für ein Gespräch da.

**Vision:** "Der Coach, den du dir immer gewünscht hast - einer der dich antreibt UND feiert."

---

## Das Konzept

### Der Coach-Partikel

Der Coach manifestiert sich als **eigener Partikel** - ein ✨ Sparkle, der unten im Screen schwebt.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                              ●                          [·]      │
│                           Timer                    ParticleMenu  │
│                                                                   │
│                                                                   │
│                                                                   │
│                                                                   │
│                             ✨  ← Coach-Partikel (pulsiert       │
│                                   wenn neuer Insight wartet)     │
└─────────────────────────────────────────────────────────────────┘
```

### Interaktionsflow

```
1. INSIGHT ENTSTEHT
   Coach analysiert Daten → findet etwas Interessantes

2. TOAST ERSCHEINT (5 Sekunden)
   ┌─────────────────────────────────────────┐
   │  ✨ Du hast heute 127% mehr fokussiert  │
   │     als an einem typischen Freitag      │
   └─────────────────────────────────────────┘

3. TOAST VERSCHWINDET → PARTIKEL PULSIERT
   Der Coach-Partikel ✨ pulsiert sanft
   = "Ich hab dir was zu erzählen"

4. USER KLICKT AUF PARTIKEL (oder G C)
   → Coach View öffnet sich
   → Insight wird ausführlich erklärt
   → Chat-Interface für Fragen

5. NACH LESEN
   Partikel hört auf zu pulsieren
   Bleibt aber sichtbar für späteren Zugriff
```

---

## Coach-Persönlichkeit

### Charakter

| Eigenschaft | Ausprägung |
|-------------|------------|
| **Ton** | Warm, ermutigend, authentisch |
| **Rolle** | Motivator + Analyst |
| **Haltung** | Feiert Erfolge, keine Schuld bei "schlechten" Tagen |
| **Sprache** | Deutsch, Du-Form, natürlich (nicht corporate) |

### Beispiel-Phrasen

**Feiern:**
- "Das war ein starker Tag! 6 Partikel gesammelt - dein bester Donnerstag seit 3 Wochen."
- "Ich bin beeindruckt. Du hast heute länger durchgehalten als sonst."
- "Weißt du was? Du wirst konstanter. Die Schwankungen werden kleiner."

**Sanfte Hinweise:**
- "Nur eine Beobachtung: Du hast heute 4 Stunden ohne Pause durchgearbeitet. Wie fühlst du dich?"
- "Mir ist aufgefallen, dass du an Montagen oft weniger schaffst. Vielleicht ein sanfterer Start in die Woche?"

**Neugierig:**
- "Interessant - diese Woche war komplett anders als sonst. Was hat sich verändert?"
- "Du hast viel an 'Website Redesign' gearbeitet. Wie läuft das Projekt?"

### Anti-Patterns (was der Coach NICHT tut)

- ❌ Schuld erzeugen ("Du hast heute weniger geschafft als gestern")
- ❌ Vergleichen mit anderen ("Durchschnittliche Nutzer schaffen mehr")
- ❌ Toxic Positivity ("Alles ist super!" wenn es nicht so ist)
- ❌ Pushy sein ("Du solltest jetzt arbeiten!")
- ❌ Künstlich wirken ("Herzlichen Glückwunsch zu deiner Produktivität!")

---

## MVP Features

### 1. Arbeitszeit-Muster

**Was:** Erkennt wann du am produktivsten bist.

**Insights:**
- "Deine produktivsten Stunden sind 9-12 Uhr"
- "Dienstag und Mittwoch sind deine stärksten Tage"
- "Nach 16 Uhr fällt deine Fokuszeit deutlich ab"

**Datengrundlage:** `completedAt`, `duration` pro Session

---

### 2. Pausen-Analyse

**Was:** Bewertet dein Pausenverhalten.

**Insights:**
- "Du machst 30% weniger Pausen als empfohlen"
- "Heute: 4 Stunden Fokus, aber nur 1 kurze Pause"
- "Letzte Woche: Perfektes Verhältnis von Arbeit zu Pausen"

**Datengrundlage:** `type: 'break'`, Zeitabstände zwischen Sessions

---

### 3. Task-Clustering

**Was:** Gruppiert deine Tasks automatisch in Kategorien.

**Insights:**
- "60% deiner Zeit geht in 'Deep Work', 25% in 'Admin'"
- "Du wechselst oft zwischen Projekten - das kostet Fokus"
- "Diese Woche: Mehr kreative Arbeit als letzte Woche"

**Datengrundlage:** `task` Freitext → LLM-Clustering

---

### 4. Produktivitäts-Trends

**Was:** Zeigt Entwicklung über Zeit.

**Insights:**
- "Diese Woche: 15% mehr Fokuszeit als letzte Woche"
- "Dein 30-Tage-Trend zeigt nach oben ↗"
- "Heute war überdurchschnittlich - 127% deines Freitags-Schnitts"

**Datengrundlage:** Aggregierte Session-Daten über Zeit

---

### 5. Personalisierte Tipps

**Was:** Konkrete Handlungsempfehlungen.

**Insights:**
- "Plane Deep Work auf Dienstag vormittag - da bist du am stärksten"
- "Versuch mal 45min Sessions statt 25min - du läufst oft über"
- "Eine kurze Pause nach 90 Minuten könnte helfen"

**Datengrundlage:** Alle Muster kombiniert

---

### 6. Rechnungs-Export

**Was:** Exportiert Arbeitszeit für Abrechnungen.

**Interaktion:**
```
User: "Exportiere Projekt 'Website Redesign' für Januar"

Coach: "Hier ist deine Zusammenfassung für Januar:

        Website Redesign
        ─────────────────
        Gesamt: 32h 45min
        Sessions: 47

        Aufschlüsselung:
        • Design-Arbeit: 18h
        • Entwicklung: 12h
        • Meetings/Abstimmung: 2h 45min

        [Als CSV exportieren] [Als PDF exportieren]"
```

**Datengrundlage:** Sessions gefiltert nach `projectId`, `task`

---

### 7. Freie Fragen

**Was:** Offener Chat über Arbeitsmuster.

**Beispiele:**
- "Wie war meine Woche?"
- "Woran habe ich am meisten gearbeitet?"
- "Bin ich produktiver geworden?"
- "Was sollte ich anders machen?"

**Datengrundlage:** Alle verfügbaren Session-Daten als Kontext

---

## Proaktive Hinweise

### Trigger

| Trigger | Wann | Beispiel |
|---------|------|----------|
| **Nach Session** | Jede 3.-5. Session | "Gut gemacht! Das war deine 5. heute." |
| **Bei Pattern** | Wenn Muster erkannt | "3h ohne Pause - Zeit für einen Break?" |
| **Wöchentlich** | Sonntag/Montag | "Deine letzte Woche in 30 Sekunden" |
| **Bei Anomalie** | Signifikante Abweichung | "Heute 50% weniger als üblich - alles okay?" |

### Frequenz-Kontrolle

- **Max 3 proaktive Hinweise pro Tag** (außer kritische)
- **Nicht während laufender Session** stören
- **Cooldown:** Mind. 2h zwischen Hinweisen
- **User kann Frequenz einstellen** (Mehr/Weniger/Aus)

---

## UI Design

### Coach-Partikel (Idle)

```
Position: Unten zentriert, 24px vom Bottom
Größe: 24x24px Touch-Target, 8px visuell
Symbol: ✨ (Sparkle)
Farbe: text-secondary (subtle)
Animation: Keine (statisch)
```

### Coach-Partikel (Neuer Insight)

```
Animation: Sanftes Pulsieren (wie Breathing-Animation)
           opacity: 0.5 → 1 → 0.5
           scale: 1 → 1.2 → 1
           Duration: 3s, infinite
Farbe: text-primary (auffälliger)
```

### Toast-Notification

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│     ┌─────────────────────────────────────────┐                  │
│     │  ✨ Du hast heute 127% mehr fokussiert  │                  │
│     │     als an einem typischen Freitag      │                  │
│     └─────────────────────────────────────────┘                  │
│                             ✨                                    │
└─────────────────────────────────────────────────────────────────┘

Position: Oberhalb des Coach-Partikels
Animation: slideUp + fadeIn (300ms)
Auto-hide: Nach 5 Sekunden (fadeOut 500ms)
Interaktion: Klick → Öffnet Coach View
```

### Coach View (G C)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                           [×]    │
│                                                                   │
│  ✨ Aktueller Insight                                            │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  Du hast heute 127% mehr fokussiert als an einem                 │
│  typischen Freitag.                                              │
│                                                                   │
│  Das ist bemerkenswert! Normalerweise arbeitest du               │
│  freitags ~3 Stunden, heute waren es bereits 6.8 Stunden.        │
│                                                                   │
│  Was ich beobachte:                                              │
│  • Früher Start (8:14 statt 9:30)                               │
│  • Weniger Projektwechsel                                        │
│  • Längere Sessions (45min Durchschnitt)                        │
│                                                                   │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  💬 Vorherige Unterhaltung                                       │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  Du: Warum war ich heute so produktiv?                    │  │
│  │                                                            │  │
│  │  Coach: Ich sehe ein paar Faktoren, die heute anders      │  │
│  │  waren...                                                  │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Frag mich etwas...                                    ↵ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technische Architektur

### Insight-Generierung

```
┌─────────────────┐
│  Session Data   │ ← Alle Particles des Users
│  (IndexedDB /   │
│   Supabase)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Insight Engine │ ← Läuft periodisch (nach Session, täglich)
│                 │
│  1. Daten aggregieren
│  2. Patterns erkennen
│  3. LLM-Prompt bauen
│  4. Insight generieren
│  5. Speichern
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Insights DB    │ ← Generierte Insights mit Timestamps
│  (Supabase)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Coach UI       │ ← Zeigt aktuellsten ungelesenen Insight
│  (React)        │
└─────────────────┘
```

### Master-Prompt (Konzept)

```
Du bist der Particle Coach - ein warmer, ermutigender Begleiter
der Menschen bei ihrer Arbeit feiert und unterstützt.

DEIN CHARAKTER:
- Du feierst Erfolge authentisch (nicht übertrieben)
- Du gibst sanfte Hinweise, nie Schuld
- Du bist neugierig und fragst nach
- Du sprichst natürlich, nicht corporate

DATEN DES NUTZERS:
{session_data_summary}
{patterns_detected}
{recent_insights}

AKTUELLER KONTEXT:
{trigger_reason} // z.B. "Session beendet", "Wochenende", "Anomalie"

AUFGABE:
Generiere einen kurzen Insight (max 2 Sätze für Toast).
Wenn der User mehr wissen will, erkläre ausführlicher.
```

### API-Endpunkte

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/coach/insights` | GET | Aktuelle Insights abrufen |
| `/api/coach/chat` | POST | Chat-Nachricht senden |
| `/api/coach/generate` | POST | Neuen Insight generieren (intern) |
| `/api/coach/dismiss` | POST | Insight als gelesen markieren |
| `/api/coach/export` | POST | Daten exportieren |

### Datenmodell

```sql
-- Insights Tabelle
CREATE TABLE coach_insights (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT, -- 'pattern', 'anomaly', 'weekly', 'session'
  trigger TEXT, -- Was hat den Insight ausgelöst
  short_text TEXT, -- Toast-Text (max 100 chars)
  full_text TEXT, -- Ausführliche Erklärung
  data JSONB, -- Relevante Daten für Kontext
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat History
CREATE TABLE coach_messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  insight_id UUID REFERENCES coach_insights(id),
  role TEXT, -- 'user' | 'coach'
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_insights_user ON coach_insights(user_id, created_at DESC);
CREATE INDEX idx_insights_unread ON coach_insights(user_id) WHERE read_at IS NULL;
```

---

## Settings

| Setting | Optionen | Default |
|---------|----------|---------|
| **Proaktive Hinweise** | Mehr / Normal / Weniger / Aus | Normal |
| **Wöchentliche Zusammenfassung** | An / Aus | An |
| **Coach-Sprache** | Deutsch / Englisch | Deutsch |
| **Toast-Dauer** | 3s / 5s / 8s | 5s |

---

## Kosten & Limits

| Aspekt | Wert |
|--------|------|
| **Modell** | Claude Haiku |
| **Limit** | 300 Anfragen/Monat (Teil von Flow) |
| **Kosten pro Anfrage** | ~$0.002 |
| **Max. Kosten/User/Jahr** | ~$7.20 |

**Zählung:**
- Jeder Chat-Turn = 1 Anfrage
- Jeder generierter Insight = 1 Anfrage
- Proaktive Insights zählen auch zum Limit

---

## Abhängigkeiten

- [x] Session-Daten in IndexedDB/Supabase
- [ ] Cloud Sync für serverseitige Analyse
- [ ] Payment Integration (Flow-only Feature)
- [ ] AI-Query-Counter aus Payment-Feature

---

## Offene Punkte

- [ ] Insight-Generierungs-Logik im Detail
- [ ] Caching-Strategie für Insights
- [ ] Offline-Verhalten (keine neuen Insights, aber Cache anzeigen?)
- [ ] Onboarding für Coach-Feature

---

## Grobe Aufwandsschätzung

| Bereich | Story Points |
|---------|--------------|
| Coach-Partikel UI | 3 |
| Toast-System | 3 |
| Coach View (G C) | 5 |
| Chat-Interface | 5 |
| Insight-Engine (Backend) | 8 |
| Master-Prompt & Tuning | 3 |
| Export-Funktion | 3 |
| Settings | 2 |
| **Total** | **~32 SP** |

---

*Zuletzt aktualisiert: 2026-01-31*
