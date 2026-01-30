'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTimerSettingsContext, type AppearanceMode } from '@/contexts/TimerSettingsContext';
import { cn } from '@/lib/utils';

interface ModeOption {
  id: AppearanceMode;
  icon: React.ReactNode;
  label: string;
}

const MODE_OPTIONS: ModeOption[] = [
  { id: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
  { id: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
  { id: 'system', icon: <Monitor className="w-4 h-4" />, label: 'System' },
];

export function NightModeSettings() {
  const { appearanceMode, setAppearanceMode } = useTimerSettingsContext();

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
        Appearance
      </label>
      <div className="grid grid-cols-3 gap-2">
        {MODE_OPTIONS.map((option) => {
          const isActive = appearanceMode === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setAppearanceMode(option.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
                  : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
              )}
            >
              <span
                className={cn(
                  isActive
                    ? 'text-accent light:text-accent-dark'
                    : 'text-tertiary light:text-tertiary-dark'
                )}
              >
                {option.icon}
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive
                    ? 'text-accent light:text-accent-dark'
                    : 'text-secondary light:text-secondary-dark'
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
