---
type: feature
status: ready
priority: p1
effort: l
business_value: high
origin: "Competitor Analysis: Pomofocus"
stories:
  - "[[stories/backlog/POMO-100-project-data-model]]"
  - "[[stories/backlog/POMO-101-project-crud]]"
  - "[[stories/backlog/POMO-102-project-selector]]"
  - "[[stories/backlog/POMO-103-project-list-view]]"
  - "[[stories/backlog/POMO-104-project-detail-view]]"
  - "[[stories/backlog/POMO-105-project-stats-integration]]"
  - "[[stories/backlog/POMO-106-project-shortcuts]]"
  - "[[stories/backlog/POMO-107-project-command-palette]]"
created: 2026-01-20
updated: 2026-01-20
tags: [projects, freelancer, organization, p1, premium]
---

# Project Tracking

## Zusammenfassung

> Projekte ermoglichen es, Partikel zu gruppieren und zuzuordnen. Jeder Partikel gehort optional zu einem Projekt. Am Ende siehst du: "Fur Projekt X habe ich 47 Partikel gesammelt." Projekte sind Kapitel deines Lebenswerks - nicht To-Do-Listen.

## Kontext & Problem

### Ausgangssituation
Nutzer sammeln Partikel ohne Kontext. Freelancer konnen ihre Zeit nicht pro Kunde/Projekt nachverfolgen. Die Statistiken zeigen nur Gesamtzeit, nicht Verteilung auf Projekte.

### Betroffene Nutzer
- **Freelancer & Consultants:** Brauchen Zeit pro Kunde fur Abrechnung
- **Knowledge Worker:** Wollen sehen, wo ihre Fokuszeit hingeht
- **Entwickler & Designer:** Arbeiten an mehreren Projekten parallel

### Auswirkung
Ohne Projekt-Tracking:
- Weniger Einblick in Zeitverteilung
- Freelancer mussen externe Tools fur Time-Tracking nutzen
- Particle wird "nur" ein Timer, nicht ein Produktivitats-Companion

## Ziele

### Muss erreicht werden
- [ ] Projekte anlegen mit Name + Brightness (Graustufe)
- [ ] Projekt vor/wahrend Session auswahlen
- [ ] Partikel werden mit Projekt verknupft gespeichert
- [ ] Projekt-Liste (`G P`) mit Partikel-Count
- [ ] Projekt-Detail mit Statistiken
- [ ] Projekt bearbeiten (Name, Brightness)
- [ ] Projekt archivieren (Soft Delete)
- [ ] Stats-Integration: "By Project" Breakdown

### Sollte erreicht werden
- [ ] Quick-Switch via `P 1-9` Shortcuts
- [ ] Projekt-Filter in bestehenden Stats-Ansichten
- [ ] "No Project" als explizite Kategorie in Stats

### Nicht im Scope
- Sub-Projekte/Hierarchien
- Projekt-Deadlines oder Milestones
- Team-Sharing von Projekten
- Farben (nur Graustufen - Schwarz-Weiss-Philosophie)
- Icons oder Emojis fur Projekte
- Projekt-Templates
- Billable/Non-Billable Tracking (spater)

## Losung

### Ubersicht

Projekte sind eine optionale Gruppierungsebene fur Partikel. Jeder Partikel kann zu einem Projekt gehoren oder "unassigned" sein. Die Projekt-Auswahl erfolgt vor oder wahrend einer Session uber ein minimales Dropdown oder Shortcuts.

### Datenmodell

**Neues Schema: Project**
```typescript
interface Project {
  id: string;                    // UUID
  name: string;                  // "Website Redesign", max 50 Zeichen
  brightness: number;            // 0.3 - 1.0 (Graustufe fur Visualisierung)
  archived: boolean;             // Versteckt, aber Daten bleiben
  createdAt: Date;
  updatedAt: Date;
}
```

**Session/Particle erweitern:**
```typescript
interface Particle {
  // ...existing fields...
  projectId?: string;            // Optional: Verknupfung zu Projekt
}
```

**Design-Entscheidungen:**

| Entscheidung | Begrundung |
|--------------|------------|
| Keine Farben | Nur Graustufen (`brightness`). Schwarz-Weiss-Philosophie. |
| Kein Icon | Reduktion. Der Name reicht. |
| Kein Deadline | Kein Druck. Projekte sind zeitlos. |
| Optional | Partikel ohne Projekt = vollig okay. |
| Soft-Delete | Archivieren statt Loschen. Lebenswerk geht nicht verloren. |

### User Flows

