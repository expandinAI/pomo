'use client';

import { RotateCcw } from 'lucide-react';
import { useTimerSettingsContext, type TimerDurations } from '@/contexts/TimerSettingsContext';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
}

function SliderRow({ label, value, min, max, onChange, unit = 'min' }: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-secondary light:text-secondary-dark">
          {label}
        </label>
        <span className="text-sm font-mono text-accent light:text-accent-dark tabular-nums">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-tertiary/20 light:bg-tertiary-dark/20 rounded-full appearance-none cursor-pointer accent-accent light:accent-accent-dark [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent light:[&::-webkit-slider-thumb]:bg-accent-dark [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent light:[&::-moz-range-thumb]:bg-accent-dark [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  );
}

export function CustomPresetEditor() {
  const {
    activePresetId,
    customDurations,
    customSessionsUntilLong,
    updateCustomDuration,
    updateCustomSessionsUntilLong,
    resetCustomPreset,
  } = useTimerSettingsContext();

  // Only show when custom preset is active
  if (activePresetId !== 'custom') {
    return null;
  }

  return (
    <div className="space-y-4 p-4 rounded-xl bg-tertiary/5 light:bg-tertiary-dark/5 border border-tertiary/10 light:border-tertiary-dark/10">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
          Custom Preset
        </h3>
        <button
          onClick={resetCustomPreset}
          className="flex items-center gap-1 px-2 py-1 text-xs text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors rounded-md hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10"
          aria-label="Reset custom preset to defaults"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <div className="space-y-4">
        <SliderRow
          label="Focus Session"
          value={Math.round(customDurations.work / 60)}
          min={1}
          max={120}
          onChange={(mins) => updateCustomDuration('work', mins)}
        />
        <SliderRow
          label="Short Break"
          value={Math.round(customDurations.shortBreak / 60)}
          min={1}
          max={30}
          onChange={(mins) => updateCustomDuration('shortBreak', mins)}
        />
        <SliderRow
          label="Long Break"
          value={Math.round(customDurations.longBreak / 60)}
          min={1}
          max={60}
          onChange={(mins) => updateCustomDuration('longBreak', mins)}
        />
        <SliderRow
          label="Sessions until Long Break"
          value={customSessionsUntilLong}
          min={1}
          max={8}
          onChange={updateCustomSessionsUntilLong}
          unit=""
        />
      </div>
    </div>
  );
}
