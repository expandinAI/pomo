---
type: feature
status: draft
priority: p2
effort: xl
business_value: high
origin: "Multi-Platform Strategy"
decisions:
  - "[[decisions/ADR-001-multi-platform-architecture]]"
  - "[[decisions/ADR-002-schema-evolution]]"
  - "[[decisions/ADR-003-sync-strategy]]"
depends_on:
  - "[[features/cloud-sync-accounts]]"
  - "[[features/payment-integration]]"
stories: []
created: 2026-01-28
updated: 2026-01-28
tags: [platform, macos, native, swift, p2]
---

# Native Mac App

## Zusammenfassung

> Native macOS App in Swift/SwiftUI mit vollem Feature-Scope. Nutzt native macOS-Features wie Menubar, Focus Mode, AppleScript und Notifications.

## Kontext & Problem

Die Web-App läuft im Browser – das bedeutet:
- Kein Zugriff auf macOS Focus Mode (Do Not Disturb)
- Keine Menubar-Integration
- Kein AppleScript für App-Steuerung (z.B. Musik pausieren)
- Keine echten System-Notifications
- Browser muss offen sein

Eine native Mac App löst all diese Probleme.

## Bekannte Anforderungen

### Muss erreicht werden

- [ ] **Timer** – Volle Timer-Funktionalität wie Web
- [ ] **Menubar App** – Timer-Status in der Menubar sichtbar
- [ ] **System Notifications** – Native macOS Notifications
- [ ] **Focus Mode Integration** – DND automatisch aktivieren während Session
- [ ] **Keyboard Shortcuts** – Globale Shortcuts (auch wenn App nicht im Fokus)
- [ ] **Cloud Sync** – Gleiche Sync-Logik wie Web
- [ ] **Offline-First** – Lokale SQLite-Datenbank

### Sollte erreicht werden

- [ ] **AppleScript Support** – Skriptbare App für Automationen
- [ ] **Shortcuts App Integration** – macOS Shortcuts unterstützen
- [ ] **Widgets** – Desktop Widgets für Timer-Status
- [ ] **WebView für Folioskop** – Komplexe Views aus Web laden

### Nicht im Scope (v1)

- Touch Bar Support (veraltet)
- Apple Watch App (separates Feature)
- Siri Integration

## Technische Überlegungen

### Tech Stack

| Komponente | Technologie |
|------------|-------------|
| UI Framework | SwiftUI |
| Local Storage | SwiftData / SQLite |
| Networking | URLSession + async/await |
| Auth | Clerk iOS SDK |
| Sync | Shared Swift Package |

### Architektur

```
┌─────────────────────────────────────────────────────────┐
│                    Mac App (Swift)                       │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │  SwiftUI   │  │  Menubar   │  │  System Integration│ │
│  │   Views    │  │   Widget   │  │  - Focus Mode      │ │
│  │            │  │            │  │  - Notifications   │ │
│  │            │  │            │  │  - AppleScript     │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
│         │               │                │              │
│         └───────────────┼────────────────┘              │
│                         │                               │
│                         ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Shared Swift Package                   │  │
│  │                                                   │  │
│  │  - Models (Session, Project, etc.)               │  │
│  │  - API Client (Supabase)                         │  │
│  │  - Sync Service                                  │  │
│  │  - Auth (Clerk)                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
│                         ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │              SwiftData / SQLite                   │  │
│  │              (Local Persistence)                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Shared Swift Package

Code der zwischen Mac und iOS geteilt wird:

```swift
// ParticleCore Package
├── Models/
│   ├── Session.swift
│   ├── Project.swift
│   └── User.swift
├── API/
│   ├── SupabaseClient.swift
│   └── ClerkAuth.swift
├── Sync/
│   ├── SyncService.swift
│   └── ConflictResolution.swift
└── Storage/
    └── LocalDatabase.swift
```

### Native Features Implementation

**Focus Mode:**
```swift
import FocusFilter

// Aktiviere DND während Session
func enableFocusMode() {
    let center = FocusFilterManager.shared
    center.setFocusFilter(.init(name: "Particle Focus"))
}
```

**Menubar:**
```swift
@main
struct ParticleApp: App {
    var body: some Scene {
        MenuBarExtra("Particle", systemImage: "circle.fill") {
            MenuBarView()
        }
        .menuBarExtraStyle(.window)

        WindowGroup {
            MainView()
        }
    }
}
```

**Global Shortcuts:**
```swift
import KeyboardShortcuts

extension KeyboardShortcuts.Name {
    static let startTimer = Self("startTimer")
    static let stopTimer = Self("stopTimer")
}
```

## Distribution

| Kanal | Vorteile | Nachteile |
|-------|----------|-----------|
| **Mac App Store** | Vertrauen, einfache Updates | 30% Cut, Review-Prozess |
| **Direct Download** | Volle Kontrolle, 0% Cut | Notarization nötig, weniger Sichtbarkeit |
| **Beide** | Best of both worlds | Mehr Aufwand |

**Empfehlung:** Start mit Direct Download (schneller), später App Store.

## Offene Fragen

- [ ] App Store oder Direct Download zuerst?
- [ ] Kostenlose App mit In-App Purchase oder Paid App?
- [ ] Brauchen wir einen Swift-Entwickler?
- [ ] WebView für komplexe Features (Statistiken) oder alles nativ?

## Abhängigkeiten

- **Cloud Sync & Accounts** muss fertig sein
- Apple Developer Account ($99/Jahr)
- Notarization für Direct Download

## Grobe Aufwandsschätzung

~40-60 Story Points (sehr grob, nach genauerer Spezifikation)

## Notizen

### Warum kein Electron/Tauri?

Siehe [[decisions/ADR-001-multi-platform-architecture]]:
- Native macOS-Features (Focus Mode, AppleScript) sind mit Electron schwer/unmöglich
- Native App fühlt sich besser an
- Shared Swift Package mit iOS

### Referenzen

- [SwiftUI for macOS](https://developer.apple.com/documentation/swiftui)
- [Focus Filters](https://developer.apple.com/documentation/focusfilter)
- [MenuBarExtra](https://developer.apple.com/documentation/swiftui/menubarextra)
