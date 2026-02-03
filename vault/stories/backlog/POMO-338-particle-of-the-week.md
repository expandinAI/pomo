---
type: story
status: backlog
priority: p1
effort: 5
feature: "[[ideas/10x-particle-of-the-week]]"
created: 2026-02-03
updated: 2026-02-03
done_date: null
tags: [10x, emotion, coach, celebration, viral]
---

# POMO-338: Particle of the Week — Der verborgene Held

## Die 10x-Vision

> Jeden Montag enthüllt Particle deinen verborgenen Moment der Brillanz.
> Nicht als Statistik. Als Geschichte.

**Der Shift:**
```
Feature:    "Hier ist deine längste Session" + Badge
10x:        "Etwas Besonderes ist passiert. Lass mich dir davon erzählen."
```

---

## User Story

> Als **Mensch, der fokussiert arbeitet**
> möchte ich **wöchentlich einen besonderen Moment gewürdigt sehen**,
> damit **meine Arbeit Bedeutung bekommt und ich stolz sein kann**.

---

## Der 10x-Moment

### Was der User erlebt

**Montag, 8:47 Uhr. User öffnet Particle.**

Das Partikel in der Timeline sieht anders aus. Gold-Schimmer. Subtil, aber unübersehbar.

User klickt. Der Coach spricht:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        ✧ Dein Held der Woche                    │
│                                                                 │
│   Am Donnerstag um 9:14 ist etwas passiert.                    │
│                                                                 │
│   Du hast dich hingesetzt, den Timer gestartet —               │
│   und dann bist du verschwunden.                               │
│                                                                 │
│   67 Minuten später warst du wieder da.                        │
│   Das Design Review? Erledigt.                                 │
│   Der Rest der Welt? Hat gewartet.                             │
│                                                                 │
│   Das ist Flow. Das bist du.                                   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  ✧                                                      │  │
│   │  67 min · Website Redesign                              │  │
│   │  Do, 30. Jan · 9:14 – 10:21                             │  │
│   │  "Design Review abgeschlossen"                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│                                    [Teilen]  [Zur Hall of Fame] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Das ist kein Badge. Das ist eine Geschichte über dich.**

---

## Akzeptanzkriterien

### 1. Das Partikel transformiert sich

- [ ] **Visuell anders:** Gold-Shimmer/Glow in Timeline und History
- [ ] **Hover-Animation:** Partikel "erwacht" mit sanfter Pulsation
- [ ] **Nicht nur markiert — es IST besonders**

### 2. Der Coach erzählt eine Geschichte

- [ ] **Kein Statistik-Dump:** "67 Minuten, längste Session" ❌
- [ ] **Narrativ:** Zeit, Kontext, was passiert ist, was es bedeutet ✓
- [ ] **Ton:** Warm, anerkennend, nie übertrieben
- [ ] **Personalisiert:** Projekt-Name, Task, Tageszeit fließen ein

### 3. Die Auswahl hat Tiefe

| Kriterium | Warum besonders | Coach-Narrativ |
|-----------|-----------------|----------------|
| Längste Session | Echter Flow | "Du bist verschwunden..." |
| Overflow >20min | Nicht aufgehört, weil fertig | "Der Timer sagte Stopp. Du hast weitergemacht." |
| Früher Morgen (vor 7h) | Disziplin | "Während andere schliefen..." |
| Wochenende | Dedication | "Samstag. Du hättest alles tun können..." |
| Konsistenz | Jeden Tag am Projekt | "5 Tage. Dasselbe Projekt. Das ist Commitment." |

### 4. Hall of Fame (Die Sammlung)

- [ ] **Eigene View:** `G F` → "Focus Hall of Fame"
- [ ] **Alle POTWs:** Chronologisch, mit Mini-Story
- [ ] **Nach 52 Wochen:** "Dein Jahr in 52 Momenten"
- [ ] **Emotional:** Nicht Liste, sondern Galerie

### 5. Shareability (Der virale Moment)

- [ ] **Share-Card:** Schönes Bild mit Partikel + Mini-Story
- [ ] **One-Click:** Twitter, LinkedIn, Download
- [ ] **Branding:** Subtle "Made with Particle"
- [ ] **Der Moment, den User teilen WOLLEN**

---

## Technische Implementierung

### Dateien

```
src/
├── lib/coach/particle-of-week.ts       # Auswahl + Narrativ-Generierung
├── components/coach/ParticleOfWeek.tsx # Die Enthüllung
├── components/coach/HallOfFame.tsx     # Sammlung aller POTWs
├── components/timer/SessionCounter.tsx # Gold-Partikel Rendering
├── components/share/ShareCard.tsx      # Generierte Share-Karte
└── api/coach/particle-of-week/route.ts # API für POTW + Story
```

### Datenmodell

```typescript
interface ParticleOfWeek {
  sessionId: string;
  weekNumber: number;
  year: number;

  // Auswahl
  criterion: 'longest' | 'overflow' | 'early_bird' | 'weekend' | 'consistency';

  // Die Geschichte
  narrative: {
    opening: string;      // "Am Donnerstag um 9:14..."
    body: string;         // "Du hast dich hingesetzt..."
    meaning: string;      // "Das ist Flow. Das bist du."
  };

  // Meta
  selectedAt: Date;
  shared?: boolean;
}
```

### Narrativ-Generierung

```typescript
// lib/coach/particle-of-week.ts

const NARRATIVE_TEMPLATES: Record<Criterion, NarrativeTemplate> = {
  longest: {
    opening: (s) => `Am ${formatDay(s.startTime)} um ${formatTime(s.startTime)} ist etwas passiert.`,
    body: (s) => `Du hast dich hingesetzt, den Timer gestartet — und dann bist du verschwunden. ${formatDuration(s.actualDuration)} später warst du wieder da.`,
    meaning: (s) => s.task
      ? `${s.task}? Erledigt. Der Rest der Welt? Hat gewartet.`
      : `Das ist Flow. Das bist du.`
  },

  overflow: {
    opening: (s) => `${formatDuration(s.estimatedDuration)} hattest du dir vorgenommen.`,
    body: (s) => `Der Timer sagte Stopp. Du hast weitergemacht. ${formatDuration(s.actualDuration - s.estimatedDuration)} extra — weil du noch nicht fertig warst.`,
    meaning: () => `Manche nennen es Überarbeitung. Wir nennen es: im Flow sein.`
  },

  early_bird: {
    opening: (s) => `${formatTime(s.startTime)}. Die meisten schlafen noch.`,
    body: (s) => `Du nicht. Du hast dir ${formatDuration(s.actualDuration)} genommen, bevor der Tag überhaupt begann.`,
    meaning: () => `Das ist nicht Disziplin. Das ist Priorität.`
  },

  // ... weitere Templates
};
```

### Gold-Partikel Rendering

```typescript
// In SessionCounter.tsx

// Prüfen ob Partikel POTW ist
const isPOTW = potwSessionIds.includes(session.id);

// Gold-Variante rendern
<motion.div
  className={cn(
    "particle-dot",
    isPOTW && "particle-dot-gold"
  )}
  animate={isPOTW ? {
    boxShadow: [
      "0 0 4px rgba(255, 215, 0, 0.3)",
      "0 0 8px rgba(255, 215, 0, 0.5)",
      "0 0 4px rgba(255, 215, 0, 0.3)"
    ]
  } : undefined}
  transition={{ duration: 3, repeat: Infinity }}
/>
```

```css
/* Gold-Partikel */
.particle-dot-gold {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
}
```

---

## UI/UX Details

### Timeline mit Gold-Partikel

```
┌─────────────────────────────────────────────────────────────────┐
│  Today                                                          │
│  ○ ○ ○ ✧ ○                                                      │
│        ↑                                                        │
│     Gold-Shimmer                                                │
│     (Particle of the Week)                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Hall of Fame (`G F`)

```
┌─────────────────────────────────────────────────────────────────┐
│                     ✧ Hall of Fame ✧                            │
│                                                                 │
│  Deine größten Momente                                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  KW 5 · 67 min · "Du bist verschwunden..."               │  │
│  │  Website Redesign · Do, 30. Jan                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  KW 4 · 52 min · "Der Timer sagte Stopp..."              │  │
│  │  API Integration · Mi, 22. Jan                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  KW 3 · 45 min · "6:47. Die meisten schlafen noch..."    │  │
│  │  Morning Routine · Mo, 13. Jan                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│                                                    [Alle teilen]│
└─────────────────────────────────────────────────────────────────┘
```

### Share-Card (generiert)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                            ✧                                    │
│                                                                 │
│                    Mein Moment der Woche                        │
│                                                                 │
│                         67 min                                  │
│                    Website Redesign                             │
│                                                                 │
│            "Du bist verschwunden. 67 Minuten                   │
│             später warst du wieder da."                         │
│                                                                 │
│                                                                 │
│                                          made with Particle     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Warum ist das 10x?

| Feature-Version | 10x-Version |
|-----------------|-------------|
| Badge auf Session | Das Partikel **leuchtet** |
| "67 min, längste" | "Du bist verschwunden..." |
| Einmal anzeigen | Hall of Fame über Zeit |
| Nur für dich | Shareable Moment |
| Statistik | Geschichte über DICH |

**Der Kern-Insight:**
> Menschen erinnern sich nicht an Zahlen.
> Sie erinnern sich an Momente, in denen sie sich besonders gefühlt haben.

---

## Phasen

### Phase 1: MVP (2-3 SP)
- [ ] Auswahl-Logik (längste Session)
- [ ] Gold-Partikel in Timeline
- [ ] Coach-Insight mit Narrativ
- [ ] Speicherung in localStorage

### Phase 2: Hall of Fame (2 SP)
- [ ] `G F` Shortcut
- [ ] Sammlung aller POTWs
- [ ] Mini-Story pro Eintrag

### Phase 3: Sharing (2 SP)
- [ ] Share-Card Generierung
- [ ] Social Media Integration
- [ ] "Made with Particle" Branding

---

## Definition of Done

- [ ] Gold-Partikel visuell anders (nicht nur Badge)
- [ ] Coach erzählt Geschichte (nicht Statistik)
- [ ] Narrativ fühlt sich persönlich an
- [ ] Hall of Fame speichert alle POTWs
- [ ] Share-Funktion funktioniert
- [ ] User sagt "Wow" (nicht "Ok cool")

---

## Notizen

- **Timing:** Sonntag 20:00 oder Montag 07:00 generieren
- **Ton:** Warm, nie cheesy, nie übertrieben
- **Gold:** Einzige Farbe die ein Partikel jemals haben darf (außer Weiß)
- **Philosophie:** "Markers, not badges" — wie bei Milestones

---

## Arbeitsverlauf

### Gestartet:
### Erledigt:
