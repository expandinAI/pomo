'use client';

import { useState, useCallback, useRef } from 'react';
import type { CoachMessage } from '@/components/coach/types';
import type { CoachContext } from '@/lib/coach/types';

/**
 * Generate a unique ID for messages
 */
function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

interface UseCoachChatResult {
  /** All messages in the conversation */
  messages: CoachMessage[];
  /** Send a message and receive streaming response */
  sendMessage: (text: string, context: CoachContext) => Promise<void>;
  /** Whether a response is currently streaming */
  isStreaming: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Clear the chat history */
  clearHistory: () => void;
}

/**
 * useCoachChat - Hook for managing chat with the AI Coach
 *
 * Handles:
 * - Message state management
 * - Streaming responses from the API
 * - Error handling
 * - History management
 */
export function useCoachChat(): UseCoachChatResult {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep track of the current streaming message ID for updates
  const streamingMessageIdRef = useRef<string | null>(null);

  /**
   * Send a message to the coach and handle streaming response
   */
  const sendMessage = useCallback(
    async (text: string, context: CoachContext): Promise<void> => {
      if (!text.trim() || isStreaming) return;

      setError(null);

      // Create user message
      const userMessage: CoachMessage = {
        id: generateId(),
        role: 'user',
        content: text.trim(),
        createdAt: new Date(),
      };

      // Add user message immediately (optimistic update)
      setMessages((prev) => [...prev, userMessage]);

      // Create placeholder for coach response
      const coachMessageId = generateId();
      streamingMessageIdRef.current = coachMessageId;

      const coachMessage: CoachMessage = {
        id: coachMessageId,
        role: 'coach',
        content: '',
        createdAt: new Date(),
      };

      // Add empty coach message that will be updated as we stream
      setMessages((prev) => [...prev, coachMessage]);
      setIsStreaming(true);

      try {
        // Prepare history for API (convert to format expected by backend)
        const history = messages.map((msg) => ({
          role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: msg.content,
        }));

        // Make the API request
        const response = await fetch('/api/coach/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text.trim(),
            history,
            context,
          }),
        });

        // Handle error responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error || `Request failed with status ${response.status}`;

          // Handle specific error codes
          if (response.status === 429) {
            throw new Error(
              "You've reached your monthly AI query limit. It will reset next month."
            );
          }
          if (response.status === 403) {
            throw new Error('AI Coach requires a Flow subscription.');
          }

          throw new Error(errorMessage);
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response stream available');
        }

        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          // Update the coach message with new content
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === coachMessageId
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          );
        }

        // Ensure we got some content
        if (!accumulatedContent.trim()) {
          throw new Error('No response from coach');
        }
      } catch (err) {
        console.error('[useCoachChat] Error:', err);

        // Set error state
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);

        // Remove the empty coach message on error
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== coachMessageId)
        );
      } finally {
        setIsStreaming(false);
        streamingMessageIdRef.current = null;
      }
    },
    [messages, isStreaming]
  );

  /**
   * Clear all messages from the chat
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    sendMessage,
    isStreaming,
    error,
    clearHistory,
  };
}
