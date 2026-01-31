---
type: story
status: backlog
priority: p1
effort: 8
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [ai, coach, backend, insights]
---

# POMO-323: Insight Engine Backend

## User Story

> Als **System**
> möchte ich **automatisch Insights aus Nutzerdaten generieren**,
> damit **der Coach proaktiv wertvolle Beobachtungen teilen kann**.

## Kontext

Link zum Feature: [[features/ai-coach]]

Das Herzstück des Coaches. Analysiert Session-Daten, erkennt Muster, generiert Insights.

## Akzeptanzkriterien

- [ ] Insight-Generierung nach jeder 3.-5. Session
- [ ] Wöchentliche Zusammenfassung (Sonntag/Montag)
- [ ] Anomalie-Erkennung (signifikante Abweichungen)
- [ ] Pattern-Erkennung (Arbeitsmuster)
- [ ] Insights werden in DB gespeichert
- [ ] Max 3 proaktive Insights pro Tag
- [ ] Cooldown von 2h zwischen Insights
- [ ] Insights zählen zum Quota-Limit

## Technische Details

### Betroffene Dateien
```
src/
├── lib/
│   └── coach/
│       ├── insight-engine.ts     # NEU: Hauptlogik
│       ├── patterns.ts           # NEU: Pattern-Detection
│       ├── anomalies.ts          # NEU: Anomalie-Detection
│       └── prompts.ts            # NEU: Insight-Prompts
├── app/api/
│   └── coach/
│       └── generate/route.ts     # NEU: Trigger-Endpoint
└── app/api/cron/
    └── weekly-insights/route.ts  # NEU: Wöchentlicher Job
```

### Datenbank
```sql
CREATE TABLE coach_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL, -- 'session' | 'pattern' | 'anomaly' | 'weekly'
  trigger TEXT,       -- Was hat den Insight ausgelöst
  short_text TEXT,    -- Toast-Text (max 100 chars)
  full_text TEXT,     -- Ausführliche Erklärung
  data JSONB,         -- Relevante Zahlen/Kontext
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insights_user ON coach_insights(user_id, created_at DESC);
CREATE INDEX idx_insights_unread ON coach_insights(user_id)
  WHERE read_at IS NULL;
```

### Insight-Typen

| Typ | Trigger | Beispiel |
|-----|---------|----------|
| `session` | Nach Session | "Das war deine 5. Session heute!" |
| `pattern` | Pattern erkannt | "Du arbeitest meist 9-12 Uhr" |
| `anomaly` | Signifikante Abweichung | "Heute 50% weniger als üblich" |
| `weekly` | Wöchentlicher Cron | "Deine Woche: 23h fokussiert" |

### Pattern-Detection (Algorithmen)

1. **Produktivste Tageszeit**
   - Gruppiere Sessions nach Stunde
   - Finde Peak-Zeiten

2. **Produktivste Wochentage**
   - Aggregiere nach Wochentag
   - Vergleiche mit Durchschnitt

3. **Pausen-Muster**
   - Berechne Zeit zwischen Sessions
   - Vergleiche mit empfohlenen 5-15min

4. **Session-Länge**
   - Durchschnitt vs. Preset-Dauer
   - Overflow-Häufigkeit

### Anomalie-Detection

```typescript
function detectAnomaly(todayStats: Stats, historicalStats: Stats): Anomaly | null {
  const deviation = (todayStats.totalFocus - historicalStats.average) / historicalStats.stdDev;

  if (Math.abs(deviation) > 1.5) {
    return {
      type: deviation > 0 ? 'high' : 'low',
      percentage: Math.round(deviation * 100),
      message: deviation > 0
        ? `${percentage}% mehr als üblich`
        : `${Math.abs(percentage)}% weniger als üblich`
    };
  }
  return null;
}
```

### Prompt für Insight-Generierung

```
Generiere einen kurzen, ermutigenden Insight basierend auf:

DATEN:
{pattern_data}

TRIGGER:
{trigger_reason}

REGELN:
- Max 2 Sätze für short_text (Toast)
- Sei warm und ermutigend
- Keine Schuld, keine Vergleiche mit anderen
- Nenne konkrete Zahlen wenn hilfreich
- Deutsch, Du-Form

Antworte im JSON-Format:
{
  "short_text": "...",
  "full_text": "..."
}
```

## Testing

### Manuell zu testen
- [ ] Nach 5 Sessions: Insight wird generiert
- [ ] Wöchentlicher Insight erscheint
- [ ] Anomalie wird erkannt
- [ ] Max 3 Insights pro Tag
- [ ] Insights werden gespeichert

## Definition of Done

- [ ] Pattern-Detection implementiert
- [ ] Anomalie-Detection implementiert
- [ ] Insight-Generierung mit LLM
- [ ] Datenbank-Schema erstellt
- [ ] Trigger nach Session
- [ ] Wöchentlicher Cron-Job
- [ ] Frequenz-Limiting
