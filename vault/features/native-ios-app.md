---
type: feature
status: draft
priority: p2
effort: l
business_value: high
origin: "Multi-Platform Strategy"
decisions:
  - "[[decisions/ADR-001-multi-platform-architecture]]"
  - "[[decisions/ADR-002-schema-evolution]]"
  - "[[decisions/ADR-003-sync-strategy]]"
depends_on:
  - "[[features/cloud-sync-accounts]]"
  - "[[features/native-mac-app]]"
stories: []
created: 2026-01-28
updated: 2026-01-28
tags: [platform, ios, native, swift, p2]
---

# Native iOS App

## Zusammenfassung

> Native iOS App in SwiftUI mit **reduziertem Scope**. Fokus auf Timer und Tracking – kein "voller Scope" wie Web/Mac. Ähnlich wie Linear's iOS App: grundlegende Funktionen, schnell und fokussiert.

## Kontext & Problem

Mobile User wollen unterwegs Partikel sammeln. Die Web-App im Mobile Safari ist keine gute Experience. Eine native iOS App ermöglicht:

- Bessere Performance
- Push Notifications
- Offline-Nutzung
- Widgets
- Focus Mode Integration

**Wichtig:** Die iOS App ist bewusst reduziert. Komplexe Features (Statistiken, Jahresansicht, Einstellungen) bleiben Web/Mac vorbehalten.

## Bekannte Anforderungen

### Scope-Definition: Was ist drin, was nicht?

| Feature | iOS App | Web/Mac |
|---------|---------|---------|
| Timer starten/stoppen | ✓ | ✓ |
| Projekt auswählen | ✓ | ✓ |
| Task eingeben | ✓ | ✓ |
| Heute-Übersicht | ✓ | ✓ |
| Basis-Statistiken | ✓ (vereinfacht) | ✓ |
| Projekte anlegen | ✓ | ✓ |
| Jahresansicht | ✗ | ✓ |
| Erweiterte Stats | ✗ | ✓ |
| Einstellungen | ✗ (nur Timer) | ✓ |
| Account-Management | ✗ (Link zu Web) | ✓ |
| Presets verwalten | ✗ | ✓ |

### Muss erreicht werden

- [ ] **Timer** – Start, Stop, Pause mit Projekt/Task
- [ ] **Heute-Ansicht** – Partikel des Tages
- [ ] **Projekt-Auswahl** – Bestehendes Projekt wählen
- [ ] **Cloud Sync** – Gleiche Sync-Logik wie Web
- [ ] **Push Notifications** – Timer fertig
- [ ] **Offline-First** – Lokale SQLite

### Sollte erreicht werden

- [ ] **Widgets** – Timer-Status auf Homescreen
- [ ] **Live Activities** – Timer auf Lock Screen (Dynamic Island)
- [ ] **Focus Mode** – iOS Focus mit Particle verknüpfen
- [ ] **Apple Watch Complication** – Status auf Watch (sehr basic)
- [ ] **Haptic Feedback** – Bei Timer-Ende

### Explizit nicht im Scope

- Jahresansicht
- Erweiterte Statistiken
- Preset-Verwaltung
- Account-Einstellungen (→ Link zu Web)
- Vollständige Settings (→ nur Timer-Duration)
- Projekt-Archivierung
- Daten-Export

## Technische Überlegungen

### Tech Stack

| Komponente | Technologie |
|------------|-------------|
| UI Framework | SwiftUI |
| Local Storage | SwiftData |
| Networking | URLSession + async/await |
| Auth | Clerk iOS SDK |
| Sync | Shared Swift Package (mit Mac) |

### Shared Code mit Mac App

```
ParticleCore (Swift Package)
├── Models/           # Shared
├── API/              # Shared
├── Sync/             # Shared
└── Storage/          # Shared

ParticleMac (App)
├── macOS-specific UI
└── Menubar, AppleScript, etc.

ParticleIOS (App)
├── iOS-specific UI
└── Widgets, Live Activities, etc.
```

### Architektur

```
┌─────────────────────────────────────────┐
│           iOS App (SwiftUI)              │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Timer   │  │  Today   │  │ Quick  │ │
│  │   View   │  │   View   │  │ Stats  │ │
│  └──────────┘  └──────────┘  └────────┘ │
│         │            │            │      │
│         └────────────┼────────────┘      │
│                      │                   │
│                      ▼                   │
│  ┌───────────────────────────────────┐  │
│  │      Shared Swift Package         │  │
│  │   (ParticleCore - shared w/ Mac)  │  │
│  └───────────────────────────────────┘  │
│                      │                   │
│                      ▼                   │
│  ┌───────────────────────────────────┐  │
│  │           SwiftData               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### UI-Skizze (sehr grob)

```
┌─────────────────────────────┐
│  Particle          [Account]│
├─────────────────────────────┤
│                             │
│                             │
│           25:00             │
│                             │
│      [  Website Redesign  ] │
│      [  API Integration   ] │
│                             │
│         [ ▶ Start ]         │
│                             │
├─────────────────────────────┤
│  Heute                      │
│                             │
│  ● ● ● ● ○ ○ ○ ○           │
│  4 von 8 Partikeln          │
│                             │
│  14:32  Website Redesign    │
│  11:15  API Integration     │
│  09:00  Code Review         │
│                             │
├─────────────────────────────┤
│  [Timer]    [Heute]   [⚙]   │
└─────────────────────────────┘
```

## Distribution

**App Store** – Einziger sinnvoller Weg für iOS.

- Apple Developer Account erforderlich ($99/Jahr)
- App Review Prozess
- 30% Cut bei In-App Purchases (15% im ersten Jahr / Small Business)

### In-App Purchase vs. Web Payment

| Ansatz | Vorteile | Nachteile |
|--------|----------|-----------|
| IAP | Nahtlos in iOS | 30% Apple Cut |
| Web Payment only | 0% Cut | Reader Rule nötig, UX-Bruch |
| Beide | Flexibel | Komplexer |

**Empfehlung:** Reader Rule nutzen (Link zu Web für Subscription), aber auch IAP anbieten für Convenience.

## Offene Fragen

- [ ] Genauer Scope: Welche "Basis-Stats" genau?
- [ ] Apple Watch App ja/nein?
- [ ] In-App Purchase implementieren oder nur Web-Link?
- [ ] Minimum iOS Version? (iOS 17 für moderne Features)

## Abhängigkeiten

- **Native Mac App** sollte zuerst kommen (Shared Package)
- Apple Developer Account
- App Store Guidelines verstehen

## Grobe Aufwandsschätzung

~25-35 Story Points (nach genauerer Spezifikation)

Weniger als Mac App, weil:
- Reduzierter Scope
- Shared Swift Package von Mac App
- Keine komplexen System-Integrationen (AppleScript etc.)

## Notizen

### Philosophie: "Linear-Style"

Linear's iOS App ist ein gutes Vorbild:
- Fokussiert auf das Wesentliche
- Kein Feature-Creep
- "Unterwegs kurz was erledigen" – nicht "am Handy arbeiten"

### Referenzen

- [Linear iOS App](https://linear.app/ios)
- [SwiftUI Widgets](https://developer.apple.com/documentation/widgetkit)
- [Live Activities](https://developer.apple.com/documentation/activitykit)
