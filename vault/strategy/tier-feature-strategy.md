---
type: strategy
status: active
created: 2026-01-30
updated: 2026-01-30
tags: [strategy, tiers, monetization, features]
---

# Tier & Feature Strategie

> **Single Source of Truth** für die Feature-Aufteilung zwischen Lokal, Particle und Particle Flow.

## Philosophie

### Kernprinzipien

1. **Aspiration + Dankbarkeit**, nicht Frustration
2. Free-User sollen die App **lieben**, nicht genervt werden
3. Flow ist für **Supporter UND Power-User**
4. Limits sind **großzügig** – die meisten brauchen kein Upgrade

### Upgrade-Psychologie

| Trigger | Beschreibung | Unser Ansatz |
|---------|--------------|--------------|
| **Tägliche Reibung** | "Du hast dein Limit erreicht" | Vermeiden |
| **Aspiration** | "Schau, was du haben könntest" | Nutzen (Year View Preview) |
| **Dankbarkeit** | "Ich liebe das Produkt" | Nutzen (Supporter-Identität) |
| **Identität** | "Ich bin ein Focus-Profi" | Nutzen (Flow-Badge) |

---

## Tier-Übersicht

| Aspekt | Lokal | Particle | Particle Flow |
|--------|-------|----------|---------------|
| **Account** | Keiner | Kostenlos | Bezahlt (9€/Monat) |
| **Speicherung** | Nur lokal | Lokal + Cloud | Lokal + Cloud |
| **DB-Wert** | – (kein Eintrag) | `'free'` | `'flow'` |
| **Display-Name** | "Lokal" | "Particle" | "Particle Flow" |

---

## Feature-Matrix

| Feature | Lokal | Particle | Particle Flow |
|---------|-------|----------|---------------|
| **Basis** ||||
| Timer & Breaks | ✓ | ✓ | ✓ |
| History | 30 Tage | Unbegrenzt | Unbegrenzt |
| Basic Stats (Tag/Woche) | ✓ | ✓ | ✓ |
| **Limits** ||||
| Aktive Projekte | 5 | 5 | ∞ |
| Custom Presets | 3 | 5 | ∞ |
| **Cloud** ||||
| Cloud Sync | ✗ | ✓ | ✓ |
| Multi-Device | ✗ | ✓ | ✓ |
| Cloud Backup | ✗ | ✓ | ✓ |
| **Premium** ||||
| Ambient Sounds | 2 Basis | 2 Basis | Alle (8+) |
| Themes | 1 | 2 | Alle |
| Year View | ✗ | Preview¹ | ✓ |
| Advanced Stats | ✗ | ✗ | ✓ |
| **Identität** ||||
| Flow-Badge | ✗ | ✗ | ✓ |
| Early Access | ✗ | ✗ | ✓ |

¹ *Preview = geblurrt/gesperrt mit Upgrade-Hinweis*

---

## Upgrade-Trigger

### Lokal → Particle

**Haupt-Trigger:** "Ich will meine Daten auf allen Geräten"

| Moment | Conversion-Ansatz |
|--------|-------------------|
| Neues Gerät gekauft | "Sync deine bestehenden Daten" |
| Angst vor Datenverlust | "Cloud Backup schützt dich" |
| Browserdaten gelöscht | Zu spät – Prävention wichtiger |

**Kein Zwang:** Die App funktioniert komplett ohne Account.

### Particle → Flow

**Haupt-Trigger:**
1. Mehr als 5 aktive Projekte (Freelancer/Profis)
2. Year View sehen wollen (emotionaler Wow-Moment)
3. Bessere Ambient Sounds (täglicher Mehrwert)
4. Indie-Entwickler unterstützen wollen

| Feature | Conversion-Strategie |
|---------|---------------------|
| **Projekte** | Sanfter Hinweis: "Archive one or upgrade to Flow" |
| **Year View** | Preview zeigen (geblurrt), Neugier wecken |
| **Sounds** | 2 Basis-Sounds für alle, Premium-Sounds locken |
| **Themes** | Sichtbarer Unterschied ohne funktionale Einschränkung |

---

## Limits im Detail

### Aktive Projekte (5)

- **Was zählt:** Nur nicht-archivierte Projekte
- **Archivierte:** Zählen nicht, unbegrenzt möglich
- **UX bei Limit:** "You have 5 active projects. Archive one or upgrade to Flow."
- **Kein hartes Blockieren:** Sanfter Upgrade-Prompt

