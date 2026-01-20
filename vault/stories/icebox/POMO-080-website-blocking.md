---
type: story
status: backlog
priority: p0
effort: 5
feature: "[[features/system-integrations]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [integrations, blocking, focus, p0]
---

# POMO-080: Website Blocking UI

## User Story

> Als **User**
> möchte ich **ablenkende Websites während Sessions blockieren können**,
> damit **ich nicht in Versuchung gerate, sie zu besuchen**.

## Kontext

Link zum Feature: [[features/system-integrations]]

Blocklist-Verwaltung in Settings. Tatsächliches Blocking erfordert Browser Extension (später).

## Akzeptanzkriterien

- [ ] **Given** Settings, **When** Blocking Section, **Then** Blocklist verwaltbar
- [ ] **Given** Default, **When** erstmalig, **Then** twitter.com, reddit.com, youtube.com, facebook.com, instagram.com
- [ ] **Given** Blocklist, **When** Custom, **Then** Sites hinzufügen/entfernen
- [ ] **Given** Blocking, **When** aktiv, **Then** nur während Work-Session (nicht Pausen)
- [ ] **Given** Shortcut B, **When** Command Palette, **Then** toggled Blocking

## Technische Details

### Blocklist Storage
```typescript
const STORAGE_KEY = 'pomo-blocked-sites';

const DEFAULT_BLOCKLIST = [
  'twitter.com',
  'x.com',
  'reddit.com',
  'youtube.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
];

interface BlockingSettings {
  enabled: boolean;
  sites: string[];
  emergencyAccessEnabled: boolean;
}
```

### Settings UI
```
┌─────────────────────────────────────────────────┐
│ Website Blocking                                │
├─────────────────────────────────────────────────┤
│ ○ Enable during focus sessions                  │
│                                                 │
│ Blocked Sites:                                  │
│ ┌─────────────────────────────────────────┐    │
│ │ twitter.com                         ✕   │    │
│ │ reddit.com                          ✕   │    │
│ │ youtube.com                         ✕   │    │
│ │ + Add site...                           │    │
│ └─────────────────────────────────────────┘    │
│                                                 │
│ ⚠️ Requires browser extension for blocking     │
│ [Install Extension]                            │
└─────────────────────────────────────────────────┘
```

### Blocked Page (für Extension)
```
┌─────────────────────────────────────────────────┐
│              🍅                                 │
│     You're in a focus session                   │
│     23 minutes remaining                        │
│                                                 │
│ [Back to Pomo]  [Emergency Access (10s)]       │
└─────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] Blocklist editierbar
- [ ] Sites hinzufügen/entfernen
- [ ] Default-Sites vorhanden
- [ ] Extension-Hinweis sichtbar

## Definition of Done

- [ ] Settings UI für Blocklist
- [ ] LocalStorage Persistenz
- [ ] Default-Sites
- [ ] Extension-Hinweis
