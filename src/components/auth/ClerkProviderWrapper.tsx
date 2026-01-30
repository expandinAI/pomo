'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ReactNode } from 'react';

// Particle-specific Clerk appearance - matches our dark, minimal aesthetic
const clerkAppearance = {
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
  },
};

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper that conditionally renders ClerkProvider only when the publishable key is available.
 * This allows the app to work without Clerk configuration (local dev without auth).
 */
export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // If no Clerk key is configured, render children without auth
  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider appearance={clerkAppearance} publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}
