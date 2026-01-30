'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Cloud, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { DataSummary } from './DataSummary';
import { UploadProgress } from './UploadProgress';
import {
  getLocalDataSummary,
  performInitialUpload,
  type LocalDataSummary,
  type UploadProgress as UploadProgressType,
} from '@/lib/sync';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { useSupabaseToken } from '@/lib/auth/hooks';
import { SPRING } from '@/styles/design-tokens';
import type { SupabaseClient } from '@supabase/supabase-js';

type ModalPhase = 'loading' | 'summary' | 'uploading' | 'success' | 'error';

interface UpgradeModalProps {
  isOpen: boolean;
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * UpgradeModal - Handles the initial data sync after account creation
 *
 * Phases:
 * 1. loading - Fetching local data summary
 * 2. summary - Show data counts, ask to sync
 * 3. uploading - Progress bar during upload
 * 4. success - Checkmark + confirmation
 * 5. error - Error message + retry option
 */
export function UpgradeModal({ isOpen, userId, onComplete, onSkip }: UpgradeModalProps) {
  const [phase, setPhase] = useState<ModalPhase>('loading');
  const [summary, setSummary] = useState<LocalDataSummary | null>(null);
  const [progress, setProgress] = useState<UploadProgressType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const prefersReducedMotion = useReducedMotion();
  const getSupabaseToken = useSupabaseToken();

  // Load data summary when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadSummary() {
      try {
        const data = await getLocalDataSummary();
        setSummary(data);
        setPhase('summary');
      } catch (err) {
        console.error('[UpgradeModal] Failed to load summary:', err);
        setPhase('summary');
        setSummary({ sessionCount: 0, projectCount: 0, hasSettings: false, totalItems: 0 });
      }
    }

