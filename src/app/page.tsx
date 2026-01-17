'use client';

import { Timer } from '@/components/timer/Timer';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ShortcutsHelp } from '@/components/ui/ShortcutsHelp';
import { TimerSettings } from '@/components/settings/TimerSettings';
import { SessionHistory } from '@/components/insights/SessionHistory';
import { useColorTheme } from '@/hooks/useColorTheme';

export default function Home() {
  // Initialize color theme on page load
  useColorTheme();
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 safe-area-inset-top safe-area-inset-bottom">
      {/* Settings and Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
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
