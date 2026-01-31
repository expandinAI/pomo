'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  CalendarDays,
  FolderKanban,
  Target,
  BarChart3,
  Activity,
  Clock,
  Calendar,
  GraduationCap,
  Trophy,
  Shield,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { SPRING } from '@/styles/design-tokens';

// Pool of messages for anonymous users - rotates on each menu open
const SIGNUP_MESSAGES = [
  'Protect your work',
  'Access anywhere',
  'Never lose progress',
  'Your work, everywhere',
  'Keep it safe',
  'Continue on any device',
];
import { cn } from '@/lib/utils';

type AuthStatus = 'anonymous' | 'authenticated' | 'loading';

type PlanType = 'free' | 'flow';

interface ParticleMenuProps {
  onOpenTimeline: () => void;
  onOpenRhythm: () => void;
  onOpenProjects: () => void;
  onOpenGoals: () => void;
  onOpenStats: () => void;
  onOpenHistory?: () => void;
  onOpenYear?: () => void;
  onOpenMilestones?: () => void;
  onOpenLearn?: () => void;
  onOpenAccount?: () => void;
  /** When true, menu opens automatically (triggered by G key) */
  isGPressed?: boolean;
  /** Auth status to show appropriate account action */
  authStatus?: AuthStatus;
  /** User's subscription plan type */
  planType?: PlanType;
  /** Trial days remaining (only shown if trial is active) */
  trialDaysRemaining?: number | null;
}

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  /** The key to press after G (e.g., 'T' for G T) */
  key: string;
  onClick: () => void;
}

/**
 * ParticleMenu - A single particle that expands into a navigation list
 *
 * Philosophy: One white dot. Click or press G to reveal all views.
 * The menu shows available destinations with their keyboard shortcuts.
 *
 * For anonymous users: Shows "Partikel sichern" to encourage sign-up
 * For authenticated users: Shows "Account" to access settings
 */
