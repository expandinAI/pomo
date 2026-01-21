'use client';

import { motion } from 'framer-motion';
import { BRIGHTNESS_PRESETS } from '@/lib/projects';

interface BrightnessSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/**
 * Visual brightness selector with 5 preset dots
 *
 * Shows a row of circular buttons representing brightness levels
 * from Dark (0.3) to White (1.0). The selected dot is filled,
 * others are outlined.
 */
export function BrightnessSelector({
  value,
  onChange,
  disabled = false,
}: BrightnessSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-secondary light:text-secondary-dark">
        Brightness
      </label>

      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-3"
          role="radiogroup"
          aria-label="Select project brightness"
        >
          {BRIGHTNESS_PRESETS.map((preset) => {
            const isSelected = Math.abs(value - preset.value) < 0.01;

            return (
              <button
                key={preset.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={preset.label}
                disabled={disabled}
                onClick={() => onChange(preset.value)}
                className="relative w-6 h-6 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface light:focus-visible:ring-offset-surface-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Background circle */}
                <span
                  className="absolute inset-0 rounded-full border-2 transition-colors"
                  style={{
                    borderColor: `rgba(255, 255, 255, ${preset.value})`,
                    backgroundColor: isSelected
                      ? `rgba(255, 255, 255, ${preset.value})`
                      : 'transparent',
                  }}
                />

                {/* Selection indicator */}
                {isSelected && (
                  <motion.span
                    layoutId="brightness-indicator"
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: `0 0 12px rgba(255, 255, 255, ${preset.value * 0.5})`,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Labels */}
        <div className="flex text-xs text-tertiary light:text-tertiary-dark gap-4">
          <span>Darker</span>
          <span>Lighter</span>
        </div>
      </div>
    </div>
  );
}
