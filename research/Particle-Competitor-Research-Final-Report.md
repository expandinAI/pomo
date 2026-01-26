# Particle: Competitor Research Final Report

> **Erstellt:** 25.01.2026
> **Analysierte Competitors:** 11
> **Research-Dauer:** Deep Dive Phase
> **Zweck:** Strategische Positionierung und Feature-Priorisierung

---

## Executive Summary

Nach der Analyse von **11 Competitors** im Pomodoro/Focus-Timer Markt haben wir klare Erkenntnisse gewonnen:

### Die Kernbotschaft

> **Particle kann im Web sein, was Session für Apple ist: Minimalistisch, keyboard-first, für Professionals – ohne Feature-Bloat.**

### Die drei wichtigsten Learnings

1. **"Weniger ist mehr" funktioniert** – Die erfolgreichsten Apps (Session, Flow) haben weniger Features, aber perfekt umgesetzt
2. **Der Web-Markt ist unterbesetzt** – Nur Pomofocus dominiert, während Apple übersättigt ist
3. **Keyboard-First ist unser USP** – Kein Competitor hat echte Keyboard-First UX

---

## Teil 1: Markt-Positionierung

### 1.1 Die Wettbewerbslandschaft

```
                        Premium / Professional
                               ↑
                               │
          Centered ────────────┼──────────── Session
          ($10/mo)             │             ($5/mo)
                               │
                               │    ● PARTICLE
                               │    (Sweet Spot)
                               │
          Pomotodo ────────────┼──────────── Flow
                               │             ($1.49/mo)
                               │
          Focus To-Do ─────────┼──────────── Pomofocus
          (Feature Bloat)      │             (Free/Simple)
                               │
                               ↓
                        Consumer / Students

    ←─────────────────────────────────────────────────→
    Feature-Rich                              Minimalist
```

### 1.2 Markt-Segmente

| Segment | Competitors | Particle-Relevanz |
|---------|-------------|-------------------|
| **Web-First Professional** | Pomofocus | **Direkter Wettbewerb** |
| **Apple Premium** | Session, Flow | Später (Native) |
| **Gamification/Students** | Forest | Nicht unser Markt |
| **ADHD/Wellness** | Llama Life, Tide | Nicht unser Markt |
| **All-in-One** | Focus To-Do | **Anti-Pattern** |
| **Social/Accountability** | Focusmate | Komplett anders |
| **AI-Enhanced** | Centered | Inspiration |

### 1.3 Particle's Positionierung

#### Wer wir sind:
- **Web-First** Focus Timer für Knowledge Workers
- **Keyboard-First** – für Entwickler, Designer, Power-User
- **Minimalistisch** – "Weniger ist mehr"
- **Professional** – nicht verspielt, nicht gamified

#### Wer wir NICHT sind:
- ❌ Kein Todoist-Klon (Focus To-Do Fehler)
- ❌ Kein GTD-System (Pomotodo Fehler)
- ❌ Kein Gamification-Tool (Forest)
- ❌ Keine Wellness-App (Tide)
- ❌ Keine Social-Plattform (Focusmate)

#### Unser Zielsegment:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   PARTICLE ZIELGRUPPE                                   │
│   ─────────────────────                                 │
│                                                         │
│   👤 Knowledge Workers                                  │
│      • Entwickler, Designer, Writer                     │
│      • Remote/Hybrid Arbeiter                           │
│      • "Deep Work" Enthusiasten                         │
│                                                         │
│   💻 Web-First Nutzer                                   │
│      • Browser ist ihr Arbeitsplatz                     │
│      • Multi-Platform (Mac + Windows + Linux)           │
│      • Keine Lust auf native Apps                       │
│                                                         │
│   ⌨️ Keyboard-Power-User                                │
│      • Lieben Linear, Raycast, Notion                   │
│      • Hassen die Maus                                  │
│      • Cmd+K ist ihr bester Freund                      │
│                                                         │
│   🎨 Design-Bewusste                                    │
│      • Schätzen Minimalismus                            │
│      • Monochrome > Bunt                                │
│      • Funktion > Spielerei                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.4 Competitive Advantages

