---
type: story
status: icebox
priority: p2
effort: 3
feature: "[[features/analytics]]"
created: 2026-01-25
updated: 2026-01-25
done_date: null
tags: [analytics, email, engagement, pomotodo-learning, p2]
---

# POMO-156: Weekly Progress Report (Email)

## User Story

> Als **Nutzer der seine Fortschritte verstehen will**
> möchte ich **wöchentlich eine Zusammenfassung per Email erhalten**,
> damit **ich meine Produktivität über Zeit sehe ohne die App zu öffnen**.

## Kontext

Link zum Feature: [[features/analytics]]

**Pomotodo-Learning:** Das beste Feature von Pomotodo sind die automatischen Weekly Reports per Email. User bekommen Insights, ohne die App öffnen zu müssen.

**Warum das wertvoll ist:**
1. **Engagement ohne App-Öffnung** – User bleiben connected
2. **Reflexion** – Wöchentlicher Rückblick fördert Verbesserung
3. **Retention** – Regelmäßiger Kontaktpunkt
4. **Low-Effort für User** – Kommt automatisch

**Particle-Philosophie:**
- **Opt-In, nicht Opt-Out** – Kein Spam
- **Minimalistisch** – Keine Marketing-Emails, nur Insights
- **Wertvoll** – Echte Daten, nicht Fluff

## Design-Prinzipien

1. **Opt-In Required** – User muss aktiv aktivieren
2. **Valuable Content** – Nur relevante Insights
3. **Minimalist Design** – Clean, nicht Spam-Look
4. **Easy Unsubscribe** – Ein Klick zum Abmelden
5. **GDPR-Compliant** – Datenschutz respektieren

## Akzeptanzkriterien

### Opt-In Flow

- [ ] **Given** Settings > Notifications, **When** "Weekly Report", **Then** Toggle verfügbar
- [ ] **Given** Toggle, **When** Default, **Then** OFF
- [ ] **Given** Toggle ON, **When** keine Email verifiziert, **Then** Email-Eingabe angefordert
- [ ] **Given** Email eingegeben, **When** Submit, **Then** Verification-Email gesendet
- [ ] **Given** Email verifiziert, **When** nächster Sonntag, **Then** Report wird gesendet

### Report-Inhalt

- [ ] **Given** Report, **When** Inhalt, **Then** Zeitraum: letzte 7 Tage
- [ ] **Given** Report, **When** Metriken, **Then** Total Focus Time
- [ ] **Given** Report, **When** Metriken, **Then** Anzahl Sessions (Full/Partial)
- [ ] **Given** Report, **When** Metriken, **Then** Anzahl erledigte Tasks
- [ ] **Given** Report, **When** Metriken, **Then** Vergleich zur Vorwoche (+/- %)
- [ ] **Given** Report, **When** Optional, **Then** Streak-Status

### Timing

- [ ] **Given** Report aktiv, **When** Sonntag 18:00 UTC, **Then** Report wird versendet
- [ ] **Given** Keine Aktivität in der Woche, **When** Sonntag, **Then** Kein Report (oder "Du warst diese Woche nicht aktiv")

### Unsubscribe

- [ ] **Given** Report-Email, **When** Footer, **Then** "Unsubscribe" Link vorhanden
- [ ] **Given** Unsubscribe-Link, **When** Klick, **Then** Sofort abgemeldet (kein Confirm)
- [ ] **Given** Abgemeldet, **When** Settings, **Then** Toggle ist OFF

### Email-Design

- [ ] **Given** Report, **When** Design, **Then** Minimalistisch, Monochrome-Style
- [ ] **Given** Report, **When** Mobile, **Then** Responsive
- [ ] **Given** Report, **When** Header, **Then** Particle Logo, Zeitraum
- [ ] **Given** Report, **When** CTA, **Then** "Details in Particle ansehen" Button

## Technische Details

### Email-Service

**Optionen:**
- **Resend** – Developer-friendly, günstig
- **SendGrid** – Etabliert, skalierbar
- **Postmark** – Hohe Deliverability
- **AWS SES** – Günstig bei Volume

**Empfehlung:** Resend (modern, einfache API, React Email Support)

### Email-Template (React Email)

```typescript
import { Html, Head, Body, Container, Section, Text, Button, Hr } from '@react-email/components';

interface WeeklyReportProps {
  userName?: string;
  weekStart: string;
  weekEnd: string;
  totalFocusTime: number;  // Minuten
  sessionsCount: number;
  tasksCompleted: number;
  vsLastWeek: number;  // Prozent (+/-)
  currentStreak: number;
}

export const WeeklyReport = ({
  userName,
  weekStart,
  weekEnd,
  totalFocusTime,
  sessionsCount,
  tasksCompleted,
  vsLastWeek,
  currentStreak,
}: WeeklyReportProps) => (
  <Html>
    <Head />
    <Body style={bodyStyle}>
      <Container style={containerStyle}>
        <Section>
          <Text style={headerStyle}>Particle</Text>
          <Text style={subheaderStyle}>
            Deine Woche: {weekStart} – {weekEnd}
          </Text>
        </Section>

        <Hr style={hrStyle} />

        <Section style={metricsSection}>
          <Text style={metricLarge}>
            {formatTime(totalFocusTime)}
          </Text>
          <Text style={metricLabel}>Fokuszeit</Text>

          <Text style={metricMedium}>
            {sessionsCount} Sessions • {tasksCompleted} Tasks
          </Text>

          <Text style={comparisonStyle}>
            {vsLastWeek >= 0 ? '↑' : '↓'} {Math.abs(vsLastWeek)}% vs. letzte Woche
          </Text>
        </Section>

        {currentStreak > 0 && (
          <Section>
            <Text style={streakStyle}>
              🔥 {currentStreak} Tage Streak
            </Text>
          </Section>
        )}

        <Hr style={hrStyle} />

        <Section>
          <Button href="https://particle.app/stats" style={buttonStyle}>
            Details ansehen →
          </Button>
        </Section>

        <Section style={footerSection}>
          <Text style={footerText}>
            Du erhältst diese Email, weil du Weekly Reports aktiviert hast.
          </Text>
          <Text style={unsubscribeText}>
            <a href="{{{unsubscribe_url}}}">Abmelden</a>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);
```

