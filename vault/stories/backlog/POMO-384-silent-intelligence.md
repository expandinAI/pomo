---
type: story
status: backlog
priority: p2
effort: 3
feature: intelligent-particles
created: 2026-02-05
updated: 2026-02-05
done_date: null
tags: [ai, coach, ux, personalization, subtle, 10x]
depends_on: []
blocks: []
---

# POMO-384: Silent Intelligence — "The App Thinks With You"

## User Story

> As a **Particle user going about my day**,
> I want **the app to subtly adapt based on my patterns**,
> so that **I feel understood without being told**.

## Context

The best AI is invisible. It doesn't announce itself — it just makes everything feel *right*. This story adds intelligence to existing UI elements without creating new features.

No modals. No buttons. No "AI-powered" badges. Just an app that quietly learns and adapts.

### The 10x Philosophy

> "The best AI is the one you don't notice. It manifests not as a feature, but as a feeling: this app understands me."

### Scope: 3 unabhaengige Sub-Features

Diese Story bündelt 3 kleine, unabhängige Verbesserungen, die alle auf lokalen Pattern-Daten basieren (kein API-Call):

| Sub-Feature | Effort | Wo |
|---|---|---|
| A) Smart Preset Highlighting | ~1 SP | PresetSelector |
| B) Task Prediction | ~1 SP | QuickTaskInput |
| C) Intelligent Empty States | ~1 SP | TimelineStats |

**Bewusst entfernt:** "Smart Default Duration" (D) aus der Original-Story. Das automatische Ändern des Timer-Werts ist zu invasiv und widerspricht dem Prinzip "User hat Kontrolle". Stattdessen kann der User selbst per Smart Task Input (`"Meeting 30"`) die Dauer setzen.

## Acceptance Criteria

### A) Smart Preset Highlighting

- [ ] **Given** user has >= 20 work sessions, **When** opening the app with timer idle, **Then** the preset that best matches the current time pattern gets a subtle visual highlight
- [ ] **Given** user's sessions at current hour (±1h) average > 45 min, **When** viewing presets, **Then** "Deep Work" or "90-Min" preset is highlighted
- [ ] **Given** user's sessions at current hour average 20-35 min, **When** viewing presets, **Then** "Pomodoro" preset is highlighted
- [ ] **Given** no clear pattern (< 20 sessions or mixed durations), **When** viewing presets, **Then** no highlighting (default behavior)
- [ ] **Given** user manually selects a different preset, **When** clicking another preset, **Then** highlighting follows user's selection (manual override wins)
- [ ] **Given** highlighting is shown, **Then** it's a subtle ring (`ring-1 ring-tertiary/20`), not a strong visual change

### B) Task Prediction / Suggestions

- [ ] **Given** user has a recurring task at the same day+hour (>= 3 occurrences), **When** opening the app at that time with no task entered, **Then** task input shows prediction as placeholder text with `?` suffix
- [ ] **Given** prediction is shown as placeholder, **When** user starts typing, **Then** placeholder disappears and user types freely
- [ ] **Given** prediction is shown as placeholder, **When** user presses Enter without typing, **Then** prediction is NOT auto-accepted (Enter startet Session ohne Task, wie bisher)
- [ ] **Given** prediction is shown as placeholder, **When** user clicks/focuses input and presses Tab, **Then** prediction fills the input (Tab = accept suggestion)
- [ ] **Given** no matching pattern (< 3 occurrences at same day+hour), **When** viewing task input, **Then** standard placeholder ("What are you working on?")

### C) Intelligent Empty States

- [ ] **Given** Timeline is empty for today AND user has >= 10 total sessions, **When** viewing Timeline, **Then** show contextual message instead of generic "A blank canvas"
- [ ] **Given** user hasn't had a session in >= 3 days, **When** showing empty state, **Then** show: "Welcome back. Start small."
- [ ] **Given** today is user's typically strong day (avg > overall avg * 1.2), **When** showing empty state, **Then** show: "{Day} — your most productive day. {avg} avg."
- [ ] **Given** current hour is in user's detected peak hours, **When** showing empty state, **Then** show: "Your peak focus window. Make it count."
- [ ] **Given** none of the above conditions match, **When** showing empty state, **Then** show default: "A blank canvas" (unchanged behavior)
- [ ] **Given** user has < 10 total sessions, **When** showing empty state, **Then** always show "A blank canvas" (not enough data for intelligence)

## Technical Details

### Affected Files