**Warum 5?**
- Reicht für die meisten persönlichen Nutzer
- Freelancer mit vielen Kunden brauchen mehr → Flow
- 3 wäre zu restriktiv, 10 zu großzügig

### Custom Presets (3/5/∞)

- **Lokal:** 3 Presets (Pomodoro, 52/17, eigenes)
- **Particle:** 5 Presets (etwas mehr Flexibilität)
- **Flow:** Unbegrenzt

**Warum diese Zahlen?**
- 3-5 reichen für 95% der Nutzer
- Schwacher Upgrade-Hebel, aber vorhanden

### Ambient Sounds (2 Basis / Alle)

**Basis-Sounds (alle Tiers):**
1. Stille (kein Sound)
2. Weißes Rauschen

**Premium-Sounds (nur Flow):**
- Regen
- Café
- Wald
- Kamin
- Ozean
- etc. (8+ geplant)

**Warum diese Aufteilung?**
- Täglicher Touch Point: Jede Session erinnert an Flow
- Basis ist funktional, Premium ist atmosphärisch

### Themes (1/2/Alle)

- **Lokal:** Default Theme
- **Particle:** Default + 1 Alternative
- **Flow:** Alle Themes

**Warum?**
- Sichtbarer Unterschied
- Keine funktionale Einschränkung
- Low-effort für uns, spürbarer Wert für User

---

## Flow Value Proposition

### Funktionaler Mehrwert

| Feature | Wert |
|---------|------|
| ∞ Projekte | Für Freelancer/Profis mit vielen Kunden |
| Year View | Emotionaler "Wow"-Moment, Stolz auf Fortschritt |
| Alle Sounds | Tägliche Verbesserung jeder Session |
| Alle Themes | Personalisierung |
| Advanced Stats | Tiefere Einblicke für Daten-Nerds |

### Identitäts-Mehrwert

| Aspekt | Beschreibung |
|--------|--------------|
| Flow-Badge | Sichtbar im Profil, Supporter-Signal |
| Indie-Support | "Du unterstützt einen Indie-Entwickler" |
| Early Access | Neue Features zuerst testen |

### Preisgestaltung

- **Monatlich:** 9€
- **Jährlich:** 79€ (2 Monate kostenlos)
- **Trial:** 14 Tage, keine Kreditkarte

---

## Roadmap: Zukünftige Flow-Features

Diese Features sind geplant und werden Flow exklusiv:

| Feature | Beschreibung | Priorität |
|---------|--------------|-----------|
| Erweiterte Projektanalyse | Zeit pro Projekt, Trends | Hoch |
| Export & Berichte | PDF/CSV Export für Freelancer | Hoch |
| Rechnungserstellung | Zeit → Rechnung für Kunden | Mittel |
| Team-Features | Shared Workspaces | Niedrig |
| API-Zugang | Für Entwickler/Automations | Niedrig |

---

## Technische Umsetzung

### TypeScript Types

```typescript
// Tier-Werte in der Datenbank
export type Tier = 'free' | 'flow';

// Auth-Status für die App
export type AuthMode = 'local' | 'free' | 'flow';
```

### Feature-Prüfung

```typescript
// Hook für Feature-Check
const hasYearView = useFeature('yearView');

// Hook für Limit-Check
const maxProjects = useTierLimit('maxActiveProjects');

// Component für Feature-Gating
<FeatureGate feature="yearView">
  <YearView />
</FeatureGate>
```

### Referenz-Implementierung

Siehe [[stories/backlog/POMO-303-account-tiers]] für die vollständige technische Spezifikation.

---

## Entscheidungslog

| Datum | Entscheidung | Begründung |
|-------|--------------|------------|
| 2026-01-30 | 5 aktive Projekte als Limit | Balance zwischen Großzügigkeit und Upgrade-Trigger |
| 2026-01-30 | Ambient Sounds als Flow-Feature | Täglicher Touch Point, emotionaler Wert |
| 2026-01-30 | Year View mit Preview für Free | Aspiration-Trigger, nicht Frustration |
| 2026-01-30 | `'free'` statt `'plus'` als DB-Wert | Klarere Semantik, "Particle" als Display-Name |
| 2026-01-30 | Archivierte Projekte zählen nicht | Kein hartes Blockieren, sanftes Nudging |

---

## Referenzen

- [[features/cloud-sync-accounts]] – Cloud Sync Feature-Spec
- [[stories/backlog/POMO-303-account-tiers]] – Implementierungs-Story
- [[strategy/pricing-monetization]] – Pricing-Strategie

---

*Letzte Aktualisierung: 2026-01-30*
