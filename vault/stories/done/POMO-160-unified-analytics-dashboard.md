---
type: story
status: backlog
priority: p1
effort: 8
feature: statistics-dashboard
created: 2025-01-24
updated: 2025-01-24
done_date: null
tags: [analytics, dashboard, redesign, heatmap, history]
---

# POMO-160: Unified Analytics Dashboard

## User Story

> Als **fokussierter Nutzer**
> möchte ich **alle meine Analytics-Daten in einem übersichtlichen Dashboard sehen**,
> damit **ich auf einen Blick verstehe, wie ich meine Zeit investiere und wo meine Peak-Zeiten liegen**.

## Kontext

Mit der ActionBar (commit 3ae1eea) wurden FocusHeatmap und SessionHistory Icons entfernt. Die Daten dieser Komponenten müssen nun ins Statistics Dashboard integriert werden.

**Aktueller Stand:**
- StatisticsDashboard: Focus Score, Deep Work, Streak, Weekly Chart, Project Breakdown, Session Timeline
- FocusHeatmap: GitHub-style Heatmap mit Peak-Zeiten (30 Tage)
- SessionHistory: Detaillierte Session-Liste mit Filter & Suche

**Ziel:** Ein einheitliches Dashboard, das alle Daten auf einen Blick zeigt.

## Akzeptanzkriterien

- [ ] **Given** ich öffne das Dashboard, **When** es lädt, **Then** sehe ich den Overview Tab mit allen KPIs
- [ ] **Given** ich bin im Overview Tab, **When** ich scrolle, **Then** sehe ich Hero Metrics, Heatmap, Chart, Projects, Recent Particles
- [ ] **Given** ich bin im Dashboard, **When** ich den Time Range ändere, **Then** aktualisiert sich die Heatmap entsprechend
- [ ] **Given** ich sehe Recent Particles, **When** ich "All Particles" klicke, **Then** wechsle ich zum History Tab (Platzhalter für POMO-161)
- [ ] **Given** ich bin im Dashboard, **When** ich auf "History" Tab klicke, **Then** sehe ich einen Platzhalter "Coming soon" (wird in POMO-161 implementiert)
- [ ] **Given** das Dashboard ist offen, **When** ich Escape drücke, **Then** schließt es sich
- [ ] **Given** ich nutze ein Screenreader, **When** ich durch das Dashboard navigiere, **Then** sind alle Sections korrekt angekündigt

## Technische Details

### Neues Layout (Tabs: Overview + History)