| Vorteil | vs. Pomofocus | vs. Session | vs. Focus To-Do |
|---------|---------------|-------------|-----------------|
| **Keyboard-First** | ✓ (keiner hat das) | ✓ | ✓ |
| **Modern Design** | ✓ | ≈ | ✓ |
| **Deep Work Presets** | ✓ | ≈ | ✓ |
| **Overflow Mode** | ✓ | ≈ | ✓ |
| **Web-First** | ≈ | ✓ | ≈ |
| **Task-Integration** | ✓ | ✓ | ≈ |
| **Nicht überladen** | ≈ | ≈ | ✓ |

**Unser einzigartiger Vorteil:** Keyboard-First + Modern Design + Web-First

---

## Teil 2: Feature-Priorisierung

### 2.1 Gesammelte User Stories (aus allen Analysen)

| ID | Feature | Priority | Effort | Source |
|----|---------|----------|--------|--------|
| POMO-132 | Overflow Mode | **P0** | 5 | Session |
| POMO-141 | Total List Time | **P0** | 2 | Llama Life |
| POMO-142 | Confetti Celebration | P1 | 3 | Llama Life |
| POMO-143 | Estimation Trend Analytics | P1 | 3 | Llama Life |
| POMO-144 | Streak Counter | P1 | 3 | Llama Life |
| POMO-145 | Daily Goals | P1 | 3 | Llama Life |
| POMO-146 | Random Task Picker | P2 | 2 | Llama Life |
| POMO-148 | Achievement System | P1 | 5 | Forest |
| POMO-149 | Session-Abbruch-Visual | P2 | 2 | Forest |
| POMO-150 | Session-Feedback | P1 | 2 | Centered |
| POMO-151 | Break Reminders | P2 | 2 | Centered |
| POMO-152 | Ambient Sounds | P2 | 3 | Tide |
| POMO-153 | Break Breathing | P3 | 2 | Tide |
| POMO-154 | Skip-Break-Bestätigung | P2 | 1 | Be Focused |
| POMO-155 | Partial Session Logging | P2 | 2 | Be Focused |
| POMO-156 | Weekly Email Report | P2 | 3 | Pomotodo |

### 2.2 Priorisierungs-Matrix

```
                    High Impact
                        ↑
                        │
    Overflow Mode ──────┼────────── Streak Counter
    Total List Time     │           Daily Goals
    Session-Feedback    │
                        │
    ────────────────────┼────────────────────────→ High Effort
                        │
    Skip-Confirm ───────┼────────── Ambient Sounds
    Partial Logging     │           Weekly Report
                        │           Achievements
                        │
                        ↓
                    Low Impact
```

### 2.3 Empfohlene Reihenfolge (MVP → V1 → V2)

#### Phase 1: MVP (Must-Have)

| Feature | Warum MVP? |
|---------|------------|
| ✅ Overflow Mode | Session's USP, respektiert Flow State |
| ✅ Total List Time | Sofortiger Mehrwert, einfach |
| ✅ Deep Work Presets | Differenzierung vs. Pomofocus |
| ✅ Keyboard-First (Cmd+K) | Unser USP |

#### Phase 2: V1 Launch (Should-Have)

| Feature | Warum V1? |
|---------|-----------|
| Streak Counter | Engagement, einfach umzusetzen |
| Daily Goals | Motivation, natürliche Erweiterung |
| Session-Feedback | Abschluss-Ritual, Datenerfassung |
| Confetti Celebration | Dopamin-Hit, monochrome-style |
| Skip-Break-Bestätigung | UX-Verbesserung, sehr einfach |
| Partial Session Logging | Datenintegrität |

