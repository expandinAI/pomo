---
type: decision
status: accepted
date: 2026-01-28
superseded_by: null
tags: [architecture, platform, infrastructure]
---

# ADR-001: Multi-Platform Architecture

## Status

**accepted**

## Kontext

Particle ist aktuell eine reine Web-App (Next.js) mit localStorage-Speicherung. Wir wollen:

1. **Native Mac App** mit AppleScript, Focus Mode, Menubar-Integration
2. **Native iOS App** mit reduziertem Scope (Timer + Tracking)
3. **Cloud-Sync** zwischen allen Plattformen
4. **Account-System** mit drei Tiers (Free, Plus, Flow)
5. **Offline-First** – App muss immer funktionieren

Die Herausforderung: Wie bauen wir eine Architektur, die all das unterstützt, ohne die bestehende Web-App zu gefährden?

## Entscheidung

Wir werden eine **Hybrid-Architektur** implementieren:

### Plattformen

| Plattform | Technologie | Scope |
|-----------|-------------|-------|
| **Web** | Next.js (bestehend) | Voller Scope |
| **macOS** | Native Swift + WebView für komplexe UI | Voller Scope |
| **iOS** | Native SwiftUI | Reduzierter Scope |

### Backend

| Komponente | Technologie | Grund |
|------------|-------------|-------|
| **Auth** | Clerk | Cross-Platform SDKs, Apple Sign-In |
| **Database** | Supabase (PostgreSQL) | RLS, Realtime-fähig, gute Swift-Libs |
| **Sync** | Near-Time (Event + Polling) | Einfacher als Realtime, ausreichend |

### Storage

| Plattform | Lokal | Cloud |
|-----------|-------|-------|
| **Web** | IndexedDB (Dexie.js) | Supabase |
| **macOS** | SQLite / SwiftData | Supabase |
| **iOS** | SQLite / SwiftData | Supabase |

## Optionen

### Option A: Electron / Tauri für Desktop

**Beschreibung:** Next.js-Code in Electron oder Tauri wrappen.

**Pro:**
- Schnellste Time-to-Market
- Code-Sharing mit Web
- Ein Codebase für alles

**Contra:**
- Native macOS-Features (AppleScript, Focus Mode) schwer/unmöglich
- Electron ist ressourcenhungrig
- Tauri hat limitierte macOS-Integration
- Fühlt sich nicht "native" an

### Option B: React Native für Mobile + Electron für Desktop

**Beschreibung:** React Native für iOS, Electron für Mac.

**Pro:**
- React-Ökosystem bleibt
- Code-Sharing zwischen Mobile-Plattformen

**Contra:**
- Drei verschiedene Codebasen (Web, RN, Electron)
- React Native macOS ist experimental
- Native Features weiterhin schwer

### Option C: Native Apps + Shared Backend *(gewählt)*

**Beschreibung:** Native Swift/SwiftUI für macOS und iOS, Web bleibt Next.js. Alle teilen sich Supabase als Backend.

**Pro:**
- Volle native Integration (AppleScript, Focus Mode, Widgets)
- Beste User Experience pro Plattform
- iOS und macOS teilen Swift-Code (Shared Package)
- Web-App bleibt unverändert
- Zukunftssicher für Apple-Ökosystem

**Contra:**
- Mehr Entwicklungsaufwand initial
- Zwei Sprachen (TypeScript + Swift)
- Drei Codebasen zu pflegen

## Konsequenzen

### Positive
- Beste User Experience auf jeder Plattform
- Volle Nutzung nativer Features
- Klare Trennung: Web = TypeScript, Apple = Swift
- iOS und macOS können Swift-Code teilen
- Web-App kann unabhängig weiterentwickelt werden

### Negative
- Höherer initialer Entwicklungsaufwand
- Zwei Sprachen im Team erforderlich (oder Swift-Expertise einkaufen)
- Feature-Parity muss aktiv gemanagt werden
- Drei Codebasen für Bug-Fixes

### Risiken
- Swift-Entwickler-Kapazität könnte Bottleneck werden
- Feature-Drift zwischen Plattformen
- Sync-Bugs schwerer zu debuggen

### Mitigationen
- **Shared Swift Package** für Business Logic (Models, API Client, Sync)
- **Feature Flags** zentral in Supabase verwalten
- **Umfangreiche API-Tests** die alle Clients verifizieren
- **Klare Scope-Definition** pro Plattform (iOS bewusst reduziert)

## Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├─────────────────┬─────────────────┬─────────────────────────────┤
│     Web App     │    macOS App    │         iOS App             │
│    (Next.js)    │    (Swift)      │       (SwiftUI)             │
│                 │                 │                             │
│  ┌───────────┐  │  ┌───────────┐  │  ┌───────────┐              │
│  │ IndexedDB │  │  │  SQLite   │  │  │  SQLite   │              │
│  │ (Dexie)   │  │  │(SwiftData)│  │  │(SwiftData)│              │
│  └───────────┘  │  └───────────┘  │  └───────────┘              │
│        │        │        │        │        │                    │
│        ▼        │        ▼        │        ▼                    │
│  ┌───────────┐  │  ┌─────────────────────────┐                  │
│  │Sync Layer │  │  │   Shared Swift Package  │                  │
│  │   (TS)    │  │  │  (Models, API, Sync)    │                  │
│  └───────────┘  │  └─────────────────────────┘                  │
└────────┬────────┴────────────────┬──────────────────────────────┘
         │                         │
         │        HTTPS/JWT        │
         ▼                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
├─────────────────────────────┬───────────────────────────────────┤
│           Clerk             │           Supabase                │
│       (Auth Only)           │         (Database)                │
│                             │                                   │
│  • Apple Sign-In            │  • PostgreSQL                     │
│  • Google OAuth             │  • Row Level Security             │
│  • Email Magic Link         │  • Edge Functions                 │
│  • JWT Tokens               │  • Realtime (optional)            │
└─────────────────────────────┴───────────────────────────────────┘
```

## Notizen

### Referenzen
- [[features/local-first-persistence]] – IndexedDB Migration
- [[features/cloud-sync-accounts]] – Supabase + Clerk Integration
- [[ADR-002-schema-evolution]] – Wie Schema-Änderungen gehandhabt werden
- [[ADR-003-sync-strategy]] – Near-Time Sync Details

### Offene Punkte
- Wann starten wir mit der Mac App? → Nach Cloud-Sync Feature
- Wer entwickelt Swift? → Noch zu klären
- iOS App Scope genau definieren → Separate Feature-Spec