```
┌─────────────────────────────────────────────────────────────┐
│  Statistics                          [Time Range ▾]   [X]  │
├─────────────────────────────────────────────────────────────┤
│  [ Overview ]  [ History ]                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ═══════════════════ TAB: OVERVIEW ═══════════════════     │
│                                                             │
│  HERO METRICS (3er Grid, prominent)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   127.5h     │  │    42        │  │    86%       │       │
│  │  Total Focus │  │   Particles  │  │  Focus Score │       │
│  │  seit Start  │  │  diese Woche │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  FOCUS PATTERNS (Heatmap - folgt Time Range!)               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │       Mo  Di  Mi  Do  Fr  Sa  So                    │    │
│  │  06   ░░  ▓▓  ▓▓  ░░  ▓▓  ░░  ░░                    │    │
│  │  09   ▓▓  ▓▓  ██  ▓▓  ▓▓  ░░  ░░   ← Peak 09-12    │    │
│  │  12   ░░  ▓▓  ▓▓  ▓▓  ░░  ░░  ░░                    │    │
│  │  15   ░░  ░░  ▓▓  ░░  ░░  ░░  ░░                    │    │
│  │  18   ░░  ░░  ░░  ░░  ░░  ░░  ░░                    │    │
│  │  21   ░░  ░░  ░░  ░░  ░░  ░░  ░░                    │    │
│  │                                Less ░░▓▓██ More     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  THIS WEEK (Bar Chart)                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │   Mo ████████████░░░░  3.5h                         │    │
│  │   Di ██████████████████  5.2h                       │    │
│  │   Mi ████████░░░░░░░░░░  2.1h                       │    │
│  │   Do ██████████████░░░░  4.0h                       │    │
│  │   Fr ████████████████░░  4.5h                       │    │
│  │   Sa ░░░░░░░░░░░░░░░░░░  0h                         │    │
│  │   So ████░░░░░░░░░░░░░░  1.2h                       │    │
│  │                          Total: 20.5h  (+12% ↑)     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  PROJECTS                                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │   Particle App  ████████████████  68%  (12.5h)     │    │
│  │   Side Project  ████████░░░░░░░░  24%  (4.2h)      │    │
│  │   Learning      ████░░░░░░░░░░░░   8%  (1.5h)      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  RECENT PARTICLES (max 20-30, Preview)                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Today                                              │    │
│  │    ⚡ Deep Work: API Integration          25m  09:45│    │
│  │    ⚡ Code Review                         25m  10:15│    │
│  │    ☕ Short Break                          5m  10:40│    │
│  │  Yesterday                                          │    │
│  │    ⚡ Feature Planning                    50m  14:00│    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  → Alle Particles durchsuchen (History Tab)                 │
│                                              [Export CSV]   │
└─────────────────────────────────────────────────────────────┘

═══════════════════ TAB: HISTORY (POMO-161) ═══════════════════

Wird in separater Story implementiert:
- Vollständige Particle-Datenbank
- Suche nach Task-Name, Projekt, Zeitraum
- Filter nach Work/Break
- Particle bearbeiten/löschen
- Pagination oder virtualisierte Liste
```

### Betroffene Dateien

```
src/components/insights/
├── StatisticsDashboard.tsx    # KOMPLETT NEU SCHREIBEN
├── DashboardHeroMetrics.tsx   # NEU - 3er KPI Grid
├── DashboardHeatmap.tsx       # NEU - Inline Heatmap (ohne Modal)
├── DashboardWeeklyChart.tsx   # NEU - Refactored Weekly Chart
├── DashboardProjects.tsx      # NEU - Project Breakdown Section
├── DashboardParticles.tsx     # NEU - Session List mit Filter
├── HeatmapGrid.tsx            # BEHALTEN - nur Props anpassen
├── WeeklyBarChart.tsx         # BEHALTEN - evtl. Props anpassen
└── ...
```

### Architektur

```typescript
// Neue Komponenten-Struktur
interface DashboardState {
  timeRange: TimeRange;
  sessions: CompletedSession[];
  searchQuery: string;
  typeFilter: 'all' | 'work' | 'break';
}

// StatisticsDashboard wird zum Container
export function StatisticsDashboard() {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  return (
    <DashboardModal>
      <DashboardHeader timeRange={} onTimeRangeChange={} />
      <DashboardContent>
        <DashboardHeroMetrics sessions={} />
        <DashboardHeatmap sessions={} />
        <DashboardWeeklyChart sessions={} />
        <DashboardProjects sessions={} timeRange={} />
        <DashboardParticles
          sessions={}
          searchQuery={}
          typeFilter={}
          onSearch={}
          onFilterChange={}
        />
      </DashboardContent>
      <DashboardFooter>
        <ExportButton />
      </DashboardFooter>
    </DashboardModal>
  );
}
```

### Daten-Quellen

| Section | Datenquelle | Time Range beeinflusst? |
|---------|-------------|-------------------------|
| Total Hours | `loadSessions()` → all-time | Nein (immer all-time) |
| Particles Count | `filteredSessions` | Ja |
| Focus Score | `calculateFocusScore()` | Ja |
| Heatmap | `buildHeatmap(timeRange)` | **Ja** (folgt Selector) |
| Weekly Chart | `calculateWeeklyStats()` | Nein (immer aktuelle Woche) |
| Projects | `getProjectBreakdown()` | Ja |
| Recent Particles | `filteredSessions.slice(0, 25)` | Ja (max 25 Einträge) |