#### Phase 3: V2+ (Nice-to-Have)

| Feature | Warum später? |
|---------|---------------|
| Ambient Sounds | Braucht Audio-Assets |
| Weekly Email Report | Braucht Backend |
| Achievement System | Komplex, braucht Design |
| Estimation Trends | Analytics-Feature |
| Random Task Picker | Fun, aber nicht kritisch |

#### Icebox (Vielleicht nie)

| Feature | Grund |
|---------|-------|
| Break Breathing | Zu weit weg vom Kern |
| Full Gamification | Nicht unsere Zielgruppe |
| Social Features | Komplett anderes Produkt |
| AI-Coach | Zu komplex für jetzt |

### 2.4 Feature-Priorisierung: Die Logik

**Prinzip 1: Core Experience zuerst**
- Timer muss perfekt funktionieren
- Keyboard-Shortcuts müssen smooth sein
- Design muss stimmen

**Prinzip 2: Quick Wins dann**
- Features die wenig Aufwand, aber hohen Impact haben
- Skip-Confirmation (1 SP), Partial Logging (2 SP)

**Prinzip 3: Engagement-Features**
- Streaks, Goals, Achievements halten User
- Aber erst wenn Core solid ist

**Prinzip 4: Komplexe Features zuletzt**
- Email Reports brauchen Backend
- Sounds brauchen Assets
- Analytics braucht Daten

---

## Teil 3: Pricing-Strategie

### 3.1 Competitor Pricing Übersicht

| Competitor | Free | Pro/Monat | Lifetime | Model |
|------------|------|-----------|----------|-------|
| Pomofocus | Voll | $2 | - | Freemium |
| Session | Basic | $5 | - | Abo |
| Flow | Voll | $1.49 | ✓ | Freemium + LT |
| Be Focused | Basic | - | $4.99 | Einmalkauf |
| Focus To-Do | Basic | $2-3 | $12-18 | Freemium + LT |
| Centered | Trial | $10 | - | Premium Abo |
| Tide | Voll | $12 | - | Freemium |
| Pomotodo | Kastriert | $3.90 | - | Freemium |
| Forest | Basic | $4 | - | Freemium |

### 3.2 Pricing-Learnings

#### Was funktioniert:

1. **Großzügiges Free** (Flow, Tide)
   - User erleben echten Wert
   - Conversion durch Mehrwert, nicht durch Frust

2. **Lifetime-Option** (Flow, Be Focused, Focus To-Do)
   - Keine Abo-Müdigkeit
   - Einmal zahlen, forever nutzen

3. **Premium-Pricing** (Centered @ $10/mo)
   - Für ernsthafte Professionals
   - Höherer Preis = wahrgenommener Wert

#### Was NICHT funktioniert:

1. **Kastriertes Free** (Pomotodo)
   - User frustriert
   - Schlechte Reviews

2. **Zu günstiges Pro** (Focus To-Do @ $2)
   - 10M Downloads, nur $9K/Monat
   - Nicht nachhaltig

3. **Feature-Gating bei Basics** (manche Apps)
   - Timer-Anpassung sollte free sein

### 3.3 Empfohlene Pricing-Strategie für Particle

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   PARTICLE PRICING                                      │
│   ────────────────                                      │
│                                                         │
│   FREE (Core Experience)                                │
│   ─────────────────────                                 │
│   ✓ Pomodoro Timer (alle Presets)                      │
│   ✓ Keyboard-Shortcuts (Cmd+K, etc.)                   │
│   ✓ Task-Liste (unbegrenzt)                            │
│   ✓ Overflow Mode                                       │
│   ✓ Basic Statistics (heute, diese Woche)              │
│   ✓ Streaks                                             │
│                                                         │
│   PRO ($5/Monat oder $48/Jahr)                         │
│   ────────────────────────────                          │
│   ✓ Alles aus Free                                      │
│   ✓ Detailed Analytics (Trends, History)               │
│   ✓ Weekly Email Reports                                │
│   ✓ Ambient Sounds                                      │
│   ✓ Achievements                                        │
│   ✓ Data Export                                         │
│   ✓ Priority Support                                    │
│                                                         │
│   LIFETIME ($49 einmalig)                              │
│   ───────────────────────                               │
│   ✓ Alles aus Pro, forever                             │
│   ✓ Keine Abo-Müdigkeit                                │
│   ✓ Early Supporter Badge                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.4 Pricing-Positionierung

