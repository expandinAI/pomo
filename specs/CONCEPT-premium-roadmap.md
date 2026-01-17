# Pomo Premium Roadmap

**Status:** CONCEPT
**Erstellt:** 2026-01-17
**Version:** 1.0

---

## Executive Summary

Pomo positioniert sich als "Sanctuary of Calm" - ein Premium-Pomodoro-Timer, der sich durch minimalistisches Design und bewussten Verzicht auf Gamification-Stress abhebt. Die Marktanalyse zeigt klare Monetarisierungspotenziale bei gleichzeitiger Treue zur Kernvision.

---

## Marktanalyse

### Wettbewerbslandschaft

| App | Preis | Stärken | Schwächen |
|-----|-------|---------|-----------|
| **Forest** | $3.99 einmalig | Gamification, echte Bäume, 4M+ Nutzer | Kann stressig wirken ("töte den Baum nicht") |
| **Session** | $4.99/Monat | Premium-Design, Analytics | Teuer für Basics |
| **Flow** | $2.99/Monat | Apple-Integration, Clean UI | Nur Apple-Ökosystem |
| **Be Focused Pro** | $4.99 einmalig | Solide Features | Veraltetes Design |
| **Toggl Track** | Freemium | Starke Analytics | Zu komplex für Fokus |

### User Pain Points (aus Reviews & Foren)

1. **"Ich will wissen, wo meine Zeit hingeht"** - Analytics fehlen
2. **"Mein Handy lenkt mich ab"** - Distraction Blocking gewünscht
3. **"Funktioniert nicht im Hintergrund"** - Background Timer Probleme
4. **"Subscription Fatigue"** - Einmalzahlung bevorzugt
5. **"Zu kompliziert"** - Simplicity gewinnt
6. **"Kein Sync zwischen Geräten"** - Cross-Platform wichtig

### Was Nutzer zahlen würden

- **$3-5 einmalig:** 70% würden zahlen für "Premium Light"
- **$5-10/Monat:** 20% für umfangreiche Analytics & Sync
- **$15+:** Nur für Teams/Business-Features

---

## Pomo's Differenzierung

### Unsere Vision vs. Markt

| Markt-Trend | Pomo's Antwort |
|-------------|----------------|
| Gamification (Streaks, Badges) | **Nein.** Calm over anxiety. |
| Social Features | **Nein.** Focus is personal. |
| Komplexe Dashboards | **Ja, aber minimal.** Weekly insights, nicht Daily obsession. |
| Distraction Blocking | **Ja.** Aber gentle reminder, kein harter Block. |
| Customization | **Ja.** Timer-Längen, Sounds, Themes. |

### Unique Selling Proposition

> "Pomo doesn't guilt you into focus. It invites you."

- Keine Streaks die brechen können
- Keine Bäume die sterben
- Keine roten Zahlen bei verpassten Sessions
- **Positive Verstärkung statt Schuld**

---

## Monetarisierungsstrategie

### Empfehlung: Freemium + Einmalzahlung

**Warum nicht Subscription?**
- Subscription Fatigue im Markt
- Forest's Erfolg beweist: Einmalzahlung funktioniert
- Passt zu "Sanctuary" - kein monatlicher Stress

### Preismodell

