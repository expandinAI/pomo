---
type: story
status: backlog
priority: p1
effort: 2
feature: year-view
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [year-view, projects, filter, p1]
---

# POMO-118: Projekt-Filter – Fokussiere dein Jahr

## User Story

> Als **Particle-Nutzer mit mehreren Projekten**
> möchte ich **die Year View nach einem Projekt filtern können**,
> damit **ich sehen kann, wie viel Zeit ich in ein bestimmtes Projekt investiert habe**.

## Kontext

Link zum Feature: [[features/year-view]]

Abhängigkeiten:
- [[stories/backlog/POMO-110-year-view-data]] (projectId Parameter vorbereitet)
- [[features/project-tracking]]

Der Projekt-Filter ermöglicht eine fokussierte Sicht auf ein einzelnes Projekt. Freelancer können so sehen: "Wie viel habe ich dieses Jahr für Client A gearbeitet?" – visualisiert als eigenständiges Grid.

**Priorität P1:** Abhängig von Project Tracking, daher nachgelagert.

## Akzeptanzkriterien

### Filter-UI
- [ ] **Given** die Year View, **When** Projekte existieren, **Then** sehe ich ein Dropdown "Alle Projekte"
- [ ] **Given** das Dropdown, **When** ich es öffne, **Then** sehe ich alle aktiven Projekte + "Alle Projekte"
- [ ] **Given** ich wähle ein Projekt, **When** das Grid aktualisiert, **Then** zeigt es nur Partikel dieses Projekts

### Grid Anpassung
- [ ] **Given** ein Projekt ist gefiltert, **When** ich das Grid sehe, **Then** zeigt die Brightness nur dieses Projekts Daten
- [ ] **Given** ein Projekt ist gefiltert, **When** ich das Grid sehe, **Then** ist das Personal Max relativ zu diesem Projekt

### Summary Anpassung
- [ ] **Given** ein Projekt ist gefiltert, **When** ich die Summary sehe, **Then** zeigt sie nur Daten dieses Projekts
- [ ] **Given** ein Projekt ist gefiltert, **When** ich "Partikel" sehe, **Then** zeigt es den Projekt-Namen daneben

### Tooltip Anpassung
- [ ] **Given** ein Projekt ist gefiltert, **When** ich über einen Tag hovere, **Then** zeigt der Tooltip "Projekt: [Name]" nicht mehr (redundant)

### URL State
- [ ] **Given** ich filtere nach Projekt, **When** ich die URL sehe, **Then** enthält sie `?project=xyz`
- [ ] **Given** ich öffne eine URL mit `?project=xyz`, **When** die View lädt, **Then** ist das Projekt vorausgewählt

## Technische Details

### ProjectFilter Component

```typescript
// src/components/year-view/ProjectFilter.tsx

interface ProjectFilterProps {
  projects: Project[];
  selectedProjectId: string | null;
  onProjectChange: (projectId: string | null) => void;
}

export function ProjectFilter({
  projects,
  selectedProjectId,
  onProjectChange,
}: ProjectFilterProps) {
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <Dropdown
      trigger={
        <button className="project-filter-trigger">
          <span>
            {selectedProject ? selectedProject.name : 'Alle Projekte'}
          </span>
          <ChevronDown />
        </button>
      }
    >
      <DropdownItem
        selected={selectedProjectId === null}
        onClick={() => onProjectChange(null)}
      >
        Alle Projekte
      </DropdownItem>

      <DropdownSeparator />

      {projects.map((project) => (
        <DropdownItem
          key={project.id}
          selected={project.id === selectedProjectId}
          onClick={() => onProjectChange(project.id)}
        >
          <ProjectDot brightness={project.brightness} />
          {project.name}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
```

### Year View mit Filter