#### Flow 1: Projekt anlegen

**Trigger:** `Cmd+K` -> "New Project" ODER `G P` -> `N`

```
+------------------------------------------+
|  New Project                             |
+------------------------------------------+
|                                          |
|  Name                                    |
|  +------------------------------------+  |
|  | Website Redesign                   |  |
|  +------------------------------------+  |
|                                          |
|  Brightness                              |
|  o o o * o   (5 Stufen, visuell)        |
|                                          |
|             [Cancel]  [Create Project]   |
|                Esc        Cmd + Enter    |
+------------------------------------------+
```

**Regeln:**
- Name: 1-50 Zeichen, required
- Brightness: Default = 0.7 (mittelhell)
- Keine Duplikat-Namen (Warning, kein Block)
- Sofort nutzbar nach Erstellung

#### Flow 2: Projekt auswahlen (vor/wahrend Session)

**Im Timer-View, unter dem Quick Task Input:**

```
+------------------------------------------+
|                                          |
|                25:00                     |
|           [----------------]             |
|                                          |
|  Working on: API Integration             |
|  Project:    Website Redesign     [v]    |
|                                          |
|            [> Start Session]             |
|                                          |
+------------------------------------------+
```

**Shortcut-Varianten:**

| Shortcut | Aktion |
|----------|--------|
| `P` | Projekt-Dropdown offnen (wenn Timer-View aktiv) |
| `P 1-9` | Schnellauswahl der letzten 9 Projekte |
| `P 0` | Kein Projekt (Partikel ohne Zuordnung) |

**Wahrend laufender Session:**
Projekt kann auch wahrend der Session gewechselt werden.
Der Partikel wird dem **letzten gewahlten Projekt** zugeordnet.

#### Flow 3: Projekt-Ubersicht (`G P`)

```
+-----------------------------------------------------------+
|  <- Projects                               [+ New]  N     |
+-----------------------------------------------------------+
|                                                           |
|  +-------------------------------------------------------+|
|  |  *  Website Redesign                    47 Partikel   ||
|  |     This week: 12 . Total: 47                         ||
|  +-------------------------------------------------------+|
|                                                           |
|  +-------------------------------------------------------+|
|  |  *  Mobile App                          23 Partikel   ||
|  |     This week: 8 . Total: 23                          ||
|  +-------------------------------------------------------+|
|                                                           |
|  +-------------------------------------------------------+|
|  |  *  Freelance: Client A                 89 Partikel   ||
|  |     This week: 0 . Total: 89                          ||
|  +-------------------------------------------------------+|
|                                                           |
|  ---------------------------------------------------------|
|  o  No Project                             34 Partikel    |
|     Particles without assignment                          |
|                                                           |
|  [Show Archived]                                          |
|                                                           |
+-----------------------------------------------------------+
```

**Interaktionen:**
- `Up/Down` oder `J/K`: Navigation
- `Enter`: Projekt-Detail offnen
- `E`: Edit Projekt
- `A`: Archivieren (mit Bestatigung)
- `N`: Neues Projekt

#### Flow 4: Projekt-Detail View

```
+-----------------------------------------------------------+
|  <- Website Redesign                            [Edit]  E |
+-----------------------------------------------------------+
|                                                           |
|  +---------------------------------------------------------+
|  |                                                         |
|  |              47 Partikel                                |
|  |              *******************                        |
|  |              ******************                         |
|  |              ***********                                |
|  |                                                         |
|  |         19h 35m total focus time                        |
|  |                                                         |
|  +---------------------------------------------------------+
|                                                           |
|  This Week        This Month        All Time              |
|  +-----------+    +-----------+     +-----------+         |
|  | 12        |    | 31        |     | 47        |         |
|  | Partikel  |    | Partikel  |     | Partikel  |         |
|  | 5h 0m     |    | 12h 55m   |     | 19h 35m   |         |
|  +-----------+    +-----------+     +-----------+         |
|                                                           |
|  Recent Sessions                                          |
|  ---------------------------------------------------------|
|  Today, 14:32      25min    API Integration               |
|  Today, 11:15      52min    Database Schema               |
|  Yesterday, 16:00  25min    Code Review                   |
|  ...                                                      |
|                                                           |
+-----------------------------------------------------------+
```

#### Flow 5: Projekt archivieren

**Trigger:** `A` auf Projekt ODER "Archive" im Edit-Modal

