# Story: Rebrand von Pomo zu Particle

**Priorität:** Hoch
**Typ:** Rebranding / Foundation
**Erstellt:** 2025-01-20
**Abgeschlossen:** 2025-01-20

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

- [x] **Package.json**: Name von "pomo" zu "particle" ändern
- [x] **Variablen-Naming**: `pomo` → `particle` in allen Dateien
- [x] **localStorage Keys**: `pomo_*` → `particle_*` mit Migration
- [x] **Custom Events**: `pomo:*` → `particle:*`
- [x] **Preset ID**: `pomodoro` → `classic`

### 2. UI-Texte

- [x] **Session-Counter**: "sessions completed" → "Particles collected"
- [x] **Dashboard**: "Recent Sessions" → "Collected Particles"
- [x] **History**: "Session History" → "Particle History"
- [x] **Command Palette**: "Switch to Pomodoro" → "Switch to Classic"
- [x] **Tab-Titel**: "Pomo - Focus Timer" → "Particle - Focus Timer"

### 3. PWA & Meta

- [x] **Manifest**: name, short_name, description
- [x] **Service Worker**: Cache-Name `particle-v1`
- [x] **Meta-Tags**: Title, Description, Keywords, OG/Twitter
- [x] **OpenGraph Image**: "Pomo" → "Particle"

### 4. Dokumentation

- [x] `VISION.md` erstellt
- [x] `BRAND.md` erstellt
- [x] `CLAUDE.md` aktualisiert
- [x] `CHANGELOG.md` aktualisiert

---

## Nicht in Scope (für später)

- Neues Onboarding ("Hallo, ich bin ein Partikel")
- Domain-Änderung (pomo.so → particle.xyz)
- Neues Favicon/Logo
- README.md komplett neu schreiben

---

## Definition of Done

- [x] Kein "Pomo" oder "Pomodoro" mehr im Code (außer Migration-Keys)
- [x] App zeigt "Particle" als Namen
- [x] Counter zeigt "Particles collected"
- [x] localStorage Migration implementiert

---

## Implementierung

**Commit:** `5f18901 refactor: Rebrand from Pomo to Particle`

28 Dateien geändert:
- Package & Manifest (3 Dateien)
- Meta Tags (layout.tsx)
- UI-Texte (6 Komponenten)
- Custom Events (5 Dateien)
- localStorage Keys (10 Dateien mit Migration)
- Design Tokens (Preset-Umbenennung)

*"Würde ein einzelner weißer Punkt auf schwarzem Grund stolz sein, Teil davon zu sein?"* ✓
