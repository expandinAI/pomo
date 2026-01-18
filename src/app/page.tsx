'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Timer } from '@/components/timer/Timer';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useColorTheme } from '@/hooks/useColorTheme';

// Lazy load non-critical modal components
const ShortcutsHelp = dynamic(
  () => import('@/components/ui/ShortcutsHelp').then(mod => ({ default: mod.ShortcutsHelp })),
  { ssr: false }
);
const TimerSettings = dynamic(
  () => import('@/components/settings/TimerSettings').then(mod => ({ default: mod.TimerSettings })),
  { ssr: false }
);
const SessionHistory = dynamic(
  () => import('@/components/insights/SessionHistory').then(mod => ({ default: mod.SessionHistory })),
  { ssr: false }
);
const WeeklyReport = dynamic(
  () => import('@/components/insights/WeeklyReport').then(mod => ({ default: mod.WeeklyReport })),
  { ssr: false }
);
const FocusHeatmap = dynamic(
  () => import('@/components/insights/FocusHeatmap').then(mod => ({ default: mod.FocusHeatmap })),
  { ssr: false }
);

export default function Home() {
  // Initialize color theme on page load
  useColorTheme();

  // Global keyboard shortcut for Cmd+, to open settings
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd+, (Mac) or Ctrl+, (Windows/Linux) to open settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('pomo:open-settings'));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main
      id="main-timer"
      tabIndex={-1}
      className="relative min-h-screen flex flex-col items-center justify-center p-4 safe-area-inset-top safe-area-inset-bottom focus:outline-none"
    >
      {/* Analytics, Settings and Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <FocusHeatmap />
        <WeeklyReport />
        <SessionHistory />
        <TimerSettings />
        <ThemeToggle />
      </div>

      <Timer />

      {/* Shortcuts help in bottom-left corner */}
      <div className="absolute bottom-4 left-4">
        <ShortcutsHelp />
      </div>
    </main>
  );
}