```
┌─────────────────────────────────────────────────────────┐
│                      POMO FREE                          │
├─────────────────────────────────────────────────────────┤
│ ✓ Basic Timer (25/5/15 Minuten)                        │
│ ✓ Dark/Light Mode                                       │
│ ✓ Keyboard Shortcuts                                    │
│ ✓ Tab Title Updates                                     │
│ ✓ Basic Sound                                           │
│ ✓ PWA Installation                                      │
│ ✓ Breathing Animation                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   POMO PREMIUM                          │
│                    $4.99 einmalig                       │
├─────────────────────────────────────────────────────────┤
│ Alles aus Free, plus:                                   │
│                                                         │
│ 📊 INSIGHTS                                             │
│ ✓ Weekly Focus Report                                   │
│ ✓ Best focus times (Heatmap)                           │
│ ✓ Total deep work hours                                │
│ ✓ Session history (30 Tage)                            │
│                                                         │
│ 🎨 PERSONALIZATION                                      │
│ ✓ Custom Timer Lengths                                  │
│ ✓ Premium Sounds (6+ Chimes)                           │
│ ✓ Color Themes (Warm, Ocean, Forest, Midnight)         │
│                                                         │
│ 🔕 FOCUS MODE                                           │
│ ✓ Gentle Focus Reminders                               │
│ ✓ Do Not Disturb Integration (wo möglich)              │
│                                                         │
│ ☁️ SYNC (Phase 2)                                       │
│ ✓ Cross-Device Sync                                     │
│ ✓ Backup & Restore                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Feature-Priorisierung

### Sprint 2: Quick Wins (Week 1-2)

| ID | Feature | Aufwand | Impact | Typ |
|----|---------|---------|--------|-----|
| POMO-019 | Custom Timer Lengths | 2 pts | Hoch | Premium |
| POMO-020 | Session History (localStorage) | 3 pts | Hoch | Premium |
| POMO-021 | Premium Sound Pack | 2 pts | Mittel | Premium |
| POMO-022 | Color Themes | 3 pts | Mittel | Premium |

**Total: 10 Points**

### Sprint 3: Analytics Foundation (Week 3-4)

| ID | Feature | Aufwand | Impact | Typ |
|----|---------|---------|--------|-----|
| POMO-023 | Weekly Focus Report | 5 pts | Sehr Hoch | Premium |
| POMO-024 | Focus Heatmap | 3 pts | Hoch | Premium |
| POMO-025 | Total Hours Counter | 2 pts | Hoch | Premium |
| POMO-026 | Export Data (CSV) | 2 pts | Mittel | Premium |

**Total: 12 Points**

### Sprint 4: Polish & Gate (Week 5-6)

| ID | Feature | Aufwand | Impact | Typ |
|----|---------|---------|--------|-----|
| POMO-027 | Premium Gate (Paywall UI) | 3 pts | Kritisch | Core |
| POMO-028 | Stripe/Paddle Integration | 5 pts | Kritisch | Core |
| POMO-029 | License Key System | 3 pts | Kritisch | Core |
| POMO-030 | Settings Page Redesign | 3 pts | Hoch | Core |

**Total: 14 Points**

### Sprint 5: Focus Mode (Week 7-8)

| ID | Feature | Aufwand | Impact | Typ |
|----|---------|---------|--------|-----|
| POMO-031 | Focus Reminders | 3 pts | Mittel | Premium |
| POMO-032 | Browser Notifications | 2 pts | Hoch | Free |
| POMO-033 | Notification Sounds | 2 pts | Mittel | Premium |

**Total: 7 Points**

### Future (Post-Launch)

| ID | Feature | Aufwand | Notes |
|----|---------|---------|-------|
| POMO-040 | Cloud Sync | 8 pts | Supabase/Firebase |
| POMO-041 | iOS App | 13 pts | React Native / Capacitor |
| POMO-042 | macOS Menu Bar App | 8 pts | Electron / Tauri |
| POMO-043 | Daily Intention Setting | 3 pts | "What's your focus today?" |
| POMO-044 | Focus Ambient Sounds | 5 pts | Rain, Cafe, Nature |
| POMO-045 | Pomodoro Templates | 3 pts | "Deep Work", "Study", "Create" |

---

## Feature Details

### POMO-019: Custom Timer Lengths

```
Beschreibung:
Nutzer können Work/Short Break/Long Break anpassen.

Akzeptanzkriterien:
- Slider oder Eingabefeld für jede Phase
- Presets: Classic (25/5/15), Deep Work (50/10/30), Sprint (15/3/10)
- Gespeichert in localStorage
- Premium-Feature (in Free: nur Classic)

UI-Konzept:
┌─────────────────────────────────────┐
│ Timer Settings                      │
├─────────────────────────────────────┤
│ Work Session    [====●====] 25 min  │
│ Short Break     [●========]  5 min  │
│ Long Break      [==●======] 15 min  │
│                                     │
│ [Classic] [Deep Work] [Sprint]      │
└─────────────────────────────────────┘
```

### POMO-023: Weekly Focus Report

```
Beschreibung:
Wöchentliche Zusammenfassung der Focus-Zeit.

Akzeptanzkriterien:
- Zeigt: Total Stunden, Sessions, bester Tag
- Vergleich zur Vorwoche
- Minimal, nicht überwältigend
- Jeden Sonntag automatisch anzeigen (optional)

