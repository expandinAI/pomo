---
type: story
status: backlog
priority: p0
effort: 3
feature: project-tracking
created: 2026-01-20
updated: 2026-01-20
done_date: null
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

- [ ] **Given** die App startet, **When** die Datenbank initialisiert wird, **Then** existiert eine `projects` Tabelle
- [ ] **Given** bestehende Partikel, **When** die Migration läuft, **Then** haben alle Partikel `projectId: null`
- [ ] **Given** ein Projekt wird erstellt, **When** es gespeichert wird, **Then** enthält es id, name, brightness, archived, createdAt, updatedAt
- [ ] **Given** ein Partikel wird gespeichert, **When** ein Projekt ausgewählt ist, **Then** enthält der Partikel die `projectId`

## Technische Details

### Betroffene Dateien
```
src/
├── lib/
│   ├── db/
│   │   ├── schema.ts          # NEU: Project Schema
│   │   ├── migrations/        # NEU: Migration für projects
│   │   └── index.ts           # Export erweitern
│   └── types.ts               # Project & Particle Types
```

### Implementierungshinweise
- IndexedDB für lokale Speicherung (wie bestehende Sessions)
- UUID für Project IDs (crypto.randomUUID())
- Brightness als Float 0.3-1.0 (nicht 0-1, damit immer sichtbar)
- Soft-Delete via `archived` boolean, kein echtes Löschen

### TypeScript Interfaces

```typescript
// src/lib/types.ts

export interface Project {
  id: string;                    // UUID
  name: string;                  // Max 50 Zeichen
  brightness: number;            // 0.3 - 1.0
  archived: boolean;             // Default: false
  createdAt: Date;
  updatedAt: Date;
}

// Particle erweitern
export interface Particle {
  // ...existing fields...
  projectId?: string | null;     // FK zu Project, optional
}
```

### Datenbank-Änderungen

```typescript
// IndexedDB Schema Update

// Neue Object Store
const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
projectStore.createIndex('name', 'name', { unique: false });
projectStore.createIndex('archived', 'archived', { unique: false });
projectStore.createIndex('createdAt', 'createdAt', { unique: false });

// Particles Store erweitern (neuer Index)
particleStore.createIndex('projectId', 'projectId', { unique: false });
```

### Validation Rules

```typescript
// src/lib/validation.ts

export const projectSchema = {
  name: {
    minLength: 1,
    maxLength: 50,
    required: true,
  },
  brightness: {
    min: 0.3,
    max: 1.0,
    default: 0.7,
  },
  archived: {
    default: false,
  },
};
```

## UI/UX

Keine UI in dieser Story. Dies ist eine reine Backend/Datenbank-Story.

## Testing

### Manuell zu testen
- [ ] Fresh Install: `projects` Store wird erstellt
- [ ] Bestehende DB: Migration läuft ohne Datenverlust
- [ ] Bestehende Partikel behalten alle Daten, haben `projectId: null`

### Automatisierte Tests
- [ ] Unit Test: Project Interface Validation
- [ ] Unit Test: Brightness Clamping (0.3-1.0)
- [ ] Integration Test: Migration auf bestehende DB
- [ ] Integration Test: Particle mit projectId speichern/laden

```typescript
// __tests__/lib/project.test.ts

describe('Project Data Model', () => {
  it('creates a project with all required fields', () => {
    const project = createProject({ name: 'Test Project' });
    expect(project.id).toBeDefined();
    expect(project.name).toBe('Test Project');
    expect(project.brightness).toBe(0.7);
    expect(project.archived).toBe(false);
    expect(project.createdAt).toBeInstanceOf(Date);
  });

  it('clamps brightness to valid range', () => {
    const project1 = createProject({ name: 'Test', brightness: 0.1 });
    expect(project1.brightness).toBe(0.3);

    const project2 = createProject({ name: 'Test', brightness: 1.5 });
    expect(project2.brightness).toBe(1.0);
  });

  it('enforces max name length', () => {
    const longName = 'a'.repeat(100);
    expect(() => createProject({ name: longName })).toThrow();
  });
});
```

## Definition of Done

- [ ] Code implementiert
- [ ] TypeScript Types exportiert
- [ ] Migration geschrieben & getestet
- [ ] Validation Rules implementiert
- [ ] Tests geschrieben & grün
- [ ] Keine Breaking Changes für bestehende Daten
- [ ] Code reviewed

## Notizen

**Wichtig:** Diese Story muss zuerst fertig sein, bevor POMO-101 bis POMO-107 beginnen können. Alle anderen Stories haben eine Dependency auf diese.

**Migration-Strategie:**
1. Neue `projects` Object Store erstellen
2. Bestehende `particles` Store: Index für `projectId` hinzufügen
3. Bestehende Partikel: `projectId: null` setzen (oder undefined lassen)

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
