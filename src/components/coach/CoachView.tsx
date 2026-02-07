'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useCoach } from '@/hooks/useCoach';
import { useCoachChat } from '@/hooks/useCoachChat';
import { useAIQuota } from '@/lib/ai-quota/hooks';
import { useParticleOfWeek } from '@/hooks/useParticleOfWeek';
import { useSessionStore } from '@/contexts/SessionContext';
import { getWeekBoundaries } from '@/lib/session-analytics';
import { QuotaRing } from './QuotaRing';
import { CoachBriefing } from './CoachBriefing';
import { ChatHistory } from './ChatHistory';

interface CoachViewProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * CoachView - Main modal for AI Coach interactions
 *
 * Features:
 * - Current insight display (InsightCard)
 * - Chat history (ChatHistory)
 * - Chat input with streaming responses
 * - Quota indicator in header
 *
 * Access:
 * - G C keyboard shortcut
 * - Click on CoachParticle (bottom-right)
 */
export function CoachView({ isOpen, onClose }: CoachViewProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');

  // Coach data and context
  const { insight, isLoading, isLoadingInsight, context, refreshContext } = useCoach();

  // Refresh context when modal opens to get latest particles
  useEffect(() => {
    if (isOpen) {
      refreshContext();
    }
  }, [isOpen, refreshContext]);

  // Chat functionality
  const { messages, sendMessage, isStreaming, error: chatError, startNewChat, isLoaded } = useCoachChat();

  // Quota management
  const { quota } = useAIQuota();

  // Particle of the Week
  const { potw, isLoading: potwLoading } = useParticleOfWeek();

  // Current week stats for the briefing ticker
  const { sessions } = useSessionStore();
  const currentWeekStats = useMemo(() => {
    if (sessions.length === 0) return null;
    const { start, end } = getWeekBoundaries(0);
    const weekSessions = sessions.filter((s) => {
      const d = new Date(s.completedAt);
      return d >= start && d <= end && s.type === 'work';
    });
    const totalParticles = weekSessions.length;
    const totalMinutes = Math.round(
      weekSessions.reduce((sum, s) => sum + s.duration, 0) / 60
    );
    const projectIds = new Set(
      weekSessions.map((s) => s.projectId).filter(Boolean)
    );
    return { totalParticles, totalMinutes, projectCount: projectIds.size };
  }, [sessions]);

  // Determine if chat is available
  const isChatDisabled = isStreaming || !context || !quota;
  const isLimitReached = quota?.isLimitReached ?? false;

  /**
   * Handle sending a message
   */
  const handleSubmit = useCallback(async () => {
    if (!inputText.trim() || isStreaming || !context) return;

    const message = inputText;
    setInputText(''); // Clear input immediately for better UX

    await sendMessage(message, context);
  }, [inputText, isStreaming, context, sendMessage]);

  /**
   * Handle keyboard events in the input
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Enter sends, Shift+Enter would add newline (if we used textarea)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Focus trap - focus the chat input for immediate typing (keyboard-first UX)
  useFocusTrap(modalRef, isOpen, { initialFocusRef: inputRef });

  // Handle keyboard shortcuts - capture phase + stopImmediatePropagation prevents Timer interference
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: 'auto' as const }}
            exit={{ opacity: 0, pointerEvents: 'none' as const }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 light:bg-black/40"
            onClick={onClose}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', ...SPRING.gentle }}
              className="w-full max-w-lg max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={modalRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="coach-title"
                className="flex flex-col overflow-hidden bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 focus:outline-none"
              >
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-tertiary/10 light:border-tertiary-dark/10">
                  <div className="flex items-center gap-2">
                    <h2
                      id="coach-title"
                      className="text-base font-semibold text-primary light:text-primary-dark"
                    >
                      Coach
                    </h2>
                    <QuotaRing />
                  </div>
                  <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                      <button
                        onClick={startNewChat}
                        className="text-xs text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors"
                        title="Start new conversation"
                      >
                        New Chat
                      </button>
                    )}
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  </div>
                </div>

                {/* Scrollable content wrapper - CRITICAL: min-h-0 for flexbox scroll */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Scrollable area */}
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    {/* Unified Coach Briefing */}
                    <div className="mb-4">
                      <CoachBriefing
                        currentWeekStats={currentWeekStats}
                        potw={potw}
                        potwLoading={potwLoading}
                        insight={insight}
                        insightLoading={isLoading || isLoadingInsight}
                      />
                    </div>

                    {/* Chat History */}
                    <div className="border-t border-tertiary/10 light:border-tertiary-dark/10 pt-4">
                      <h3 className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider mb-2">
                        Conversation
                      </h3>
                      <ChatHistory messages={messages} isLoading={isLoading} isStreaming={isStreaming} />
                    </div>
                  </div>
                </div>

                {/* Fixed footer with chat input */}
                <div className="flex-shrink-0 px-5 py-4 border-t border-tertiary/10 light:border-tertiary-dark/10">
                  {/* Error message */}
                  {chatError && (
                    <p className="text-xs text-red-400 text-center mb-2">
                      {chatError}
                    </p>
                  )}

                  {/* Limit reached message */}
                  {isLimitReached && !chatError && (
                    <p className="text-xs text-tertiary light:text-tertiary-dark text-center mb-2">
                      Monthly limit reached. Resets next month.
                    </p>
                  )}

                  {/* Chat input */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                          isLimitReached
                            ? 'Monthly limit reached'
                            : isStreaming
                              ? 'Coach is thinking...'
                              : 'Ask me anything...'
                        }
                        disabled={isChatDisabled || isLimitReached}
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-tertiary/5 light:bg-tertiary-dark/5 border border-tertiary/10 light:border-tertiary-dark/10 text-sm text-primary light:text-primary-dark placeholder:text-tertiary light:placeholder:text-tertiary-dark disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      />
                      <button
                        onClick={handleSubmit}
                        disabled={
                          isChatDisabled || isLimitReached || !inputText.trim()
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-primary light:hover:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