### Cron Job / Scheduler

```typescript
// Sonntag 18:00 UTC
// 0 18 * * 0

const sendWeeklyReports = async () => {
  // 1. Alle User mit aktivem Weekly Report
  const users = await db.user.findMany({
    where: { weeklyReportEnabled: true, emailVerified: true },
  });

  // 2. Für jeden User: Stats der letzten 7 Tage
  for (const user of users) {
    const stats = await getWeeklyStats(user.id);

    // 3. Skip wenn keine Aktivität
    if (stats.totalFocusTime === 0) continue;

    // 4. Email senden
    await resend.emails.send({
      from: 'Particle <hello@particle.app>',
      to: user.email,
      subject: `Deine Woche: ${stats.totalFocusTime} Minuten Fokuszeit`,
      react: WeeklyReport(stats),
    });
  }
};
```

### Datenbank-Schema

```prisma
model User {
  id                  String   @id @default(cuid())
  email               String?  @unique
  emailVerified       DateTime?

  // Weekly Report Settings
  weeklyReportEnabled Boolean  @default(false)
  weeklyReportDay     Int      @default(0)  // 0 = Sonntag
  weeklyReportTime    Int      @default(18) // UTC Hour

  // Unsubscribe Token (für sichere Abmeldung)
  unsubscribeToken    String?  @unique
}
```

### UI Mockup

**Settings:**
```
Benachrichtigungen
─────────────────────────────────────────

Weekly Progress Report
Erhalte jeden Sonntag eine Zusammenfassung
deiner Produktivität per Email.

  [OFF] ─────────────○ [ON]

  Email: max@example.com ✓ verifiziert
  [Ändern]

  Nächster Report: Sonntag, 26.01.2026
```

**Email-Preview:**
```
┌─────────────────────────────────────────┐
│                                         │
│            ● Particle                   │
│                                         │
│   Deine Woche: 19.01. – 25.01.2026     │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│              8h 45min                   │
│              Fokuszeit                  │
│                                         │
│     21 Sessions • 14 Tasks erledigt     │
│                                         │
│          ↑ 23% vs. letzte Woche         │
│                                         │
│             🔥 12 Tage Streak           │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│        [ Details ansehen → ]            │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   Du erhältst diese Email weil...       │
│   Abmelden                              │
│                                         │
└─────────────────────────────────────────┘
```

## GDPR / Datenschutz

### Anforderungen

- [ ] Opt-In erforderlich (kein Pre-checked)
- [ ] Email-Verifizierung vor erstem Report
- [ ] Einfache Abmeldung (1-Click)
- [ ] Keine Tracking-Pixel im Email
- [ ] Datenschutz-Hinweis in Settings
- [ ] Emails werden nicht für Marketing genutzt

### Privacy Notice

> "Deine Email wird ausschließlich für Weekly Reports verwendet.
> Du kannst dich jederzeit abmelden. Wir verkaufen deine Daten nicht."

## Nicht im Scope (v1)

- Daily Reports
- Monthly Reports
- Custom Report-Frequenz
- Report-Timing anpassen
- Detaillierte Projekt-Breakdown im Email
- PDF-Export der Reports

## Effort Breakdown

| Task | Effort |
|------|--------|
| Email-Service Setup (Resend) | 0.5 |
| Email-Template (React Email) | 0.5 |
| Settings UI + Email-Verification | 0.5 |
| Cron Job / Scheduler | 0.5 |
| Stats-Aggregation Query | 0.5 |
| Unsubscribe-Flow | 0.25 |
| Testing | 0.25 |
| **Total** | **3 Story Points** |

## Testing

### Manuell zu testen

- [ ] Opt-In Flow funktioniert
- [ ] Email-Verification funktioniert
- [ ] Report wird am Sonntag gesendet
- [ ] Report-Inhalt ist korrekt
- [ ] Mobile-Rendering OK
- [ ] Unsubscribe funktioniert (1-Click)
- [ ] Kein Report bei 0 Aktivität

## Definition of Done

- [ ] Email-Service integriert
- [ ] Opt-In in Settings
- [ ] Email-Verification Flow
- [ ] Weekly Report Template
- [ ] Cron Job für Sonntag 18:00 UTC
- [ ] Unsubscribe-Funktion
- [ ] GDPR-konform
- [ ] Code Review abgeschlossen
- [ ] **Prüffrage:** Würde ich diese Email selbst lesen wollen?