UI-Konzept:
┌─────────────────────────────────────┐
│ Your Week in Focus                  │
├─────────────────────────────────────┤
│                                     │
│       12.5 hours                    │
│       of deep work                  │
│                                     │
│  Mo Tu We Th Fr Sa Su              │
│  ▄▄ ██ ▄▄ ██ ▄▄ ░░ ░░              │
│                                     │
│  Best day: Wednesday (3.5h)        │
│  +2h from last week                 │
│                                     │
└─────────────────────────────────────┘
```

### POMO-024: Focus Heatmap

```
Beschreibung:
Wann bist du am produktivsten?

UI-Konzept:
┌─────────────────────────────────────┐
│ Your Focus Pattern                  │
├─────────────────────────────────────┤
│         6  9  12  15  18  21       │
│   Mon   ░░ ██ ██ ▄▄ ░░ ░░          │
│   Tue   ░░ ██ ██ ██ ░░ ░░          │
│   Wed   ░░ ▄▄ ██ ██ ▄▄ ░░          │
│   Thu   ░░ ██ ██ ▄▄ ░░ ░░          │
│   Fri   ░░ ▄▄ ██ ░░ ░░ ░░          │
│                                     │
│   Peak focus: 9-12am weekdays      │
└─────────────────────────────────────┘
```

---

## Technische Überlegungen

### Datenspeicherung

**Phase 1 (MVP):**
- localStorage für alles
- Keine Server-Kosten
- Einfache Implementierung
- Nachteil: Kein Sync

**Phase 2 (Sync):**
- Supabase Free Tier (50k MAU)
- Auth: Magic Link oder Google
- Realtime Sync möglich

### Payment Integration

**Empfehlung: Lemon Squeezy**
- Einfacher als Stripe für Digital Products
- Handles VAT/Taxes automatisch
- License Keys out-of-the-box
- 5% + $0.50 pro Transaktion

**Alternative: Paddle**
- Ähnlich, größer
- 5% + $0.50

### Premium Gate Logik

```typescript
// Premium check
const isPremium = () => {
  const license = localStorage.getItem('pomo_license');
  if (!license) return false;
  return validateLicense(license);
};

// Feature gating
const canAccessAnalytics = isPremium();
const canCustomizeTimer = isPremium();
const canChangeTheme = isPremium();
```

---

## Go-to-Market

### Launch Strategie

1. **Soft Launch (Week 6)**
   - ProductHunt "Coming Soon"
   - Twitter/X Teaser
   - Early Access für 50 Beta-Tester

2. **ProductHunt Launch (Week 8)**
   - Launch am Dienstag (beste Ergebnisse)
   - "Pomo: The timer that doesn't guilt you"
   - Launch Discount: $2.99 statt $4.99

3. **Content Marketing**
   - "Why I quit Forest for Pomo"
   - "The anti-gamification productivity app"
   - Dev.to / Medium Artikel

### Erfolgsmetriken

| Metrik | Ziel (3 Monate) |
|--------|-----------------|
| Weekly Active Users | 5,000 |
| Premium Conversion | 3-5% |
| Revenue | $500-1000/Monat |
| App Store Rating | 4.5+ |

---

## Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|------------|
| Zu wenige zahlen | Mittel | Niedrige Einstiegshürde ($2.99 Launch) |
| Komplexität creep | Hoch | Strikte Feature-Reviews, "Subtract first" |
| Technische Schulden | Mittel | Refactor vor Feature-Sprints |
| Burnout | Niedrig | Klare Sprint-Grenzen |

---

## Nächste Schritte

1. **Sofort:** Sprint 2 Stories in `/specs/` erstellen
2. **Diese Woche:** POMO-019 (Custom Timer) implementieren
3. **Woche 2:** Session History + Sounds
4. **Woche 3:** Analytics Grundgerüst

---

## Appendix: Recherche-Quellen

- Zapier: "Best Pomodoro Apps 2024"
- Reclaim.ai: "Pomodoro App Comparison"
- Reddit r/productivity: User Feedback Threads
- App Store Reviews: Forest, Session, Flow
- ProductHunt: Top Timer Apps

---

*Dieses Dokument wird regelmäßig aktualisiert.*
