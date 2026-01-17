'use client';

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useColorTheme } from '@/hooks/useColorTheme';
import { COLOR_THEMES, type ColorTheme } from '@/styles/themes';
import { SPRING } from '@/styles/design-tokens';

export function ThemeSettings() {
  const { currentTheme, setTheme } = useColorTheme();

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-tertiary dark:text-tertiary-dark uppercase tracking-wider">
        Color Theme
      </label>
      <div className="grid grid-cols-2 gap-2">
        {COLOR_THEMES.map((theme) => {
          const isSelected = currentTheme === theme.id;
          return (
            <motion.button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`relative flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'ring-2 ring-offset-2 ring-offset-surface dark:ring-offset-surface-dark'
                  : 'hover:bg-tertiary/5 dark:hover:bg-tertiary-dark/5'
              }`}
              style={{
                backgroundColor: isSelected ? `${theme.colors.accent}15` : undefined,
                // Use CSS custom property for Tailwind ring color
                '--tw-ring-color': isSelected ? theme.colors.accent : undefined,
              } as React.CSSProperties}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', ...SPRING.default }}
            >
              {/* Color swatch */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                style={{ backgroundColor: theme.colors.accent }}
              >
                {isSelected ? (
                  <Check className="w-4 h-4" />
                ) : (
                  theme.emoji
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isSelected
                      ? 'text-primary dark:text-primary-dark'
                      : 'text-secondary dark:text-secondary-dark'
                  }`}
                >
                  {theme.name}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
