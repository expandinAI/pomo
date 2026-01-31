---
type: story
status: backlog
priority: p2
effort: 3
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [ai, coach, export, invoices]
---

# POMO-325: Export Function

## User Story

> Als **Freelancer**
> möchte ich **meine Arbeitszeit für ein Projekt exportieren können**,
> damit **ich Rechnungen erstellen kann**.

## Kontext

Link zum Feature: [[features/ai-coach]]

Coach kann auf Anfrage Arbeitsdaten exportieren. Natural Language Interface.

## Akzeptanzkriterien

- [ ] User kann im Chat nach Export fragen
- [ ] Coach versteht: "Exportiere Projekt X für Januar"
- [ ] Export als CSV oder PDF
- [ ] Gruppierung nach Projekt, Task, Tag
- [ ] Summen und Zwischensummen
- [ ] Download-Link wird im Chat angezeigt
- [ ] Zeitraum-Filter (letzte Woche, Monat, Custom)

## Technische Details

### Betroffene Dateien
```
src/
├── lib/
│   └── coach/
│       └── export.ts             # NEU: Export-Logik
├── app/api/coach/
│   └── export/route.ts           # NEU: Export-Endpoint
```

### Intent-Detection

Coach erkennt Export-Absichten:
```typescript
const EXPORT_INTENTS = [
  'exportiere',
  'export',
  'rechnung',
  'abrechnung',
  'zeitaufstellung',
  'zusammenfassung für',
];
```

### Export-Formate

**CSV:**
```csv
Datum,Projekt,Task,Start,Ende,Dauer (min)
2026-01-15,Website Redesign,Hero Section,09:14,09:39,25
2026-01-15,Website Redesign,Navigation,10:02,10:27,25
...

Gesamt,,,,,180
```

**PDF:**
```
┌─────────────────────────────────────────────────────────────────┐
│                     ZEITAUFSTELLUNG                              │
│                                                                   │
│  Projekt: Website Redesign                                       │
│  Zeitraum: 01.01.2026 - 31.01.2026                              │
│                                                                   │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  15.01.2026                                                      │
│    Hero Section                   09:14 - 09:39      25 min     │
│    Navigation                     10:02 - 10:27      25 min     │
│                                             Summe:   50 min     │
│                                                                   │
│  16.01.2026                                                      │
│    ...                                                           │
│                                                                   │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  GESAMT                                              32h 45min   │
│                                                                   │
│  Generiert am 31.01.2026 mit Particle                           │
└─────────────────────────────────────────────────────────────────┘
```

### Chat-Flow

```
User: "Exportiere Website Redesign für Januar"

Coach: "Klar! Hier ist deine Zusammenfassung für 'Website Redesign' im Januar:

        Gesamt: 32h 45min
        Sessions: 47

        [Als CSV herunterladen] [Als PDF herunterladen]

        Soll ich nach Tasks aufschlüsseln?"
```

## API-Endpoint

```typescript
// POST /api/coach/export
interface ExportRequest {
  projectId?: string;
  projectName?: string; // Falls kein ID bekannt
  startDate: string;    // ISO
  endDate: string;      // ISO
  format: 'csv' | 'pdf';
  groupBy?: 'day' | 'task' | 'both';
}

interface ExportResponse {
  downloadUrl: string;
  summary: {
    totalMinutes: number;
    sessionCount: number;
  };
}
```

## Definition of Done

- [ ] Export-Logik implementiert
- [ ] CSV-Export funktioniert
- [ ] PDF-Export funktioniert
- [ ] Coach versteht Export-Anfragen
- [ ] Download-Links im Chat
- [ ] Projekt-/Zeitraum-Filter
