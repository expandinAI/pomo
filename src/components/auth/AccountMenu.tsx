'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClerk } from '@clerk/nextjs';
import { Settings, BookOpen, LogOut, Sparkles, Cloud, Moon, Sun, Monitor, X, CreditCard } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';
import { useParticleAuth } from '@/lib/auth/hooks';
import { useTrial } from '@/lib/trial';
import { TierBadge } from './TierBadge';
import type { AppearanceMode } from '@/contexts/TimerSettingsContext';

interface AccountMenuProps {
  className?: string;
  appearanceMode?: AppearanceMode;
  onAppearanceModeChange?: (mode: AppearanceMode) => void;
  /** Controlled mode: when provided, the panel open state is controlled externally */
  isOpen?: boolean;
  /** Controlled mode: callback when the panel should close */
  onClose?: () => void;
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

interface AppearanceOption {
  id: AppearanceMode;
  icon: React.ReactNode;
  label: string;
}

const APPEARANCE_OPTIONS: AppearanceOption[] = [
  { id: 'light', icon: <Sun className="w-3.5 h-3.5" />, label: 'Light' },
  { id: 'dark', icon: <Moon className="w-3.5 h-3.5" />, label: 'Dark' },
  { id: 'system', icon: <Monitor className="w-3.5 h-3.5" />, label: 'System' },
];

/**
 * AccountMenu - Panel for authenticated users
 *
 * Can be used in two modes:
 * 1. Controlled: Pass `isOpen` and `onClose` props (used by ParticleMenu)
 * 2. Uncontrolled: Renders its own trigger button (legacy)
 *
 * Shows:
 * - User email and tier badge
 * - "Try Particle Flow" CTA (for free users)
 * - Appearance mode selector (Light/Dark/System)
 * - Settings link
 * - Library link
 * - Sign out
 */
export function AccountMenu({
  className,
  appearanceMode,
  onAppearanceModeChange,
  isOpen: controlledIsOpen,
  onClose,
}: AccountMenuProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { signOut } = useClerk();
  const auth = useParticleAuth();

  // Determine if we're in controlled mode
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = isControlled
    ? (value: boolean) => { if (!value && onClose) onClose(); }
    : setInternalIsOpen;

  // Get user info
  const email = auth.status === 'authenticated' ? auth.email : null;
  const tier = auth.status === 'authenticated' ? auth.tier : 'free';
  const trial = useTrial();

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
  }, [isOpen, setIsOpen]);

  // Close menu on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setIsOpen(false);
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true);
      return () => window.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [isOpen, setIsOpen]);

  const handleSignOut = useCallback(() => {
    setIsOpen(false);
    signOut();
  }, [signOut, setIsOpen]);

  const handleOpenSettings = useCallback(() => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('particle:open-settings'));
  }, [setIsOpen]);

  const handleOpenLearn = useCallback(() => {
    setIsOpen(false);
    // Open learn panel
    window.dispatchEvent(new CustomEvent('particle:open-learn'));
  }, [setIsOpen]);

  const handleUpgrade = useCallback(() => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('particle:open-upgrade'));
  }, [setIsOpen]);

  const handleSyncData = useCallback(() => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('particle:trigger-sync'));
  }, [setIsOpen]);

  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const handleManageSubscription = useCallback(async () => {
    if (isLoadingPortal) return;
    setIsLoadingPortal(true);

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { portalUrl } = await response.json();
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      setIsLoadingPortal(false);
    }
  }, [isLoadingPortal]);

  // In controlled mode, don't render anything if not open (parent handles trigger)
  if (isControlled && !isOpen) {
    return null;
  }

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      {/* Dropdown menu - positioned absolute to top-right corner in controlled mode */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', ...SPRING.snappy }}
            className={cn(
              isControlled
                ? 'fixed top-16 right-4 w-72'  // Fixed position when controlled
                : 'absolute top-full right-0 mt-2 w-64',  // Dropdown when uncontrolled
              'bg-surface light:bg-surface-dark',
              'rounded-xl border border-tertiary/20 light:border-tertiary-dark/20',
              'shadow-lg shadow-black/20',
              'overflow-hidden z-50'
            )}
            role="dialog"
            aria-label="Account menu"
          >
            {/* Header with close button */}
            <div className="px-4 py-3 border-b border-tertiary/10 light:border-tertiary-dark/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <p className="text-sm text-primary light:text-primary-dark font-medium truncate">
                    {email || 'User'}
                  </p>
                  <TierBadge tier={tier} />
                </div>
                {isControlled && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ml-2',
                      'text-tertiary light:text-tertiary-dark',
                      'hover:text-secondary light:hover:text-secondary-dark',
                      'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
                      'transition-colors',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                    )}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Menu items */}
            <div className="p-2">
              {/* Upgrade CTA for free users */}
              {tier === 'free' && (
                <>
                  <MenuItem
                    icon={<Sparkles className="w-4 h-4" />}
                    label={trial.hasUsed ? 'Upgrade to Flow' : 'Try Particle Flow'}
                    onClick={handleUpgrade}
                    highlight
                  />
                  <div className="my-2 border-t border-tertiary/10 light:border-tertiary-dark/10" />
                </>
              )}

              {/* Manage subscription for Flow users */}
              {tier === 'flow' && (
                <MenuItem
                  icon={<CreditCard className="w-4 h-4" />}
                  label={isLoadingPortal ? 'Opening...' : 'Manage subscription'}
                  onClick={handleManageSubscription}
                />
              )}

              {/* Sync Data option - shows if there's pending local data */}
              {hasPendingSync && (
                <MenuItem
                  icon={<Cloud className="w-4 h-4" />}
                  label="Sync Local Data"
                  onClick={handleSyncData}
                />
              )}

              {/* Appearance Mode Selector */}
              {onAppearanceModeChange && (
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
                      Appearance
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {APPEARANCE_OPTIONS.map((option) => {
                      const isActive = appearanceMode === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => onAppearanceModeChange(option.id)}
                          className={cn(
                            'flex flex-col items-center gap-1 py-2 px-1.5 rounded-lg transition-colors',
                            isActive
                              ? 'bg-accent/15 light:bg-accent-dark/15 ring-1 ring-accent/50 light:ring-accent-dark/50'
                              : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
                          )}
                        >
                          <span
                            className={cn(
                              isActive
                                ? 'text-accent light:text-accent-dark'
                                : 'text-tertiary light:text-tertiary-dark'
                            )}
                          >
                            {option.icon}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] font-medium',
                              isActive
                                ? 'text-accent light:text-accent-dark'
                                : 'text-secondary light:text-secondary-dark'
                            )}
                          >
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <MenuItem
                icon={<Settings className="w-4 h-4" />}
                label="Settings"
                onClick={handleOpenSettings}
              />

              <MenuItem
                icon={<BookOpen className="w-4 h-4" />}
                label="Library"
                onClick={handleOpenLearn}
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