```
         Preis/Monat
              ↑
              │
     $10 ─────┼──── Centered (Premium)
              │
              │
      $5 ─────┼──── Session ──── PARTICLE ●
              │
              │
      $2 ─────┼──── Pomofocus ── Focus To-Do
              │
              │
     $1.50 ───┼──── Flow
              │
              └──────────────────────────────→
                    Feature Depth
```

**Particle bei $5/Monat:**
- Günstiger als Centered ($10)
- Gleich wie Session
- Premium vs. Pomofocus ($2)
- Positioniert als "Professional Tool"

### 3.5 Conversion-Strategie

1. **Free ist vollständig nutzbar**
   - Kein Feature-Gating bei Basics
   - User lieben das Produkt erst

2. **Pro für Power-User**
   - Analytics für Selbstoptimierer
   - Sounds für Atmosphäre
   - Email Reports für Busy People

3. **Lifetime für Early Adopters**
   - $49 = 10 Monate Pro
   - Attraktiv für Enthusiasten
   - Gute Early-Revenue-Quelle

---

## Teil 4: Do's and Don'ts

### 4.1 Die 10 wichtigsten DO's

| # | DO | Learning von |
|---|-----|--------------|
| 1 | **Keyboard-First als USP** | Kein Competitor hat das |
| 2 | **Overflow Mode implementieren** | Session zeigt den Wert |
| 3 | **Free vollständig nutzbar machen** | Flow, Tide |
| 4 | **"Basics perfekt" vor Features** | Flow |
| 5 | **Minimalistisches Design** | Session, Flow |
| 6 | **Deep Work Presets anbieten** | 52/17, 90/20 differenzieren |
| 7 | **Lifetime-Option anbieten** | Be Focused, Flow |
| 8 | **Streak-Mechanik nutzen** | Subtile Engagement-Hook |
| 9 | **Session-Feedback einbauen** | Centered |
| 10 | **Eigenes Produkt täglich nutzen** | Pomotodo ("Dogfooding") |

### 4.2 Die 10 wichtigsten DON'Ts

| # | DON'T | Warnung von |
|---|-------|-------------|
| 1 | **Kein Todoist-Klon werden** | Focus To-Do (Feature Bloat) |
| 2 | **Nicht "Stuck in Middle"** | Pomotodo |
| 3 | **Free nicht kastrieren** | Pomotodo |
| 4 | **Nicht zu günstig sein** | Focus To-Do ($9K bei 10M) |
| 5 | **Keine Gamification-App werden** | Forest (andere Zielgruppe) |
| 6 | **Keine Wellness-App werden** | Tide (anderer Markt) |
| 7 | **Kein veraltetes Design** | Be Focused, Pomotodo |
| 8 | **Keine falschen Versprechen** | Pomotodo ("GTD") |
| 9 | **Nicht alles für alle sein** | Focus To-Do |
| 10 | **Nicht Apple-only denken** | Web ist unsere Stärke |

### 4.3 Die "Weniger ist mehr" Checkliste