```
+------------------------------------------+
|  Archive "Website Redesign"?             |
+------------------------------------------+
|                                          |
|  This project has 47 Partikel.           |
|                                          |
|  Archiving hides it from your list,      |
|  but all data is preserved.              |
|                                          |
|  You can restore it anytime.             |
|                                          |
|             [Cancel]  [Archive]          |
|                Esc        Enter          |
+------------------------------------------+
```

**Wichtig:** Kein permanentes Loschen. Lebenswerk geht nicht verloren.

### Statistik-Integration

**Globale Stats erweitern (`G S`):**

```
+-----------------------------------------------------------+
|  Statistics                              [D] [W] [M] [Y]  |
+-----------------------------------------------------------+
|                                                           |
|  ... existing stats ...                                   |
|                                                           |
|  ---------------------------------------------------------|
|                                                           |
|  By Project (This Week)                                   |
|                                                           |
|  Website Redesign     ----------------     12 (48%)       |
|  Mobile App           --------              8 (32%)       |
|  No Project           -----                 5 (20%)       |
|                                                           |
+-----------------------------------------------------------+
```

### Keyboard Shortcuts

**Neue Shortcuts:**

| Shortcut | Kontext | Aktion |
|----------|---------|--------|
| `G P` | Global | Go to Projects |
| `P` | Timer-View | Projekt-Dropdown offnen |
| `P 1-9` | Timer-View | Schnellauswahl Projekt 1-9 |
| `P 0` | Timer-View | Kein Projekt |
| `N` | Projects-View | Neues Projekt |
| `E` | Projects-View | Projekt bearbeiten |
| `A` | Projects-View | Projekt archivieren |
| `Enter` | Projects-View | Projekt-Detail offnen |

**Command Palette erweitern:**

```
+-----------------------------------------------------------+
|  > project...                                             |
+-----------------------------------------------------------+
|  Actions                                                  |
|  |- New Project                                        N  |
|  |- Go to Projects                                   G P  |
|  +- Switch Project...                                  P  |
|                                                           |
|  Projects                                                 |
|  |- Website Redesign                                  P 1 |
|  |- Mobile App                                        P 2 |
|  +- Freelance: Client A                               P 3 |
+-----------------------------------------------------------+
```

### Messaging (Brand Voice)

**Leerer Zustand (keine Projekte):**
```
                    *

       Dein Lebenswerk hat viele Kapitel.

    Erstelle dein erstes Projekt, um deine
           Partikel zu gruppieren.

              [+ Neues Projekt]
```

**Projekt erstellt:**
> "Dein neues Kapitel beginnt. Sammle Partikel."

**Projekt archiviert:**
> "Dieses Kapitel ist abgeschlossen. Deine Partikel bleiben erhalten."

## Akzeptanzkriterien

### Must Have (MVP)

- [ ] Projekt erstellen mit Name + Brightness
- [ ] Projekt auswahlen vor/wahrend Session
- [ ] Partikel wird mit Projekt verknupft gespeichert
- [ ] Projekt-Liste (`G P`) mit Partikel-Count
- [ ] Projekt-Detail mit Statistiken (Woche/Monat/Gesamt)
- [ ] Projekt bearbeiten (Name, Brightness)
- [ ] Projekt archivieren (Soft Delete)
- [ ] Keyboard-first: Alle definierten Shortcuts funktionieren
- [ ] "No Project" als valide Option
- [ ] Stats-Integration: "By Project" Breakdown
- [ ] Archivierte Projekte ausblendbar/einblendbar
- [ ] Migration: Alte Partikel haben `projectId: null`

### Nice to Have (Post-MVP)

- [ ] Projekt-Reihenfolge anpassen (Drag & Drop)
- [ ] Projekt-Filter in Jahresansicht
- [ ] Bulk-Assign: Partikel nachtragich zuordnen
- [ ] Export: Zeit pro Projekt als separate CSV-Spalte

## Edge Cases & Fehlerbehandlung

| Szenario | Erwartetes Verhalten |
|----------|---------------------|
| Partikel ohne Projekt | Vollig okay. Wird unter "No Project" gezahlt. |
| Projekt archivieren mit Partikeln | Partikel bleiben, Projekt wird ausgeblendet. |
| Projekt-Name andern | Alle verknupften Partikel behalten Verknupfung. |
| Duplikat-Name | Warning anzeigen, aber erlauben (User-Freiheit). |
| Projekt wahrend Session wechseln | Partikel wird dem letzten Projekt zugeordnet. |
| Sehr viele Projekte (>20) | Suche in Dropdown, "Recent" priorisiert. |
| Archiviertes Projekt wiederherstellen | Uber "Show Archived" -> Projekt -> Edit -> Unarchive |
| Offline: Neues Projekt | Lokal erstellen, bei Reconnect syncen. |

