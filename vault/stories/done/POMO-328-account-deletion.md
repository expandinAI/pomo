---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/gdpr-data-privacy]]"
created: 2026-01-31
updated: 2026-02-03
done_date: null
tags: [gdpr, privacy, deletion]
---

# POMO-328: Account Deletion (Immediate)

## User Story

> As a **user**,
> I want to **delete my account immediately**,
> so that **I can leave the platform when I decide to**.

## Context

Link: [[features/gdpr-data-privacy]]

**Philosophie:** Der Nutzer will raus, also darf er raus. Keine künstlichen Hürden, keine Cooling-off Period. Eine klare Warnung reicht.

**Vereinfacht von:** Ursprünglich 30-Tage Cooling-off + Cron Job (POMO-329 entfernt).

## Acceptance Criteria

### UI

- [ ] "Delete Account" Button in Privacy Settings (existiert bereits)
- [ ] Confirmation Modal mit:
  - Warnung was gelöscht wird (Particles, Projects, Settings, Coach History)
  - "Export my data first" Button
  - Text-Input: User muss "DELETE" eingeben
  - Cancel / Delete Buttons
- [ ] Delete-Button disabled bis "DELETE" korrekt eingegeben

### Deletion Flow

- [ ] **Given** User bestätigt mit "DELETE", **When** Button geklickt, **Then** sofortige Löschung aller Daten
- [ ] **Given** Löschung erfolgreich, **Then** Logout + Redirect zu `/`
- [ ] **Given** Löschung fehlgeschlagen, **Then** Error-Message anzeigen

### Was wird gelöscht?

1. Coach Data (insights, messages)
2. Sessions (alle Particles)
3. Projects
4. User Settings
5. Stripe Subscription (cancel)
6. Clerk User
7. User Record (zuletzt wegen Foreign Keys)

## Technical Details

### API Endpoint

```typescript
// DELETE /api/account
// Auth: Required (Clerk)

// Response on success: 204 No Content
// Response on error: 500 { error: string }
```

### Deletion Function

```typescript
// src/lib/account/delete-account.ts

export async function deleteAccount(userId: string): Promise<void> {
  // 1. Coach data
  await supabase.from('coach_insights').delete().eq('user_id', userId);
  await supabase.from('coach_messages').delete().eq('user_id', userId);

  // 2. Sessions
  await supabase.from('sessions').delete().eq('user_id', userId);

  // 3. Projects
  await supabase.from('projects').delete().eq('user_id', userId);

  // 4. Settings
  await supabase.from('user_settings').delete().eq('user_id', userId);

  // 5. Cancel Stripe subscription (if exists)
  const user = await supabase.from('users').select('subscription_id').eq('id', userId).single();
  if (user.data?.subscription_id) {
    await stripe.subscriptions.cancel(user.data.subscription_id);
  }

  // 6. Delete user record
  await supabase.from('users').delete().eq('id', userId);

  // 7. Delete Clerk user (triggers logout)
  await clerk.users.deleteUser(userId);
}
```

### Files

```
src/
├── app/api/
│   └── account/route.ts              # NEW: DELETE endpoint
├── components/settings/
│   └── DeleteAccountModal.tsx        # NEW: Confirmation modal
└── lib/account/
    └── delete-account.ts             # NEW: Deletion logic
```

## UI/UX

### Delete Account Modal

```
┌─────────────────────────────────────────────────┐
│                                           [×]   │
│                                                 │
│         Delete Account                          │
│                                                 │
│   ⚠️ This action cannot be undone.              │
│                                                 │
│   The following will be permanently deleted:    │
│   • 127 Particles                               │
│   • 12 Projects                                 │
│   • Your settings                               │
│   • Coach history                               │
│   • Your Flow subscription (if any)             │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │  ↓ Export my data first                 │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   To confirm, type "DELETE":                    │
│   ┌─────────────────────────────────────────┐   │
│   │                                         │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   [Cancel]              [Delete Account]        │
│                         (disabled until typed)  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### States

- **Initial:** Delete button disabled, input empty
- **Typing:** Delete button still disabled
- **"DELETE" entered:** Delete button enabled (red/destructive)
- **Loading:** "Deleting..." with spinner
- **Error:** Error message, can retry

## Testing

### Manual Testing

- [ ] Modal öffnet von Privacy Settings
- [ ] "Export first" Button funktioniert
- [ ] Delete Button disabled bis "DELETE" eingegeben
- [ ] Löschung funktioniert (alle Daten weg)
- [ ] Logout nach Löschung
- [ ] Redirect zu `/`
- [ ] Stripe Subscription wird gecancelt

## Definition of Done

- [ ] DELETE /api/account endpoint
- [ ] DeleteAccountModal component
- [ ] delete-account.ts utility
- [ ] Integration in PrivacySettings
- [ ] Error handling
- [ ] Loading states
- [ ] Tested mit echtem Account

## Nicht im Scope

- ~~30-Tage Cooling-off Period~~ (entfernt)
- ~~Cancellation Email~~ (entfernt)
- ~~Cron Job~~ (POMO-329 entfernt)
- Confirmation Email nach Löschung (optional für später)

---

## Arbeitsverlauf

### Erstellt: 2026-01-31
Story erstellt mit 30-Tage Cooling-off.

### Updated: 2026-02-03
Vereinfacht: Sofortige Löschung ohne Cooling-off. POMO-329 (Cron) entfernt.
