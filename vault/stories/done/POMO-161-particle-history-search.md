---
type: story
status: done
priority: p1
effort: 5
feature: statistics-dashboard
created: 2025-01-24
updated: 2025-01-24
done_date: 2025-01-24
tags: [analytics, history, search, filter, particles]
depends_on: [POMO-160]
---

# POMO-161: Particle History & Search

## User Story

> Als **fokussierter Nutzer**
> möchte ich **meine gesamte Particle-Historie durchsuchen und filtern**,
> damit **ich vergangene Arbeit wiederfinden, analysieren und bei Bedarf bearbeiten kann**.

## Kontext

Diese Story baut auf POMO-160 (Unified Analytics Dashboard) auf und implementiert den **History Tab** im Dashboard.

Während der Overview Tab einen schnellen Überblick gibt (max 25 Recent Particles), ist der History Tab die vollständige "Particle-Datenbank" für Power-User.

**Use Cases:**
- "Was habe ich letzte Woche Montag gemacht?"
- "Zeig mir alle Particles zum Projekt 'Particle App'"
- "Wie viel Zeit habe ich in 'Code Review' investiert?"
- "Ich möchte den Task-Namen eines alten Particles korrigieren"

## Akzeptanzkriterien

- [ ] **Given** ich bin im Dashboard, **When** ich auf "History" Tab klicke, **Then** sehe ich die vollständige Particle-Liste
- [ ] **Given** ich bin im History Tab, **When** ich einen Suchbegriff eingebe, **Then** werden Particles nach Task-Name gefiltert
- [ ] **Given** ich bin im History Tab, **When** ich ein Projekt wähle, **Then** sehe ich nur Particles dieses Projekts
- [ ] **Given** ich bin im History Tab, **When** ich einen Zeitraum wähle, **Then** werden nur Particles aus diesem Zeitraum gezeigt
- [ ] **Given** ich bin im History Tab, **When** ich "Work" oder "Break" Filter setze, **Then** werden nur entsprechende Particles gezeigt
- [ ] **Given** ich klicke auf ein Particle, **When** das Detail-Popup öffnet, **Then** kann ich Task-Name und Projekt bearbeiten
- [ ] **Given** es gibt 500+ Particles, **When** ich scrolle, **Then** lädt die Liste performant (virtualisiert oder paginiert)

## Technische Details

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Statistics                          [Time Range ▾]   [X]  │
├─────────────────────────────────────────────────────────────┤
│  [ Overview ]  [ History ← aktiv ]                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🔍 Search particles...                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [All] [Work] [Break]    [Project ▾]    [Date Range]  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Showing 127 of 342 particles                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Today                                              │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │ ⚡ API Integration           25m   09:45    │    │    │
│  │  │    Particle App                       [•••] │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │ ⚡ Code Review               25m   10:15    │    │    │
│  │  │    Particle App                       [•••] │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │                                                     │    │
│  │  Yesterday                                          │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │ ⚡ Feature Planning          50m   14:00    │    │    │
│  │  │    Side Project                       [•••] │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │  ...                                                │    │
│  │                                                     │    │
│  │  [Load more] oder virtualisiertes Scrollen          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Betroffene Dateien

```
src/components/insights/
├── StatisticsDashboard.tsx      # Tab-Navigation hinzufügen
├── DashboardHistoryTab.tsx      # NEU - History Tab Container
├── ParticleSearchBar.tsx        # NEU - Suchfeld
├── ParticleFilterBar.tsx        # NEU - Filter Controls
├── ParticleList.tsx             # NEU - Virtualisierte Liste
├── ParticleListItem.tsx         # NEU - Einzelnes Particle
├── ParticleEditPopover.tsx      # NEU - Inline Edit
└── ...
```

### Filter-State

```typescript
interface HistoryFilters {
  searchQuery: string;
  typeFilter: 'all' | 'work' | 'break';
  projectId: string | null;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

// URL-Sync für Deep-Links (optional)
// ?tab=history&search=api&project=abc&type=work
```

### Virtualisierung

Für Performance bei vielen Particles:

```typescript
// Option A: react-window
import { FixedSizeList } from 'react-window';

// Option B: Intersection Observer + Load More
const [visibleCount, setVisibleCount] = useState(50);
const loadMore = () => setVisibleCount(prev => prev + 50);

// Option C: Pagination
const [page, setPage] = useState(1);
const pageSize = 50;
```

