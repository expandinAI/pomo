---
type: feature
status: refined
priority: p1
effort: m
business_value: critical
origin: "Legal Compliance"
decisions:
  - "[[decisions/ADR-001-multi-platform-architecture]]"
depends_on:
  - "[[features/cloud-sync-accounts]]"
stories:
  - "[[stories/backlog/POMO-327-data-export]]"
  - "[[stories/backlog/POMO-328-account-deletion]]"
  - "[[stories/backlog/POMO-329-deletion-cron]]"
  - "[[stories/backlog/POMO-330-privacy-settings-ui]]"
  - "[[stories/backlog/POMO-331-privacy-policy-page]]"
created: 2026-01-28
updated: 2026-01-31
tags: [legal, gdpr, privacy, compliance, p1]
---

# GDPR & Data Privacy

## Zusammenfassung

> DSGVO-konforme Datenschutz-Features: Datenexport, Account-Löschung mit 30-Tage Cooling-Off, Privacy Policy. Cookieless Analytics (PostHog) = kein Cookie Banner nötig. Server in USA mit ordnungsgemäßer EU-Disclosure.

## Kontext & Problem

Sobald wir User-Accounts und Cloud-Speicherung haben, unterliegen wir der DSGVO (da auch EU-Nutzer). Ohne Compliance:

- Rechtliche Risiken (Bußgelder bis 4% des Umsatzes)
- Vertrauensverlust bei Nutzern
- App Store Rejection möglich

---

## Entscheidungen (FINAL)

| Aspekt | Entscheidung | Begründung |
|--------|--------------|------------|
| **Analytics** | PostHog (Cookieless) | Kein Consent nötig |
| **Cookie Banner** | ❌ Nicht nötig | Cookieless Tech |
| **Server-Standort** | USA | Hauptzielgruppe USA |
| **EU-Compliance** | DPF + SCCs + DPAs | Legal seit Juli 2023 |
| **Cooling-Off** | 30 Tage | User kann Löschung abbrechen |

---

## MVP-Scope (Launch-Blocker)

### 1. Privacy Policy ✅

Muss enthalten:

| Abschnitt | Inhalt |
|-----------|--------|
| Welche Daten | Email, Sessions, Projects, Settings, AI Chat |
| Warum | Service-Erbringung, AI Coach |
| Wie lange | Bis Account-Löschung + 30 Tage |
| Mit wem geteilt | Supabase, Clerk, Stripe, Anthropic |
| Server-Standort | USA (mit DPF/SCCs Disclosure) |
| Nutzerrechte | Export, Löschung, Korrektur |
| Kontakt | Email-Adresse |

**US-Transfer Disclosure (Pflicht):**

```markdown
## Datenübertragung in die USA

Deine Daten werden auf Servern in den USA gespeichert und verarbeitet.
Wir arbeiten ausschließlich mit Anbietern, die unter dem EU-US Data
Privacy Framework zertifiziert sind oder Standardvertragsklauseln (SCCs)
nutzen:

- Supabase Inc. (Datenbank) – DPF-zertifiziert
- Clerk Inc. (Authentifizierung) – SCCs
- Stripe Inc. (Zahlungen) – DPF-zertifiziert
- Anthropic PBC (AI Coach) – DPA vorhanden

Diese Mechanismen stellen sicher, dass deine Daten auch in den USA
nach europäischen Standards geschützt sind.
```

---

### 2. Data Export

**User-Story:** Als User möchte ich alle meine Daten herunterladen können.

**Endpoint:** `POST /api/privacy/export`

**Export-Inhalt:**

```json
{
  "exportedAt": "2026-01-31T14:30:00Z",
  "user": {
    "email": "user@example.com",
    "createdAt": "2025-06-15T10:00:00Z",
    "tier": "flow"
  },
  "sessions": [
    {
      "id": "...",
      "type": "work",
      "duration": 1500,
      "completedAt": "2026-01-30T09:25:00Z",
      "task": "Homepage redesign",
      "projectId": "..."
    }
  ],
  "projects": [...],
  "settings": {...},
  "coachData": {
    "insights": [...],
    "chatHistory": [...]
  }
}
```

