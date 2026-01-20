---
type: story
status: backlog
priority: p1
effort: 8
feature: "[[features/system-integrations]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [integrations, slack, oauth, p1]
---

# POMO-079: Slack Status Integration

## User Story

> Als **Slack-User**
> möchte ich **dass mein Status automatisch auf "Fokussiert" gesetzt wird**,
> damit **Kollegen wissen, dass ich nicht sofort antworten kann**.

## Kontext

Link zum Feature: [[features/system-integrations]]

**Priorität: P1** - OAuth-Komplexität, später implementieren.

## Akzeptanzkriterien

- [ ] **Given** Slack verbunden, **When** Session startet, **Then** Status "🍅 In Focus Session"
- [ ] **Given** Status gesetzt, **When** Emoji, **Then** 🍅 oder konfigurierbar
- [ ] **Given** Status gesetzt, **When** Text, **Then** "Focusing until HH:MM" (optional)
- [ ] **Given** Session endet, **When** Status, **Then** zurück auf vorherigen
- [ ] **Given** Settings, **When** Custom Text, **Then** konfigurierbar
- [ ] **Given** Settings, **When** Disconnect, **Then** möglich

## Technische Details

### OAuth Flow
```typescript
// 1. Redirect to Slack
const connectSlack = () => {
  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID,
    scope: 'users.profile:write,dnd:write',
    redirect_uri: `${window.location.origin}/api/slack/callback`,
  });
  window.location.href = `https://slack.com/oauth/v2/authorize?${params}`;
};

// 2. Handle callback, store token
// 3. Use token for status updates
```

### Slack API
```typescript
const setSlackStatus = async (
  accessToken: string,
  status: string,
  emoji: string,
  expiration?: number
) => {
  const response = await fetch('https://slack.com/api/users.profile.set', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profile: {
        status_text: status,
        status_emoji: emoji,
        status_expiration: expiration || 0,
      },
    }),
  });
  return response.json();
};
```

### Storage
```typescript
interface SlackIntegration {
  accessToken: string; // Verschlüsselt
  previousStatus?: {
    text: string;
    emoji: string;
  };
}
```

## Testing

### Manuell zu testen
- [ ] OAuth Flow funktioniert
- [ ] Status wird gesetzt
- [ ] Status wird zurückgesetzt
- [ ] Disconnect funktioniert

## Definition of Done

- [ ] OAuth implementiert
- [ ] Status Set/Reset
- [ ] Settings UI
- [ ] Token-Speicherung
