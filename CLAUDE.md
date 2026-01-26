# CLAUDE.md

This file provides guidance to Claude Code when working with the **Particle** codebase.

> **Wichtig:** Lies `VISION.md` und `BRAND.md` für die vollständige Philosophie und Markenidentität.

---

## Die Seele von Particle

**Particle ist keine Pomodoro-App. Particle ist der Raum, in dem Menschen ihr Lebenswerk schaffen.**

### Kernprinzip
> Die Arbeit eines Lebens besteht aus vielen Partikeln.

### Bei jeder Entscheidung frage:

1. **Ist es reduziert genug?** – Jedes Pixel muss seinen Platz verdienen
2. **Dreht es sich um Partikel?** – Nicht "Sessions", nicht "Pomodoros" – **Partikel**
3. **Erzeugt es Stolz statt Schuld?** – Keine Streak-Verluste, keine roten Badges
4. **Ist es Keyboard-first?** – Alle Kernfunktionen per Tastatur
5. **Hat es emotionale Tiefe?** – Animationen wie Magie, nicht wie Gimmicks

### Naming Convention
- Der offizielle Name ist **Particle** (mit 'e')
- Session-Einheit: `Particle` (Singular), `Particles` (Plural)
- Variable: `particle`, nicht `pomo` oder `pomodoro`
- Counter: "Du hast 12 Partikel gesammelt" – nicht "12 Sessions"

### Apple Design Award Anspruch
Wir bauen nicht einfach eine App. Jede Entscheidung wird gemessen an:
- **Reduktion** – Weißer Punkt auf Schwarz
- **Emotion** – Stolz statt Schuld
- **Storytelling** – Ein Partikel, das mit dir spricht
- **Craft** – Animationen wie Magie
- **Philosophie** – Tiefe hinter der Oberfläche

---

## Projekt-Management (vault/)

Dieses Projekt nutzt `vault/` für lokales Projekt-Management (ersetzt Linear):

```
vault/
├── ideas/            # Rohe Ideen
├── features/         # PRDs/Feature-Specs
├── stories/          # User Stories (backlog/, active/, done/)
├── decisions/        # Architecture Decision Records
├── ROADMAP.md        # Übersicht
└── CHANGELOG.md      # Historie
```

**Skill:** Nutze den `product-owner` Skill (`.claude/skills/product-owner/SKILL.md`) für:
- "Neue Idee: [Beschreibung]" → Erstellt `vault/ideas/...`
- "Was steht an?" → Zeigt Backlog
- "Erstell Stories für Feature X" → Generiert User Stories
- "Story X ist fertig" → Verschiebt nach done/, updated CHANGELOG

---

## Project Overview

**Particle** is an Apple Design Award-worthy focus app. The goal is to create a "sanctuary of calm" for focused work—beautiful, minimal, and premium-feeling.

**Key philosophy:** Subtract, don't add. Every feature must earn its place. Every Pixel must serve the Particle.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── timer/        # Timer-specific components
│   └── ui/           # Reusable UI components
├── lib/              # Utilities and helpers
└── styles/           # Global styles and tokens
```

## Design Principles

1. **The 70% Rule** - Timer owns 70% of the viewport. It's the hero.
2. **Progressive Disclosure** - Controls invisible until needed
3. **Premium Feel** - Generous spacing, spring animations, black & white
4. **Calm Over Anxiety** - No streaks, no guilt, no gamification
5. **Partikel als Währung** - Alles dreht sich um Partikel: sammeln, visualisieren, teilen
6. **Emotionale Tiefe** - Animationen, die sich anfühlen wie Magie

## Code Guidelines

### TypeScript
- Strict mode enabled
- Prefer `interface` over `type` for object shapes
- Use explicit return types on functions
- No `any` types

### Components
- One component per file
- Co-locate styles and tests
- Use named exports
- Props interfaces named `ComponentNameProps`

```typescript
// Good
interface TimerDisplayProps {
  timeRemaining: number;
  isRunning: boolean;
}

