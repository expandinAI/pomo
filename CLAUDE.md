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

### Overlay & Modal Standards

**Einheitliches Design für alle Overlays/Modals.** Konsistenz schafft Vertrauen und reduziert kognitive Last.

**Close-Button Standard:**
```tsx
<button
  onClick={onClose}
  className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
  aria-label="Close"
>
  <X className="w-4 h-4" />
</button>
```

| Eigenschaft | Wert | Begründung |
|-------------|------|------------|
| Form | `rounded-full` | Kreis = Particle-Ästhetik |
| Größe | `w-8 h-8` (32px) | Touch-friendly |
| Icon | `w-4 h-4` (16px) | Proportional zur Button-Größe |
| Farbe | `text-tertiary` → `hover:text-secondary` | Subtil, nicht dominant |
| Hintergrund | `hover:bg-tertiary/10` | Sanftes Hover-Feedback |
| Focus | `focus-visible:ring-2 ring-accent` | Accessibility |

**Warum rund?**
- Das Particle (weißer Punkt) ist ein Kreis – der Close-Button spiegelt das
- Apple-Konsistenz (macOS Traffic Lights)
- Einfachste geometrische Form = maximale Reduktion

**Overlay-Container Standard:**
```tsx
className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10"
```

**Header-Layout:**
```tsx
<div className="flex items-center justify-between px-5 py-4 border-b border-tertiary/10">
  <h2 className="text-base font-semibold text-primary">Title</h2>
  {/* Close Button hier */}
</div>
```

**Focus-Management bei Keyboard-Navigation:**

Wenn Modals per Tastatur geöffnet werden (z.B. `G M`, `G S`), muss der initiale Fokus korrekt gesetzt werden. **Falsch:** Close-Button fokussieren → zeigt sichtbaren Focus-Ring. **Falsch:** Inneren Content-Bereich fokussieren → kann Scroll-Probleme verursachen.

**Richtig:** Den Modal-Container selbst fokussieren:

```tsx
// Focus management
const modalRef = useRef<HTMLDivElement>(null);
// Focus the modal container itself to avoid visible ring on close button
useFocusTrap(modalRef, isOpen, { initialFocusRef: modalRef });

// Modal-Container braucht tabIndex und focus:outline-none
<div
  ref={modalRef}
  tabIndex={-1}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  className="... focus:outline-none"
>
```

| Aspekt | Lösung |
|--------|--------|
| `tabIndex={-1}` | Macht Container fokussierbar, aber nicht in Tab-Reihenfolge |
| `focus:outline-none` | Verhindert sichtbaren Focus-Ring auf Container |
| `initialFocusRef: modalRef` | Fokussiert den Dialog selbst statt Close-Button |
| Tab-Navigation | Funktioniert normal (springt zu erstem interaktiven Element) |

**Warum nicht Close-Button fokussieren?**
- `focus-visible` zeigt Ring wenn letzte Interaktion Keyboard war
- Sieht aus wie ein Bug (weißer Ring um Close-Button)

**Warum nicht Content-Bereich fokussieren?**
- Browser scrollt fokussiertes Element ins Sichtfeld
- Kann Header aus dem Viewport scrollen

**Scrollbare Modals (KRITISCH):**

Modals mit scrollbarem Inhalt benötigen eine **ununterbrochene Flexbox-Kette**. Ohne diese funktioniert `overflow-y-auto` nicht.

**Das Problem:** Flexbox-Items haben standardmäßig `min-height: auto`, d.h. sie können nicht kleiner als ihr Inhalt werden. Dadurch wird `overflow-y-auto` wirkungslos.

**Die Lösung:** Jeder Container zwischen dem höhenbeschränkten Element und dem scrollbaren Bereich braucht:
- `flex flex-col` (Flexbox aktivieren)
- `min-h-0` (erlaubt dem Element, kleiner als sein Inhalt zu werden)

```tsx
{/* ✅ RICHTIG: Scrollbares Modal */}
<motion.div className="max-h-[80vh] flex flex-col">
  <div
    ref={modalRef}
    tabIndex={-1}
    className="flex flex-col overflow-hidden focus:outline-none ..."
  >
    {/* Fixed header */}
    <div className="flex-shrink-0">Header</div>

    {/* Scrollable content wrapper - KRITISCH: min-h-0 */}
    <div className="flex-1 flex flex-col min-h-0">
      {/* Actual scrollable area */}
      <div className="flex-1 overflow-y-auto">
        {/* Long content here */}
      </div>
    </div>

    {/* Fixed footer (optional) */}
    <div className="flex-shrink-0">Footer</div>
  </div>
</motion.div>
```

```tsx
{/* ❌ FALSCH: Scroll funktioniert nicht */}
<motion.div className="max-h-[80vh] flex flex-col">
  <div ref={modalRef} className="overflow-hidden flex flex-col ...">
    <div>Header</div>
    <div>  {/* ← FEHLER: Kein flex-1, kein min-h-0! */}
      <div className="overflow-y-auto">  {/* ← Wirkungslos! */}
        Content
      </div>
    </div>
  </div>
</motion.div>
```

| Klasse | Zweck | Wo anwenden |
|--------|-------|-------------|
| `max-h-[80vh]` | Höhenbeschränkung | Äußerster Container |
| `flex flex-col` | Flexbox aktivieren | Alle Container in der Kette |
| `min-h-0` | Schrumpfen erlauben | Alle Container zwischen max-h und overflow |
| `flex-shrink-0` | Nicht schrumpfen | Header, Footer, fixe Bereiche |
| `flex-1` | Restlichen Platz füllen | Scrollbarer Bereich |
| `overflow-y-auto` | Scrollbar aktivieren | Innerster scrollbarer Container |

**Checkliste für scrollbare Modals:**
- [ ] Äußerer Container hat `max-h-[...]` und `flex flex-col`
- [ ] Alle Zwischen-Container haben `flex flex-col min-h-0`
- [ ] Fixe Bereiche (Header, Footer) haben `flex-shrink-0`
- [ ] Scrollbarer Bereich hat `flex-1 overflow-y-auto`

**Keyboard Event Isolation (KRITISCH):**

Modals müssen Keyboard-Events isolieren, damit sie nicht zum Timer durchsickern (z.B. ESC cancelt Timer, Space startet/stoppt Timer).

**Das Problem:** Sowohl Modals als auch Timer registrieren Handler auf `window`. Normales `stopPropagation()` stoppt nur Bubbling, nicht andere Handler auf demselben Element.

**Die Lösung:** `stopImmediatePropagation()` + Capture Phase:

```tsx
// ✅ RICHTIG: Event wird komplett gestoppt
useEffect(() => {
  if (!isOpen) return;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();  // Stoppt ALLE anderen Handler
      onClose();
    }
  }

  // Capture phase = wird VOR anderen Handlern ausgeführt
  window.addEventListener('keydown', handleKeyDown, true);
  return () => window.removeEventListener('keydown', handleKeyDown, true);
}, [isOpen, onClose]);
```

```tsx
// ❌ FALSCH: Timer empfängt das Event trotzdem
window.addEventListener('keydown', handleKeyDown);  // Kein capture
e.stopPropagation();  // Stoppt nur Bubbling, nicht andere window-Handler
```

| Methode | Effekt |
|---------|--------|
| `stopPropagation()` | Stoppt Bubbling zu Parent-Elementen |
| `stopImmediatePropagation()` | Stoppt Bubbling UND alle anderen Handler auf demselben Element |
| Capture Phase (`true`) | Handler wird in Capture-Phase ausgeführt (vor Bubble-Phase) |

**Checkliste für Modal Keyboard-Handler:**
- [ ] `if (!isOpen) return;` am Anfang des useEffect
- [ ] `e.preventDefault()` für alle behandelten Keys
- [ ] `e.stopImmediatePropagation()` für alle behandelten Keys
- [ ] `window.addEventListener('keydown', handler, true)` (capture phase!)
- [ ] Cleanup mit `true`: `removeEventListener('keydown', handler, true)`

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
