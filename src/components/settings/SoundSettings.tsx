'use client';

import { Volume2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSoundSettings, SOUND_PRESETS, type SoundOption } from '@/hooks/useSoundSettings';
import { useSound } from '@/hooks/useSound';
import { SPRING } from '@/styles/design-tokens';

export function SoundSettings() {
  const { selectedSound, setSound } = useSoundSettings();
  const { preview } = useSound();

  const handleSelect = (soundId: SoundOption) => {
    setSound(soundId);
    preview(soundId);
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-tertiary dark:text-tertiary-dark uppercase tracking-wider">
        Completion Sound
      </label>
      <div className="grid grid-cols-2 gap-2">
        {SOUND_PRESETS.map((preset) => {
          const isSelected = selectedSound === preset.id;
          return (
            <motion.button
              key={preset.id}
              onClick={() => handleSelect(preset.id)}
              className={`relative flex items-center gap-2 p-3 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'bg-accent/10 dark:bg-accent-dark/10 ring-1 ring-accent dark:ring-accent-dark'
                  : 'bg-tertiary/5 dark:bg-tertiary-dark/5 hover:bg-tertiary/10 dark:hover:bg-tertiary-dark/10'
              }`}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', ...SPRING.default }}
            >
              <Volume2
                className={`w-4 h-4 flex-shrink-0 ${
                  isSelected
                    ? 'text-accent dark:text-accent-dark'
                    : 'text-tertiary dark:text-tertiary-dark'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isSelected
                      ? 'text-accent dark:text-accent-dark'
                      : 'text-secondary dark:text-secondary-dark'
                  }`}
                >
                  {preset.name}
                </p>
                <p className="text-xs text-tertiary dark:text-tertiary-dark truncate">
                  {preset.description}
                </p>
              </div>
              {isSelected && (
                <Check className="w-4 h-4 text-accent dark:text-accent-dark flex-shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
