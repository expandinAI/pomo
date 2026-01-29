---
type: story
status: backlog
priority: p0
effort: 5
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [ui, auth, onboarding]
---

# Auth UI (Sign In/Up, Account Menu)

## User Story

> Als **Nutzer**
> möchte ich **mich einfach anmelden können**,
> damit **ich Zugang zu Cloud-Sync und Premium-Features bekomme**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

Die Auth-UI ist der erste Kontaktpunkt für Nutzer, die upgraden wollen. Sie muss einfach, schnell und vertrauenswürdig wirken.

## Akzeptanzkriterien

- [ ] **Given** die App, **When** nicht eingeloggt, **Then** zeigt Header "Anmelden" Button
- [ ] **Given** Sign-In Page, **When** geladen, **Then** zeigt Apple, Google, Email Optionen
- [ ] **Given** eingeloggt, **When** Header angeschaut, **Then** zeigt Account-Avatar/Menu
- [ ] **Given** Account Menu, **When** geklickt, **Then** zeigt Tier, Settings, Logout

## Technische Details

### Betroffene Dateien
```
src/
├── app/
│   ├── sign-in/[[...sign-in]]/page.tsx   # NEU
│   ├── sign-up/[[...sign-up]]/page.tsx   # NEU
│   └── account/page.tsx                  # NEU
├── components/
│   └── auth/
│       ├── SignInButton.tsx              # NEU
│       ├── AccountMenu.tsx               # NEU
│       └── TierBadge.tsx                 # NEU
```

### Sign-In Page Design

```
┌─────────────────────────────────────────┐
│                                         │
│               Particle                  │
│                                         │
│       Bei Particle anmelden             │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  ◉  Mit Apple fortfahren        │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  ◎  Mit Google fortfahren       │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ───────────── oder ─────────────────  │
│                                         │
│   E-Mail                                │
│   ┌─────────────────────────────────┐   │
│   │ name@example.com                │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │       Magic Link senden         │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ─────────────────────────────────────│
│                                         │
│   Noch kein Konto?  Registrieren        │
│                                         │
└─────────────────────────────────────────┘
```

### Account Menu Design

```
┌─────────────────────────────────────────┐
│  ┌───┐                                  │
│  │ W │  waldemar@example.com            │
│  └───┘  Particle Plus                   │
├─────────────────────────────────────────┤
│                                         │
│  ★  Particle Flow testen                │
│     14 Tage kostenlos                   │
│                                         │
├─────────────────────────────────────────┤
│  ⚙  Einstellungen                       │
│  ↗  Hilfe & Feedback                    │
│  ←  Abmelden                            │
│                                         │
└─────────────────────────────────────────┘
```

### Implementierungshinweise

```typescript
// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-zinc-900 border-zinc-800',
            headerTitle: 'text-white',
            socialButtonsBlockButton: 'bg-zinc-800 hover:bg-zinc-700',
            formFieldInput: 'bg-zinc-800 border-zinc-700',
            footerActionLink: 'text-white hover:text-zinc-300',
          },
        }}
        routing="path"
        path="/sign-in"
      />
    </div>
  );
}
```

```typescript
// src/components/auth/AccountMenu.tsx

export function AccountMenu() {
  const { user, signOut } = useAuth();
  const tier = useTier();

  if (!user) {
    return <SignInButton />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.emailAddresses[0]?.emailAddress}</p>
          <TierBadge tier={tier} />
        </div>

        <DropdownMenuSeparator />

        {tier !== 'flow' && (
          <>
            <DropdownMenuItem onClick={openTrialModal}>
              <Star className="mr-2 h-4 w-4" />
              Particle Flow testen
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Einstellungen
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Testing

### Manuell zu testen
- [ ] Sign-In mit Google funktioniert
- [ ] Sign-In mit Email Magic Link funktioniert
- [ ] Account Menu zeigt korrekten Tier
- [ ] Logout funktioniert
- [ ] Redirect nach Login zur App

### Automatisierte Tests
- [ ] E2E Test: Sign-Up Flow
- [ ] E2E Test: Sign-In Flow

## Definition of Done

- [ ] Sign-In/Up Pages implementiert
- [ ] Clerk Appearance customized (Particle Style)
- [ ] Account Menu im Header
- [ ] Tier Badge korrekt
- [ ] Mobile-responsive
