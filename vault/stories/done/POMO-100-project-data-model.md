---
type: story
status: done
priority: p0
effort: 3
feature: project-tracking
created: 2026-01-20
updated: 2026-01-21
done_date: 2026-01-21
tags: [projects, database, migration, p0]
---

# POMO-100: Project Data Model & Migration

## User Story

> Als **Particle-Nutzer**
> möchte ich **Projekte als Datenbankstruktur verfügbar haben**,
> damit **ich meine Partikel später Projekten zuordnen kann**.

## Kontext

Link zum Feature: [[features/project-tracking]]

Dies ist die Foundation-Story für Project Tracking. Ohne das Datenmodell können keine weiteren Features gebaut werden. Die Migration muss sauber sein, damit bestehende Partikel erhalten bleiben.

## Akzeptanzkriterien

- [x] **Given** die App startet, **When** die Datenbank initialisiert wird, **Then** existiert eine `projects` Tabelle
- [x] **Given** bestehende Partikel, **When** die Migration läuft, **Then** haben alle Partikel `projectId: null`
- [x] **Given** ein Projekt wird erstellt, **When** es gespeichert wird, **Then** enthält es id, name, brightness, archived, createdAt, updatedAt
- [x] **Given** ein Partikel wird gespeichert, **When** ein Projekt ausgewählt ist, **Then** enthält der Partikel die `projectId`

## Technische Details

### Implementierte Dateien
```
src/
├── lib/
│   ├── projects/
│   │   ├── types.ts          # Project Interface, Constants
│   │   ├── storage.ts        # CRUD Operations (localStorage)
│   │   ├── stats.ts          # Statistics Functions
│   │   └── index.ts          # Module Exports
│   └── session-storage.ts    # Extended with projectId
├── hooks/
│   └── useProjects.ts        # React Hook for state management
```

### Implementierungshinweise
- localStorage für lokale Speicherung (wie bestehende Sessions)
- Custom ID Generator für Project IDs (`proj_timestamp-random`)
- Brightness als Float 0.3-1.0 (nicht 0-1, damit immer sichtbar)
- Soft-Delete via `archived` boolean, kein echtes Löschen

### TypeScript Interfaces

```typescript
// src/lib/projects/types.ts

export interface Project {
  id: string;                    // proj_timestamp-random
  name: string;                  // Max 50 Zeichen
  brightness: number;            // 0.3 - 1.0
  archived: boolean;             // Default: false
  createdAt: string;             // ISO string
  updatedAt: string;             // ISO string
}

export interface ProjectWithStats extends Project {
  particleCount: number;
  totalDuration: number;
  weekParticleCount: number;
  monthParticleCount: number;
}

// CompletedSession erweitert
export interface CompletedSession {
  // ...existing fields...
  projectId?: string;            // Optional project assignment
}
```

### Storage Functions

```typescript
// src/lib/projects/storage.ts
export function loadProjects(): Project[]
export function createProject(data: CreateProjectData): Project
export function updateProject(id: string, data: UpdateProjectData): Project | null
export function archiveProject(id: string): Project | null
export function restoreProject(id: string): Project | null
export function getActiveProjects(): Project[]
export function isDuplicateName(name: string, excludeId?: string): boolean
```

### Statistics Functions

```typescript
// src/lib/projects/stats.ts
export function getSessionsForProject(projectId: string | null): CompletedSession[]
export function getProjectStats(project: Project): ProjectWithStats
export function getAllProjectsWithStats(includeArchived?: boolean): ProjectWithStats[]
export function getProjectBreakdown(timeRange: 'week' | 'month' | 'all'): ProjectBreakdown[]
export function getRecentProjectIds(limit?: number): string[]
```

### React Hook

```typescript
// src/hooks/useProjects.ts
export function useProjects(): {
  projects: Project[];
  activeProjects: Project[];
  archivedProjects: Project[];
  projectsWithStats: ProjectWithStats[];
  selectedProjectId: string | null;
  selectProject: (projectId: string | null) => void;
  create: (data: CreateProjectData) => Project;
  update: (id: string, data: UpdateProjectData) => Project | null;
  archive: (id: string) => Project | null;
  restore: (id: string) => Project | null;
  getById: (id: string) => Project | null;
  checkDuplicateName: (name: string, excludeId?: string) => boolean;
  recentProjectIds: string[];
  refresh: () => void;
  isLoading: boolean;
}
```

## UI/UX

Keine UI in dieser Story. Dies ist eine reine Backend/Datenbank-Story.

## Definition of Done

- [x] Code implementiert
- [x] TypeScript Types exportiert
- [x] Storage Layer implementiert (localStorage statt IndexedDB)
- [x] Validation Rules implementiert
- [x] Typecheck bestanden
- [x] Keine Breaking Changes für bestehende Daten

## Arbeitsverlauf

### Erledigt: 2026-01-21

**Implementiert:**
1. `src/lib/projects/types.ts` - Project Interface mit BRIGHTNESS_PRESETS
2. `src/lib/projects/storage.ts` - Full CRUD mit localStorage
3. `src/lib/projects/stats.ts` - Statistik-Funktionen für Projekte
4. `src/lib/projects/index.ts` - Clean Module Export
5. `src/hooks/useProjects.ts` - React Hook mit selectedProject Persistence
6. `src/lib/session-storage.ts` - CompletedSession um projectId erweitert

**Entscheidungen:**
- localStorage statt IndexedDB (konsistent mit bestehender Session-Speicherung)
- Brightness-Presets von 0.3-1.0 (5 Stufen: Dark, Dim, Medium, Bright, White)
- `useProjects` Hook speichert selectedProjectId separat für Session-Persistence
