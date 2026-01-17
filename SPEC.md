# SPEC.md - Pomo Focus Timer

> Technical specification for an Apple Design Award-worthy Pomodoro timer

---

## Product Overview

| Field | Value |
|-------|-------|
| **Name** | Pomo |
| **Domain** | pomo.so |
| **Tagline** | "Your sanctuary for deep work" |
| **Category** | Productivity / Focus Timer |
| **Target Users** | Students, Freelancers, Remote Workers, Knowledge Workers |

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS 3.4
- **Animation:** Framer Motion 10
- **Icons:** Lucide React
- **State:** React useState/useReducer (no external state library)

### Backend
- **API:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (magic link, optional)
- **Realtime:** Supabase Realtime (future: sync across devices)

### Infrastructure
- **Hosting:** Vercel (Edge Functions)
- **Analytics:** Plausible (privacy-focused)
- **Payments:** Stripe (when Pro tier launches)
- **Error Tracking:** Sentry (minimal, privacy-conscious)

### Development
- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm
- **Linting:** ESLint + Prettier
- **Testing:** Vitest + Testing Library (unit), Playwright (e2e)

---

## MVP Features (v1.0)

### Core Timer
1. **Accurate countdown timer** - Web Worker powered for background tab accuracy
2. **Start/Pause/Reset controls** - Single primary action, secondary reset
3. **Session types** - Work (25min), Short Break (5min), Long Break (15min)
4. **Auto-transition** - Option to auto-start next session
5. **Session counter** - Track completed pomodoros

### Notifications
6. **Browser notifications** - Permission-based, respectful
7. **Tab title updates** - Show remaining time in browser tab
8. **Audio notification** - Optional completion sound

### Experience
9. **Dark/Light mode** - System detection + manual toggle
10. **"The Breath" animation** - 3-second breathing before session start
11. **Completion celebration** - Subtle particle animation on finish
12. **Keyboard shortcuts** - Space (start/pause), R (reset), S (skip to next)

### Technical
13. **PWA support** - Installable, offline-capable
14. **Wake Lock API** - Prevent screen sleep during active session
15. **Responsive design** - Mobile-first, works on all screen sizes

---

## Design System

### Color Palette

```css
/* Light Mode */
--color-background: #FAFAF9;       /* Warm white */
--color-surface: #FFFFFF;           /* Pure surface */
--color-text-primary: #1C1917;      /* Warm black */
--color-text-secondary: #78716C;    /* Stone 500 */
--color-text-tertiary: #A8A29E;     /* Stone 400 */
--color-accent: #0D9488;            /* Teal 600 */
--color-accent-soft: #CCFBF1;       /* Teal 100 */

/* Dark Mode */
--color-background: #0C0A09;        /* Stone 950 */
--color-surface: #1C1917;           /* Stone 900 */
--color-text-primary: #FAFAF9;      /* Stone 50 */
--color-text-secondary: #A8A29E;    /* Stone 400 */
--color-text-tertiary: #78716C;     /* Stone 500 */
--color-accent: #2DD4BF;            /* Teal 400 */
--color-accent-soft: #134E4A;       /* Teal 900 */
```

### Typography

```css
/* Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Type Scale */
--text-xs: 0.75rem;     /* 12px - captions */
--text-sm: 0.875rem;    /* 14px - secondary text */
--text-base: 1rem;      /* 16px - body */
--text-lg: 1.125rem;    /* 18px - large body */
--text-xl: 1.25rem;     /* 20px - headings */
--text-2xl: 1.5rem;     /* 24px - section titles */
--text-timer: 6rem;     /* 96px - timer display */
--text-timer-lg: 8rem;  /* 128px - timer on large screens */

/* Timer-specific */
font-variant-numeric: tabular-nums;
letter-spacing: -0.02em;
```

### Spacing

```css
/* 8px base unit */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 9999px;
```

### Shadows

```css
/* Warm-tinted shadows */
--shadow-sm: 0 1px 2px 0 rgb(28 25 23 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(28 25 23 / 0.07), 0 2px 4px -2px rgb(28 25 23 / 0.05);
--shadow-lg: 0 10px 15px -3px rgb(28 25 23 / 0.08), 0 4px 6px -4px rgb(28 25 23 / 0.05);
```

### Motion

```css
/* Timing */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

/* Easing */
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

/* Spring (Framer Motion) */
spring: { stiffness: 400, damping: 30 }
springGentle: { stiffness: 300, damping: 40 }
springBouncy: { stiffness: 500, damping: 25 }
```

---

## Data Model

### User (Optional - Pro feature)
```typescript
interface User {
  id: string;
  email: string;
  created_at: Date;
  settings: UserSettings;
}

interface UserSettings {
  workDuration: number;      // minutes, default 25
  shortBreakDuration: number; // minutes, default 5
  longBreakDuration: number;  // minutes, default 15
  longBreakInterval: number;  // sessions before long break, default 4
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  soundVolume: number;        // 0-1
  theme: 'light' | 'dark' | 'system';
  breathingEnabled: boolean;
}
```

