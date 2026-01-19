---
type: feature
status: ready
priority: p0
effort: l
business_value: high
origin: "[[ideas/ui-transformation]]"
stories:
  - "[[stories/backlog/POMO-078-macos-dnd]]"
  - "[[stories/backlog/POMO-079-slack-status]]"
  - "[[stories/backlog/POMO-080-website-blocking]]"
  - "[[stories/backlog/POMO-081-linear-integration]]"
  - "[[stories/backlog/POMO-082-integration-settings]]"
created: 2026-01-19
updated: 2026-01-19
tags: [ui-transformation, integrations, focus, p0, mvp]
---

# System Integrations

## Zusammenfassung

> Integration von Pomo mit dem Betriebssystem und externen Services für ein nahtloses Fokus-Erlebnis: Automatische DND-Aktivierung, Slack Status Updates und Website-Blocking während Sessions.

## Kontext & Problem

### Ausgangssituation
Nutzer werden durch Notifications und Websites abgelenkt, obwohl sie fokussieren wollen.

### Betroffene Nutzer
macOS-Nutzer, Slack-User, alle die Ablenkungen minimieren wollen.

### Auswirkung
Ohne Integrationen muss der User manuell DND aktivieren, Slack-Status setzen, etc.

## Ziele

### Muss erreicht werden (P0)
- [ ] macOS Do Not Disturb Integration
- [ ] Website Blocking UI & Blocklist
- [ ] Integration Settings Panel

### Sollte erreicht werden (P1)
- [ ] Slack Status Integration
- [ ] Linear Integration

### Nicht im Scope
- Browser Extension für Blocking (Web App Scope)
- Notion/GitHub Integration

## Lösung

### macOS DND Integration

Bei Session-Start automatisch Focus Mode aktivieren, bei Ende deaktivieren.

**Approach:** Shortcuts App Integration via URL Scheme
```typescript
const enableDND = () => {
  window.location.href = 'shortcuts://run-shortcut?name=Enable%20Focus';
};
```

### Website Blocking

**Blocklist-Verwaltung in Settings:**
- Default: twitter.com, reddit.com, youtube.com, facebook.com, instagram.com
- Custom Sites hinzufügen/entfernen
- Blocking nur während aktiver Work-Session

**Blocked Page:**
```
┌─────────────────────────────────────────────────┐
│              🍅                                 │
│     You're in a focus session                   │
│     23 minutes remaining                        │
│     [Back to Pomo]  [Emergency Access (10s)]   │
└─────────────────────────────────────────────────┘
```

### Integration Settings Panel

```
┌─────────────────────────────────────────────────┐
│  Integrations                                   │
├─────────────────────────────────────────────────┤
│  System                                         │
│  │ 🍎 macOS Focus Mode       [Active]         │
│                                                 │
│  Apps                                           │
│  │ 💬 Slack              [Connected]          │
│  │ 📋 Linear             [Connect]            │
│                                                 │
│  Blocking                                       │
│  │ 🚫 Website Blocking   5 sites              │
└─────────────────────────────────────────────────┘
```

### Technische Überlegungen

**Slack OAuth (P1):**
- Scopes: `users.profile:write`, `dnd:write`
- Status: "🍅 Focusing until HH:MM"

**Linear OAuth (P1):**
- Issues durchsuchen und als Task verknüpfen
- Session-Zeit an Issue anhängen

## Akzeptanzkriterien

**P0:**
- [ ] macOS DND aktiviert sich bei Session-Start
- [ ] Website Blocklist in Settings verwaltbar
- [ ] Integration Settings Panel vorhanden

**P1:**
- [ ] Slack Status wird automatisch gesetzt
- [ ] Linear Issues können verknüpft werden

## Metriken & Erfolgsmessung

- **Primäre Metrik:** 50% weniger Unterbrechungen
- **Sekundäre Metrik:** DND Integration Nutzung > 60%
- **Messzeitraum:** 4 Wochen nach Launch

## Stories

**P0:**
1. [[stories/backlog/POMO-082-integration-settings]] - Settings Panel (3 SP)
2. [[stories/backlog/POMO-078-macos-dnd]] - macOS DND (5 SP)
3. [[stories/backlog/POMO-080-website-blocking]] - Website Blocking (5 SP)

**P1:**
4. [[stories/backlog/POMO-079-slack-status]] - Slack Integration (8 SP)
5. [[stories/backlog/POMO-081-linear-integration]] - Linear Integration (8 SP)

**P0 Gesamt: 13 Story Points**
**P1 Gesamt: 16 Story Points**

## Changelog

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-01-19 | Migriert aus backlog/epics | Claude |
