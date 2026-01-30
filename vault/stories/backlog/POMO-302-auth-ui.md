---
type: story
status: backlog
priority: p0
effort: 5
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-29
done_date: null
tags: [ui, auth, onboarding]
---

# POMO-302: Auth UI – Sign In/Up & Account Menu

## User Story

> Als **Nutzer**
> möchte ich **mich einfach anmelden können**,
> damit **ich Zugang zu Cloud-Sync und Premium-Features bekomme**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

**Vorgänger:** POMO-300 (Clerk Setup), POMO-301 (Supabase Schema)

Die Auth-UI ist der erste Kontaktpunkt für Nutzer, die von Lokal auf Plus upgraden wollen. Sie muss einfach, schnell und Particle-typisch minimalistisch sein.

**Wichtig:** Die App funktioniert komplett ohne Account (Lokal-Modus). Auth ist ein Upgrade, keine Voraussetzung.

**Reihenfolge:** POMO-300 → POMO-301 → **POMO-302** → POMO-303 → ...

## Akzeptanzkriterien

- [ ] **Given** die App im Lokal-Modus, **When** Header angeschaut, **Then** zeigt subtilen "Sync" Button
- [ ] **Given** Sign-In Page, **When** geladen, **Then** zeigt Apple, Google, Email Optionen
- [ ] **Given** eingeloggt, **When** Header angeschaut, **Then** zeigt Account-Avatar/Menu
- [ ] **Given** Account Menu, **When** geklickt, **Then** zeigt Email, Tier, Settings, Logout

## Technische Details

### Dateistruktur

```
src/
├── app/
│   ├── sign-in/[[...sign-in]]/page.tsx   # NEU
│   └── sign-up/[[...sign-up]]/page.tsx   # NEU
├── components/
│   └── auth/
│       ├── index.ts                       # NEU: Exports
│       ├── SyncButton.tsx                 # NEU: Header-Button für Lokal-User
│       ├── AccountMenu.tsx                # NEU: Header-Menu für eingeloggte User
│       └── TierBadge.tsx                  # NEU: Plus/Flow Badge
```

### Sign-In Page

```typescript
// src/app/sign-in/[[...sign-in]]/page.tsx

import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Particle */}
        <div className="flex justify-center mb-12">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>

        <SignIn
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: '#ffffff',
              colorBackground: '#000000',
              colorInputBackground: '#18181b',
              colorInputText: '#ffffff',
              borderRadius: '0.75rem',
            },
            elements: {
              rootBox: 'mx-auto w-full',
              card: 'bg-transparent shadow-none',
              headerTitle: 'text-white text-xl font-medium text-center',
              headerSubtitle: 'text-tertiary text-center',
              socialButtonsBlockButton:
                'bg-surface border border-tertiary/20 text-white hover:bg-surface-light transition-colors',
              socialButtonsBlockButtonText: 'text-white font-normal',
              dividerLine: 'bg-tertiary/20',
              dividerText: 'text-tertiary',
              formFieldLabel: 'text-secondary text-sm',
              formFieldInput:
                'bg-surface border-tertiary/20 text-white placeholder:text-tertiary focus:border-white/50 focus:ring-0',
              formButtonPrimary:
                'bg-white text-black font-medium hover:bg-zinc-200 transition-colors',
              footerActionLink: 'text-white hover:text-zinc-300',
              identityPreviewEditButton: 'text-white',
              formFieldSuccessText: 'text-green-400',
              formFieldErrorText: 'text-red-400',
            },
          }}
          routing="path"
          path="/sign-in"
        />
      </div>
    </div>
  );
}
```

### Sign-Up Page

```typescript
// src/app/sign-up/[[...sign-up]]/page.tsx

import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Particle */}
        <div className="flex justify-center mb-12">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>

        <SignUp
          appearance={{
            // Same appearance as SignIn
            baseTheme: dark,
            variables: {
              colorPrimary: '#ffffff',
              colorBackground: '#000000',
              colorInputBackground: '#18181b',
              colorInputText: '#ffffff',
              borderRadius: '0.75rem',
            },
            elements: {
              rootBox: 'mx-auto w-full',
              card: 'bg-transparent shadow-none',
              headerTitle: 'text-white text-xl font-medium text-center',
              headerSubtitle: 'text-tertiary text-center',
              socialButtonsBlockButton:
                'bg-surface border border-tertiary/20 text-white hover:bg-surface-light transition-colors',
              formButtonPrimary:
                'bg-white text-black font-medium hover:bg-zinc-200 transition-colors',
              // ... same as SignIn
            },
          }}
          routing="path"
          path="/sign-up"
        />
      </div>
    </div>
  );
}
```

### Sync Button (für Lokal-User)

```typescript
// src/components/auth/SyncButton.tsx

'use client';

import { Cloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

/**
 * Subtiler Button im Header für Lokal-User.
 * Zeigt den Weg zu Cloud-Sync ohne aufdringlich zu sein.
 */
export function SyncButton() {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.push('/sign-in')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full
                 text-tertiary hover:text-secondary
                 hover:bg-tertiary/10 transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Cloud className="w-4 h-4" />
      <span className="text-sm">Sync</span>
    </motion.button>
  );
}
```

### Account Menu (für eingeloggte User)

```typescript
// src/components/auth/AccountMenu.tsx

'use client';

import { useAuth, useUser, useClerk } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, Sparkles, HelpCircle } from 'lucide-react';
import { TierBadge } from './TierBadge';
import { useParticleAuth } from '@/lib/auth/hooks';

export function AccountMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const auth = useParticleAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  if (auth.status !== 'authenticated' || !user) {
    return null;
  }

  const tier = auth.tier;
  const initial = user.firstName?.[0] || user.emailAddresses[0]?.emailAddress?.[0] || '?';

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-surface border border-tertiary/20
                   flex items-center justify-center text-sm font-medium text-white
                   hover:border-tertiary/40 transition-colors"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt=""
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initial.toUpperCase()
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64
                       bg-surface border border-tertiary/20 rounded-xl
                       shadow-xl overflow-hidden z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-tertiary/10">
              <p className="text-sm text-white truncate">
                {user.emailAddresses[0]?.emailAddress}
              </p>
              <div className="mt-1">
                <TierBadge tier={tier} />
              </div>
            </div>

            {/* Trial/Upgrade CTA */}
            {tier === 'plus' && (
              <div className="px-4 py-3 border-b border-tertiary/10">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Open trial modal
                    window.dispatchEvent(new CustomEvent('particle:open-trial'));
                  }}
                  className="flex items-center gap-2 text-sm text-white hover:text-zinc-300"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Particle Flow testen</span>
                </button>
                <p className="text-xs text-tertiary mt-1">14 Tage kostenlos</p>
              </div>
            )}

            {/* Menu Items */}
            <div className="py-1">
              <MenuButton icon={Settings} onClick={() => setIsOpen(false)}>
                Einstellungen
              </MenuButton>
              <MenuButton icon={HelpCircle} onClick={() => setIsOpen(false)}>
                Hilfe & Feedback
              </MenuButton>
              <MenuButton
                icon={LogOut}
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
              >
                Abmelden
              </MenuButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({
  icon: Icon,
  children,
  onClick,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 flex items-center gap-3
                 text-sm text-secondary hover:text-white
                 hover:bg-tertiary/10 transition-colors"
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}
```

### Tier Badge

```typescript
// src/components/auth/TierBadge.tsx

'use client';

import type { Tier } from '@/lib/tiers/config';

interface TierBadgeProps {
  tier: 'plus' | 'flow';
  showLabel?: boolean;
}

export function TierBadge({ tier, showLabel = true }: TierBadgeProps) {
  const config = {
    plus: {
      label: 'Plus',
      className: 'bg-tertiary/20 text-secondary',
    },
    flow: {
      label: 'Flow',
      className: 'bg-white/10 text-white',
    },
  };

  const { label, className } = config[tier];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {showLabel ? `Particle ${label}` : label}
    </span>
  );
}
```

### Header Integration

```typescript
// In Header-Komponente:

import { useParticleAuth } from '@/lib/auth/hooks';
import { SyncButton, AccountMenu } from '@/components/auth';

export function Header() {
  const auth = useParticleAuth();

  return (
    <header className="...">
      {/* ... other header content ... */}

      <div className="flex items-center gap-4">
        {auth.status === 'authenticated' ? (
          <AccountMenu />
        ) : auth.status === 'anonymous' ? (
          <SyncButton />
        ) : null}
      </div>
    </header>
  );
}
```

### Exports

```typescript
// src/components/auth/index.ts

export { SyncButton } from './SyncButton';
export { AccountMenu } from './AccountMenu';
export { TierBadge } from './TierBadge';
```

## UI Design

### Sign-In Page (Particle-Ästhetik)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │  ← Particle
│                                                             │
│                                                             │
│               Bei Particle anmelden                         │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   Mit Apple fortfahren                              │   │  ← Schwarz, weiße Border
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   Mit Google fortfahren                             │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│                    ──── oder ────                           │
│                                                             │
│   E-Mail                                                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ name@example.com                                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │             Magic Link senden                       │   │  ← Weiß auf Schwarz
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│            Noch kein Konto? Registrieren                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Account Menu

```
                                          ┌───┐
                                          │ W │  ← Avatar
                                          └───┘
                                            │
                                            ▼
                         ┌────────────────────────────────┐
                         │  waldemar@example.com          │
                         │  Particle Plus                 │
                         ├────────────────────────────────┤
                         │  ✦  Particle Flow testen       │
                         │     14 Tage kostenlos          │
                         ├────────────────────────────────┤
                         │  ⚙  Einstellungen              │
                         │  ?  Hilfe & Feedback           │
                         │  →  Abmelden                   │
                         └────────────────────────────────┘
```

## Testing

### Manuell zu testen

- [ ] Sign-In Page: Particle-Styling passt (schwarz, minimalistisch)
- [ ] Sign-In mit Google funktioniert
- [ ] Sign-In mit Email Magic Link funktioniert
- [ ] Sign-In mit Apple funktioniert (wenn konfiguriert)
- [ ] Redirect nach Login zur App
- [ ] Account Menu zeigt korrekten Tier (Plus/Flow)
- [ ] Account Menu: Logout funktioniert
- [ ] Sync Button für Lokal-User sichtbar
- [ ] Mobile-responsive

### Automatisierte Tests

```typescript
describe('Auth UI', () => {
  it('shows SyncButton when anonymous', () => {
    mockUseParticleAuth({ status: 'anonymous' });

    render(<Header />);

    expect(screen.getByText('Sync')).toBeInTheDocument();
  });

  it('shows AccountMenu when authenticated', () => {
    mockUseParticleAuth({ status: 'authenticated', tier: 'plus' });

    render(<Header />);

    expect(screen.queryByText('Sync')).not.toBeInTheDocument();
    // Avatar should be visible
  });

  it('shows trial CTA for Plus users', async () => {
    mockUseParticleAuth({ status: 'authenticated', tier: 'plus' });

    render(<AccountMenu />);

    // Open menu
    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('Particle Flow testen')).toBeInTheDocument();
  });
});
```

## Definition of Done

- [ ] Sign-In/Up Pages mit Particle-Styling
- [ ] Clerk Appearance customized (schwarzer BG, weißer Accent)
- [ ] SyncButton für Lokal-User im Header
- [ ] AccountMenu für eingeloggte User
- [ ] TierBadge zeigt Plus/Flow korrekt
- [ ] Mobile-responsive
- [ ] Keyboard-Navigation (Escape schließt Menu)
- [ ] Tests geschrieben & grün

## Notizen

**Particle im Sign-In:**
- Der kleine weiße Punkt über dem Form verbindet die Auth-Seiten mit der Haupt-App
- Kein Logo, kein Text – nur der Particle

**SyncButton statt "Anmelden":**
- "Anmelden" klingt nach Pflicht
- "Sync" kommuniziert den Nutzen (Daten synchronisieren)
- Subtil, nicht aufdringlich

**Trial CTA im Menu:**
- Nur für Plus-User sichtbar
- Flow-User sehen es nicht (bereits Premium)
- Position: prominent aber nicht aufdringlich

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
