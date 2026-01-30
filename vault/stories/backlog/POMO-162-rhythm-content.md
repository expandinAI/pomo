---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/learn-section]]"
created: 2026-01-27
updated: 2026-01-27
done_date: null
tags: [content, learn, rhythms]
---

# POMO-162: Rhythmus-Erklärungen

## User Story

> Als **Particle-Nutzer**
> möchte ich **verstehen, was die drei Rhythmen bedeuten und woher sie kommen**,
> damit **ich den passenden Rhythmus für meine Arbeitsweise wählen kann**.

## Kontext

Link zum Feature: [[features/learn-section]]

Die drei Rhythmen sind das Herzstück von Particle. Die Erklärungen müssen im Particle-Voice geschrieben sein – poetisch, kurz, mit Storytelling. Keine Dokumentation, sondern ein Gespräch mit einem weisen Mentor.

## Akzeptanzkriterien

- [ ] **Given** ich bin im Learn Panel, **When** ich "Die drei Rhythmen" wähle, **Then** sehe ich Erklärungen zu allen drei Rhythmen
- [ ] **Given** ich lese über einen Rhythmus, **When** ich "Ausprobieren" klicke, **Then** wird dieser Rhythmus aktiviert und das Panel schließt
- [ ] **Given** ein Rhythmus ist bereits aktiv, **When** ich ihn im Learn Panel sehe, **Then** ist er als "Aktiv" markiert
- [ ] **Given** ich bin in der Rhythmus-Ansicht, **When** ich `←` oder Backspace drücke, **Then** komme ich zurück zum Menü

## Content (Final Copy)

### Classic · 25 Minuten

```markdown
Der Ursprung. Francesco Cirillo nannte es "Pomodoro" –
nach seiner Küchenuhr.

Kurze Sprints. Häufige Pausen.
Perfekt, wenn du anfängst – oder wenn
der innere Widerstand groß ist.
```

**Button:** `Ausprobieren` / `Bereits aktiv`

### Deep Work · 52 Minuten

```markdown
Die DeskTime-Studie fand heraus: Die produktivsten
10% arbeiten 52 Minuten, dann 17 Minuten Pause.

Längere Fokuszeit. Tiefere Arbeit.
Für Projektarbeit und konzentriertes Denken.
```

**Button:** `Ausprobieren` / `Bereits aktiv`

### Ultradian · 90 Minuten

```markdown
Dein Körper folgt einem 90-Minuten-Rhythmus.
Nathaniel Kleitman entdeckte ihn in den 1950ern.

Für Flow-States. Für Arbeit, die dich
vergessen lässt, dass Zeit vergeht.
```

**Button:** `Ausprobieren` / `Bereits aktiv`

### Abschluss-Text

```markdown
Es gibt kein "richtig" oder "falsch".
Nur das, was für dich funktioniert.
```

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── learn/
│       ├── LearnContent.tsx      # Artikel-Container
│       └── RhythmCard.tsx        # Einzelne Rhythmus-Karte
├── lib/
│   └── content/
│       └── learn-content.ts      # Content als Constants
```

### Implementierungshinweise
- Content als TypeScript-Konstanten (kein CMS nötig für MVP)
- `RhythmCard` bekommt den aktuellen Preset als Prop
- "Ausprobieren" ruft `setPreset()` auf und schließt Panel

### Datenstruktur
```typescript
interface RhythmContent {
  id: 'classic' | 'deep-work' | 'ultradian';
  title: string;
  duration: string;
  paragraphs: string[];
  presetValue: PresetType;
}
```

## UI/UX

### Layout
```
┌─────────────────────────────────────────┐
│  ← Zurück                           ✕   │
│                                         │
│  Die drei Rhythmen                      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Jeder Partikel hat seinen eigenen      │
│  Rhythmus. Hier sind drei, die          │
│  Menschen geholfen haben.               │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ○ Classic · 25 Minuten                 │
│                                         │
│    Der Ursprung. Francesco Cirillo...   │
│                                         │
│                      [ Ausprobieren ]   │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ● Deep Work · 52 Minuten      Aktiv    │
│                                         │
│    Die DeskTime-Studie fand heraus...   │
│                                         │
│                      [ Bereits aktiv ]  │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ...                                    │
│                                         │
└─────────────────────────────────────────┘
```

**Verhalten:**
- Click auf "Ausprobieren" → Preset wechseln, Panel schließen
- "Bereits aktiv" Button ist disabled (grau)
- Radio-Indikator (○/●) zeigt aktuellen Preset

## Testing

### Manuell zu testen
- [ ] Alle drei Rhythmen werden angezeigt
- [ ] Aktiver Rhythmus ist markiert
- [ ] "Ausprobieren" wechselt Preset
- [ ] Panel schließt nach Preset-Wechsel
- [ ] Zurück-Navigation funktioniert

### Automatisierte Tests
- [ ] Unit Test: RhythmCard zeigt korrekten State
- [ ] Unit Test: Preset-Wechsel-Callback wird aufgerufen

## Definition of Done

- [ ] Code implementiert
- [ ] Content ist final (Particle-Voice)
- [ ] Tests geschrieben & grün
- [ ] Lokal getestet
- [ ] Deployed auf Preview

## Notizen

- Die Texte sind bewusst kurz – keine Wall of Text
- Jeder Rhythmus hat eine "Geschichte" (Cirillo, DeskTime, Kleitman)
- Keine Bewertung ("besser"/"schlechter") – nur Unterschiede

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
