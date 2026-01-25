# POMO-147: Visual Task Segments im Timer-Ring

## Status: Icebox

## Übersicht

Wenn der Nutzer mehrere Tasks mit Zeiten eingibt (z.B. "Emails 5 · Call 10 · Meeting 10"), sollen im Timer-Ring visuelle Breakpoints/Segmente angezeigt werden, die den Übergang zwischen Tasks markieren.

## User Story

**Als** ADHD-Nutzer
**möchte ich** im Timer-Ring sehen, wann ich von einem Task zum nächsten übergehe
**damit** ich visuelle Milestones habe und ein Gefühl von Mini-Erfolgen während der Session bekomme

## Kontext

Feature baut auf POMO-141 (Multi-Task Input) auf. Die Multi-Task Eingabe ist aktuell nur eine Hilfe zur Zeitberechnung - keine echte Task-Liste mit Tracking.

## Anforderungen

### Must Have
- [ ] Task-Dauern separat speichern (nicht nur als Text-String)
- [ ] Ring-Segmente an den Task-Übergängen anzeigen
- [ ] Subtile visuelle Markierung (nicht zu aufdringlich)

### Nice to Have
- [ ] Sanfte Animation/Highlight beim Erreichen eines Breakpoints
- [ ] Aktuellen Task in der Anzeige hervorheben
- [ ] Sound-Feedback beim Task-Übergang (optional)

## Technische Überlegungen

1. **Datenstruktur erweitern**: `currentTask` von String zu Array von `{ text: string, duration: number }[]`
2. **TimerRing.tsx anpassen**: Segmente berechnen und als SVG-Markierungen rendern
3. **Timer-State erweitern**: Aktuellen Task-Index tracken

## Design-Prinzipien

- Ring bleibt minimalistisch - Segmente sollten subtil sein
- Keine Ablenkung vom Flow
- Optional aktivierbar (Setting?)

## Abhängigkeiten

- POMO-141: Multi-Task Input mit Total Time (Prerequisite)

## Priorität

**Niedrig** - Icebox. Erst validieren ob Multi-Task Input überhaupt genutzt wird.

---

*Erstellt: 2025-01-25*
