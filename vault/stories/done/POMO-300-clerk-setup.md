---
type: story
status: done
priority: p0
effort: 3
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-29
done_date: 2026-02-03
tags: [infrastructure, auth, clerk]
---

# POMO-300: Clerk Auth Setup

## User Story

> Als **Entwickler**
> möchte ich **Clerk als Auth-Provider integrieren**,
> damit **Nutzer sich mit Apple, Google oder Email anmelden können**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

**Vorgänger:** POMO-200 Serie (IndexedDB Migration)

Clerk ist unser Auth-Provider. Er bietet Apple Sign-In (wichtig für iOS), Google OAuth und Email Magic Links out of the box.

**Tier-Architektur:**
- **Lokal (kein Account):** Volle App, Daten nur auf diesem Gerät
- **Particle (kostenloser Account):** Cloud Sync, Daten auf allen Geräten
- **Particle Flow (bezahlter Account):** Premium Features

**Reihenfolge:** POMO-300 → POMO-301 → POMO-302 → POMO-303 → ...

## Akzeptanzkriterien

- [ ] **Given** die App, **When** Clerk initialisiert wird, **Then** sind alle Auth-Methoden verfügbar
- [ ] **Given** ein Nutzer, **When** er sich anmeldet, **Then** erhält er einen JWT Token
- [ ] **Given** der JWT Token, **When** er an Supabase gesendet wird, **Then** kann Supabase den User identifizieren
- [ ] **Given** die App ohne Account, **When** sie geladen wird, **Then** funktioniert alles (lokaler Modus)

## Technische Details

### Installation

```bash
pnpm add @clerk/nextjs
```

### Dateistruktur

```
src/
├── app/
│   ├── layout.tsx                        # ÄNDERN: ClerkProvider
│   ├── sign-in/[[...sign-in]]/page.tsx   # NEU
│   └── sign-up/[[...sign-up]]/page.tsx   # NEU
├── lib/
│   └── auth/
│       ├── index.ts                      # NEU: Exports
│       ├── config.ts                     # NEU: Clerk Config
│       └── hooks.ts                      # NEU: useParticleAuth
├── middleware.ts                         # NEU: Auth Middleware
.env.local                                # Clerk Keys
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Clerk Provider (Layout)

```typescript
// src/app/layout.tsx

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#ffffff',
          colorBackground: '#000000',
          colorInputBackground: '#18181b',
          colorInputText: '#ffffff',
        },
        elements: {
          formButtonPrimary: 'bg-white text-black hover:bg-zinc-200',
          card: 'bg-black border border-zinc-800',
          headerTitle: 'text-white',
          headerSubtitle: 'text-zinc-400',
          socialButtonsBlockButton: 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800',
          formFieldInput: 'bg-zinc-900 border-zinc-800',
          footerActionLink: 'text-white hover:text-zinc-300',
          identityPreviewEditButton: 'text-white',
        },
      }}
    >
      <html lang="de">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Middleware (Public Routes)

```typescript
// src/middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Alles ist public - Auth ist optional
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Keine Route erfordert Auth
  // Die App funktioniert komplett ohne Account
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Auth Hook

```typescript
// src/lib/auth/hooks.ts

import { useAuth, useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

export type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous' }  // Kein Account, lokaler Modus
  | { status: 'authenticated'; user: User; tier: 'free' | 'flow' };

export function useParticleAuth(): AuthState {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  return useMemo(() => {
    if (!isLoaded) {
      return { status: 'loading' };
    }

    if (!isSignedIn || !user) {
      return { status: 'anonymous' };
    }

    // Tier aus Clerk Metadata
    const tier = (user.publicMetadata?.tier as 'free' | 'flow') || 'free';

    return {
      status: 'authenticated',
      user,
      tier,
    };
  }, [isLoaded, isSignedIn, user]);
}

/**
 * Hook für Supabase Token
 */
export function useSupabaseToken() {
  const { getToken } = useAuth();

  return async () => {
    return getToken({ template: 'supabase' });
  };
}

/**
 * Prüft ob User eingeloggt ist
 */
export function useIsAuthenticated(): boolean {
  const auth = useParticleAuth();
  return auth.status === 'authenticated';
}
```

### Clerk Dashboard Konfiguration

**1. Projekt erstellen:**
- https://dashboard.clerk.com
- Neues Projekt: "Particle"

**2. Social Connections aktivieren:**
- Apple: Apple Developer Account erforderlich
- Google: Google Cloud Console OAuth

**3. Email:**
- Magic Link aktivieren
- Email Templates auf Deutsch anpassen

**4. JWT Templates (für Supabase):**
- Name: `supabase`
- Claims:
  ```json
  {
    "sub": "{{user.id}}",
    "email": "{{user.primary_email_address}}",
    "user_metadata": {
      "tier": "{{user.public_metadata.tier}}"
    }
  }
  ```
- Signing Algorithm: RS256

**5. Appearance:**
- Dark Theme als Default
- Logo hochladen
- Farben: Schwarz/Weiß (Particle-Ästhetik)

## Testing

### Manuell zu testen

- [ ] App startet ohne Account (lokaler Modus)
- [ ] Sign Up mit Email Magic Link funktioniert
- [ ] Sign In mit Google funktioniert
- [ ] Nach Login: `useParticleAuth()` gibt `authenticated` zurück
- [ ] Clerk Appearance passt zu Particle (Dark, minimal)
- [ ] Sign Out funktioniert

### Automatisierte Tests

```typescript
// src/lib/auth/__tests__/hooks.test.ts

describe('useParticleAuth', () => {
  it('returns anonymous when not signed in', () => {
    // Mock Clerk hooks
    mockUseAuth({ isLoaded: true, isSignedIn: false });

    const { result } = renderHook(() => useParticleAuth());

    expect(result.current).toEqual({ status: 'anonymous' });
  });

  it('returns authenticated with tier', () => {
    mockUseAuth({ isLoaded: true, isSignedIn: true });
    mockUseUser({
      user: {
        id: 'user_123',
        publicMetadata: { tier: 'flow' }
      }
    });

    const { result } = renderHook(() => useParticleAuth());

    expect(result.current.status).toBe('authenticated');
    expect(result.current.tier).toBe('flow');
  });

  it('defaults to free tier', () => {
    mockUseAuth({ isLoaded: true, isSignedIn: true });
    mockUseUser({
      user: {
        id: 'user_123',
        publicMetadata: {}  // Kein Tier gesetzt
      }
    });

    const { result } = renderHook(() => useParticleAuth());

    expect(result.current.tier).toBe('free');
  });
});
```

## Definition of Done

- [ ] Clerk Account erstellt und konfiguriert
- [ ] Environment Variables in `.env.local`
- [ ] ClerkProvider in Layout mit Particle-Styling
- [ ] Middleware erlaubt alle Routes (public)
- [ ] `useParticleAuth()` Hook funktioniert
- [ ] Sign-In/Up Pages angelegt (Basis)
- [ ] JWT Template für Supabase konfiguriert
- [ ] App funktioniert weiterhin ohne Account

## Notizen

**Warum Clerk?**
- Apple Sign-In out of the box (wichtig für iOS)
- Exzellente DX und Dokumentation
- JWT Templates für Supabase-Integration
- Gehostete UI (schnell) oder Custom UI (flexibel)

**Wichtig: App bleibt ohne Account nutzbar!**
- Clerk ist optional
- Lokaler Modus = Default
- Account = Upgrade für Sync

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