```
src/
├── components/
│   ├── timer/
│   │   ├── PresetSelector.tsx        # Add smart highlighting ring
│   │   └── QuickTaskInput.tsx        # Add prediction placeholder + Tab accept
│   └── timeline/
│       └── TimelineStats.tsx         # Replace static empty state with dynamic
├── lib/
│   └── coach/
│       └── silent-intelligence.ts    # NEW: All pattern-matching logic in one file
└── hooks/
    ├── useSmartPreset.ts             # NEW: Preset recommendation
    ├── useTaskPrediction.ts          # NEW: Task suggestion
    └── useSmartEmptyState.ts         # NEW: Contextual empty state
```

### A) Smart Preset Highlighting

```typescript
// src/hooks/useSmartPreset.ts
import { useSessionStore } from '@/lib/db';

interface PresetRecommendation {
  presetId: string | null;           // 'pomodoro' | 'deep-work' | '90-min' | null
  confidence: 'high' | 'medium' | 'low';
}

export function useSmartPreset(): PresetRecommendation {
  const sessions = useSessionStore(state => state.sessions);

  // 1. Filter: Nur work sessions
  const workSessions = sessions.filter(s => s.type === 'work');
  if (workSessions.length < 20) return { presetId: null, confidence: 'low' };

  // 2. Filter: Sessions zur aktuellen Stunde (±1h)
  const currentHour = new Date().getHours();
  const relevantSessions = workSessions.filter(s => {
    const sessionHour = new Date(s.completedAt).getHours();
    return Math.abs(sessionHour - currentHour) <= 1;
  });

  if (relevantSessions.length < 5) return { presetId: null, confidence: 'low' };

  // 3. Durchschnittliche Dauer berechnen
  const avgSeconds = relevantSessions.reduce((sum, s) => sum + s.duration, 0) / relevantSessions.length;
  const avgMinutes = avgSeconds / 60;

  // 4. Preset empfehlen basierend auf Dauer-Cluster
  if (avgMinutes >= 70) {
    return { presetId: '90-min', confidence: relevantSessions.length >= 10 ? 'high' : 'medium' };
  }
  if (avgMinutes >= 40) {
    return { presetId: 'deep-work', confidence: relevantSessions.length >= 10 ? 'high' : 'medium' };
  }
  if (avgMinutes >= 15) {
    return { presetId: 'pomodoro', confidence: 'medium' };
  }

  return { presetId: null, confidence: 'low' };
}
```

**PresetSelector Integration:**
```tsx
// In PresetSelector.tsx
const { presetId: recommendedPreset, confidence } = useSmartPreset();

// Nur bei medium/high confidence anzeigen
const showRecommendation = recommendedPreset && confidence !== 'low';

<button
  className={cn(
    "...", // existing styles
    showRecommendation && recommendedPreset === preset.id && !isUserSelected &&
      "ring-1 ring-tertiary/20 light:ring-tertiary-dark/20"
  )}
>
```

**Wichtig: `isUserSelected`** — Sobald der User manuell einen Preset klickt, verschwindet das Highlighting fuer den empfohlenen Preset. Das Highlighting ist ein Vorschlag, kein Override.

### B) Task Prediction

```typescript
// src/hooks/useTaskPrediction.ts
import { useSessionStore } from '@/lib/db';

export function useTaskPrediction(): string | null {
  const sessions = useSessionStore(state => state.sessions);
  const workSessions = sessions.filter(s => s.type === 'work' && s.task);

  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();

  // Sessions am gleichen Wochentag zur gleichen Stunde (±1h)
  const contextSessions = workSessions.filter(s => {
    const d = new Date(s.completedAt);
    return d.getDay() === currentDay &&
           Math.abs(d.getHours() - currentHour) <= 1;
  });

  if (contextSessions.length < 3) return null;

  // Haeufigste Task zaehlen
  const taskCounts = new Map<string, number>();
  for (const s of contextSessions) {
    if (s.task) {
      const count = taskCounts.get(s.task) || 0;
      taskCounts.set(s.task, count + 1);
    }
  }

  // Nur vorschlagen wenn dominante Task >= 3x vorkommt
  let maxTask = '';
  let maxCount = 0;
  for (const [task, count] of taskCounts) {
    if (count > maxCount) {
      maxCount = count;
      maxTask = task;
    }
  }

  return maxCount >= 3 ? maxTask : null;
}
```

