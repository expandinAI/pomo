# vault – Project Management System

Ein Obsidian-kompatibler, Git-nativer Projekt-Management-Ansatz für Solo-Entwickler und kleine Teams. Optimiert für die Zusammenarbeit mit Claude Code.

## Philosophie

- **Colocation**: Specs leben beim Code
- **Git-native**: Volle History auf alle Entscheidungen
- **AI-first**: Claude kann direkt lesen, schreiben, updaten
- **Human-friendly**: Funktioniert als Obsidian-Vault für visuelles Management
- **Zero Dependencies**: Kein externes Tool nötig

## Verzeichnisstruktur

```
vault/
├── _templates/           # Vorlagen für alle Dokumenttypen
│   ├── idea.md
│   ├── feature.md
│   ├── story.md
│   └── decision.md
│
├── ideas/                # Rohe Ideen, noch nicht validiert
│   └── *.md
│
├── features/             # Ausgearbeitete PRDs/Feature-Specs
│   └── *.md
│
├── stories/              # User Stories, abgeleitet aus Features
│   ├── backlog/          # Priorisiert, bereit zur Umsetzung
│   ├── active/           # Aktuell in Arbeit
│   └── done/             # Erledigt (nach Sprint/Release archivieren)
│
├── decisions/            # Architecture Decision Records (ADRs)
│   └── *.md
│
├── INBOX.md              # Schnelle Notizen, wird regelmäßig verarbeitet
├── ROADMAP.md            # High-level Überblick: Was kommt wann?
└── CHANGELOG.md          # Was wurde wann released/erledigt?
```

## Lifecycle

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  INBOX  │ ──▶ │  IDEA   │ ──▶ │ FEATURE │ ──▶ │ STORIES │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
  Schnelle        Validiert,      PRD mit         Umsetzbare
  Notiz           ausformuliert   Specs           Einheiten
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │   backlog/   │
                                              └──────────────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │   active/    │
                                              └──────────────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │    done/     │
                                              └──────────────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │ CHANGELOG.md │
                                              └──────────────┘
```

## Frontmatter-Schema

Jedes Dokument hat strukturierte Metadaten im YAML-Frontmatter:

### Gemeinsame Felder

```yaml
---
type: idea | feature | story | decision
status: draft | ready | active | done | rejected
priority: p0 | p1 | p2 | p3  # p0 = kritisch, p3 = nice-to-have
created: 2025-01-18
updated: 2025-01-18
tags: [mvp, ux, backend, api]
---
```

### Typ-spezifische Felder

**Idea:**
```yaml
---
type: idea
status: draft | validated | promoted | rejected
source: user-feedback | competitor | internal | research
effort_guess: xs | s | m | l | xl  # Grobe Schätzung
---
```

**Feature:**
```yaml
---
type: feature
status: draft | ready | in-progress | done
priority: p0 | p1 | p2 | p3
effort: xs | s | m | l | xl
business_value: low | medium | high | critical
origin: "[[ideas/idea-name]]"  # Link zur ursprünglichen Idee
stories: []  # Liste der abgeleiteten Stories
---
```

**Story:**
```yaml
---
type: story
status: backlog | active | done
priority: p0 | p1 | p2 | p3
effort: 1 | 2 | 3 | 5 | 8 | 13  # Story Points (Fibonacci)
feature: "[[features/feature-name]]"  # Parent Feature
done_date: null | 2025-01-20
---
```

**Decision:**
```yaml
---
type: decision
status: proposed | accepted | deprecated | superseded
date: 2025-01-18
superseded_by: null | "[[decisions/new-decision]]"
---
```

## Naming Conventions

| Typ | Format | Beispiel |
|-----|--------|----------|
| Idea | `{kurzer-slug}.md` | `ai-scheduling-assistant.md` |
| Feature | `{feature-slug}.md` | `smart-availability-detection.md` |
| Story | `{feature}-{nummer}-{slug}.md` | `availability-01-calendar-sync.md` |
| Decision | `{nummer}-{slug}.md` | `001-use-supabase-auth.md` |

## Obsidian-Integration

### Tags für Filterung

- `#idea`, `#feature`, `#story`, `#decision` – Typ
- `#p0`, `#p1`, `#p2`, `#p3` – Priorität
- `#mvp`, `#v1.1`, `#v2` – Release/Milestone
- `#blocked`, `#needs-review`, `#tech-debt` – Status-Flags

### Wikilinks für Verknüpfungen

```markdown
Diese Story gehört zu [[features/smart-availability-detection]].
Siehe auch [[decisions/001-use-supabase-auth]] für Kontext.
```

### Dataview-Queries (optional)

```dataview
TABLE status, priority, effort
FROM "stories/backlog"
WHERE status = "backlog"
SORT priority ASC
```

## Claude Code Integration

### Schnelle Befehle

| Befehl | Aktion |
|--------|--------|
| "Was steht an?" | Scannt `stories/backlog/`, sortiert nach Priorität |
| "Zeig mir die Roadmap" | Liest `ROADMAP.md` |
| "Neue Idee: X" | Erstellt Datei in `ideas/` mit Template |
| "Mach aus Idee X ein Feature" | Promoted Idee → erstellt PRD in `features/` |
| "Erstell Stories für Feature X" | Generiert Stories aus PRD |
| "Story X ist fertig" | Moved nach `done/`, updated Frontmatter, CHANGELOG |

### Kontext-Effizienz

Claude kann mit einem `view vault/` schnell den Projektstand erfassen:
- Struktur zeigt sofort was wo ist
- Frontmatter ist maschinenlesbar
- Keine API-Calls, keine Token-Verschwendung

## Workflow-Beispiel

### 1. Idee erfassen
```bash
# Schnell in INBOX
echo "- [ ] Automatische Timezone-Erkennung für Meetings" >> vault/INBOX.md

# Oder direkt als Idee
# Claude: "Neue Idee: Timezone-Erkennung"
```

### 2. Idee validieren & ausarbeiten
```bash
# Claude: "Schau dir die Idee timezone-detection an und validiere sie"
# → Recherche, Aufwandsschätzung, Empfehlung
```

### 3. Feature-Spec erstellen
```bash
# Claude: "Mach aus der Timezone-Idee ein Feature mit PRD"
# → Erstellt vault/features/timezone-detection.md
```

### 4. Stories ableiten
```bash
# Claude: "Erstell User Stories für das Timezone-Feature"
# → Erstellt Stories in vault/stories/backlog/
```

### 5. Umsetzen & Tracken
```bash
# Claude: "Ich arbeite jetzt an timezone-01-detect-browser"
# → Moved nach active/, setzt status: active

# Nach Fertigstellung:
# Claude: "Story timezone-01 ist done"
# → Moved nach done/, setzt done_date, updated CHANGELOG
```

## Best Practices

1. **INBOX regelmäßig leeren** – Wöchentlich durchgehen, Ideen erstellen oder verwerfen
2. **Features klein halten** – Max 3-5 Stories pro Feature
3. **Stories sind atomar** – Eine Story = ein PR = ein Deploy
4. **Changelog pflegen** – Jede erledigte Story wird dokumentiert
5. **Decisions dokumentieren** – Wichtige Architektur-Entscheidungen festhalten
6. **Tags konsistent nutzen** – Ermöglicht Obsidian-Filterung

## Migration von Linear/anderen Tools

1. Export bestehende Issues als Markdown
2. Frontmatter hinzufügen
3. In passende Ordner sortieren
4. Links anpassen

---

*Dieses System ist designed für Solo-Entwickler und kleine Teams die schnell iterieren wollen, ohne Tool-Overhead.*
