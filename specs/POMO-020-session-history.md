# POMO-020: Session History

**Status:** DONE
**Priority:** P0 - Urgent
**Estimate:** 3 points
**Epic:** Premium Features
**Labels:** `premium`, `analytics`, `insights`

## Beschreibung
Speichert abgeschlossene Sessions und zeigt eine Übersicht der letzten 30 Tage. Grundlage für spätere Analytics-Features.

## Akzeptanzkriterien
- [x] Speichert bei Session-Ende: Datum, Typ, Dauer
- [x] Zeigt Liste der letzten Sessions
- [x] Maximal 100 Sessions gespeichert (FIFO)
- [x] 30-Tage-Ansicht
- [x] Gruppierung nach Tag
- [x] Total-Stunden pro Tag
- [x] History-Button in UI (Clock/Chart Icon)
- [x] Modal/Panel mit Session-Liste

## Technische Notizen
- `src/lib/session-storage.ts` für localStorage Logik
- Interface: `CompletedSession { id, type, duration, completedAt }`
- Trigger bei `COMPLETE_SESSION` in Timer
- Lazy Load für History-Component

## UI-Konzept
```
┌─────────────────────────────────────┐
│ Session History             [×]    │
├─────────────────────────────────────┤
│                                     │
│ Today                    2.5h total │
│ ├─ 🍅 Focus   25 min      14:30    │
│ ├─ ☕ Break    5 min      14:55    │
│ ├─ 🍅 Focus   25 min      15:00    │
│ └─ ☕ Break    5 min      15:25    │
│                                     │
│ Yesterday                 1.5h total │
│ ├─ 🍅 Focus   25 min      09:00    │
│ └─ 🍅 Focus   25 min      10:00    │
│                                     │
│ [Show more]                         │
└─────────────────────────────────────┘
```

## Datenstruktur
```typescript
interface CompletedSession {
  id: string;
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number; // in seconds
  completedAt: string; // ISO date
}
```

## Dateien
- `src/lib/session-storage.ts` (NEU)
- `src/components/insights/SessionHistory.tsx` (NEU)
- `src/components/timer/Timer.tsx` (MODIFIZIEREN)
- `src/app/page.tsx` (MODIFIZIEREN - History Button)

## Implementierungslog
- 2026-01-17: Fertiggestellt
  - Storage: `src/lib/session-storage.ts`
    - addSession, loadSessions, getSessionsFromDays
    - groupSessionsByDate, getTotalDuration
    - formatDuration, formatDate, formatTime
  - Component: `src/components/insights/SessionHistory.tsx`
    - BarChart3 Icon Button oben rechts
    - Modal mit 30-Tage-Übersicht
    - Total Focus Time Summary
    - Sessions gruppiert nach Tag
    - Icons für Work (Zap) und Break (Coffee)
  - Integration: Timer.tsx speichert bei handleComplete
  - localStorage Key: `pomo_session_history`
