'use client';

import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';
import Link from 'next/link';
import { SPRING } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';

interface SyncButtonProps {
  className?: string;
}

/**
 * SyncButton - Subtle button for anonymous users to sign in
 *
 * Displays a cloud icon with "Sync" text, linking to the sign-in page.
 * Used in the header area next to ActionBar.
 */
export function SyncButton({ className }: SyncButtonProps) {
  return (
    <Link href="/sign-in">
      <motion.div
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-full',
          'text-tertiary light:text-tertiary-dark',
          'hover:text-secondary light:hover:text-secondary-dark',
          'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
          'transition-colors duration-fast cursor-pointer',
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <Cloud className="w-4 h-4" />
        <span className="text-sm font-medium">Sync</span>
      </motion.div>
    </Link>
  );
}