### Session (Pro feature)
```typescript
interface Session {
  id: string;
  user_id: string;
  type: 'work' | 'short_break' | 'long_break';
  duration: number;           // planned duration in seconds
  actual_duration: number;    // actual duration if paused early
  completed: boolean;
  started_at: Date;
  completed_at: Date | null;
}
```

### Local State (MVP)
```typescript
interface TimerState {
  mode: 'work' | 'short_break' | 'long_break';
  timeRemaining: number;      // seconds
  isRunning: boolean;
  isPaused: boolean;
  completedPomodoros: number;
}
```

---

## API Endpoints

### MVP (No Auth Required)
```
No API needed for MVP - all state is local
```

### Pro (Future)
```
POST   /api/auth/magic-link     - Send magic link email
GET    /api/auth/callback       - Handle magic link callback
DELETE /api/auth/logout         - Log out

GET    /api/sessions            - Get user sessions (paginated)
POST   /api/sessions            - Create new session
PATCH  /api/sessions/:id        - Update session (complete/cancel)

GET    /api/settings            - Get user settings
PUT    /api/settings            - Update settings

GET    /api/stats               - Get aggregated statistics
GET    /api/stats/weekly        - Get weekly summary
```

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| TTFB | <100ms | Vercel Analytics |
| LCP | <1.5s | Lighthouse |
| FID | <100ms | Lighthouse |
| CLS | <0.1 | Lighthouse |
| Total Bundle | <100KB | Build output |
| JS Bundle | <75KB | Build output |
| Lighthouse Performance | 95+ | Lighthouse |
| Lighthouse Accessibility | 100 | Lighthouse |
| Lighthouse Best Practices | 100 | Lighthouse |
| Lighthouse SEO | 100 | Lighthouse |

---

## Component Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, providers
│   ├── page.tsx            # Main timer page
│   ├── manifest.ts         # PWA manifest
│   └── globals.css         # Global styles, CSS variables
│
├── components/
│   ├── timer/
│   │   ├── Timer.tsx           # Main timer container
│   │   ├── TimerDisplay.tsx    # Time display (MM:SS)
│   │   ├── TimerControls.tsx   # Start/Pause/Reset buttons
│   │   ├── SessionType.tsx     # Work/Break selector
│   │   ├── SessionCounter.tsx  # Completed pomodoros display
│   │   ├── BreathingAnimation.tsx  # "The Breath" component
│   │   └── CompletionCelebration.tsx # Particle animation
│   │
│   └── ui/
│       ├── Button.tsx      # Primary button component
│       ├── IconButton.tsx  # Icon-only button
│       ├── ThemeToggle.tsx # Dark/Light mode switch
│       └── Kbd.tsx         # Keyboard shortcut display
│
├── lib/
│   ├── timer-worker.ts     # Web Worker for timer
│   ├── sounds.ts           # Sound management
│   ├── notifications.ts    # Browser notifications
│   ├── wake-lock.ts        # Wake Lock API wrapper
│   ├── storage.ts          # Local storage helpers
│   └── constants.ts        # Timer defaults, config
│
└── styles/
    └── design-tokens.ts    # Design system tokens
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start / Pause timer |
| `R` | Reset current session |
| `S` | Skip to next session |
| `M` | Toggle mute |
| `D` | Toggle dark mode |
| `?` | Show keyboard shortcuts |

---

## Accessibility Requirements

- **WCAG AA minimum**, AAA where possible
- All interactive elements keyboard accessible
- Focus indicators visible and high contrast
- Screen reader announcements for timer state changes
- Reduced motion support (prefers-reduced-motion)
- Color not used as only indicator
- Touch targets minimum 44x44px

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 14+ |
| Edge | 90+ |
| Mobile Safari | 14+ |
| Chrome Android | 90+ |

**Progressive Enhancement:**
- Wake Lock API (graceful fallback)
- Web Workers (fallback to main thread)
- Notifications (permission-based)
- PWA features (optional enhancement)

---

## Security Considerations

- No sensitive data in MVP (timer state only)
- CSP headers configured
- HTTPS only
- No external scripts except analytics
- Plausible analytics (privacy-focused, no cookies)

---

## Future Roadmap

### v1.1 - Statistics
- Session history (local storage)
- Daily/weekly charts
- Focus streaks (non-punishing)

### v1.2 - Accounts
- Magic link authentication
- Cloud sync
- Cross-device access

### v1.3 - Pro Features
- Custom durations
- Sound library
- Themes
- Export data

### v2.0 - Native Apps
- iOS (Swift, native)
- Android (Kotlin, native)
- macOS menu bar app
- Cross-device sync

---

## Development Milestones

### Week 1: Foundation
- [ ] Project setup (Next.js, Tailwind, TypeScript)
- [ ] Design tokens implementation
- [ ] Timer component (basic functionality)
- [ ] Web Worker for accurate timing

### Week 2: Core Experience
- [ ] Timer controls (start/pause/reset)
- [ ] Session type switching
- [ ] Dark/Light mode
- [ ] Tab title updates

### Week 3: Polish
- [ ] "The Breath" animation
- [ ] Completion celebration
- [ ] Keyboard shortcuts
- [ ] PWA setup

### Week 4: Launch Prep
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Bug fixes
- [ ] Launch marketing assets

---

*Version: 1.0*
*Last updated: 2026-01-17*
