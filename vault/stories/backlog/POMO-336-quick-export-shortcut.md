---
type: story
status: backlog
priority: p1
effort: 1
feature: export
created: 2026-02-03
updated: 2026-02-03
done_date: null
tags: [10x, quick-win, keyboard, freelancer, export]
---

# POMO-336: Quick Export Shortcut (`G E`)

## User Story

> Als **Freelancer**
> möchte ich **mit `G E` die aktuelle Woche als CSV exportieren**,
> damit **ich in Sekunden meine Arbeitszeit für Rechnungen habe, ohne durch Menüs zu klicken**.

## Kontext

**Problem:**
Export existiert über Coach oder History, erfordert aber mehrere Klicks. Für Freelancer, die wöchentlich Stunden dokumentieren, ist das zu langsam.

**Lösung:**
Ein Chord-Shortcut `G E` (Go → Export) exportiert sofort die aktuelle Kalenderwoche.

**Bestehendes:**
- `ExportButton.tsx` → `exportSessionsAsCSV()` exportiert ALLE Sessions
- `export-utils.ts` → `generateCSV()`, `downloadFile()` als Utils
- `ExportDialog.tsx` → Projekt-spezifischer Export mit API

**Neu zu erstellen:**
- `exportCurrentWeekAsCSV()` → Filter + Export nur aktuelle Woche
- `G E` Shortcut in Navigation-Handler
- Toast-Feedback mit Kalenderwoche + Stunden

**10x-Faktor:**
Freelancer-Killer-Feature. Von 5 Klicks auf 2 Tasten. Existierende Logik, neuer Shortcut = sofortiger Wert.

## Akzeptanzkriterien

### Shortcut

- [ ] **Given** User ist in der App (kein Modal offen), **When** `G E` gedrückt, **Then** CSV der aktuellen Woche wird heruntergeladen
- [ ] **Given** Modal/Overlay offen, **When** `G E`, **Then** keine Aktion (Shortcut blockiert)
- [ ] Shortcut erscheint in Help-Modal (`?`) unter "Navigation"

### Export

- [ ] **Given** Sessions diese Woche vorhanden, **When** Export, **Then** Datei `particle-export-2026-W05.csv` heruntergeladen
- [ ] **Given** keine Sessions diese Woche, **When** Export, **Then** Toast "No particles this week"
- [ ] CSV enthält nur Work-Sessions (keine Breaks)
- [ ] CSV-Format identisch mit bestehendem Export (gleiche Spalten)

### Feedback

- [ ] **Given** Export erfolgreich, **Then** StatusMessage zeigt "Exported · Week 5 · 12.5h" (KW + Gesamtstunden)
- [ ] **Given** Export leer, **Then** StatusMessage zeigt "No particles this week"
- [ ] Message verschwindet nach 2s (wie `flowContinueMessage`)

## Implementierung

### 1. Neue Funktion in `export-utils.ts`

```typescript
/**
 * Get start and end of current ISO week (Monday 00:00 - Sunday 23:59)
 */
function getCurrentWeekRange(): { start: Date; end: Date; weekNumber: number } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  // ISO week number
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((start.getTime() - jan1.getTime()) / 86400000);
  const weekNumber = Math.ceil((days + jan1.getDay() + 1) / 7);

  return { start, end, weekNumber };
}

/**
 * Export current week's sessions as CSV
 * Returns { success: boolean; weekNumber: number; totalHours: number }
 */
export function exportCurrentWeekAsCSV(
  sessions: UnifiedSession[]
): { success: boolean; weekNumber: number; totalHours: number } {
  const { start, end, weekNumber } = getCurrentWeekRange();

  // Filter: only work sessions in current week
  const weekSessions = sessions.filter(s => {
    if (s.type !== 'work') return false;
    const date = new Date(s.completedAt);
    return date >= start && date <= end;
  });

  if (weekSessions.length === 0) {
    return { success: false, weekNumber, totalHours: 0 };
  }

  const totalMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0) / 60;
  const totalHours = Math.round(totalMinutes * 10) / 10; // 1 decimal

  const csv = generateCSV(weekSessions as CompletedSession[]);
  const year = new Date().getFullYear();
  const filename = `particle-export-${year}-W${weekNumber.toString().padStart(2, '0')}.csv`;
  downloadFile(csv, filename);

  return { success: true, weekNumber, totalHours };
}
```

