'use client';

import { Volume2, VolumeX, Check, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { type AmbientType } from '@/lib/ambientGenerators';
import { SPRING } from '@/styles/design-tokens';

// Icon mapping for ambient types
const AMBIENT_ICONS: Record<AmbientType, string> = {
  silence: '',
  rain: '',
  forest: '',
  cafe: '',
  white: '',
  ocean: '',
};

export function AmbientSettings() {
  const { type, volume, setType, setVolume, preview, presets } = useAmbientSound();

  const handleSelect = (ambientType: AmbientType) => {
    setType(ambientType);
    if (ambientType !== 'silence') {
      preview(ambientType);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const volumePercent = Math.round(volume * 100);
  const isMuted = type === 'silence';

  return (
    <div className="space-y-4">
      {/* Volume Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
            Ambient Volume
          </label>
          <span className="text-xs text-secondary light:text-secondary-dark tabular-nums">
            {volumePercent}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`p-1.5 rounded-md transition-colors ${
              isMuted
                ? 'text-tertiary light:text-tertiary-dark'
                : 'text-accent light:text-accent-dark'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Waves className="w-4 h-4" />
            )}
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            disabled={isMuted}
            className={`flex-1 h-1.5 rounded-full appearance-none cursor-pointer
              ${isMuted ? 'opacity-50' : ''}
              bg-tertiary/20 light:bg-tertiary-dark/20
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3.5
              [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-accent
              [&::-webkit-slider-thumb]:light:bg-accent-dark
              [&::-webkit-slider-thumb]:shadow-sm
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-3.5
              [&::-moz-range-thumb]:h-3.5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-accent
              [&::-moz-range-thumb]:light:bg-accent-dark
              [&::-moz-range-thumb]:border-0
            `}
            aria-label="Ambient sound volume"
          />
        </div>
      </div>

      {/* Sound Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
          Ambient Sound
        </label>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => {
            const isSelected = type === preset.id;
            return (
              <motion.button
                key={preset.id}
                onClick={() => handleSelect(preset.id)}
                className={`relative flex items-center gap-2 p-3 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
                    : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
                }`}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', ...SPRING.default }}
              >
                <span className="text-lg flex-shrink-0" aria-hidden="true">
                  {AMBIENT_ICONS[preset.id] || (
                    <Volume2
                      className={`w-4 h-4 ${
                        isSelected
                          ? 'text-accent light:text-accent-dark'
                          : 'text-tertiary light:text-tertiary-dark'
                      }`}
                    />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isSelected
                        ? 'text-accent light:text-accent-dark'
                        : 'text-secondary light:text-secondary-dark'
                    }`}
                  >
                    {preset.name}
                  </p>
                  <p className="text-xs text-tertiary light:text-tertiary-dark truncate">
                    {preset.description}
                  </p>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-accent light:text-accent-dark flex-shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>
        <p className="text-xs text-tertiary light:text-tertiary-dark mt-2">
          Plays during focus sessions only
        </p>
      </div>
    </div>
  );
}
