import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Pomo - Your sanctuary for deep work',
  description:
    'A beautifully designed Pomodoro timer that creates calm, not anxiety. Focus with intention.',
  keywords: ['pomodoro', 'timer', 'focus', 'productivity', 'deep work'],
  authors: [{ name: 'Pomo' }],
  creator: 'Pomo',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pomo',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pomo.so',
    title: 'Pomo - Your sanctuary for deep work',
    description: 'A beautifully designed Pomodoro timer that creates calm, not anxiety.',
    siteName: 'Pomo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pomo - Your sanctuary for deep work',
    description: 'A beautifully designed Pomodoro timer that creates calm, not anxiety.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF9' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0A09' },
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
        className={`${inter.variable} font-sans antialiased bg-background text-primary min-h-screen`}
      >
        {/* Script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
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
        {children}
      </body>
    </html>
  );
}
