'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { CoachMessage } from './types';
import { cn } from '@/lib/utils';

interface ChatHistoryProps {
  messages: CoachMessage[];
  isLoading?: boolean;
  isStreaming?: boolean;
}

/**
 * ChatHistory - Displays the message list between user and coach
 *
 * Design:
 * - User messages: Right-aligned with accent background
 * - Coach messages: Left-aligned with surface background
 * - Empty state: "Ask the Coach anything"
 * - Streaming support with smooth auto-scroll
 */
export function ChatHistory({
  messages,
  isLoading = false,
  isStreaming = false,
}: ChatHistoryProps) {
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  // Get the last message content for streaming updates
  const lastMessage = messages[messages.length - 1];
  const lastMessageContent = lastMessage?.content || '';

  // Smooth auto-scroll to bottom when new messages arrive or content updates during streaming
  useEffect(() => {
    if (scrollAnchorRef.current && messages.length > 0) {
      scrollAnchorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [messages.length, lastMessageContent]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        {/* Skeleton messages */}
        <div className="flex justify-start">
          <div className="max-w-[80%] p-3 rounded-2xl bg-tertiary/10 light:bg-tertiary-dark/10">
            <div className="h-3 w-48 rounded bg-tertiary/20 light:bg-tertiary-dark/20 animate-pulse" />
            <div className="h-3 w-32 rounded bg-tertiary/20 light:bg-tertiary-dark/20 animate-pulse mt-2" />
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[80%] p-3 rounded-2xl bg-tertiary/15 light:bg-tertiary-dark/15">
            <div className="h-3 w-24 rounded bg-tertiary/25 light:bg-tertiary-dark/25 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-8 text-center"
      >
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-full bg-tertiary/10 light:bg-tertiary-dark/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-tertiary light:text-tertiary-dark" />
          </div>
        </div>
        <p className="text-sm text-tertiary light:text-tertiary-dark">
          Ask the Coach anything
        </p>
      </motion.div>
    );
  }

  // Message list
  return (
    <div className="space-y-3 py-4">
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;
        const isStreamingMessage =
          isStreaming && isLastMessage && message.role === 'coach';

        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] px-4 py-2.5 rounded-2xl',
                message.role === 'user'
                  ? 'bg-primary light:bg-primary-dark text-background light:text-background-dark rounded-br-sm'
                  : 'bg-tertiary/10 light:bg-tertiary-dark/10 text-primary light:text-primary-dark rounded-bl-sm'
              )}
            >
              {message.role === 'coach' ? (
                <span className="text-sm leading-relaxed">
                  <ReactMarkdown
                    allowedElements={['p', 'strong', 'em', 'code']}
                    unwrapDisallowed={true}
                    components={{
                      p: ({ children }) => <span>{children}</span>,
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      code: ({ children }) => (
                        <code className="px-1 py-0.5 rounded bg-tertiary/20 light:bg-tertiary-dark/20 font-mono text-xs">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {isStreamingMessage && (
                    <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary/60 light:bg-primary-dark/60 animate-pulse" />
                  )}
                </span>
              ) : (
                <span className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Invisible scroll anchor for smooth auto-scroll */}
      <div ref={scrollAnchorRef} aria-hidden="true" />
    </div>
  );
}
