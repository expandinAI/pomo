---
type: story
status: done
priority: p2
effort: 2
feature: analytics
created: 2026-01-18
updated: 2026-01-20
done_date: 2026-01-20
tags: [analytics, export, premium]
---

# POMO-032: Export Data (CSV)

## User Story

> Als **Pomo-Nutzer**
> möchte ich **meine Session-Daten als CSV exportieren können**,
> damit **ich sie in anderen Tools analysieren oder als Backup sichern kann**.

## Kontext

Nutzer wollen Kontrolle über ihre Daten. Ein CSV-Export ermöglicht:
1. Backup der Daten (kein Cloud-Sync nötig)
2. Import in Spreadsheets für eigene Analysen
3. Datenmigration falls nötig

## Akzeptanzkriterien

- [ ] **Given** Sessions existieren, **When** User klickt "Export", **Then** CSV-Datei wird heruntergeladen
- [ ] **Given** CSV erstellt, **When** User öffnet in Excel/Sheets, **Then** Spalten korrekt erkannt
- [ ] **Given** 0 Sessions, **When** User klickt Export, **Then** Hinweis "No data to export"
- [ ] **Given** Export-Button, **When** User hovert, **Then** Tooltip erklärt was exportiert wird
- [ ] **Given** Export erfolgt, **When** Datei heruntergeladen, **Then** Filename enthält Datum

## Technische Details

### Betroffene Dateien
```
src/
├── components/settings/
│   └── ExportButton.tsx      # NEW - Export Button mit Logic
├── lib/
│   └── export-utils.ts       # NEW - CSV Generation
└── components/insights/
    └── SessionHistory.tsx    # Integration des Buttons
```

### Implementierungshinweise
- Keine externe Library nötig - nativer CSV-String
- Blob + URL.createObjectURL für Download
- UTF-8 BOM für Excel-Kompatibilität
- Escape Kommas und Quotes in Werten

### CSV Format
```csv
id,type,duration_seconds,duration_formatted,completed_at,date,time
abc123,work,1500,25m,2026-01-18T10:30:00Z,2026-01-18,10:30 AM
def456,shortBreak,300,5m,2026-01-18T10:55:00Z,2026-01-18,10:55 AM
```

### Implementierung
```typescript
function generateCSV(sessions: CompletedSession[]): string {
  const header = 'id,type,duration_seconds,duration_formatted,completed_at,date,time';
  const rows = sessions.map(s => {
    const date = new Date(s.completedAt);
    return [
      s.id,
      s.type,
      s.duration,
      formatDuration(s.duration),
      s.completedAt,
      date.toLocaleDateString('en-CA'), // YYYY-MM-DD
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    ].join(',');
  });

  // UTF-8 BOM for Excel compatibility
  return '\uFEFF' + [header, ...rows].join('\n');
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

## UI/UX

### In Session History Modal
```
┌─────────────────────────────────────┐
│ Session History              [X]    │
├─────────────────────────────────────┤
│                                     │
│  ... session list ...               │
│                                     │
├─────────────────────────────────────┤
│  [📥 Export CSV]                    │
│                                     │
└─────────────────────────────────────┘
```

### Alternativ: In Settings
```
┌─────────────────────────────────────┐
│ Data & Privacy                      │
├─────────────────────────────────────┤
│                                     │
│  Export your data                   │
│  Download all sessions as CSV       │
│  [📥 Export]                        │
│                                     │
│  Clear all data                     │
│  [🗑️ Clear] (dangerous)            │
│                                     │
└─────────────────────────────────────┘
```

**Verhalten:**
- Button: Icon + "Export CSV" oder nur Icon auf Mobile
- Click: Sofortiger Download
- Filename: `pomo-sessions-2026-01-18.csv`
- Feedback: Kurzer Toast "Downloaded!" (optional)

## Testing

### Manuell zu testen
- [ ] Export mit verschiedenen Session-Typen
- [ ] Export mit Sonderzeichen (falls möglich)
- [ ] CSV öffnen in Excel
- [ ] CSV öffnen in Google Sheets
- [ ] CSV öffnen in Numbers (Mac)
- [ ] Export mit 0 Sessions (Error handling)
- [ ] Filename enthält korrektes Datum

### Automatisierte Tests
- [ ] Unit Test: `generateCSV()` Output-Format
- [ ] Unit Test: CSV escaping (Kommas, Quotes)
- [ ] Unit Test: UTF-8 BOM vorhanden

## Definition of Done

- [ ] Code implementiert
- [ ] Tests geschrieben & grün
- [ ] Lokal getestet
- [ ] CSV öffnet korrekt in Excel/Sheets
- [ ] Accessibility: Button hat aria-label
- [ ] Mobile: Button funktioniert

## Notizen

- Später: JSON-Export für vollständiges Backup
- Später: Import-Funktion für Restore
- Keine sensitive Daten im Export (IDs sind nur lokal relevant)

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
