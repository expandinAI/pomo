---
type: story
status: backlog
priority: p1
effort: 1
feature: "[[ideas/10x-flow-continue-shortcut]]"
created: 2026-02-03
updated: 2026-02-03
done_date: null
tags: [10x, quick-win, keyboard, flow]
---

# POMO-335: Flow Continue Shortcut

## User Story

> Als **Power-User im Flow-State**
> möchte ich **mit Space sofort weitermachen können** wenn der Timer endet,
> damit **mein Flow nicht durch Modals oder Animationen unterbrochen wird**.

## Kontext

Link zur Idee: [[ideas/10x-flow-continue-shortcut]]

Aktuell: Wenn der Timer endet (besonders im Overflow), startet die Celebration-Animation und ein Modal erscheint. Power-User, die im Flow sind, wollen sofort weitermachen ohne Klicks.

**10x-Analyse:** Respektiert den Flow-State. Minimaler Aufwand, großer UX-Gewinn.

## Akzeptanzkriterien

- [ ] **Given** Timer ist beendet (Celebration zeigt), **When** User drückt `Space`, **Then** neue Session startet sofort
- [ ] **Given** Timer ist im Overflow, **When** Timer endet und User drückt `Space`, **Then** aktuelle Session wird gespeichert und neue startet
- [ ] **Given** Timer zeigt End-Modal, **When** User drückt `Space`, **Then** Modal schließt und neue Session startet
- [ ] **Given** Space gedrückt zum Weitermachen, **Then** kurzer Toast "Weiter im Flow..." erscheint
- [ ] **Given** User will Celebration sehen, **When** User drückt `Enter`, **Then** normaler Flow (Done) wie bisher

## Technische Details

### Betroffene Dateien
```
src/
├── components/timer/Timer.tsx        # Shortcut-Handler erweitern
├── components/timer/EndConfirmationModal.tsx  # Space-Handler
└── lib/shortcuts.ts                  # Falls zentral
```

### Implementierungshinweise
- Im `EndConfirmationModal` auf `Space` lauschen
- Bei Space: `onContinue()` aufrufen (neue Session)
- Celebration kann übersprungen werden
- Toast mit "Weiter im Flow..." zeigen (1.5s)

## UI/UX

**Verhalten:**
- Timer endet → Celebration/Modal erscheint
- `Space` → Modal schließt, neue Session startet, Toast "Weiter im Flow..."
- `Enter` → Normaler "Done" Flow (wie bisher)
- Keyboard-Hint im Modal: "Space = Weiter · Enter = Fertig"

## Testing

### Manuell zu testen
- [ ] Timer beenden, Space drücken → neue Session
- [ ] Timer beenden, Enter drücken → normaler Done-Flow
- [ ] Overflow beenden, Space → Overflow wird gespeichert, neue Session
- [ ] Toast erscheint und verschwindet

## Definition of Done

- [ ] Code implementiert
- [ ] Lokal getestet
- [ ] Keyboard-Hint sichtbar
- [ ] Toast funktioniert

## Notizen

- Aufwand: ~30 Minuten
- Kein Backend nötig
- Kein neues State Management

---

## Arbeitsverlauf

### Gestartet:
### Erledigt:
