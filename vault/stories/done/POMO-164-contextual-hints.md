---
type: story
status: backlog
priority: p2
effort: 2
feature: "[[features/learn-section]]"
created: 2026-01-27
updated: 2026-01-28
done_date: null
tags: [hints, learn, ux, retention]
---
	
# POMO-164: Contextual Hints

## User Story

> Als **Particle-Nutzer**
> möchte ich **dezente Hinweise in der StatusBar bekommen, wenn mein Nutzungsverhalten auf einen anderen Rhythmus hindeutet**,
> damit **ich meinen optimalen Fokus-Rhythmus entdecken kann**.

## Kontext

Link zum Feature: [[features/learn-section]]

Contextual Hints nutzen die **bestehende StatusBar** (wie die Welcome-Message). Kein neues UI, keine Buttons, keine Modals. Einfach eine Message mit "Press L" am Ende.

Maximal 1x pro 7 Tage, nie während einer Session, verschwindet automatisch.

## Akzeptanzkriterien

- [ ] **Given** ich habe 3x im Overflow gearbeitet, **When** meine nächste Session endet, **Then** sehe ich in der StatusBar: "You were in flow. Press L to explore rhythms."
- [ ] **Given** ich habe 3x vor Timer-Ende abgebrochen, **When** meine nächste Session endet, **Then** sehe ich: "Shorter sessions work too. Press L to learn why."
- [ ] **Given** ich habe vor weniger als 7 Tagen einen Hint gesehen, **When** ein neuer Trigger auslöst, **Then** wird kein Hint angezeigt
- [ ] **Given** ein Hint wird angezeigt, **When** ich L drücke, **Then** öffnet sich das Learn Panel
- [ ] **Given** ein Hint wird angezeigt, **When** 8 Sekunden vergehen, **Then** verschwindet der Hint automatisch

## Hint-Katalog

| ID | Trigger | Message |
|----|---------|---------|
| `overflow-flow` | 3x im Overflow gearbeitet | "You were in flow. Press L to explore rhythms." |
| `early-stop` | 3x vor Timer-Ende abgebrochen | "Shorter sessions work too. Press L to learn why." |
| `first-week` | 7 Tage seit erstem Start | "One week of particles. Press L to discover your rhythm." |

**Entfernt:** `never-switched` (zu edge-case, zu wenig Mehrwert)

## Technische Details

### Betroffene Dateien

```
src/
├── hooks/
│   └── useContextualHints.ts   # Trigger-Logik + State
└── components/
    └── timer/
        └── Timer.tsx           # Integration in StatusBar
```

**Keine neue Komponente nötig!** Wir nutzen die vorhandene StatusBar-Infrastruktur.

### Implementierung

```typescript
// useContextualHints.ts
interface HintState {
  lastHintShownAt: number | null;  // Timestamp
  overflowCount: number;
  earlyStopCount: number;
  firstStartDate: number | null;
}

interface UseContextualHintsReturn {
  /** Check if a hint should be shown, returns message or null */
  checkForHint: (sessionType: 'overflow' | 'early-stop' | 'complete') => string | null;
  /** Mark hint as shown (resets cooldown) */
  markHintShown: () => void;
  /** Increment overflow counter */
  trackOverflow: () => void;
  /** Increment early-stop counter */
  trackEarlyStop: () => void;
}
```

### Integration in Timer.tsx

```typescript
// Nach Session-Ende
const hint = checkForHint(wasOverflow ? 'overflow' : wasEarlyStop ? 'early-stop' : 'complete');
if (hint) {
  setContextualHint(hint);
  markHintShown();
}

// In StatusBar (gleiche Priorität wie welcomeMessage)
message={contextualHint ?? welcomeMessage ?? ...}
```

### LocalStorage Key

```typescript
const HINT_STATE_KEY = 'particle:contextual-hints';
```

## UI/UX

### Darstellung

Exakt wie die Welcome-Message – in der StatusBar unter dem Timer:

```
                    25:00

    You were in flow. Press L to explore rhythms.
```

### Verhalten

| Aspekt | Verhalten |
|--------|-----------|
| Erscheint | Nach Session-Ende (nach Celebration) |
| Verschwindet | Nach 8 Sekunden (auto-dismiss) |
| L drücken | Öffnet Learn Panel |
| Andere Taste | Ignoriert (Hint bleibt) |
| Neue Session starten | Hint verschwindet |

### Animation

Gleich wie Welcome-Message (fade in/out via StatusBar).

## Regeln

| Regel | Begründung |
|-------|------------|
| **Max. 1 Hint pro 7 Tage** | Nicht nerven |
| **Nie während Session** | Fokus nicht stören |
| **Auto-dismiss nach 8s** | Nicht blockieren |
| **Kein Tracking** | Privacy |
| **Keine Schuld-Sprache** | Particle-Voice |

## Testing

### Manuell zu testen

- [ ] Hint erscheint nach 3x Overflow (nach nächster Session)
- [ ] Hint erscheint nach 3x Early-Stop (nach nächster Session)
- [ ] Hint erscheint nach 7 Tagen
- [ ] Kein Hint während Session
- [ ] 7-Tage-Cooldown funktioniert
- [ ] L öffnet Learn Panel
- [ ] Auto-dismiss nach 8s

### Automatisierte Tests

- [ ] Unit: Trigger-Logik für jeden Hint
- [ ] Unit: 7-Tage-Cooldown
- [ ] Unit: Counter werden korrekt erhöht

## Definition of Done

- [ ] Hook implementiert
- [ ] In Timer.tsx integriert
- [ ] Alle 3 Triggers funktionieren
- [ ] Tests geschrieben & grün
- [ ] Lokal getestet

## Vereinfachungen gegenüber Original

| Vorher | Nachher |
|--------|---------|
| Eigene `ContextualHint.tsx` Komponente | Keine (nutzt StatusBar) |
| Modal mit Buttons | Inline-Text mit "Press L" |
| 4 Hint-Typen | 3 Hint-Typen |
| Effort: 5 | Effort: 2 |
| Komplex | Elegant |

## Voice Check

- ✅ "You were in flow" – positiv, nicht belehrend
- ✅ "Press L to explore" – Einladung, kein Befehl
- ✅ Kurz genug für StatusBar
- ✅ Konsistent mit Welcome-Message Muster

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
