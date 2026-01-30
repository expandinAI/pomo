import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { NoiseOverlay, Vignette, AmbientEffects } from '@/components/effects';
import { AmbientEffectsProvider } from '@/contexts/AmbientEffectsContext';
import { TimerSettingsProvider } from '@/contexts/TimerSettingsContext';
import { AmbientSoundProvider } from '@/contexts/AmbientSoundContext';
import { CommandPaletteProvider } from '@/contexts/CommandPaletteContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { CommandPaletteWrapper } from '@/components/command';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Particle - Your sanctuary for deep work',
  description:
    'A beautifully designed focus timer that creates calm, not anxiety. Focus with intention.',
  keywords: ['particle', 'focus', 'timer', 'productivity', 'deep work'],
  authors: [{ name: 'Particle' }],
  creator: 'Particle',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Particle',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pomo.so',
    title: 'Particle - Your sanctuary for deep work',
    description: 'A beautifully designed focus timer that creates calm, not anxiety.',
    siteName: 'Particle',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Particle - Your sanctuary for deep work',
    description: 'A beautifully designed focus timer that creates calm, not anxiety.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-primary min-h-screen`}
      >
        {/* Skip to main content link for keyboard/screen reader users */}
        <a
          href="#main-timer"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-surface light:focus:bg-surface-light focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-primary light:focus:text-primary-light focus:ring-2 focus:ring-accent focus:outline-none"
        >
          Skip to timer
        </a>
        {/* Script to prevent flash of wrong theme - Dark is default */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

                // Light mode adds .light class, dark mode is the default (no class needed)
                if (theme === 'light' || (!theme && prefersLight)) {
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        {/* Register service worker for offline support */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
        <SessionProvider>
          <TimerSettingsProvider>
            <AmbientSoundProvider>
              <AmbientEffectsProvider>
                <CommandPaletteProvider>
                  {/* Visual effects for immersive dark experience */}
                  <NoiseOverlay />
                  <Vignette />
                  <AmbientEffects />
                  {/* Command Palette (Cmd+K) */}
                  <CommandPaletteWrapper />
                  {children}
                </CommandPaletteProvider>
              </AmbientEffectsProvider>
            </AmbientSoundProvider>
          </TimerSettingsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