**QuickTaskInput Integration:**
```tsx
// In QuickTaskInput.tsx
const predictedTask = useTaskPrediction();
const [userHasTyped, setUserHasTyped] = useState(false);

const displayPlaceholder = !userHasTyped && predictedTask
  ? `${predictedTask}?`
  : "What are you working on?";

<input
  placeholder={displayPlaceholder}
  onChange={(e) => {
    setUserHasTyped(e.target.value.length > 0);
    // ... existing onChange
  }}
  onKeyDown={(e) => {
    // Tab = accept prediction
    if (e.key === 'Tab' && predictedTask && !userHasTyped && !value) {
      e.preventDefault();
      setValue(predictedTask);
      setUserHasTyped(true);
    }
    // Enter = start session (NICHT prediction uebernehmen)
    // bestehendes Verhalten bleibt: Enter ohne Text = Session ohne Task
  }}
/>
```

**Design-Entscheidung: Tab statt Enter**

- **Enter** startet eine Session (bestehendes Verhalten, nicht ändern)
- **Tab** akzeptiert die Prediction (neues Verhalten, non-destructive)
- **Einfach tippen** überschreibt die Prediction (Placeholder verschwindet)
- User, die die Prediction nicht kennen, werden nie davon gestört

### C) Intelligent Empty States

```typescript
// src/hooks/useSmartEmptyState.ts
import { useSessionStore } from '@/lib/db';
import { detectAllPatterns } from '@/lib/coach/patterns';

export function useSmartEmptyState(): string {
  const sessions = useSessionStore(state => state.sessions);
  const workSessions = sessions.filter(s => s.type === 'work');

  // Minimum 10 Sessions fuer Intelligenz
  if (workSessions.length < 10) return "A blank canvas";

  const today = new Date();
  const dayOfWeek = today.getDay();
  const currentHour = today.getHours();

  // 1. Rueckkehr nach Pause (hoechste Prioritaet)
  const lastSession = workSessions
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];

  if (lastSession) {
    const lastDate = new Date(lastSession.completedAt);
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff >= 3) {
      return "Welcome back. Start small.";
    }
  }

  // 2. Starker Tag
  const dayAvgs = calculateDayOfWeekAverages(workSessions);
  const overallAvg = workSessions.length / countActiveDays(workSessions);
  const todayAvg = dayAvgs[dayOfWeek];

  if (todayAvg && todayAvg > overallAvg * 1.2) {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    const formatted = todayAvg % 1 === 0 ? `${todayAvg}` : todayAvg.toFixed(1);
    return `${dayName} — your most productive day. ${formatted} avg.`;
  }

  // 3. Peak Hour
  const patterns = detectAllPatterns(workSessions, []);
  const timePattern = patterns.find(p => p.type === 'time_of_day');
  if (timePattern) {
    // Pattern description enthaelt peak hours, z.B. "9am-11am"
    // Pruefen ob aktuelle Stunde im Peak-Bereich liegt
    if (isCurrentHourInPeak(timePattern, currentHour)) {
      return "Your peak focus window. Make it count.";
    }
  }

  // 4. Default
  return "A blank canvas";
}
```

**TimelineStats Integration:**
```tsx
// In TimelineStats.tsx (oder wo der Empty State gerendert wird)
const emptyMessage = useSmartEmptyState();

// Ersetze den hardcoded "A blank canvas" String:
<p className="text-sm text-tertiary">{emptyMessage}</p>
```

## UI/UX

### Preset Highlighting (subtil!)

```
┌─────────────────────────────────────────┐
│                                         │
│  [Pomodoro]  [Deep Work]  [90-Min] [·]  │
│                  ↑                      │
│           ring-1 ring-tertiary/20       │
│           (kaum sichtbar, nur Hauch)    │
│                                         │
└─────────────────────────────────────────┘
```

- Ring: `ring-1 ring-tertiary/20` (20% Opacity = subtil)
- Kein Label, kein Tooltip (pure Subtilität)
- Verschwindet sobald User einen Preset manuell wählt
- Nur bei `confidence !== 'low'`

### Task Prediction

```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐│
│  │ Brand Redesign?                    │││  ← Placeholder (text-tertiary)
│  └─────────────────────────────────────┘│
│                                         │
│  Tab to accept · Enter to start         │  ← Hint (optional, text-xs)
│                                         │
└─────────────────────────────────────────┘
```

**Fragezeichen:** Signalisiert "Vorschlag, nicht Annahme". User kann ignorieren.

**Verhalten:**
- Prediction erscheint als normaler Placeholder (text-tertiary, italic)
- User tippt → Placeholder verschwindet, User-Text erscheint
- User drueckt Tab → Prediction wird Inputwert
- User drueckt Enter (leer) → Session startet ohne Task (unveraendert)

### Intelligent Empty State

```
Timeline (leer, Dienstag, starker Tag):
┌─────────────────────────────────────────┐
│                                         │
│              ·                          │  ← Breathing dot (bestehend)
│                                         │
│  Tuesday — your most productive day.    │
│           4.2 avg.                      │
│                                         │
└─────────────────────────────────────────┘
```

