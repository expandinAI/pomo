---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/system-integrations]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [integrations, settings, ui, p0]
---

# POMO-082: Integration Settings Panel

## User Story

> Als **User**
> möchte ich **alle Integrationen zentral verwalten können**,
> damit **ich leicht verbinden und trennen kann**.

## Kontext

Link zum Feature: [[features/system-integrations]]

Zentrales Settings Panel für alle Integrationen. Sollte als erstes implementiert werden.

## Akzeptanzkriterien

- [ ] **Given** Settings, **When** geöffnet, **Then** "Integrations" Section dediziert
- [ ] **Given** Integration, **When** angezeigt, **Then** Status (Connected/Disconnected)
- [ ] **Given** Integration, **When** nicht verbunden, **Then** Connect Button
- [ ] **Given** Integration, **When** verbunden, **Then** Disconnect Button
- [ ] **Given** Integration, **When** verbunden, **Then** Konfigurationsoptionen
- [ ] **Given** Integration, **When** "Test Connection", **Then** Verbindung geprüft

## Technische Details

### UI Design
```
┌─────────────────────────────────────────────────┐
│  Integrations                                   │
├─────────────────────────────────────────────────┤
│  System                                         │
│  ┌─────────────────────────────────────────┐   │
│  │ 🍎 macOS Focus Mode                     │   │
│  │    ○ Auto-enable during sessions        │   │
│  │    Status: Active                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Apps                                           │
│  ┌─────────────────────────────────────────┐   │
│  │ 💬 Slack                    [Connected] │   │
│  │    Status: "🍅 Focusing" during sessions│   │
│  │    [Configure] [Disconnect]             │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │ 📋 Linear                    [Connect]  │   │
│  │    Link issues to focus sessions        │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Blocking                                       │
│  ┌─────────────────────────────────────────┐   │
│  │ 🚫 Website Blocking                     │   │
│  │    5 sites blocked                      │   │
│  │    [Edit Blocklist]                     │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Integration State
```typescript
interface IntegrationState {
  macosDND: {
    enabled: boolean;
    status: 'active' | 'inactive';
  };
  slack: {
    connected: boolean;
    lastSync?: Date;
    config: SlackConfig;
  };
  linear: {
    connected: boolean;
    lastSync?: Date;
  };
  blocking: {
    enabled: boolean;
    siteCount: number;
  };
}
```

## Testing

### Manuell zu testen
- [ ] Integrations Section sichtbar
- [ ] Status korrekt angezeigt
- [ ] Connect/Disconnect Buttons
- [ ] Konfiguration öffenbar

## Definition of Done

- [ ] Settings Section
- [ ] Status-Anzeige
- [ ] Connect/Disconnect UI
- [ ] Konfigurations-Modals
