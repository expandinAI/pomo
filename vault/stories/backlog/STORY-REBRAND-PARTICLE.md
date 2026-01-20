# Story: Rebrand von Pomo zu Particle

**Priorität:** Hoch
**Typ:** Rebranding / Foundation
**Erstellt:** 2025-01-20

---

## Kontext

Wir haben eine neue Vision, Philosophie und Markenidentität für unsere App entwickelt. Der Name ändert sich von "Pomo" zu "Particle". Dies ist mehr als ein Rename – es ist eine Neuausrichtung der gesamten App um das Konzept des Partikels.

> "Die Arbeit eines Lebens besteht aus vielen Partikeln."

Siehe `VISION.md` und `BRAND.md` für die vollständige Philosophie.

---

## Akzeptanzkriterien

Die App heißt "Particle" und alle Referenzen zu "Pomo/Pomodoro" sind ersetzt.

---

## Tasks

### 1. Code-Rebranding

- [ ] **Package.json**: Name von "pomo" zu "particle" ändern
- [ ] **README.md**: Komplett neu schreiben für Particle
- [ ] **Variablen-Naming**: `pomo` → `particle` in allen Dateien
- [ ] **Komponenten-Naming**: Falls "Pomo" in Komponentennamen vorkommt
- [ ] **Kommentare**: Alle "Pomodoro"-Referenzen ersetzen

### 2. UI-Texte

- [ ] **Session-Counter**: "Sessions" → "Partikel" (z.B. "3 Partikel gesammelt")
- [ ] **Timer-Labels**: Falls "Pomodoro" irgendwo steht
- [ ] **Tooltips/Hints**: Sprache an Brand Guidelines anpassen

### 3. Visuelle Anpassungen (Phase 2)

- [ ] **Favicon**: Weißer Punkt auf Schwarz
- [ ] **Logo**: Particle-Wordmark oder nur Punkt
- [ ] **Meta-Tags**: Title, Description für SEO

### 4. Domain & Deployment

- [ ] **Domain recherchieren**: parti.cl, particle.app, getparticle.com, etc.
- [ ] **Vercel-Projekt**: Umbenennen wenn nötig

### 5. Dokumentation

- [x] `VISION.md` erstellt
- [x] `BRAND.md` erstellt
- [x] `CLAUDE.md` aktualisiert

---

## Nicht in Scope (für später)

- Neues Onboarding ("Hallo, ich bin ein Partikel")
- Partikel-Visualisierung / Scatterplot
- Animations-Overhaul
- Sound-Design

---

## Definition of Done

- [ ] Kein "Pomo" oder "Pomodoro" mehr im Code (außer technische Referenzen wie "Pomodoro-Technik" in Docs)
- [ ] App zeigt "Particle" als Namen
- [ ] Counter zeigt "Partikel" statt "Sessions"
- [ ] README.md reflektiert neue Vision

---

## Notizen

Diese Story ist das Fundament für alles, was kommt. Nach dem Rebranding können wir die emotionalen Features bauen (Visualisierung, Onboarding, etc.).

*"Würde ein einzelner weißer Punkt auf schwarzem Grund stolz sein, Teil davon zu sein?"*
