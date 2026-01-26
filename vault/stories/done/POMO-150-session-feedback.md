---
type: story
status: done
priority: p1
effort: 2
feature: "[[features/timer-core]]"
created: 2026-01-25
updated: 2026-01-26
done_date: 2026-01-26
tags: [timer, feedback, session-end, particle-philosophy, status-message]
---

# POMO-150: Partikel-Moment – Kontextuelles Session-Feedback

## User Story

> Als **Mensch, der gerade einen Partikel gesammelt hat**
> möchte ich **einen kurzen, bedeutungsvollen Moment der Reflexion erleben**,
> damit **ich meinen Fortschritt wahrnehme, ohne aus dem Flow gerissen zu werden**.

## Die Philosophie

**Centered zeigt Reports. Forest zeigt Bäume. Wir zeigen einen Satz.**

Ein einziger, kontextueller Satz in der StatusMessage – ruhig, bedeutungsvoll, partikel-zentriert. Kein Modal. Kein Overlay. Keine Unterbrechung.

Der Moment nach einer Session ist heilig. Wir nutzen ihn nicht für Gamification oder Selbstbeweihräucherung. Wir nutzen ihn, um dem Menschen zu sagen, was er wissen sollte. Nicht mehr. Nicht weniger.

**Die Prüffrage:** "Würde ein weiser Mentor das sagen, oder ein überdrehter Produktivitäts-Coach?"

## Design-Prinzipien

1. **StatusMessage als Ort** – Keine neue UI, kein Modal
2. **Ein Satz** – Maximal zwei kurze Zeilen
3. **Partikel als Währung** – Immer "Partikel", nie "Session"
4. **Kontext statt Celebration** – Sinnvolle Info, kein "WOW!"
5. **Ruhig statt aufgeregt** – Wie ein Mentor, nicht wie ein Coach

## Das Konzept: Kontextuelle Nachrichten

Die StatusMessage zeigt nach Session-Ende (5-8 Sekunden) einen kontextuellen Satz. Der Inhalt hängt von der Situation ab:

### Basis (Standard)
```
Ein neuer Partikel · 45 min fokussiert
```

### Varianten je nach Kontext

| Situation | Nachricht |
|-----------|-----------|
| Erster Partikel des Tages | `Dein erster Partikel heute.` |
| Daily Goal erreicht | `Tagesziel erreicht · 8 Partikel` |
| Mit Overflow | `52 min · +7 im Flow` |
| Mit Task | `[Task-Name] · Ein Partikel` |
| Meilenstein 10 | `Partikel 10 · Dein Lebenswerk wächst.` |
| Meilenstein 50 | `50 Partikel · Die Arbeit trägt Früchte.` |
| Meilenstein 100 | `100 Partikel · Ein Fundament entsteht.` |
| Meilenstein 500 | `500 Partikel · Wenige kommen so weit.` |
| Meilenstein 1000 | `1.000 Partikel · Ein Lebenswerk nimmt Form an.` |

### Prioritätsreihenfolge

Wenn mehrere Situationen zutreffen, zeigen wir die bedeutendste:

1. **Meilenstein** (selten, wichtig)
2. **Daily Goal erreicht** (täglich relevant)
3. **Mit Task** (konkreter Kontext)
4. **Erster des Tages** (Start-Moment)
5. **Mit Overflow** (Flow-Anerkennung)
6. **Basis** (Standard-Fall)

## Was wir NICHT machen

- ❌ Kein Modal oder Card
- ❌ Kein "Session Complete" oder "Well done!"
- ❌ Keine Bewertungen ("Great job!", "Amazing!")
- ❌ Keine Emojis (🔥, 🏆, etc.)
- ❌ Keine Streak-Anzeigen (erzeugt Schuld)
- ❌ Keine Reflection-Prompts (zu invasiv)
- ❌ Keine bunten Farben
- ❌ Kein Score oder Rating

## Akzeptanzkriterien

### Basis-Funktionalität

- [ ] **Given** Work-Session abgeschlossen, **When** Timer endet, **Then** StatusMessage zeigt kontextuellen Satz
- [ ] **Given** Feedback angezeigt, **When** 6 Sekunden, **Then** blendet sanft aus
- [ ] **Given** Feedback angezeigt, **When** User klickt/Taste drückt, **Then** blendet sofort aus
- [ ] **Given** Break-Session, **When** endet, **Then** KEIN Feedback (nur Work zählt)

### Kontext-Varianten

- [ ] **Given** Erster Partikel des Tages, **When** Feedback, **Then** zeigt "Dein erster Partikel heute."
- [ ] **Given** Daily Goal erreicht (z.B. 8), **When** Feedback, **Then** zeigt "Tagesziel erreicht · 8 Partikel"
- [ ] **Given** Session mit Overflow, **When** Feedback, **Then** zeigt Zeit + Overflow
- [ ] **Given** Session mit Task, **When** Feedback, **Then** zeigt Task-Name
- [ ] **Given** Meilenstein erreicht, **When** Feedback, **Then** zeigt Meilenstein-Nachricht

### Ton & Stil

- [ ] **Given** Alle Nachrichten, **When** Review, **Then** ruhig, nicht aufgeregt
- [ ] **Given** Alle Nachrichten, **When** Review, **Then** "Partikel" statt "Session"
- [ ] **Given** Alle Nachrichten, **When** Review, **Then** keine Emojis, keine Ausrufezeichen

## Technische Details

### Erweiterung der StatusMessage

Die StatusMessage hat bereits ein Prioritätssystem. Wir fügen eine neue Priorität hinzu:

```typescript
// In StatusMessage.tsx
interface StatusMessageProps {
  // ... existing props
  sessionFeedback?: SessionFeedback | null;  // NEW
}

interface SessionFeedback {
  type: 'first-today' | 'goal-reached' | 'milestone' | 'overflow' | 'task' | 'standard';
  particleCount?: number;       // für Meilensteine
  dailyCount?: number;          // für Daily Goal
  duration: number;             // in Minuten
  overflowMinutes?: number;     // falls Overflow
  taskName?: string;            // falls Task
}
```

### Feedback-Berechnung

```typescript
function calculateSessionFeedback(
  todayCount: number,
  totalCount: number,
  duration: number,
  overflowSeconds: number,
  taskName?: string,
  dailyGoal?: number
): SessionFeedback {
  // 1. Meilenstein prüfen (höchste Priorität)
  const milestones = [1000, 500, 100, 50, 10];
  for (const m of milestones) {
    if (totalCount === m) {
      return { type: 'milestone', particleCount: m, duration };
    }
  }

  // 2. Daily Goal erreicht
  if (dailyGoal && todayCount === dailyGoal) {
    return { type: 'goal-reached', dailyCount: todayCount, duration };
  }

  // 3. Mit Task
  if (taskName) {
    return { type: 'task', taskName, duration };
  }

  // 4. Erster des Tages
  if (todayCount === 1) {
    return { type: 'first-today', duration };
  }

  // 5. Mit Overflow
  if (overflowSeconds > 60) {
    return {
      type: 'overflow',
      duration,
      overflowMinutes: Math.round(overflowSeconds / 60)
    };
  }

  // 6. Standard
  return { type: 'standard', duration };
}
```

### Nachricht-Generierung

```typescript
function formatFeedbackMessage(feedback: SessionFeedback): string {
  switch (feedback.type) {
    case 'milestone':
      return getMilestoneMessage(feedback.particleCount!);
    case 'goal-reached':
      return `Tagesziel erreicht · ${feedback.dailyCount} Partikel`;
    case 'task':
      return `${feedback.taskName} · Ein Partikel`;
    case 'first-today':
      return 'Dein erster Partikel heute.';
    case 'overflow':
      return `${feedback.duration} min · +${feedback.overflowMinutes} im Flow`;
    case 'standard':
      return `Ein neuer Partikel · ${feedback.duration} min fokussiert`;
  }
}

function getMilestoneMessage(count: number): string {
  const messages: Record<number, string> = {
    10: 'Partikel 10 · Dein Lebenswerk wächst.',
    50: '50 Partikel · Die Arbeit trägt Früchte.',
    100: '100 Partikel · Ein Fundament entsteht.',
    500: '500 Partikel · Wenige kommen so weit.',
    1000: '1.000 Partikel · Ein Lebenswerk nimmt Form an.',
  };
  return messages[count] || `Partikel ${count}`;
}
```

## Dateien

| Datei | Änderung |
|-------|----------|
| `src/components/timer/StatusMessage.tsx` | Neue Priorität für sessionFeedback |
| `src/components/timer/Timer.tsx` | SessionFeedback berechnen und übergeben |
| `src/lib/session-feedback.ts` | Neue Utility für Feedback-Berechnung |

## Verifizierung

1. `npm run typecheck` - keine Fehler
2. `npm run dev` - App starten
3. **Work-Session abschließen:** StatusMessage zeigt kontextuellen Satz
4. **Erster des Tages:** "Dein erster Partikel heute."
5. **Mit Task:** "[Task-Name] · Ein Partikel"
6. **Mit Overflow:** "52 min · +7 im Flow"
7. **Daily Goal erreichen:** "Tagesziel erreicht · X Partikel"
8. **Nach 6 Sekunden:** Nachricht blendet aus
9. **Break-Session:** Kein Feedback

## Nicht im Scope (v1)

- Reflection/Journal-Eingabe
- Statistik-Details
- Vergleich mit gestern
- Sharing-Funktionalität
- Sound-Feedback (eigenes Feature)

## Die Seele

> "Die meisten Apps schreien 'AMAZING JOB!' nach jeder Session. Wir sagen einen Satz. Ruhig. Bedeutungsvoll. Wie ein Mentor, der nickt und sagt: 'Gut. Weiter.'"

---

*"Ein neuer Partikel. Dein Lebenswerk wächst."*