**Format:** JSON (maschinenlesbar, DSGVO-konform)

**UI:**

```
┌─────────────────────────────────────────┐
│ Deine Daten                             │
│                                         │
│ Du kannst jederzeit eine Kopie aller    │
│ deiner Daten herunterladen.             │
│                                         │
│ Enthalten:                              │
│ • 127 Partikel                          │
│ • 12 Projekte                           │
│ • Einstellungen                         │
│ • Coach-Verlauf                         │
│                                         │
│ [Daten exportieren (JSON)]              │
│                                         │
│ Der Export kann einige Sekunden dauern. │
└─────────────────────────────────────────┘
```

---

### 3. Account Deletion (30 Tage Cooling-Off)

**Ablauf:**

```
1. User klickt "Account löschen"
           ↓
2. Bestätigung: "LÖSCHEN" eintippen
           ↓
3. Account wird DEAKTIVIERT (nicht gelöscht)
   • Login nicht mehr möglich
   • Daten noch vorhanden
   • Email: "Du hast 30 Tage zum Abbrechen"
           ↓
4. 30 Tage warten
           ↓
5a. User bricht ab → Account reaktiviert
           ↓
5b. 30 Tage vorbei → Permanente Löschung
    • Alle Sessions gelöscht
    • Alle Projekte gelöscht
    • Alle Coach-Daten gelöscht
    • Clerk User gelöscht
    • Stripe Subscription gekündigt
```

**Datenbank-Änderungen:**

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  deletion_requested_at TIMESTAMPTZ,
  deletion_scheduled_for TIMESTAMPTZ;

-- Cron Job: Täglich um 3:00 UTC
-- Lösche alle Users wo deletion_scheduled_for < NOW()
```

**UI - Schritt 1: Löschung anfordern**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         Account löschen                         │
│                                                 │
│   ⚠️ Diese Aktion kann nicht rückgängig        │
│   gemacht werden.                               │
│                                                 │
│   Folgendes wird gelöscht:                      │
│   • 127 Partikel                                │
│   • 12 Projekte                                 │
│   • Deine Einstellungen                         │
│   • Coach-Verlauf                               │
│   • Dein Flow-Abo (falls vorhanden)            │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │  Meine Daten zuerst exportieren         │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   Um fortzufahren, gib "LÖSCHEN" ein:          │
│   ┌─────────────────────────────────────────┐   │
│   │                                         │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   [Abbrechen]    [Account löschen]              │
│                                                 │
└─────────────────────────────────────────────────┘
```

**UI - Schritt 2: Bestätigung (nach Klick)**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         Löschung eingeleitet                    │
│                                                 │
│   Dein Account wird in 30 Tagen gelöscht.       │
│                                                 │
│   Bis dahin:                                    │
│   • Kannst du dich nicht mehr einloggen        │
│   • Sind deine Daten noch gespeichert          │
│   • Kannst du die Löschung abbrechen           │
│                                                 │
│   Wir haben dir eine E-Mail mit einem Link     │
│   zum Abbrechen geschickt.                      │
│                                                 │
│   Löschung am: 2. März 2026                     │
│                                                 │
│   [Verstanden]                                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Email: Löschung eingeleitet**

```
Betreff: Dein Particle-Account wird gelöscht

Hallo,

du hast die Löschung deines Particle-Accounts angefordert.

Dein Account und alle Daten werden am 2. März 2026
permanent gelöscht.

Falls du es dir anders überlegst:
[Löschung abbrechen]

Falls du das nicht warst, kontaktiere uns bitte sofort.

– Team Particle
```

---

### 4. Privacy Settings UI

Im Account-Bereich:

```
┌─────────────────────────────────────────────────────────────────┐
│ Datenschutz                                                      │
│ ─────────────────────────────────────────────────────────────   │
│                                                                   │
│ Datenexport                                                      │
│ Lade eine Kopie aller deiner Daten herunter.                    │
│ [Daten exportieren]                                              │
│                                                                   │
│ ─────────────────────────────────────────────────────────────   │
│                                                                   │
│ Analytics                                              [●]       │
│ Hilf uns, Particle zu verbessern (anonymisiert)                 │
│                                                                   │
│ ─────────────────────────────────────────────────────────────   │
│                                                                   │
│ Account löschen                                                  │
│ Lösche deinen Account und alle Daten permanent.                 │
│ [Account löschen...]                                             │
│                                                                   │
│ ─────────────────────────────────────────────────────────────   │
│                                                                   │
│ Datenschutzerklärung                                            │
│ [Datenschutzerklärung öffnen ↗]                                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technische Architektur

### API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/privacy/export` | POST | Generiert JSON-Export |
| `/api/privacy/delete` | POST | Startet 30-Tage Deletion |
| `/api/privacy/cancel-deletion` | POST | Bricht Löschung ab |
| `/api/cron/cleanup-deleted` | POST | Cron: Permanente Löschung |

### Datenmodell

```sql
-- User-Erweiterung
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  analytics_enabled BOOLEAN DEFAULT TRUE,
  deletion_requested_at TIMESTAMPTZ,
  deletion_scheduled_for TIMESTAMPTZ,
  deletion_cancelled_at TIMESTAMPTZ;

-- Für Audit-Trail (optional, später)
CREATE TABLE privacy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type TEXT, -- 'export', 'deletion_requested', 'deletion_cancelled', 'deleted'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Hard Delete (nach 30 Tagen)

```typescript
async function permanentlyDeleteUser(userId: string): Promise<void> {
  // 1. Coach-Daten löschen
  await supabase.from('coach_insights').delete().eq('user_id', userId);
  await supabase.from('coach_messages').delete().eq('user_id', userId);

  // 2. Sessions löschen
  await supabase.from('sessions').delete().eq('user_id', userId);

  // 3. Projekte löschen
  await supabase.from('projects').delete().eq('user_id', userId);

  // 4. Settings löschen
  await supabase.from('user_settings').delete().eq('user_id', userId);

  // 5. Stripe Subscription kündigen
  if (user.subscription_id) {
    await stripe.subscriptions.cancel(user.subscription_id);
  }

  // 6. Clerk User löschen
  await clerk.users.deleteUser(userId);

  // 7. User-Record löschen
  await supabase.from('users').delete().eq('id', userId);
}
```

---

## Nicht im MVP-Scope (Later)

| Feature | Warum später |
|---------|--------------|
| Audit Log | Nice-to-have, nicht DSGVO-Pflicht |
| 2FA | Security-Feature, nicht Privacy |
| Granulare Consent | Nicht nötig bei Cookieless |
| Data Retention Auto-Delete | Kann später kommen |
| CCPA (California) | Ähnlich zu GDPR, später |

---

## Abhängigkeiten

- [x] Supabase DPA vorhanden
- [x] Clerk DPA vorhanden
- [x] Stripe DPA vorhanden
- [x] Anthropic DPA vorhanden
- [ ] Privacy Policy Text schreiben
- [ ] Cloud Sync muss existieren

---

## Aufwandsschätzung

| Story | SP |
|-------|---:|
| Data Export API + UI | 3 |
| Account Deletion Flow | 5 |
| Deletion Cron Job | 2 |
| Privacy Settings UI | 2 |
| Privacy Policy Page | 2 |
| **Total** | **~14 SP** |

---

## Checkliste vor Launch

- [ ] Privacy Policy auf Website
- [ ] Privacy Policy Link in App (Footer/Settings)
- [ ] Data Export funktioniert
- [ ] Account Deletion funktioniert
- [ ] 30-Tage Cron Job läuft
- [ ] Deletion-Emails werden gesendet
- [ ] Analytics Opt-Out funktioniert
- [ ] US-Transfer in Privacy Policy erwähnt

---

*Zuletzt aktualisiert: 2026-01-31*
