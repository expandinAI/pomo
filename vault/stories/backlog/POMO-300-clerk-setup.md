---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [infrastructure, auth, clerk]
---

# Clerk Integration Setup

## User Story

> Als **Entwickler**
> möchte ich **Clerk als Auth-Provider integrieren**,
> damit **Nutzer sich mit Apple, Google oder Email anmelden können**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

Clerk ist unser Auth-Provider. Er bietet Apple Sign-In (wichtig für iOS), Google OAuth und Email Magic Links out of the box.

## Akzeptanzkriterien

- [ ] **Given** die App, **When** Clerk initialisiert wird, **Then** sind alle Auth-Methoden verfügbar
- [ ] **Given** ein Nutzer, **When** er sich anmeldet, **Then** erhält er einen JWT Token
- [ ] **Given** der JWT Token, **When** er an Supabase gesendet wird, **Then** kann Supabase den User identifizieren

## Technische Details

### Betroffene Dateien
```
src/
├── app/
│   ├── layout.tsx            # ÄNDERN: ClerkProvider
│   ├── sign-in/[[...sign-in]]/page.tsx   # NEU
│   └── sign-up/[[...sign-up]]/page.tsx   # NEU
├── lib/
│   └── auth/
│       ├── clerk.ts          # NEU: Config
│       └── hooks.ts          # NEU: useUser, useAuth
├── middleware.ts             # NEU: Auth Middleware
.env.local                    # Clerk Keys
```

### Implementierungshinweise

1. Clerk Account erstellen: https://clerk.com
2. Apple Sign-In und Google OAuth aktivieren
3. Supabase JWT Template konfigurieren

```bash
npm install @clerk/nextjs
```

```typescript
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // App ist public, Auth ist optional
  // Nur bestimmte API-Routes schützen wenn nötig
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

```typescript
// src/lib/auth/hooks.ts
import { useAuth, useUser } from '@clerk/nextjs';

export function useParticleAuth() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  return {
    isSignedIn,
    user,
    getSupabaseToken: () => getToken({ template: 'supabase' }),
  };
}
```

### Clerk Dashboard Konfiguration

1. **JWT Templates**: Supabase Template erstellen
   - Claims: `sub`, `email`, `iat`, `exp`
   - Signing: RS256

2. **Social Connections**:
   - Apple: Apple Developer Account nötig
   - Google: Google Cloud Console OAuth

3. **Email**: Magic Link aktivieren

## Testing

### Manuell zu testen
- [ ] Sign Up mit Email funktioniert
- [ ] Sign In mit Google funktioniert
- [ ] Sign In mit Apple funktioniert (wenn konfiguriert)
- [ ] Nach Login: User-Objekt verfügbar

### Automatisierte Tests
- [ ] Unit Test: `useParticleAuth()` Hook

## Definition of Done

- [ ] Clerk Account erstellt
- [ ] Environment Variables gesetzt
- [ ] ClerkProvider in Layout
- [ ] Sign-In/Up Pages funktionieren
- [ ] JWT Token für Supabase abrufbar