### Responsive Verhalten

- **Desktop (>768px):** Volle Breite, max-w-2xl
- **Tablet (640-768px):** max-w-lg
- **Mobile (<640px):** Vollbild, Hero Metrics als 2x2 Grid

## UI/UX

### Design-Prinzipien

1. **Information Density:** Viel Daten, wenig Noise
2. **Scannable:** Wichtigstes oben, Details unten
3. **Konsistent:** Gleiche Abstände, gleiche Typografie
4. **Reduced Motion:** Alle Animationen respektieren `prefers-reduced-motion`

### Interaktionen

- **Time Range Selector:** Dropdown (Day/Week/Month/All)
- **Session Filter:** Toggle-Buttons (All/Work/Break)
- **Session Search:** Inline-Textfeld
- **Project Click:** Öffnet Project Detail (wenn vorhanden)
- **Session Click:** Zeigt Task-Details (Tooltip oder Expansion)

### Animationen

- Modal entrance: `scale(0.95) → scale(1)` + `y(20) → y(0)`
- Sections: Staggered fade-in (50ms delay zwischen Sections)
- Heatmap cells: Sehr subtle pulse bei Hover
- Numbers: Count-up Animation für Hero Metrics (optional)

## Testing

### Manuell zu testen

- [ ] Dashboard öffnet via ActionBar (Stats Icon)
- [ ] Dashboard öffnet via G+S Shortcut
- [ ] Time Range ändert alle relevanten Sections
- [ ] Filter/Suche funktioniert in Particles Section
- [ ] Heatmap zeigt korrekte Peak-Zeiten
- [ ] Weekly Chart zeigt aktuelle Woche
- [ ] Export Button generiert korrektes CSV
- [ ] Keyboard Navigation innerhalb des Dashboards
- [ ] Escape schließt Dashboard
- [ ] Korrekte Darstellung auf Mobile

### Edge Cases

- [ ] Keine Sessions: Alle Sections zeigen Empty States
- [ ] Nur Breaks: Work-Metriken zeigen 0
- [ ] Sehr viele Sessions (1000+): Performance okay
- [ ] Sessions über mehrere Jahre: Heatmap/Chart stabil

## Definition of Done

- [ ] Code implementiert (neue Komponenten)
- [ ] Alte Komponenten aufgeräumt (FocusHeatmap Modal, SessionHistory Modal)
- [ ] Tests geschrieben & grün
- [ ] TypeScript strict mode erfüllt
- [ ] Lokal getestet (Desktop + Mobile)
- [ ] Lighthouse Performance > 90
- [ ] Accessibility: ARIA Labels, Focus Trap, Screen Reader Test

## Notizen

### Migration

Nach Abschluss können diese Dateien entfernt werden:
- `src/components/insights/FocusHeatmap.tsx` (Modal-Teil)
- `src/components/insights/SessionHistory.tsx` (komplett)

HeatmapGrid.tsx und andere Utility-Komponenten bleiben.

### Entscheidungen (geklärt)

1. ✅ **Heatmap Time Range:** Folgt dem Selector (nicht fix 30 Tage)
   → Nutzer soll Pattern im gewählten Zeitraum sehen

2. ✅ **Session-Limit:** Max 20-25 in Overview, Link zu History Tab
   → Vollständige Suche/Filter in separater Story (POMO-161)

3. ✅ **Sub-Tabs:** Ja, zwei Tabs
   - **Overview:** KPIs, Heatmap, Chart, Projects, Recent Particles
   - **History:** Particle-Datenbank (POMO-161)

### Abhängige Story

**POMO-161: Particle History & Search** (folgt nach dieser Story)
- History Tab im Dashboard
- Vollständige Particle-Datenbank durchsuchen
- Filter nach Projekt, Zeit, Task-Name
- Particles bearbeiten/löschen

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
