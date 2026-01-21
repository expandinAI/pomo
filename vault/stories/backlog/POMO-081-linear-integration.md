---
type: story
status: backlog
priority: p1
effort: 8
feature: "[[features/system-integrations]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [integrations, linear, oauth, p1]
---

# POMO-081: Linear Integration

## User Story

> Als **Entwickler**
> möchte ich **Linear Issues mit meinen Pomo Sessions verknüpfen können**,
> damit **ich meinen Fortschritt an echten Tasks tracken kann**.

## Kontext

Link zum Feature: [[features/system-integrations]]

**Priorität: P1** - OAuth-Komplexität, später implementieren.

## Akzeptanzkriterien

- [ ] **Given** Linear verbunden, **When** OAuth, **Then** erfolgreich authentifiziert
- [ ] **Given** Task-Input, **When** Linear verbunden, **Then** Issues durchsuchbar
- [ ] **Given** Issue ausgewählt, **When** Task, **Then** Name übernommen
- [ ] **Given** Session fertig, **When** Issue verknüpft, **Then** Option "Mark as Done"
- [ ] **Given** Shortcut L I, **When** gedrückt, **Then** Issue-Suche öffnet
- [ ] **Given** Settings, **When** Disconnect, **Then** möglich

## Technische Details

### OAuth Flow
```typescript
const connectLinear = () => {
  const params = new URLSearchParams({
    client_id: LINEAR_CLIENT_ID,
    scope: 'read,write',
    redirect_uri: `${window.location.origin}/api/linear/callback`,
    response_type: 'code',
  });
  window.location.href = `https://linear.app/oauth/authorize?${params}`;
};
```

### Linear GraphQL API
```graphql
query SearchIssues($query: String!) {
  searchIssues(query: $query, first: 10) {
    nodes {
      id
      identifier
      title
      state {
        name
      }
    }
  }
}

mutation UpdateIssueState($issueId: String!, $stateId: String!) {
  issueUpdate(id: $issueId, input: { stateId: $stateId }) {
    issue {
      id
      state { name }
    }
  }
}
```

### Issue Picker UI
```
┌─────────────────────────────────────────────────┐
│ 🔍 Search Linear issues...                      │
├─────────────────────────────────────────────────┤
│ ENG-123  Fix authentication bug       In Prog  │
│ ENG-124  Add dark mode                 Todo    │
│ ENG-125  Update documentation          Todo    │
└─────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] OAuth Flow funktioniert
- [ ] Issues durchsuchbar
- [ ] Issue als Task übernommen
- [ ] Mark as Done funktioniert

## Definition of Done

- [ ] OAuth implementiert
- [ ] Issue Search
- [ ] Task Integration
- [ ] Status Update
