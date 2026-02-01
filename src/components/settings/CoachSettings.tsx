'use client';

import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoachSettings, INSIGHT_FREQUENCY_CONFIG, DISPLAY_DURATION_OPTIONS, type CoachInsightFrequency, type CoachDisplayDuration } from '@/hooks/useCoachSettings';
import { useFeature } from '@/lib/tiers/hooks';
import { SPRING } from '@/styles/design-tokens';

const FREQUENCY_OPTIONS: { value: CoachInsightFrequency; label: string }[] = [
  { value: 'more', label: 'More' },
  { value: 'normal', label: 'Normal' },
  { value: 'less', label: 'Less' },
  { value: 'off', label: 'Off' },
];

/**
 * Settings component for AI Coach configuration.
 * Only visible to Flow tier users.
 */
export function CoachSettings() {
  const hasAiCoach = useFeature('aiCoach');
  const {
    insightFrequency,
    setInsightFrequency,
    weeklySummaryEnabled,
    setWeeklySummaryEnabled,
    insightDisplayDuration,
    setInsightDisplayDuration,
    currentConfig,
  } = useCoachSettings();

  // Only render for Flow users
  if (!hasAiCoach) {
    return null;
  }

  // Generate description text based on frequency
  const frequencyDescription = insightFrequency === 'off'
    ? 'Proactive insights disabled'
    : `${currentConfig.maxPerDay}/day, ${currentConfig.cooldownMs / (60 * 60 * 1000)}h cooldown`;

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
        AI Coach
      </label>

      {/* Proactive Insights Setting */}
      <div className="p-3 rounded-lg bg-tertiary/5 light:bg-tertiary-dark/5 space-y-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-accent light:text-accent-dark" />
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary light:text-secondary-dark">
              Proactive Insights
            </p>
            <p className="text-xs text-tertiary light:text-tertiary-dark">
              {frequencyDescription}
            </p>
          </div>
        </div>

        {/* Frequency Selector */}
        <div className="flex gap-2">
          {FREQUENCY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setInsightFrequency(value)}
              className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
                insightFrequency === value
                  ? 'bg-accent light:bg-accent-dark text-background light:text-background-light'
                  : 'bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Summary Toggle */}
      <motion.button
        onClick={() => setWeeklySummaryEnabled(!weeklySummaryEnabled)}
        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
          weeklySummaryEnabled
            ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
            : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
        }`}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <div className="text-left">
          <p
            className={`text-sm font-medium ${
              weeklySummaryEnabled
                ? 'text-accent light:text-accent-dark'
                : 'text-secondary light:text-secondary-dark'
            }`}
          >
            Weekly Summary
          </p>
          <p className="text-xs text-tertiary light:text-tertiary-dark">
            Receive weekly focus insights
          </p>
        </div>
        {/* Toggle Switch */}
        <div
          className={`relative w-10 h-6 rounded-full transition-colors ${
            weeklySummaryEnabled
              ? 'bg-accent light:bg-accent-dark'
              : 'bg-tertiary/30 light:bg-tertiary-dark/30'
          }`}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{ left: weeklySummaryEnabled ? 20 : 4 }}
            transition={{ type: 'spring', ...SPRING.default }}
          />
        </div>
      </motion.button>

      {/* Insight Display Duration */}
      <AnimatePresence>
        {insightFrequency !== 'off' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', ...SPRING.gentle }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-lg bg-tertiary/5 light:bg-tertiary-dark/5 space-y-2">
              <span className="text-xs text-tertiary light:text-tertiary-dark">
                Insight Display Duration
              </span>
              <div className="flex gap-2">
                {DISPLAY_DURATION_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setInsightDisplayDuration(value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      insightDisplayDuration === value
                        ? 'bg-accent light:bg-accent-dark text-background light:text-background-light'
                        : 'bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
