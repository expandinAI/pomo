'use client';

import { Volume2, VolumeX, Check, Bell, MousePointerClick, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSoundSettings, SOUND_PRESETS, type SoundOption, type TransitionIntensity } from '@/hooks/useSoundSettings';
import { useSound } from '@/hooks/useSound';
import { SPRING } from '@/styles/design-tokens';

export function SoundSettings() {
  const { selectedSound, setSound, volume, setVolume, muted, toggleMute, completionSoundEnabled, setCompletionSoundEnabled, uiSoundsEnabled, setUiSoundsEnabled, transitionSoundsEnabled, setTransitionSoundsEnabled, transitionIntensity, setTransitionIntensity } = useSoundSettings();
  const { preview } = useSound();

  const handleSelect = (soundId: SoundOption) => {
    setSound(soundId);
    preview(soundId);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const volumePercent = Math.round(volume * 100);

  return (
    <div className="space-y-4">
      {/* Volume Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
            Volume
          </label>
          <span className="text-xs text-secondary light:text-secondary-dark tabular-nums">
            {volumePercent}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-md transition-colors ${
              muted
                ? 'bg-accent/10 light:bg-accent-dark/10 text-accent light:text-accent-dark'
                : 'text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark'
            }`}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            disabled={muted}
            className={`flex-1 h-1.5 rounded-full appearance-none cursor-pointer
              ${muted ? 'opacity-50' : ''}
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
            aria-label="Volume"
          />
        </div>
      </div>

      {/* Session Complete Sound Toggle */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
          Session Sound
        </label>
        <motion.button
          onClick={() => setCompletionSoundEnabled(!completionSoundEnabled)}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
            completionSoundEnabled
              ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
              : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
          }`}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', ...SPRING.default }}
        >
          <div className="flex items-center gap-3">
            <Bell
              className={`w-4 h-4 ${
                completionSoundEnabled
                  ? 'text-accent light:text-accent-dark'
                  : 'text-tertiary light:text-tertiary-dark'
              }`}
            />
            <div className="text-left">
              <p
                className={`text-sm font-medium ${
                  completionSoundEnabled
                    ? 'text-accent light:text-accent-dark'
                    : 'text-secondary light:text-secondary-dark'
                }`}
              >
                Session Complete
              </p>
              <p className="text-xs text-tertiary light:text-tertiary-dark">
                Sound when session ends
              </p>
            </div>
          </div>
          {/* Toggle Switch */}
          <div
            className={`relative w-10 h-6 rounded-full transition-colors ${
              completionSoundEnabled
                ? 'bg-accent light:bg-accent-dark'
                : 'bg-tertiary/30 light:bg-tertiary-dark/30'
            }`}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
              animate={{ left: completionSoundEnabled ? 20 : 4 }}
              transition={{ type: 'spring', ...SPRING.default }}
            />
          </div>
        </motion.button>
      </div>

      {/* UI Sounds Toggle */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
          UI Sounds
        </label>
        <motion.button
          onClick={() => setUiSoundsEnabled(!uiSoundsEnabled)}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
            uiSoundsEnabled
              ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
              : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
          }`}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', ...SPRING.default }}
        >
          <div className="flex items-center gap-3">
            <MousePointerClick
              className={`w-4 h-4 ${
                uiSoundsEnabled
                  ? 'text-accent light:text-accent-dark'
                  : 'text-tertiary light:text-tertiary-dark'
              }`}
            />
            <div className="text-left">
              <p
                className={`text-sm font-medium ${
                  uiSoundsEnabled
                    ? 'text-accent light:text-accent-dark'
                    : 'text-secondary light:text-secondary-dark'
                }`}
              >
                Interaction Sounds
              </p>
              <p className="text-xs text-tertiary light:text-tertiary-dark">
                Subtle click on timer start/pause
              </p>
            </div>
          </div>
          {/* Toggle Switch */}
          <div
            className={`relative w-10 h-6 rounded-full transition-colors ${
              uiSoundsEnabled
                ? 'bg-accent light:bg-accent-dark'
                : 'bg-tertiary/30 light:bg-tertiary-dark/30'
            }`}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
              animate={{ left: uiSoundsEnabled ? 20 : 4 }}
              transition={{ type: 'spring', ...SPRING.default }}
            />
          </div>
        </motion.button>
      </div>

      {/* Transition Sounds Toggle */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
          Transition Sounds
        </label>
        <motion.button
          onClick={() => setTransitionSoundsEnabled(!transitionSoundsEnabled)}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
            transitionSoundsEnabled
              ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
              : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
          }`}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', ...SPRING.default }}
        >
          <div className="flex items-center gap-3">
            <Sparkles
              className={`w-4 h-4 ${
                transitionSoundsEnabled
                  ? 'text-accent light:text-accent-dark'
                  : 'text-tertiary light:text-tertiary-dark'
              }`}
            />
            <div className="text-left">
              <p
                className={`text-sm font-medium ${
                  transitionSoundsEnabled
                    ? 'text-accent light:text-accent-dark'
                    : 'text-secondary light:text-secondary-dark'
                }`}
              >
                Phase Transitions
              </p>
              <p className="text-xs text-tertiary light:text-tertiary-dark">
                Gentle chimes between focus and break
              </p>
            </div>
          </div>
          {/* Toggle Switch */}
          <div
            className={`relative w-10 h-6 rounded-full transition-colors ${
              transitionSoundsEnabled
                ? 'bg-accent light:bg-accent-dark'
                : 'bg-tertiary/30 light:bg-tertiary-dark/30'
            }`}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
              animate={{ left: transitionSoundsEnabled ? 20 : 4 }}
              transition={{ type: 'spring', ...SPRING.default }}
            />
          </div>
        </motion.button>

        {/* Intensity Selector - only show when enabled */}
        {transitionSoundsEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', ...SPRING.default }}
            className="pt-2"
          >
            <div className="flex items-center gap-1 p-1 bg-tertiary/5 light:bg-tertiary-dark/5 rounded-lg">
              {(['subtle', 'normal', 'rich'] as TransitionIntensity[]).map((intensity) => {
                const isSelected = transitionIntensity === intensity;
                const labels: Record<TransitionIntensity, string> = {
                  subtle: 'Subtle',
                  normal: 'Normal',
                  rich: 'Rich',
                };
                return (
                  <button
                    key={intensity}
                    onClick={() => setTransitionIntensity(intensity)}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-accent light:bg-accent-dark text-background light:text-background-light shadow-sm'
                        : 'text-secondary light:text-secondary-dark hover:text-primary light:hover:text-primary-dark'
                    }`}
                  >
                    {labels[intensity]}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Sound Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
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
                    ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
                    : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
                }`}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', ...SPRING.default }}
              >
                <Volume2
                  className={`w-4 h-4 flex-shrink-0 ${
                    isSelected
                      ? 'text-accent light:text-accent-dark'
                      : 'text-tertiary light:text-tertiary-dark'
                  }`}
                />
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
      </div>
    </div>
  );
}