    setPhase('loading');
    loadSummary();
  }, [isOpen]);

  // Handle sync button click
  const handleSync = useCallback(async () => {
    setPhase('uploading');
    setProgress({
      phase: 'projects',
      current: 0,
      total: summary?.totalItems || 0,
      message: 'Starting sync...',
    });

    try {
      // Get Supabase token from Clerk
      const token = await getSupabaseToken();
      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      // Create authenticated Supabase client
      const client = createSupabaseClient(token);
      if (!client) {
        throw new Error('Supabase is not configured');
      }

      // Type assertion to help TypeScript understand the client is properly typed
      const supabase = client as SupabaseClient<Database>;

      // First, ensure user exists in Supabase
      const { data: existingUsers, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId);

      let supabaseUserId: string;

      if (userCheckError) {
        throw new Error(userCheckError.message);
      }

      if (!existingUsers || existingUsers.length === 0) {
        // User doesn't exist, create them
        // Note: The `as never` cast is required because RLS affects type inference
        const { data: newUsers, error: createError } = await supabase
          .from('users')
          .insert({ clerk_id: userId } as never)
          .select('id');

        if (createError) {
          throw new Error(createError.message);
        }
        if (!newUsers || newUsers.length === 0) {
          throw new Error('Failed to create user');
        }
        supabaseUserId = (newUsers[0] as { id: string }).id;
      } else {
        supabaseUserId = (existingUsers[0] as { id: string }).id;
      }

      // Perform the upload
      const result = await performInitialUpload(
        supabase,
        supabaseUserId,
        (p) => setProgress(p)
      );

      if (result.success) {
        setPhase('success');
        // Auto-close after success
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        // Partial success - show warning but continue
        if (result.projectsUploaded > 0 || result.sessionsUploaded > 0) {
          console.warn('[UpgradeModal] Partial upload:', result.errors);
          setPhase('success');
          setTimeout(() => {
            onComplete();
          }, 2000);
        } else {
          throw new Error(result.errors[0] || 'Upload failed');
        }
      }
    } catch (err) {
      console.error('[UpgradeModal] Sync failed:', err);
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
      setPhase('error');
    }
  }, [summary, userId, getSupabaseToken, onComplete]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setErrorMessage('');
    handleSync();
  }, [handleSync]);

  // Block keyboard events from reaching timer
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Block common timer shortcuts
      if ([' ', 'Escape', 's', 'r', 'S', 'R'].includes(e.key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }

      // ESC to skip/close
      if (e.key === 'Escape' && phase === 'summary') {
        onSkip();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, phase, onSkip]);

  if (!isOpen) return null;

  // Particle animation based on phase
  const particleAnimation = prefersReducedMotion
    ? { opacity: 1 }
    : phase === 'uploading'
      ? {
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8],
        }
      : phase === 'success'
        ? { scale: 1, opacity: 1 }
        : {
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          };

  const particleTransition = prefersReducedMotion
    ? { duration: 0 }
    : phase === 'uploading'
      ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const }
      : phase === 'success'
        ? { duration: 0.3 }
        : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background light:bg-background-dark"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Particle */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary light:bg-primary-dark"
        style={{ top: '30%' }}
        animate={particleAnimation}
        transition={particleTransition}
      />

      {/* Content */}
      <div
        className="absolute inset-x-0 flex justify-center px-4"
        style={{ top: '38%' }}
      >
        <AnimatePresence mode="wait">
          {/* Loading Phase */}
          {phase === 'loading' && (
            <motion.div
              key="loading"
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm text-tertiary light:text-tertiary-dark">
                Checking local data...
              </p>
            </motion.div>
          )}

          {/* Summary Phase */}
          {phase === 'summary' && summary && (
            <motion.div
              key="summary"
              className="flex flex-col items-center w-full max-w-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <motion.h1
                className="text-xl font-medium text-primary light:text-primary-dark mb-2 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                Welcome to Particle!
              </motion.h1>

              <motion.p
                className="text-sm text-secondary light:text-secondary-dark mb-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                You have local data to sync:
              </motion.p>

              <motion.div
                className="w-full mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <DataSummary summary={summary} />
              </motion.div>

              {/* Sync Button */}
              <motion.button
                onClick={handleSync}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary light:bg-primary-dark text-background light:text-background-dark font-medium hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              >
                <Cloud className="w-4 h-4" />
                <span>Sync Now</span>
              </motion.button>

              {/* Skip Link */}
              <motion.button
                onClick={onSkip}
                className="mt-6 text-sm text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                Later
              </motion.button>
            </motion.div>
          )}

          {/* Uploading Phase */}
          {phase === 'uploading' && progress && (
            <motion.div
              key="uploading"
              className="flex flex-col items-center w-full max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h1
                className="text-xl font-medium text-primary light:text-primary-dark mb-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Syncing your data...
              </motion.h1>

              <UploadProgress progress={progress} />
            </motion.div>
          )}

          {/* Success Phase */}
          {phase === 'success' && (
            <motion.div
              key="success"
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', ...SPRING.default }}
            >
              <motion.div
                className="w-12 h-12 rounded-full bg-primary/10 light:bg-primary-dark/10 flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', ...SPRING.bouncy, delay: 0.1 }}
              >
                <Check className="w-6 h-6 text-primary light:text-primary-dark" />
              </motion.div>

              <motion.p
                className="text-lg text-primary light:text-primary-dark text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                Data synced successfully!
              </motion.p>
            </motion.div>
          )}

          {/* Error Phase */}
          {phase === 'error' && (
            <motion.div
              key="error"
              className="flex flex-col items-center w-full max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', ...SPRING.default }}
              >
                <AlertCircle className="w-6 h-6 text-red-500" />
              </motion.div>

              <motion.h1
                className="text-xl font-medium text-primary light:text-primary-dark mb-2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Sync failed
              </motion.h1>

              <motion.p
                className="text-sm text-tertiary light:text-tertiary-dark mb-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {errorMessage}
              </motion.p>

              {/* Retry Button */}
              <motion.button
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary light:bg-primary-dark text-background light:text-background-dark font-medium hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </motion.button>

              {/* Skip Link */}
              <motion.button
                onClick={onSkip}
                className="mt-4 text-sm text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Skip for now
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
