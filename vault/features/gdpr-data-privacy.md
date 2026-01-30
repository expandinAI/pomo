---
type: feature
status: draft
priority: p1
effort: m
business_value: critical
origin: "Legal Compliance"
decisions:
  - "[[decisions/ADR-001-multi-platform-architecture]]"
depends_on:
  - "[[features/cloud-sync-accounts]]"
stories: []
created: 2026-01-28
updated: 2026-01-28
tags: [legal, gdpr, privacy, compliance, p1]
---

# GDPR & Data Privacy

## Zusammenfassung

> DSGVO-konforme Datenschutz-Features: Datenexport, Account-Löschung, Privacy Policy, Cookie Consent. Muss vor öffentlichem Launch mit Accounts fertig sein.

## Kontext & Problem

Sobald wir User-Accounts und Cloud-Speicherung haben, unterliegen wir der DSGVO (da EU-Nutzer). Ohne Compliance:

- Rechtliche Risiken (Bußgelder bis 4% des Umsatzes)
- Vertrauensverlust bei Nutzern
- App Store Rejection möglich

## Bekannte Anforderungen

### Muss erreicht werden (DSGVO Minimum)

- [ ] **Privacy Policy** – Verständliche Datenschutzerklärung
- [ ] **Data Export** – Nutzer kann alle seine Daten herunterladen (JSON)
- [ ] **Account Deletion** – Nutzer kann Account komplett löschen
- [ ] **Cookie Consent** – Banner für Analytics/Tracking (falls verwendet)
- [ ] **Data Processing Agreement** – Mit Supabase/Clerk (haben beide)

### Sollte erreicht werden

- [ ] **Granulare Consent-Optionen** – Analytics separat abschaltbar
- [ ] **Data Retention Policy** – Automatische Löschung nach X Jahren Inaktivität
- [ ] **Audit Log** – Wer hat wann auf welche Daten zugegriffen
- [ ] **Two-Factor Authentication** – Für Account-Sicherheit

### Nicht im Scope

- SOC 2 Compliance (Enterprise-Feature)
- HIPAA (Healthcare)
- CCPA (California) – Ähnlich zu GDPR, später

## Technische Überlegungen

### Data Export

```typescript
// Supabase Edge Function: /api/export-data

async function exportUserData(userId: string): Promise<UserDataExport> {
  const [user, sessions, projects, settings] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('sessions').select('*').eq('user_id', userId),
    supabase.from('projects').select('*').eq('user_id', userId),
    supabase.from('user_settings').select('*').eq('user_id', userId).single(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    user: {
      email: user.email,
      createdAt: user.created_at,
      tier: user.tier,
    },
    sessions: sessions.data,
    projects: projects.data,
    settings: settings.data,
  };
}
```

**Format:** JSON (maschinenlesbar, DSGVO-konform)

### Account Deletion

```typescript
// Supabase Edge Function: /api/delete-account

async function deleteAccount(userId: string): Promise<void> {
  // 1. Soft-Delete in Supabase (30 Tage Retention für Undo)
  await supabase
    .from('users')
    .update({
      deleted_at: new Date().toISOString(),
      email: `deleted_${userId}@particle.app`,  // Anonymisieren
    })
    .eq('id', userId);

  // 2. User bei Clerk löschen
  await clerk.users.deleteUser(userId);

  // 3. Nach 30 Tagen: Hard Delete via Cron Job
  // (Sessions, Projects, Settings)
}
```

**Ablauf:**
1. User klickt "Account löschen"
2. Bestätigung per Email
3. 30 Tage Cooling-Off Period (Account deaktiviert, aber Daten noch da)
4. Nach 30 Tagen: Permanente Löschung
5. User kann in den 30 Tagen den Löschvorgang abbrechen

### UI für Account-Löschung

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         Account löschen                         │
│                                                 │
│   Das Löschen deines Accounts ist permanent     │
│   und kann nicht rückgängig gemacht werden.     │
│                                                 │
│   Folgendes wird gelöscht:                      │
│   • 127 Partikel                                │
│   • 12 Projekte                                 │
│   • Deine Einstellungen                         │
│   • Dein Subscription (falls vorhanden)         │
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
│   ┌─────────────────────────────────────────┐   │
│   │      Account endgültig löschen          │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   [Abbrechen]                                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Privacy Policy

Muss enthalten:
- Welche Daten wir sammeln
- Warum wir sie sammeln
- Wie lange wir sie speichern
- Mit wem wir sie teilen (Supabase, Clerk, Stripe)
- Nutzerrechte (Export, Löschung, Korrektur)
- Kontaktdaten des Verantwortlichen

**Hosting:** Auf Website + Link in App

### Cookie Consent (falls Analytics)

Falls wir Analytics verwenden (z.B. Plausible, PostHog):

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  🍪 Cookies & Datenschutz                       │
│                                                 │
│  Wir nutzen Cookies für:                        │
│  ✓ Notwendig (Login, Einstellungen)            │
│  ○ Analytics (Nutzungsstatistiken)             │
│                                                 │
│  [Nur notwendige]  [Alle akzeptieren]          │
│                                                 │
│  Mehr in unserer Datenschutzerklärung          │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Empfehlung:** Privacy-freundliche Analytics (Plausible, Fathom) verwenden, die kein Consent brauchen.

## Offene Fragen

- [ ] Welche Analytics verwenden wir? (Plausible = kein Consent nötig)
- [ ] Hosting-Standort: Supabase EU (Frankfurt) → Dokumentieren
- [ ] Brauchen wir einen Datenschutzbeauftragten?
- [ ] AGB separat oder Teil der Privacy Policy?

## Abhängigkeiten

- **Cloud Sync & Accounts** muss existieren
- Rechtliche Prüfung der Privacy Policy
- Supabase DPA (bereits vorhanden)
- Clerk DPA (bereits vorhanden)

## Grobe Aufwandsschätzung

~10-15 Story Points

| Story | Aufwand |
|-------|---------|
| Data Export API | 3 SP |
| Account Deletion Flow | 5 SP |
| Privacy Policy Page | 2 SP |
| Cookie Consent (optional) | 3 SP |
| Settings UI für Privacy | 2 SP |

## Timeline

**Muss fertig sein:** Vor Public Launch mit Accounts

Empfohlene Reihenfolge:
1. Privacy Policy schreiben (parallel zu Dev)
2. Data Export implementieren
3. Account Deletion implementieren
4. Cookie Consent (falls nötig)

## Notizen

### DSGVO Quick Reference

| Recht | Implementation |
|-------|----------------|
| Auskunftsrecht | Data Export |
| Recht auf Löschung | Account Deletion |
| Recht auf Datenübertragbarkeit | JSON Export |
| Widerspruchsrecht | Analytics Opt-Out |

### Referenzen

- [GDPR.eu – Leitfaden](https://gdpr.eu/)
- [Supabase GDPR](https://supabase.com/docs/company/privacy)
- [Clerk GDPR](https://clerk.com/privacy)