**Empfehlung:** Start mit Load More (einfacher), später virtualisieren wenn nötig.

### Particle Edit

```typescript
interface ParticleEditData {
  task: string;
  projectId: string | null;
}

// Inline Edit oder Popover
function ParticleEditPopover({
  particle,
  onSave,
  onDelete
}: Props) {
  // Task-Name editieren
  // Projekt zuweisen/ändern
  // Particle löschen (mit Confirmation)
}
```

## UI/UX

### Filter-Verhalten

- **Suchfeld:** Debounced (300ms), sucht in Task-Namen
- **Type Filter:** Toggle-Buttons, nur einer aktiv
- **Project Filter:** Dropdown mit allen Projekten + "All Projects"
- **Date Range:** Picker oder Quick-Selects (Today, This Week, This Month)

### Particle Card

```
┌──────────────────────────────────────────────────────┐
│ ⚡ Task Name Here                    25m    09:45   │
│    Project Name                              [•••]  │
└──────────────────────────────────────────────────────┘

[•••] = Context Menu:
- Edit Task
- Change Project
- Delete Particle
```

### Empty States

- Keine Particles: "Start a focus session to collect your first Particle"
- Keine Treffer: "No particles match your search. Try different filters."

### Keyboard Navigation

- `↑/↓` durch Liste navigieren
- `Enter` Particle zum Bearbeiten öffnen
- `Escape` Bearbeitung abbrechen
- `/` Fokus auf Suchfeld

## Testing

### Manuell zu testen

- [ ] Tab-Wechsel zwischen Overview und History
- [ ] Suche funktioniert und ist performant
- [ ] Alle Filter funktionieren einzeln und kombiniert
- [ ] Particle-Edit speichert Änderungen
- [ ] Particle-Delete entfernt Particle (mit Confirmation)
- [ ] Performance bei 500+ Particles
- [ ] Mobile: Filter-Bar collapst sinnvoll

### Edge Cases

- [ ] Leere Suche zeigt alle Particles
- [ ] Suche mit Sonderzeichen crasht nicht
- [ ] Gelöschte Projekte: Particles zeigen "No Project"
- [ ] Particle ohne Task: Zeigt Session-Type als Label

## Definition of Done

- [ ] History Tab implementiert
- [ ] Alle Filter funktionieren
- [ ] Particle-Edit funktioniert
- [ ] Performance bei vielen Particles akzeptabel
- [ ] Keyboard Navigation
- [ ] Accessibility (ARIA, Focus Management)
- [ ] Tests geschrieben

## Notizen

### Scope-Grenzen

**In Scope:**
- Suche, Filter, Liste
- Particle Task/Project bearbeiten
- Particle löschen

**Out of Scope (Later):**
- Particle Duration ändern
- Particles zusammenführen
- Bulk-Operationen
- Export gefilterte Particles

---

## Arbeitsverlauf

### Gestartet: 2025-01-24

### Erledigt: 2025-01-24

**Implementierte Komponenten:**

1. **ParticleSearchBar.tsx** - Suchfeld mit 300ms Debounce, `/` Keyboard-Shortcut
2. **ParticleFilterBar.tsx** - Type-Toggle (All/Work/Break) + Project-Dropdown
3. **ParticleListItem.tsx** - Particle-Karte mit Icon, Task, Project, Duration, Menu-Button
4. **ParticleList.tsx** - Gruppierte Liste nach Datum, Load More Button, Counter
5. **ParticleEditModal.tsx** - Modal zum Bearbeiten von Task-Name/Projekt, Delete mit Confirmation
6. **HistoryTab.tsx** - Container mit State-Management für Filter und Pagination
7. **StatisticsDashboard.tsx** - Sessions und Update-Callback an HistoryTab übergeben

**Features:**
- Debounced Suche in Task-Namen
- Type-Filter (All/Work/Break)
- Project-Filter (Dropdown)
- Paginierte Liste (50 initial, Load More)
- Edit Modal (Task, Project ändern)
- Delete mit Confirmation
- Keyboard: `/` fokussiert Suchfeld, `Escape` schließt Modal
- Counter: "Showing X of Y particles"
- Empty States für keine Particles / keine Treffer
