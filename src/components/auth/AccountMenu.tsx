'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClerk, useUser } from '@clerk/nextjs';
import { Settings, HelpCircle, LogOut, Sparkles, Cloud } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';
import { useParticleAuth } from '@/lib/auth/hooks';
import { TierBadge } from './TierBadge';

interface AccountMenuProps {
  className?: string;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}

function MenuItem({ icon, label, onClick, highlight }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left',
        'transition-colors duration-fast',
        highlight
          ? 'text-white hover:bg-white/10'
          : 'text-secondary light:text-secondary-dark hover:text-primary light:hover:text-primary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
      )}
    >
      <span className={cn('w-4 h-4', highlight && 'text-white')}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

/**
 * AccountMenu - Dropdown menu for authenticated users
 *
 * Shows user avatar/initial as trigger, with dropdown containing:
 * - User email and tier badge
 * - "Try Particle Flow" CTA (for free users)
 * - Settings link
 * - Help & Feedback link
 * - Sign out
 */
export function AccountMenu({ className }: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { signOut } = useClerk();
  const { user } = useUser();
  const auth = useParticleAuth();

  // Get user info
  const email = auth.status === 'authenticated' ? auth.email : null;
  const tier = auth.status === 'authenticated' ? auth.tier : 'free';
  const avatarUrl = user?.imageUrl;
  const initials = user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || '?';

  // Check if initial sync is pending (has local data but not synced yet)
  const [hasPendingSync, setHasPendingSync] = useState(false);

  useEffect(() => {
    // Check if sync is completed
    const completed = localStorage.getItem('particle:initial-sync-completed') === 'true';
    setHasPendingSync(!completed);
  }, [isOpen]); // Re-check when menu opens

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close menu on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSignOut = useCallback(() => {
    setIsOpen(false);
    signOut();
  }, [signOut]);

  const handleOpenSettings = useCallback(() => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('particle:open-settings'));
  }, []);

  const handleOpenHelp = useCallback(() => {
    setIsOpen(false);
    // Open learn panel with keyboard shortcuts view
    window.dispatchEvent(new CustomEvent('particle:open-learn', { detail: { section: 'shortcuts' } }));
  }, []);

  const handleUpgrade = useCallback(() => {
    setIsOpen(false);
    // TODO: Implement upgrade modal (POMO-303)
    // For now, this does nothing - the modal will be added in POMO-303
  }, []);

  const handleSyncData = useCallback(() => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('particle:trigger-sync'));
  }, []);

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      {/* Avatar trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          'text-tertiary light:text-tertiary-dark',
          'hover:text-secondary light:hover:text-secondary-dark',
          'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
          'transition-colors duration-fast',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          'overflow-hidden'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', ...SPRING.default }}
        aria-label="Account menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold">{initials}</span>
        )}
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', ...SPRING.snappy }}
            className={cn(
              'absolute top-full right-0 mt-2 w-64',
              'bg-surface light:bg-surface-dark',
              'rounded-xl border border-tertiary/20 light:border-tertiary-dark/20',
              'shadow-lg shadow-black/20',
              'overflow-hidden z-50'
            )}
            role="menu"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-tertiary/10 light:border-tertiary-dark/10">
              <div className="flex items-center justify-between">
                <p className="text-sm text-primary light:text-primary-dark font-medium truncate max-w-[160px]">
                  {email || 'User'}
                </p>
                <TierBadge tier={tier} />
              </div>
            </div>

            {/* Menu items */}
            <div className="p-2">
              {/* Upgrade CTA for free users */}
              {tier === 'free' && (
                <>
                  <MenuItem
                    icon={<Sparkles className="w-4 h-4" />}
                    label="Try Particle Flow"
                    onClick={handleUpgrade}
                    highlight
                  />
                  <div className="my-2 border-t border-tertiary/10 light:border-tertiary-dark/10" />
                </>
              )}

              {/* Sync Data option - shows if there's pending local data */}
              {hasPendingSync && (
                <MenuItem
                  icon={<Cloud className="w-4 h-4" />}
                  label="Sync Local Data"
                  onClick={handleSyncData}
                />
              )}

              <MenuItem
                icon={<Settings className="w-4 h-4" />}
                label="Settings"
                onClick={handleOpenSettings}
              />

              <MenuItem
                icon={<HelpCircle className="w-4 h-4" />}
                label="Help & Feedback"
                onClick={handleOpenHelp}
              />

              <div className="my-2 border-t border-tertiary/10 light:border-tertiary-dark/10" />

              <MenuItem
                icon={<LogOut className="w-4 h-4" />}
                label="Sign out"
                onClick={handleSignOut}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
