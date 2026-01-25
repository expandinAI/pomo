---
type: story
status: done
priority: p1
effort: 1
feature: year-view
created: 2026-01-20
updated: 2026-01-25
done_date: 2026-01-25
tags: [year-view, projects, filter, p1]
---

# POMO-118: Year View Project Filter

## User Story

> As a **Particle user with multiple projects**
> I want to **filter the Year View by project**
> so that **I can see how much time I invested in a specific project this year**.

## Context

Link to feature: [[features/year-view]]

**Use Case:** Freelancers can see "How much did I work for Client A this year?" — visualized as a focused grid showing only that project's particles.

**DRY Principle:** Reuse existing `ProjectFilterDropdown` component from insights.

## Acceptance Criteria

### Filter Integration
- [ ] **Given** the Year View modal, **When** projects exist, **Then** I see a ProjectFilterDropdown in the header
- [ ] **Given** I select a project, **When** the grid updates, **Then** it shows only particles of that project
- [ ] **Given** no projects exist, **When** I open Year View, **Then** no filter is shown

### Grid Adaptation
- [ ] **Given** a project is filtered, **When** I see the grid, **Then** brightness is relative to that project's personal max
- [ ] **Given** a project is filtered, **When** I see the grid, **Then** peak day is within that project's data

### Summary Adaptation
- [ ] **Given** a project is filtered, **When** I see the summary, **Then** it shows only that project's data
- [ ] **Given** a project is filtered, **When** I look at the header, **Then** I see "Filtered: [Project Name]" indicator

### State Reset
- [ ] **Given** I close the Year View, **When** I reopen it, **Then** filter is reset to "All Projects"
- [ ] **Given** I change the year, **When** the view updates, **Then** filter persists within the session

## Technical Details

### Implementation Approach

**1. Enable projectId filtering in data API** (`src/lib/year-view/aggregation.ts`):

```typescript
export function filterWorkSessionsForYear(
  sessions: CompletedSession[],
  year: number,
  projectId?: string | null  // Add parameter
): CompletedSession[] {
  return sessions.filter((session) => {
    if (session.type !== 'work') return false;
    const sessionDate = new Date(session.completedAt);
    if (sessionDate.getFullYear() !== year) return false;
    // Filter by project if specified
    if (projectId && session.projectId !== projectId) return false;
    return true;
  });
}
```

**2. Update data.ts** to pass projectId:

```typescript
export async function getYearViewData(
  year: number,
  projectId?: string | null
): Promise<YearViewData> {
  const sessions = loadSessions();
  const workSessions = filterWorkSessionsForYear(sessions, year, projectId);
  // ... rest unchanged
}
```

**3. Add filter to YearViewModal** (`src/components/year-view/YearViewModal.tsx`):

```typescript
import { ProjectFilterDropdown } from '@/components/insights/ProjectFilterDropdown';
import { useProjects } from '@/hooks/useProjects';

export function YearViewModal() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { activeProjects } = useProjects();

  // Load data with project filter
  useEffect(() => {
    if (isOpen && !useMockData) {
      getYearViewData(currentYear, selectedProjectId).then(setRealData);
    }
  }, [isOpen, currentYear, useMockData, selectedProjectId]);

  // Reset filter when modal closes
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSelectedProjectId(null);  // Reset filter
    setHoveredCell(null);
  }, []);

  // In header, next to Demo toggle:
  {activeProjects.length > 0 && (
    <ProjectFilterDropdown
      value={selectedProjectId}
      onChange={setSelectedProjectId}
      projects={activeProjects}
    />
  )}

  // Show filter indicator below year selector when filtered:
  {selectedProjectId && (
    <p className="text-xs text-tertiary">
      Filtered: {activeProjects.find(p => p.id === selectedProjectId)?.name}
    </p>
  )}
}
```

### Files to Change

| File | Change |
|------|--------|
| `src/lib/year-view/aggregation.ts` | Add `projectId` parameter to `filterWorkSessionsForYear` |
| `src/lib/year-view/data.ts` | Pass `projectId` to filter function |
| `src/components/year-view/YearViewModal.tsx` | Add state, dropdown, indicator |

### No New Files Needed

Reuses existing:
- `ProjectFilterDropdown` from `src/components/insights/`
- `useProjects` hook

## UI Design

### Header with Project Filter

```
┌─────────────────────────────────────────────────────────────────┐
│  Year View              [All Projects ▼]        [Demo]    [×]  │
└─────────────────────────────────────────────────────────────────┘
```

### With Active Filter

```
┌─────────────────────────────────────────────────────────────────┐
│  Year View              [● Client A ▼]          [Demo]    [×]  │
│                                                                 │
│                           ◀  2025  ▶                           │
│                       Filtered: Client A                        │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    [Year Grid]                          │  │
│   │              (only Client A particles)                  │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│      127 particles  ·  53h 20m  ·  8 days  ·  34 active        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Testing

### Manual Testing
- [ ] Filter dropdown appears when projects exist
- [ ] "All Projects" shows complete grid
- [ ] Project filter shows only that project's data
- [ ] Brightness adapts (new personal max for filtered data)
- [ ] Summary shows filtered totals
- [ ] Filter indicator visible when active
- [ ] Filter resets when modal closes
- [ ] Filter persists across year changes

## Definition of Done

- [ ] `filterWorkSessionsForYear` accepts projectId parameter
- [ ] `getYearViewData` passes projectId to filter
- [ ] YearViewModal has filter state
- [ ] ProjectFilterDropdown integrated in header
- [ ] Filter indicator shown when active
- [ ] Filter resets on modal close
- [ ] No TypeScript errors
- [ ] No console errors

## Out of Scope

- URL state persistence (modal-based, not needed)
- Keyboard shortcut to open filter (dropdown has its own)
- Custom tests (later)
- Filter in tooltip (redundant when filtered)

---

## Work Log

### Started:
2026-01-25: Implementation using existing ProjectFilterDropdown

### Completed:
2026-01-25: Shipped in commit 5817a46