Vor jedem neuen Feature fragen:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   FEATURE-FILTER: "Weniger ist mehr"                   │
│   ───────────────────────────────────                   │
│                                                         │
│   □ Löst es ein echtes Problem unserer Zielgruppe?     │
│                                                         │
│   □ Kann es keyboard-first bedient werden?             │
│                                                         │
│   □ Passt es zum minimalistischen Design?              │
│                                                         │
│   □ Ist es optional (nicht aufdringlich)?              │
│                                                         │
│   □ Macht es die App komplexer zu verstehen?           │
│     → Wenn ja: NEIN                                    │
│                                                         │
│   □ Würde Focus To-Do dieses Feature haben?            │
│     → Wenn ja: Kritisch hinterfragen                   │
│                                                         │
│   □ Würde Session dieses Feature haben?                │
│     → Wenn ja: Wahrscheinlich gut                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Teil 5: Strategische Empfehlungen

### 5.1 Go-to-Market Strategie

#### Phase 1: Soft Launch (Beta)
- Keyboard-First Community ansprechen
- Reddit: r/productivityapps, r/webdev
- Twitter/X: #buildinpublic
- Product Hunt vorbereiten

#### Phase 2: Product Hunt Launch
- "Keyboard-First Pomodoro Timer für Professionals"
- Tagline: "The focus timer that respects your flow"
- Video: Cmd+K Demo

#### Phase 3: Content Marketing
- "Deep Work Presets: Warum 25/5 nicht für jeden passt"
- "Overflow Mode: Warum der Timer nicht bei 00:00 stoppen sollte"
- SEO auf "pomodoro timer online"

### 5.2 Differenzierung kommunizieren

#### Messaging-Framework

**Für wen:**
> "Particle ist für Knowledge Worker, die ihre beste Arbeit machen wollen – ohne Ablenkung, ohne Bloat, ohne Maus."

**Was wir sind:**
> "Ein minimalistischer Focus-Timer, der sich anfühlt wie Linear – nicht wie eine Spielzeug-App."

**Was uns unterscheidet:**
> "Keyboard-First. Deep Work Presets. Overflow Mode. Designed for professionals."

### 5.3 Roadmap-Empfehlung

```
Q1 2026: MVP
──────────
• Core Timer (Presets, Overflow)
• Keyboard-First (Cmd+K)
• Task-Liste (einfach)
• Basic Design

Q2 2026: V1 Launch
──────────────────
• Streaks + Daily Goals
• Session-Feedback
• Confetti
• Skip-Confirmation
• Partial Logging
• Product Hunt Launch

Q3 2026: V1.5
─────────────
• Ambient Sounds
• Analytics Dashboard
• Weekly Email Reports

Q4 2026: V2
───────────
• Achievements
• Team Features (?)
• Native Apps evaluieren
```

### 5.4 Metriken für Erfolg

| Metrik | Ziel (6 Monate) | Benchmark |
|--------|-----------------|-----------|
| **Daily Active Users** | 5.000 | Pomofocus: 30.000+ |
| **Weekly Retention** | 40% | Good: 30%+ |
| **Free → Pro Conversion** | 3% | SaaS avg: 2-5% |
| **MRR** | $5.000 | Session: $7-8K |
| **NPS** | 50+ | Good: 30+ |

---

## Teil 6: Competitor Quick Reference

### 6.1 Threat Assessment

| Competitor | Threat Level | Grund |
|------------|--------------|-------|
| **Pomofocus** | 🔴 Hoch | Direkter Web-Konkurrent |
| **Session** | 🟡 Mittel | Apple-only, aber Vorbild |
| **Centered** | 🟡 Mittel | Premium-Segment |
| **Flow** | 🟢 Niedrig | Apple-only |
| **Be Focused** | 🟢 Niedrig | Apple-only, veraltet |
| **Focus To-Do** | 🟢 Niedrig | Feature Bloat |
| **Llama Life** | 🟢 Niedrig | ADHD-Nische |
| **Forest** | 🟢 Niedrig | Gamification-Nische |
| **Tide** | 🟢 Niedrig | Wellness-Nische |
| **Focusmate** | ⚪ Minimal | Komplett anderes Produkt |
| **Pomotodo** | ⚪ Minimal | Geringe Relevanz |

### 6.2 Feature-Inspiration pro Competitor

| Competitor | Was wir übernehmen | Was wir NICHT übernehmen |
|------------|-------------------|--------------------------|
| **Session** | Overflow Mode, Design | Apple-Lock-in |
| **Llama Life** | End Time, Streaks, Fun | ADHD-Fokus, bunte UI |
| **Forest** | Subtile Gamification | "Baum stirbt", verspielt |
| **Centered** | Session-Feedback, Premium | AI-Coach, $10 Preis |
| **Tide** | Ambient Sounds (optional) | Wellness-Fokus |
| **Be Focused** | Skip-Confirm, Partial Log | Veraltetes Design |
| **Flow** | "Basics perfekt", Lifetime | Commitment Mode (?) |
| **Focus To-Do** | NICHTS | Alles (Anti-Pattern) |
| **Focusmate** | Accountability-Konzept | Social Features |
| **Pomotodo** | Weekly Reports | GTD-Versprechen |

---

## Fazit

### Die Essenz in einem Satz

> **Particle wird der "Session für Web" – minimalistisch, keyboard-first, für Professionals, die ihre beste Arbeit machen wollen.**

### Die drei Säulen von Particle

```
        ┌─────────────────────────────────────┐
        │                                     │
        │           PARTICLE                  │
        │                                     │
        │   "The focus timer that respects    │
        │         your flow"                  │
        │                                     │
        └─────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │          │  │          │  │          │
   │ KEYBOARD │  │  DEEP    │  │ MINIMAL  │
   │  FIRST   │  │  WORK    │  │ DESIGN   │
   │          │  │          │  │          │
   │ Cmd+K    │  │ 25/5     │  │ Mono-    │
   │ Shortcuts│  │ 52/17    │  │ chrome   │
   │ No Mouse │  │ 90/20    │  │ Clean    │
   │          │  │ Overflow │  │ Focused  │
   │          │  │          │  │          │
   └──────────┘  └──────────┘  └──────────┘
```

### Nächste Schritte

1. ✅ Competitor Research abgeschlossen
2. ⬜ MVP Feature-Set finalisieren
3. ⬜ Design System verfeinern
4. ⬜ MVP entwickeln
5. ⬜ Beta-User finden
6. ⬜ Product Hunt vorbereiten

---

## Anhang: Alle Research-Dokumente

| Dokument | Pfad |
|----------|------|
| Pomofocus Analysis | `/pomo/research/Pomo-Competitor-Analysis-Pomofocus.md` |
| Session Analysis | `/pomo/research/Particle-Competitor-Analysis-Session.md` |
| Llama Life Analysis | `/pomo/research/Particle-Competitor-Analysis-LlamaLife.md` |
| Forest Analysis | `/pomo/research/Particle-Competitor-Analysis-Forest.md` |
| Centered Analysis | `/pomo/research/Particle-Competitor-Analysis-Centered.md` |
| Tide Analysis | `/pomo/research/Particle-Competitor-Analysis-Tide.md` |
| Be Focused Analysis | `/pomo/research/Particle-Competitor-Analysis-BeFocused.md` |
| Focus To-Do Analysis | `/pomo/research/Particle-Competitor-Analysis-FocusToDo.md` |
| Focusmate Analysis | `/pomo/research/Particle-Competitor-Analysis-Focusmate.md` |
| Flow Analysis | `/pomo/research/Particle-Competitor-Analysis-Flow.md` |
| Pomotodo Analysis | `/pomo/research/Particle-Competitor-Analysis-Pomotodo.md` |
| Feature Market Overview | `/pomo/research/Particle-Competitor-Feature-Market-Overview.md` |
| **This Report** | `/pomo/research/Particle-Competitor-Research-Final-Report.md` |

---

*"Weniger ist mehr. Das haben wir gelernt."*

— Particle Competitor Research, Januar 2026