## Metriken & Erfolgsmessung

- **Primare Metrik:** 40% der Sessions haben ein Projekt zugewiesen (nach 4 Wochen)
- **Sekundare Metrik:** Upgrade-Rate bei Freelancern +15%
- **Sekundare Metrik:** Session-Frequenz bei Nutzern mit Projekten +20%
- **Messzeitraum:** 4 Wochen nach Launch

## Risiken & Abhangigkeiten

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Feature Creep zu Task-Manager | mittel | hoch | Strikte Abgrenzung in Spec dokumentiert |
| Sync-Konflikte bei Projekten | niedrig | mittel | CRDT-basierte Conflict Resolution |
| Performance bei vielen Projekten | niedrig | niedrig | Lazy Loading, Pagination ab 50 |

**Abhangigkeiten:**
- [ ] Quick Task System (done) - Projekt-Dropdown baut darauf auf
- [ ] Statistics Dashboard (done) - "By Project" Integration
- [ ] Command Palette (done) - Project-Commands registrieren

## Offene Fragen

- [x] ~~Brightness oder keine Brightness?~~ -> **Ja, 5 Graustufen**
- [ ] Projekt-Wechsel wahrend Session erlauben? -> **Vorschlag: Ja (flexibel)**
- [ ] Default-Projekt setzen moglich? -> **Vorschlag: Nein (bewusste Entscheidung)**
- [ ] Max. Anzahl aktive Projekte? -> **Vorschlag: Soft Limit 100, Warning**

## Technische Uberlegungen

### Datenbank-Migration

```sql
-- Neue Tabelle
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brightness REAL DEFAULT 0.7,
  archived INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

-- Particles erweitern
ALTER TABLE particles ADD COLUMN project_id TEXT REFERENCES projects(id);

-- Index fur Performance
CREATE INDEX idx_particles_project ON particles(project_id);
```

### Sync-Relevanz

- Projekte mussen uber alle Plattformen synchronisiert werden
- `projectId` in Particles muss konsistent sein
- Bei Offline: Lokale Projekte, Sync bei Reconnect
- Conflict Resolution: Last-Write-Wins fur Projekt-Metadaten

### Komponenten-Struktur

```
src/components/
├── projects/
│   ├── ProjectList.tsx          # G P View
│   ├── ProjectDetail.tsx        # Einzelnes Projekt
│   ├── ProjectForm.tsx          # Create/Edit Modal
│   ├── ProjectSelector.tsx      # Dropdown im Timer
│   ├── ProjectStats.tsx         # Stats-Breakdown
│   └── ProjectEmptyState.tsx    # Leerer Zustand
```

## Spatere Erweiterung: Freelancer-Features

**Nicht im MVP, aber vorbereiten:**

```typescript
interface Project {
  // ...existing...
  isBillable?: boolean;          // Fur Freelancer
  hourlyRate?: number;           // EUR/Stunde
  clientName?: string;           // "Acme Corp"
}
```

Diese Felder konnen spater hinzugefugt werden ohne Breaking Changes.

## Stories

Abgeleitete User Stories fur die Umsetzung:

| Story | Titel | Effort | Prio |
|-------|-------|--------|------|
| [[stories/backlog/POMO-100-project-data-model]] | Datenmodell & Migration | 3 SP | P0 |
| [[stories/backlog/POMO-101-project-crud]] | Create/Read/Update/Archive | 5 SP | P0 |
| [[stories/backlog/POMO-102-project-selector]] | Timer-Integration Dropdown | 3 SP | P0 |
| [[stories/backlog/POMO-103-project-list-view]] | G P Ubersicht | 3 SP | P0 |
| [[stories/backlog/POMO-104-project-detail-view]] | Projekt-Detail mit Stats | 3 SP | P0 |
| [[stories/backlog/POMO-105-project-stats-integration]] | "By Project" in Stats | 2 SP | P0 |
| [[stories/backlog/POMO-106-project-shortcuts]] | Alle Keyboard Shortcuts | 2 SP | P0 |
| [[stories/backlog/POMO-107-project-command-palette]] | Commands registrieren | 2 SP | P1 |

**P0 Gesamt: 21 Story Points**
**P1 Gesamt: 2 Story Points**
**Total: 23 Story Points**

## Changelog

| Datum | Anderung | Autor |
|-------|----------|-------|
| 2026-01-20 | Initial Draft aus Competitor Analysis | Claude |
