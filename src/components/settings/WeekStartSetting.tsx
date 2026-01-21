'use client';

import { useWeekStart } from '@/hooks/useWeekStart';

/**
 * Week Start Setting Component
 *
 * Allows users to choose whether their week starts on Monday (European)
 * or Sunday (American). Affects calendar views like the Year Grid.
 */
export function WeekStartSetting() {
  const { weekStart, setWeekStart } = useWeekStart();

  const options = [
    { value: 'monday' as const, label: 'Montag' },
    { value: 'sunday' as const, label: 'Sonntag' },
  ];

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-tertiary light:text-tertiary-light uppercase tracking-wider">
        Wochenstart
      </label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const isActive = weekStart === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setWeekStart(option.value)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent light:bg-accent-dark text-background light:text-background-light'
                  : 'bg-tertiary/10 light:bg-tertiary-light/10 text-secondary light:text-secondary-light hover:bg-tertiary/20 light:hover:bg-tertiary-light/20'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-tertiary light:text-tertiary-light">
        Erster Tag der Woche in Kalenderansichten
      </p>
    </div>
  );
}