### 2. State + Shortcut in `page.tsx`

```typescript
// Neuer State (neben flowContinueMessage, sessionTooShortMessage)
const [exportMessage, setExportMessage] = useState<string | null>(null);

// Auto-clear nach 2s
useEffect(() => {
  if (exportMessage) {
    const timeout = setTimeout(() => setExportMessage(null), 2000);
    return () => clearTimeout(timeout);
  }
}, [exportMessage]);

// In handleGNavigation oder ähnlich
case 'e':
case 'E':
  e.preventDefault();
  const { success, weekNumber, totalHours } = exportCurrentWeekAsCSV(sessions);
  if (success) {
    setExportMessage(`Exported · Week ${weekNumber} · ${totalHours}h`);
  } else {
    setExportMessage('No particles this week');
  }
  break;
```

### 3. StatusMessage Props erweitern

```typescript
// In StatusMessage.tsx - neuer Prop
exportMessage?: string | null;

// In getDisplayMessage() - hohe Priorität (nach explicit message)
if (exportMessage) {
  return exportMessage;
}
```

### 4. Shortcut-Dokumentation in `shortcuts.ts`

```typescript
// In SHORTCUTS Array, Navigation-Kategorie
{ key: 'G E', description: 'Export current week', category: 'navigation' },
```

### Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `src/lib/export-utils.ts` | `exportCurrentWeekAsCSV()` + `getCurrentWeekRange()` |
| `src/app/page.tsx` | `exportMessage` State + `G E` Handler |
| `src/components/timer/StatusMessage.tsx` | `exportMessage` Prop + Priority |
| `src/lib/shortcuts.ts` | Dokumentation |

## UI/UX

**Kein Dialog, kein Modal.** Sofortiger Download + subtiles Feedback.

```
User drückt: G E
→ CSV wird heruntergeladen
→ StatusMessage erscheint: "Exported · Week 5 · 12.5h"
→ Message verschwindet nach 2s
```

**Dateiname-Format:**
```
particle-export-2026-W05.csv
```

**StatusMessage-Format:**
```
Exported · Week 5 · 12.5h
```
oder
```
No particles this week
```

**Warum StatusMessage statt Toast?**
- Konsistent mit `flowContinueMessage`, `sessionTooShortMessage`
- Subtiler, nicht aufdringlich
- Gleiche Position, gleiches Styling
- Particle-Philosophie: Integriert, nicht überlagert

## Testing

### Manuell

- [ ] `G E` drücken → CSV wird heruntergeladen
- [ ] Dateiname enthält korrekte Kalenderwoche
- [ ] CSV enthält nur Sessions dieser Woche
- [ ] StatusMessage zeigt richtige Stundenzahl
- [ ] Bei leerer Woche: StatusMessage "No particles this week"
- [ ] In Help-Modal (`?`): `G E` erscheint unter Navigation

### Edge Cases

- [ ] Montag morgen (neue Woche, evtl. keine Sessions)
- [ ] Sonntag abend (Ende der Woche)
- [ ] Jahreswechsel (Woche 1 / Woche 52)

## Definition of Done

- [ ] `exportCurrentWeekAsCSV()` implementiert
- [ ] `G E` Shortcut funktioniert
- [ ] StatusMessage-Feedback (Erfolg + Leer)
- [ ] Help-Modal aktualisiert
- [ ] TypeScript-Typen korrekt
- [ ] Lint & Typecheck grün

## Nicht im Scope (v1)

- Monat exportieren (`Shift+G E`)
- Projekt-Filter (nutze ExportDialog dafür)
- Format-Auswahl (nur CSV, kein PDF/JSON)
- Zeitraum-Picker (nur aktuelle Woche)

## Spätere Erweiterungen

| Feature | Shortcut | Beschreibung |
|---------|----------|--------------|
| Monat exportieren | `Shift+G E` | Aktueller Monat |
| Letzte Woche | `G Shift+E` | Vorherige Kalenderwoche |
| Command Palette | `/export week` | Alternative zum Shortcut |

---

## Arbeitsverlauf

### Gestartet:
### Erledigt:
