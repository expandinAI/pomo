---
type: story
status: backlog
priority: p1
effort: 5
feature: "[[features/learn-section]]"
created: 2026-01-27
updated: 2026-01-28
done_date: null
tags: [ui, learn, panel]
---

# POMO-161: Learn Panel UI

## User Story

> Als **Particle-Nutzer**
> möchte ich **einen ruhigen Bereich haben, wo ich mehr über fokussiertes Arbeiten erfahren kann**,
> damit **ich verstehe, wie ich Particle optimal für mich nutzen kann**.

## Kontext

Link zum Feature: [[features/learn-section]]

Die Learn Section ist der zentrale Ort für Wissen über Fokusarbeit und die drei Rhythmen. Das Panel muss sich nahtlos in die Particle-Ästhetik einfügen – minimalistisch, keyboard-first, nicht aufdringlich.

## Akzeptanzkriterien

- [ ] **Given** ich bin auf der Timer-Seite, **When** ich `L` drücke, **Then** öffnet sich das Learn Panel von rechts
- [ ] **Given** das Learn Panel ist offen, **When** ich `Esc` oder `L` drücke, **Then** schließt sich das Panel
- [ ] **Given** das Learn Panel ist offen, **When** ich außerhalb des Panels klicke, **Then** schließt sich das Panel
- [ ] **Given** ich bin auf Mobile (<640px), **When** das Learn Panel öffnet, **Then** ist es fullscreen
- [ ] **Given** das Panel ist offen, **When** ich mit der Tastatur navigiere, **Then** kann ich durch die Menüpunkte navigieren
- [ ] **Given** ich klicke auf den Learn-Button unten rechts, **Then** öffnet sich das Panel

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── learn/
│       ├── LearnPanel.tsx        # Hauptcontainer (Slide-In Panel)
│       └── LearnMenu.tsx         # Menü mit Themen
├── hooks/
│   └── useLearnPanel.ts          # State-Management Hook
├── components/ui/
│   └── CornerControls.tsx        # Learn-Button hier integrieren
└── app/
    └── page.tsx                  # State + Event-Listener
```

### Integration in BottomRightControls

Der Learn-Button wird Teil der bestehenden `BottomRightControls` Komponente:

```
Bottom-right Layout: [L] [D] [⚙]
                      │   │   └── Settings
                      │   └────── Night Mode (Day/Night Toggle)
                      └────────── Learn ("Verstehen")
```

**Warum hier?**
- Learn ist eine Meta-Funktion (wie Settings), keine tägliche Navigation
- Semantisch: "Verstehen" gehört zu "Einstellungen" (System-Controls)
- Apple-Konvention: Hilfe/Info unten rechts

### State-Management

```typescript
// In page.tsx
const [showLearn, setShowLearn] = useState(false);

// Event-Listener für Command Palette Integration
useEffect(() => {
  function handleOpenLearn() {
    setShowLearn(true);
  }
  window.addEventListener('particle:open-learn', handleOpenLearn);
  return () => window.removeEventListener('particle:open-learn', handleOpenLearn);
}, []);
```

### Keyboard-Handler

```typescript
// Global L-Taste (in page.tsx oder dediziertem Hook)
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      setShowLearn(prev => !prev);
    }
  }
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Animation (Framer Motion)

```typescript
// Slide-In von rechts
const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300
    }
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2 }
  }
};
```

### Z-Index Hierarchie

| Layer | Z-Index | Komponente |
|-------|---------|------------|
| Timer | 0 | Basis |
| Learn Panel | 50 | Über Timer |
| Command Palette | 60 | Über allem außer Toasts |
| Toasts | 70 | Ganz oben |

## UI/UX

### Panel-Layout

```
┌─────────────────────────────────────────┐
│  Verstehen                          ✕   │  ← Header mit Close-Button
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  📚  Die drei Rhythmen            │  │  ← Menü-Item (klickbar)
│  │      Jeder Mensch arbeitet anders │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🧠  Warum Pausen wichtig sind    │  │
│  │      Dein Gehirn braucht Raum     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🔬  Die Wissenschaft             │  │
│  │      Fokus ist keine Magie        │  │
│  └───────────────────────────────────┘  │
│                                         │
│                                         │
│  ─────────────────────────────────────  │
│  Keyboard: L                            │  ← Footer-Hint
└─────────────────────────────────────────┘
```

### Learn-Button in CornerControls

```typescript
// In BottomRightControls erweitern
export function BottomRightControls({
  onOpenLearn,        // NEU
  onToggleNightMode,
  onOpenSettings,
  nightModeEnabled,
}: BottomRightControlsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Learn Button - NEU */}
      <CornerButton
        onClick={onOpenLearn}
        label="Open learn section"
        tooltip="Verstehen · L"
      >
        <BookOpen className="w-4 h-4" />
      </CornerButton>

      {/* Night Mode Toggle */}
      <motion.button ... />

      {/* Settings */}
      <CornerButton ... />
    </div>
  );
}
```

**Icon:** `BookOpen` von Lucide (nicht `HelpCircle` – "Verstehen" ≠ "Hilfe")

### Backdrop

```typescript
// Klick außerhalb schließt Panel
<AnimatePresence>
  {showLearn && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => setShowLearn(false)}
      />
      {/* Panel */}
      <LearnPanel onClose={() => setShowLearn(false)} />
    </>
  )}
</AnimatePresence>
```

## Styling

```typescript
// LearnPanel.tsx
<motion.div
  variants={panelVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
  className={cn(
    "fixed right-0 top-0 bottom-0 z-50",
    "w-[400px] max-w-full",
    "bg-surface light:bg-surface-dark",
    "border-l border-tertiary/10 light:border-tertiary-dark/10",
    "shadow-xl",
    "flex flex-col",
    // Mobile: Fullscreen
    "sm:w-[400px]",
    "max-sm:w-full max-sm:border-l-0"
  )}
>
```

### Focus Management

```typescript
// Focus Trap + Initial Focus
const panelRef = useRef<HTMLDivElement>(null);
useFocusTrap(panelRef, isOpen, { initialFocusRef: panelRef });

// Panel Container
<motion.div
  ref={panelRef}
  tabIndex={-1}
  role="dialog"
  aria-modal="true"
  aria-labelledby="learn-title"
  className="... focus:outline-none"
>
```

## Testing

### Manuell zu testen
- [ ] `L` öffnet/schließt Panel
- [ ] `Esc` schließt Panel
- [ ] Click auf Backdrop schließt Panel
- [ ] Click auf Learn-Button öffnet Panel
- [ ] Mobile (<640px): Panel ist fullscreen
- [ ] Animation ist smooth (Spring-basiert)
- [ ] Focus Trap funktioniert (Tab bleibt im Panel)
- [ ] Keyboard-Events werden isoliert (Space/Esc triggern nicht Timer)

### Automatisierte Tests
- [ ] Unit Test: Keyboard-Handler (`L` toggle, `Esc` close)
- [ ] Unit Test: Focus Management
- [ ] E2E Test: Panel öffnen/schließen via Button und Keyboard

## Definition of Done

- [ ] LearnPanel.tsx implementiert
- [ ] LearnMenu.tsx mit 3 Themen-Items
- [ ] CornerControls.tsx erweitert (Learn-Button)
- [ ] page.tsx: State + Event-Listener
- [ ] Keyboard-Isolation (Events sickern nicht zum Timer)
- [ ] Focus Trap funktioniert
- [ ] Mobile-Responsive (fullscreen <640px)
- [ ] Tests geschrieben & grün
- [ ] Manuell getestet
- [ ] Keyboard-Accessibility geprüft

## Notizen

- **Titel:** "Verstehen" (nicht "Learn" oder "Hilfe") – passt zum Particle-Voice
- **Icon:** `BookOpen` – vermittelt Wissen, nicht Hilflosigkeit
- **Animation:** Spring-basiert für organisches Gefühl
- **Scope dieser Story:** Nur Panel-UI und Trigger, KEIN Content (siehe POMO-162)

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