export function TimerDisplay({ timeRemaining, isRunning }: TimerDisplayProps) {
  // ...
}
```

### Styling
- Use Tailwind utilities
- Design tokens in `tailwind.config.js` and `src/styles/design-tokens.ts`
- No inline styles
- Dark mode via `dark:` prefix

### Animation
- All animations via Framer Motion
- Respect `prefers-reduced-motion`
- Spring physics for organic feel
- Timing: 150ms (fast), 300ms (normal), 500ms (slow)

```typescript
// Good - respects reduced motion
const prefersReducedMotion = useReducedMotion();

<motion.div
  animate={{ scale: 1.02 }}
  transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400 }}
/>
```

### State Management
- React useState/useReducer for component state
- No external state libraries needed
- Timer logic in Web Worker for background accuracy

### Performance
- Target <100KB total bundle
- Lazy load non-critical components
- Optimize images (next/image)
- Use dynamic imports for heavy animations

## Common Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript check
pnpm test         # Run tests
```

## Key Files

- `src/app/page.tsx` - Main timer page
- `src/components/timer/Timer.tsx` - Core timer component
- `src/lib/timer-worker.ts` - Web Worker for timer
- `tailwind.config.js` - Design tokens

## Architektur-Entscheidungen

### ParticleDetailOverlay (DRY-Prinzip)

**Single Source of Truth:** Die Komponente `src/components/timer/ParticleDetailOverlay.tsx` ist die **einzige** Komponente zum Bearbeiten von Particles. Sie wird überall verwendet:

| Ort | Zugriff |
|-----|---------|
| Timeline | Klick auf Particle-Dot |
| History | Klick auf Particle-Zeile |
| Projektansicht | Klick auf Session in Projekt-Detail |
| (Zukünftig) | Überall wo Particles angezeigt werden |

**Wichtig bei Erweiterungen:**
- Neue Features **immer** in `ParticleDetailOverlay.tsx` implementieren
- Keine parallelen Edit-UIs bauen
- Alle Einstiegspunkte profitieren automatisch von Verbesserungen
- Konsistente UX über die gesamte App

**Integration Pattern:**
```typescript
// In der Parent-Komponente:
const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

// Callback für Klick auf Particle
const handleEdit = (session: CompletedSession) => {
  setEditingSessionId(session.id);
};

// Overlay einbinden
<ParticleDetailOverlay
  isOpen={editingSessionId !== null}
  sessionId={editingSessionId}
  onClose={() => setEditingSessionId(null)}
  onSessionUpdated={() => refreshData()}
  onSessionDeleted={() => { refreshData(); setEditingSessionId(null); }}
  projects={projects}
  recentProjectIds={recentProjectIds}
/>
```

**Aktueller Feature-Stand:**
- Zeitspanne (Start → Ende) mit Live-Update
- Dauer-Anpassung (+/- Buttons, direkte Eingabe)
- Prominenter Overflow-Badge
- Task-Eingabe
- Projekt-Zuordnung
- Keyboard-Shortcuts (↑/↓, Shift+↑/↓, Enter, Esc)
- Delete mit Confirmation

## Timer Business Logic

### COMPLETE vs. SKIP Actions

Der Timer unterscheidet zwischen **natürlicher Completion** und **manuellem Skip** (S-Taste):

| Aspekt | COMPLETE | SKIP |
|--------|----------|------|
| Session Counter | +1 bei Work | Keine Änderung |
| Celebration | Ja bei Work | Nein |
| Gespeicherte Zeit | Volle Session-Dauer | Tatsächlich elapsed |
| Mindest-Schwelle | Keine | >60 Sekunden |
| Visual Feedback | "Well done!" Animation | "Skipped to [Mode]" Text |

**Wichtig:** Diese Unterscheidung ist bewusst so designed:
- Skip zählt nicht als vollständige Session (kein Counter-Increment)
- Skip speichert nur die tatsächlich gearbeitete Zeit
- Sessions < 60s werden bei Skip nicht gespeichert (nicht sinnvoll)
- Keine Celebration bei Skip (User hat nicht "fertig" gemacht)

**Code-Location:** `src/components/timer/Timer.tsx`
- `COMPLETE` Action: Zeile ~76-100
- `SKIP` Action: Zeile ~102-126
- `handleSkip` Callback: Zeile ~455-488

## Keyboard Hints Strategie

### Philosophie: "Learn by Doing"

Particle zeigt **nicht** bei jedem Button einen Shortcut-Hint. Das würde die minimalistische UI zerstören und zum Tastaturkurs mutieren. Stattdessen: eine **gestufte Lernkurve**.

### Die Stufen

| Stufe | Methode | Wann |
|-------|---------|------|
| **1. Inline Hints** | `<KeyboardHint>` direkt im Button | Nur primäre Aktionen |
| **2. Tooltips** | `title` Attribut mit Shortcut | Sekundäre Aktionen (on hover) |
| **3. Help Modal** | `?` öffnet vollständige Liste | On demand |
| **4. Smart Hints** | Kontextuelle Tipps | (Später) Nach X Sessions ohne Shortcut |

### Inline Hints: Nur primäre Aktionen

**Die "One Hint per Context" Regel:** Pro Bildschirmkontext maximal **ein** inline Hint.

| Kontext | Shortcut | Komponente |
|---------|----------|------------|
| Timer idle | `Space` | Start Button ✓ |
| Timer running | `Space` | Pause Button ✓ |
| Overflow mode | `↵` | Done Button |

**Code-Beispiel:**
```tsx
<Button>
  Start Focus
  <KeyboardHint shortcut="Space" />
</Button>
```

### Wo KEINE Inline Hints

| Element | Shortcut | Warum nicht |
|---------|----------|-------------|
| Preset Buttons | `1-4` | Kompakt, würde UI überladen |
| ActionBar Icons | `G T`, `G S` | Sequenz-Shortcuts schwer darstellbar |
| TaskInput | `T` | Wenn fokussiert, Hint unnötig |
| Settings Toggles | `Shift+A` | Power-User Features |

**Entscheidungsbaum:**
```
Ist es die primäre Aktion im Kontext?
  └─ Ja → Inline Hint
  └─ Nein → Ist es eine häufige Aktion?
              └─ Ja → Tooltip (title="Shortcut: G T")
              └─ Nein → Nur im Help Modal
```

### Technische Umsetzung

**Komponenten:**
- `src/components/ui/KeyboardHint.tsx` – Inline Hint Badge
- `src/hooks/useKeyboardHintsSettings.ts` – Toggle für Hints (default: on)
- `src/lib/platform.ts` – `formatShortcut()` für Mac/Windows

**Platform-Formatierung:**
```typescript
formatShortcut("Cmd+K")  // Mac: "⌘K", Windows: "Ctrl+K"
formatShortcut("Enter")  // "↵"
formatShortcut("Space")  // "Space"
```

### Settings

User können Hints deaktivieren:
- Hook: `useKeyboardHintsSettings()`
- Storage: `localStorage['particle:keyboard-hints-visible']`
- Default: `true`

---

## Anti-Patterns to Avoid

- **No gamification** - No points, badges, streaks – aber Partikel sammeln ist erlaubt (das ist Bedeutung, kein Spiel)
- **No social features** - Focus is personal
- **No feature creep** - If it doesn't serve the Particle, skip it
- **No guilt mechanics** - Missing a session is fine
- **No aggressive upsells** - Premium feels generous
- **No colors** - Schwarz und Weiß. Farbe muss verdient werden.
- **No noise** - Jedes UI-Element muss seinen Platz verdienen

## Testing

- Unit tests: Vitest + Testing Library
- E2E tests: Playwright
- Test timer accuracy in background tabs
- Test all keyboard shortcuts
- Accessibility testing with axe-core

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast WCAG AA+
- [ ] Screen reader announcements for state changes
- [ ] Reduced motion support
- [ ] Touch targets 44x44px minimum

## Before Committing

1. Run `pnpm lint && pnpm typecheck`
2. Test in both light and dark mode
3. Test keyboard navigation
4. Check performance (Lighthouse 95+)
5. Test on mobile viewport
6. **Die Prüffrage:** "Würde ein einzelner weißer Punkt auf schwarzem Grund stolz sein, Teil davon zu sein?"

---

## Referenzdokumente

- `VISION.md` – Das vollständige Manifest und die Philosophie
- `BRAND.md` – Brand Guidelines, Voice & Tone, visuelle Identität
- Dieter Rams – "Weniger, aber besser"
- Linear – Vorbild für Reduktion und Craft in Software
- Endel – Vorbild für emotionales Sound-/Visualisierungs-Design

---

*Particle – Where focus becomes visible.*