- Gleiche Styling wie bisheriger "A blank canvas" Text
- Kein visueller Unterschied — nur der Text aendert sich
- Keine Animation, kein Highlighting

## Testing

### Manual Testing

**A) Smart Preset:**
- [ ] < 20 Sessions → kein Highlighting
- [ ] 20+ Sessions, morgens + Deep Work Pattern → "Deep Work" Preset highlighted
- [ ] 20+ Sessions, nachmittags + kurze Sessions → "Pomodoro" highlighted
- [ ] User klickt manuell auf anderen Preset → Highlighting folgt User-Wahl
- [ ] Kein klares Pattern → kein Highlighting

**B) Task Prediction:**
- [ ] Montag 9am + 3x "Brand Redesign" an vorherigen Montagen 9am → Placeholder zeigt "Brand Redesign?"
- [ ] Tab druecken → Prediction wird Input-Wert
- [ ] Enter druecken (leer) → Session startet ohne Task (unveraendert!)
- [ ] Tippen → Prediction verschwindet, User-Text uebernimmt
- [ ] < 3 Wiederholungen → Standard-Placeholder

**C) Intelligent Empty States:**
- [ ] < 10 Sessions → "A blank canvas" (default)
- [ ] 3+ Tage Pause → "Welcome back. Start small."
- [ ] Starker Wochentag → Tag + Durchschnitt angezeigt
- [ ] Peak Hour → "Your peak focus window."
- [ ] Keiner der Trigger → "A blank canvas" (default)

### Automated Tests

- [ ] Unit test `useSmartPreset()` — Dauer-Cluster korrekt erkannt
- [ ] Unit test `useSmartPreset()` — < 20 Sessions → null
- [ ] Unit test `useTaskPrediction()` — 3+ Wiederholungen → Prediction
- [ ] Unit test `useTaskPrediction()` — < 3 Wiederholungen → null
- [ ] Unit test `useSmartEmptyState()` — Prioritaetsreihenfolge korrekt
- [ ] Unit test `useSmartEmptyState()` — < 10 Sessions → "A blank canvas"
- [ ] Unit test edge cases: keine Sessions, 1 Session, grenzwertige Daten

## Definition of Done

- [ ] Smart Preset Highlighting in PresetSelector (ring-1, subtil)
- [ ] Task Prediction als Placeholder in QuickTaskInput (Tab = accept)
- [ ] Intelligent Empty States in Timeline (3 kontextuelle Varianten + Default)
- [ ] Alle Features graceful degrade bei unzureichenden Daten
- [ ] Kein sichtbares "AI" Branding — nur subtile Anpassungen
- [ ] Kein bestehendes Verhalten geaendert (Enter = Start, Preset = funktioniert wie immer)
- [ ] Typecheck + Lint pass
- [ ] Keine API Calls — rein lokale Pattern-Auswertung

## Notes

**Das Schluesselprinzip: Subtilitaet**

Diese Features sollen nie "in your face" sein. Wenn ein User sie nicht bewusst bemerkt, aber das Gefuehl hat "die App versteht mich", dann haben wir gewonnen.

**Warum "Smart Default Duration" entfernt wurde:**

Die Original-Story hatte ein Sub-Feature D das den Timer-Wert automatisch aendert. Das wurde bewusst entfernt:
- Den Timer-Wert zu aendern ist invasiv (User erwartet 25:00 und sieht 45:00)
- Es ueberschneidet sich mit Smart Task Input (`"Meeting 30"` setzt schon Duration)
- Es widerspricht dem Prinzip "User hat Kontrolle ueber den Timer"
- Preset Highlighting (Sub-Feature A) erreicht dasselbe subtiler

**Keine API Calls:**
Alles rein client-seitig. Kein Impact auf Quota, funktioniert offline, instant.

**Abhaengigkeiten:**
- Nutzt bestehende `detectAllPatterns()` aus `src/lib/coach/patterns.ts`
- Nutzt bestehende `useSessionStore()` fuer Session-Daten
- PresetSelector (POMO-066, done) wird minimal erweitert
- QuickTaskInput (POMO-061, done) wird minimal erweitert
- TimelineStats (done) wird minimal erweitert
- Kann parallel zu allen anderen Stories entwickelt werden

**Future enhancements:**
- Feature flag in Settings zum Deaktivieren ("Vanilla Mode")
- Mehr Empty-State Varianten (saisonale, milestone-bezogene)
- Prediction auch fuer Projekte (nicht nur Tasks)
