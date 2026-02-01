---
type: story
status: done
priority: p2
effort: 3
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-02-01
done_date: 2026-02-01
tags: [ai, coach, export, invoices]
---

# POMO-325: Export Function

## User Story

> As a **freelancer**,
> I want to **export my work time for a project**,
> so that **I can create invoices**.

## Context

Link: [[features/ai-coach]]

Coach can export work data on request. Natural language interface—just ask.

## Acceptance Criteria

- [ ] User can ask for export in chat *(Follow-up)*
- [ ] Coach understands: "Export Project X for January" *(Follow-up)*
- [x] Export as CSV or PDF
- [x] Grouping by project, task, day
- [x] Totals and subtotals
- [ ] Download link shown in chat *(Follow-up)*
- [x] Date range filter (last week, month, custom)

## Technical Details

### Files
```
src/
├── lib/
│   └── coach/
│       └── export.ts             # NEW: Export logic
├── app/api/coach/
│   └── export/route.ts           # NEW: Export endpoint
```

### Intent Detection

Coach recognizes export intents:
```typescript
const EXPORT_INTENTS = [
  'export',
  'download',
  'invoice',
  'timesheet',
  'summary for',
  'report',
];
```

### Export Formats

**CSV:**
```csv
Date,Project,Task,Start,End,Duration (min)
2026-01-15,Website Redesign,Hero Section,09:14,09:39,25
2026-01-15,Website Redesign,Navigation,10:02,10:27,25
...

Total,,,,,180
```

**PDF:**
```
┌─────────────────────────────────────────────────────────────────┐
│                       TIME REPORT                                │
│                                                                   │
│  Project: Website Redesign                                       │
│  Period: Jan 1, 2026 - Jan 31, 2026                             │
│                                                                   │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  Jan 15, 2026                                                    │
│    Hero Section                   09:14 - 09:39      25 min     │
│    Navigation                     10:02 - 10:27      25 min     │
│                                             Subtotal: 50 min    │
│                                                                   │
│  Jan 16, 2026                                                    │
│    ...                                                           │
│                                                                   │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  TOTAL                                               32h 45min   │
│                                                                   │
│  Generated on Jan 31, 2026 with Particle                        │
└─────────────────────────────────────────────────────────────────┘
```

### Chat Flow

```
User: "Export Website Redesign for January"

Coach: "Here's your summary for 'Website Redesign' in January:

        Total: 32h 45min
        Sessions: 47 particles

        [Download as CSV] [Download as PDF]

        Want me to break it down by task?"
```

## API Endpoint

```typescript
// POST /api/coach/export
interface ExportRequest {
  projectId?: string;
  projectName?: string; // If no ID known
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

- [x] Export logic implemented
- [x] CSV export works
- [x] PDF export works
- [ ] Coach understands export requests *(Follow-up)*
- [ ] Download links in chat *(Follow-up)*
- [x] Project/date filtering

## Implementation Notes

**Files created:**
- `src/lib/export/` - Export library (types, csv, pdf, prepare-data)
- `src/app/api/export/route.ts` - API endpoint for PDF generation
- `src/components/export/ExportDialog.tsx` - Export modal UI

**UI Integration:**
- Export button in ProjectDetailModal header
- Keyboard shortcut: `X`
- Period selector: This Week, This Month, Last Month
- Format selector: PDF (default), CSV

**Follow-up tasks:**
- Coach chat integration for natural language export requests
- Custom date range picker
