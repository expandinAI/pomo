'use client';

import { Sunrise } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDailyIntentionSettings } from '@/hooks/useDailyIntentionSettings';
import { SPRING } from '@/styles/design-tokens';

export function DailyIntentionSettings() {
  const { dailyIntentionEnabled, toggleDailyIntention } = useDailyIntentionSettings();

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
        Daily Intention
      </label>
      <motion.button
        onClick={toggleDailyIntention}
        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
          dailyIntentionEnabled
            ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
            : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
        }`}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <div className="flex items-center gap-3">
          <Sunrise
            className={`w-4 h-4 ${
              dailyIntentionEnabled
                ? 'text-accent light:text-accent-dark'
                : 'text-tertiary light:text-tertiary-dark'
            }`}
          />
          <div className="text-left">
            <p
              className={`text-sm font-medium ${
                dailyIntentionEnabled
                  ? 'text-accent light:text-accent-dark'
                  : 'text-secondary light:text-secondary-dark'
              }`}
            >
              Start Ritual
            </p>
            <p className="text-xs text-tertiary light:text-tertiary-dark">
              Daily inspiration at app start
            </p>
          </div>
        </div>
        {/* Toggle Switch */}
        <div
          className={`relative w-10 h-6 rounded-full transition-colors ${
            dailyIntentionEnabled
              ? 'bg-accent light:bg-accent-dark'
              : 'bg-tertiary/30 light:bg-tertiary-dark/30'
          }`}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{ left: dailyIntentionEnabled ? 20 : 4 }}
            transition={{ type: 'spring', ...SPRING.default }}
          />
        </div>
      </motion.button>
    </div>
  );
}
