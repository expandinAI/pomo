'use client';

import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';

interface IntentionDisplayProps {
  /** The intention text to display (null = hidden) */
  intention: string | null;
  /** Callback when clicked - typically opens IntentionOverlay */
  onClick?: () => void;
}

const MAX_DISPLAY_LENGTH = 40;

/**
 * IntentionDisplay
 *
 * Displays the daily intention text below the timer as a subtle,
 * always-visible reminder. Clicking opens the IntentionOverlay.
 *
 * Features:
 * - Returns null when no intention
 * - Truncates text > 40 chars with ellipsis
 * - title attribute shows full text on hover
 * - Fade in/out animation
 * - Subtle text color, highlights on hover
 */
export function IntentionDisplay({ intention, onClick }: IntentionDisplayProps) {
  if (!intention) {
    return null;
  }

  const shouldTruncate = intention.length > MAX_DISPLAY_LENGTH;
  const displayText = shouldTruncate
    ? `${intention.slice(0, MAX_DISPLAY_LENGTH)}...`
    : intention;

  return (
    <motion.button
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ type: 'spring', ...SPRING.gentle }}
      onClick={onClick}
      title={shouldTruncate ? intention : undefined}
      className="text-sm text-secondary light:text-secondary-dark text-center max-w-xs mx-auto truncate hover:text-primary light:hover:text-primary-dark transition-colors cursor-pointer bg-transparent border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded px-2 py-1"
      aria-label={`Today's intention: ${intention}. Click to edit.`}
    >
      {displayText}
    </motion.button>
  );
}