```typescript
// src/components/year-view/YearView.tsx

export function YearView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    searchParams.get('project')
  );

  const { data, isLoading } = useYearViewData(currentYear, selectedProjectId);
  const { projects } = useProjects();

  const handleProjectChange = (projectId: string | null) => {
    setSelectedProjectId(projectId);

    // URL updaten
    const params = new URLSearchParams(searchParams);
    if (projectId) {
      params.set('project', projectId);
    } else {
      params.delete('project');
    }
    router.replace(`/year?${params.toString()}`);
  };

  return (
    <div className="year-view">
      <header className="year-header">
        <BackButton />
        <YearSelector ... />
        <ProjectFilter
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={handleProjectChange}
        />
      </header>

      <YearGrid data={data} />

      <YearSummary
        summary={data.summary}
        projectName={selectedProjectId ? getProject(selectedProjectId)?.name : null}
      />
    </div>
  );
}
```

### Summary mit Projekt-Name

```typescript
// src/components/year-view/YearSummary.tsx

interface YearSummaryProps {
  summary: YearViewSummary;
  projectName?: string | null;
}

export function YearSummary({ summary, projectName }: YearSummaryProps) {
  return (
    <div className="year-summary">
      <SummaryCard
        value={summary.totalParticles.toLocaleString('de-DE')}
        label={projectName ? `Partikel für ${projectName}` : 'Partikel'}
      />
      {/* ... other cards ... */}
    </div>
  );
}
```

### Betroffene Dateien

```
src/
└── components/
    └── year-view/
        ├── YearView.tsx         # Filter Integration
        ├── ProjectFilter.tsx    # NEU
        ├── YearSummary.tsx      # projectName Prop
        └── project-filter.css
```

## UI/UX

### Header mit Project Filter

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ← Zurück                     2025                                │
│                           [<]      [>]                            │
│                                                                   │
│              [Alle Projekte ▼]                                    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Dropdown geöffnet

```
              [Website Redesign ▼]
              ┌─────────────────────────┐
              │ ✓ Alle Projekte         │
              │ ─────────────────────── │
              │   ● Website Redesign    │
              │   ● Mobile App          │
              │   ● Freelance: Client A │
              └─────────────────────────┘
```

### Gefilterte Summary

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│    312              130h 15m          12 Tage          78         │
│  PARTIKEL FÜR      FOKUSZEIT      LÄNGSTE SERIE   AKTIVE TAGE    │
│ WEBSITE REDESIGN                                                  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] Dropdown zeigt alle Projekte
- [ ] "Alle Projekte" zeigt komplettes Grid
- [ ] Projekt-Filter zeigt nur dieses Projekt
- [ ] Brightness passt sich an (neues Personal Max)
- [ ] Summary zeigt Projekt-Name
- [ ] URL enthält `?project=xyz`
- [ ] URL-Parameter wird bei Load angewendet
- [ ] Peak Day ist relativ zum gefilterten Projekt

### Automatisierte Tests

```typescript
describe('ProjectFilter', () => {
  it('filters year view data by project', async () => {
    const { result } = renderHook(() =>
      useYearViewData(2025, 'project-123')
    );

    await waitFor(() => {
      expect(result.current.data.summary.totalParticles).toBeLessThan(
        allParticles
      );
    });
  });

  it('updates URL when project changes', () => {
    render(<YearView />);

    fireEvent.click(screen.getByText('Website Redesign'));

    expect(window.location.search).toContain('project=');
  });

  it('loads project from URL parameter', () => {
    // Mock URL with project param
    mockSearchParams({ project: 'project-123' });

    render(<YearView />);

    expect(screen.getByText('Website Redesign')).toHaveClass('selected');
  });
});
```

## Definition of Done

- [ ] ProjectFilter Component implementiert
- [ ] Dropdown mit Projekten
- [ ] Grid zeigt gefilterte Daten
- [ ] Brightness relativ zu gefiltertem Max
- [ ] Summary zeigt Projekt-Name
- [ ] URL State (`?project=xyz`)
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**UX-Überlegung:**
- Filter-State ist Teil der URL → Shareable
- Bei Projekt-Wechsel: Animation spielt erneut
- "Alle Projekte" als erster Eintrag (Clear-Filter)

**Abhängigkeit:**
- Braucht Project Tracking Feature (POMO-100 bis POMO-107)
- Daher P1, nicht P0

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
