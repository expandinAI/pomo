'use client';

import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTimerSettingsContext } from '@/contexts/TimerSettingsContext';
import { SPRING } from '@/styles/design-tokens';

export function EndTimeSettings() {
  const { showEndTime, setShowEndTime } = useTimerSettingsContext();

  return (
    <motion.button
      onClick={() => setShowEndTime(!showEndTime)}
      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
        showEndTime
          ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
          : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
      }`}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', ...SPRING.default }}
    >
      <div className="flex items-center gap-3">
        <Clock
          className={`w-4 h-4 ${
            showEndTime
              ? 'text-accent light:text-accent-dark'
              : 'text-tertiary light:text-tertiary-dark'
          }`}
        />
        <div className="text-left">
          <p
            className={`text-sm font-medium ${
              showEndTime
                ? 'text-accent light:text-accent-dark'
                : 'text-secondary light:text-secondary-dark'
            }`}
          >
            End Time Preview
          </p>
          <p className="text-xs text-tertiary light:text-tertiary-dark">
            Show when the session ends
          </p>
        </div>
      </div>
      {/* Toggle Switch */}
      <div
        className={`relative w-10 h-6 rounded-full transition-colors ${
          showEndTime
            ? 'bg-accent light:bg-accent-dark'
            : 'bg-tertiary/30 light:bg-tertiary-dark/30'
        }`}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ left: showEndTime ? 20 : 4 }}
          transition={{ type: 'spring', ...SPRING.default }}
        />
      </div>
    </motion.button>
  );
}