export function ParticleMenu({
  onOpenTimeline,
  onOpenRhythm,
  onOpenProjects,
  onOpenGoals,
  onOpenStats,
  onOpenHistory,
  onOpenYear,
  onOpenMilestones,
  onOpenLearn,
  onOpenAccount,
  isGPressed = false,
  authStatus = 'anonymous',
  planType,
  trialDaysRemaining,
}: ParticleMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openedViaKeyboard, setOpenedViaKeyboard] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Glow effect for break start (anonymous users only)
  const [shouldGlow, setShouldGlow] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Random signup message - changes each time menu opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const signupMessage = useMemo(
    () => SIGNUP_MESSAGES[Math.floor(Math.random() * SIGNUP_MESSAGES.length)],
    [isOpen]
  );

  // Listen for break-started event (glow effect for anonymous users)
  useEffect(() => {
    if (authStatus !== 'anonymous') return;

    const handleBreakStart = () => {
      setShouldGlow(true);
      // Auto-stop after animation completes (2 pulses × 4s = 8s)
      setTimeout(() => setShouldGlow(false), 8000);
    };

    window.addEventListener('particle:break-started', handleBreakStart);
    return () => window.removeEventListener('particle:break-started', handleBreakStart);
  }, [authStatus]);

  // Build menu items based on available callbacks
  const menuItems: MenuItem[] = [
    { id: 'timeline', icon: <CalendarDays className="w-4 h-4" />, label: 'Timeline', key: 'T', onClick: onOpenTimeline },
    { id: 'stats', icon: <BarChart3 className="w-4 h-4" />, label: 'Statistics', key: 'S', onClick: onOpenStats },
    ...(onOpenHistory ? [{ id: 'history', icon: <Clock className="w-4 h-4" />, label: 'History', key: 'H', onClick: onOpenHistory }] : []),
    { id: 'projects', icon: <FolderKanban className="w-4 h-4" />, label: 'Projects', key: 'P', onClick: onOpenProjects },
    { id: 'goals', icon: <Target className="w-4 h-4" />, label: 'Goals', key: 'O', onClick: onOpenGoals },
    { id: 'rhythm', icon: <Activity className="w-4 h-4" />, label: 'Rhythm', key: 'R', onClick: onOpenRhythm },
    ...(onOpenYear ? [{ id: 'year', icon: <Calendar className="w-4 h-4" />, label: 'Year View', key: 'Y', onClick: onOpenYear }] : []),
    ...(onOpenMilestones ? [{ id: 'milestones', icon: <Trophy className="w-4 h-4" />, label: 'Milestones', key: 'M', onClick: onOpenMilestones }] : []),
    ...(onOpenLearn ? [{ id: 'library', icon: <GraduationCap className="w-4 h-4" />, label: 'Library', key: 'L', onClick: onOpenLearn }] : []),
  ];

  // Open menu when G is pressed
  useEffect(() => {
    if (isGPressed && !isOpen) {
      setIsOpen(true);
      setOpenedViaKeyboard(true);
    }
  }, [isGPressed, isOpen]);

  // Close menu when G is released (timeout expired)
  useEffect(() => {
    if (!isGPressed && openedViaKeyboard) {
      // Small delay to allow the second key to be processed
      const timer = setTimeout(() => {
        setIsOpen(false);
        setOpenedViaKeyboard(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isGPressed, openedViaKeyboard]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setOpenedViaKeyboard(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setOpenedViaKeyboard(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    setIsOpen(false);
    setOpenedViaKeyboard(false);
    item.onClick();
  };

  const handleButtonClick = () => {
    setShouldGlow(false); // Stop glow when menu opens
    setIsOpen(!isOpen);
    setOpenedViaKeyboard(false);
  };

  const handleAccountClick = () => {
    setIsOpen(false);
    setOpenedViaKeyboard(false);
    onOpenAccount?.();
  };

  const totalItems = menuItems.length;

  return (
    <div ref={menuRef} className="relative">
      {/* The Particle - trigger button */}
      <motion.button
        onClick={handleButtonClick}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          'transition-colors duration-fast',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          isOpen
            ? 'bg-primary light:bg-primary-dark'
            : 'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
        )}
        aria-label={isOpen ? 'Close menu' : 'Open navigation menu (G)'}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <motion.div
          className={cn(
            'w-2 h-2 rounded-full',
            isOpen
              ? 'bg-background light:bg-background-dark'
              : 'bg-secondary light:bg-secondary-dark'
          )}
          animate={
            shouldGlow && !prefersReducedMotion && !isOpen
              ? { scale: [1, 1.4, 1] }
              : { scale: isOpen ? 0.8 : 1 }
          }
          transition={
            shouldGlow && !prefersReducedMotion && !isOpen
              ? {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : { type: 'spring', ...SPRING.snappy }
          }
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            className={cn(
              'absolute top-full right-0 mt-2',
              'min-w-[220px]',
              'bg-surface light:bg-surface-dark',
              'border border-tertiary/20 light:border-tertiary-dark/20',
              'rounded-xl shadow-xl',
              'overflow-hidden',
              'z-50'
            )}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', ...SPRING.snappy }}
          >
            {/* Header when opened via G */}
            {openedViaKeyboard && (
              <motion.div
                className="px-4 py-2 border-b border-tertiary/10 light:border-tertiary-dark/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-xs text-tertiary light:text-tertiary-dark">
                  Go to…
                </span>
              </motion.div>
            )}

            {/* Navigation Items */}
            <div className="py-1">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  role="menuitem"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5',
                    'text-secondary light:text-secondary-dark',
                    'hover:text-primary light:hover:text-primary-dark',
                    'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
                    'transition-colors duration-fast',
                    'focus:outline-none focus-visible:bg-tertiary/10'
                  )}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.02,
                    duration: 0.12,
                  }}
                >
                  <span className="text-tertiary light:text-tertiary-dark">
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left text-sm font-medium">
                    {item.label}
                  </span>
                  {/* Keyboard shortcut - highlight the key when G is pressed */}
                  <span className="flex items-center gap-0.5 font-mono text-xs">
                    <span className="text-tertiary/50 light:text-tertiary-dark/50">G</span>
                    <span className={cn(
                      'px-1.5 py-0.5 rounded',
                      openedViaKeyboard
                        ? 'bg-primary/10 text-primary light:bg-primary-dark/10 light:text-primary-dark font-semibold'
                        : 'text-tertiary light:text-tertiary-dark'
                    )}>
                      {item.key}
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-tertiary/10 light:bg-tertiary-dark/10 mx-3" />

            {/* Account Section */}
            <div className="py-1">
              {authStatus === 'anonymous' ? (
                // Anonymous: Show "Protect your work" with link to sign-in
                <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                  <motion.div
                    role="menuitem"
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5',
                      'text-secondary light:text-secondary-dark',
                      'hover:text-primary light:hover:text-primary-dark',
                      'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
                      'transition-colors duration-fast',
                      'cursor-pointer'
                    )}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: totalItems * 0.02,
                      duration: 0.12,
                    }}
                  >
                    <span className="text-tertiary light:text-tertiary-dark">
                      <Shield className="w-4 h-4" />
                    </span>
                    <span className="flex-1 text-left text-sm font-medium">
                      {signupMessage}
                    </span>
                  </motion.div>
                </Link>
              ) : authStatus === 'authenticated' ? (
                // Authenticated: Show "Account" button with plan type
                <motion.button
                  role="menuitem"
                  onClick={handleAccountClick}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5',
                    'text-secondary light:text-secondary-dark',
                    'hover:text-primary light:hover:text-primary-dark',
                    'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
                    'transition-colors duration-fast',
                    'focus:outline-none focus-visible:bg-tertiary/10'
                  )}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: totalItems * 0.02,
                    duration: 0.12,
                  }}
                >
                  <span className="text-tertiary light:text-tertiary-dark">
                    <User className="w-4 h-4" />
                  </span>
                  <span className="flex-1 text-left text-sm font-medium">
                    Account
                  </span>
                  {planType && (
                    planType === 'flow' || (trialDaysRemaining != null && trialDaysRemaining > 0) ? (
                      <span className="text-[11px] font-semibold tracking-wide text-primary light:text-primary-dark drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] light:drop-shadow-[0_0_8px_rgba(0,0,0,0.2)]">
                        {trialDaysRemaining != null && trialDaysRemaining > 0
                          ? `Flow · ${trialDaysRemaining}d`
                          : 'Flow'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-tertiary/50 light:text-tertiary-dark/50">
                        Free
                      </span>
                    )
                  )}
                </motion.button>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
