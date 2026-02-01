'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import type { AIQuotaStatus } from './quota-service';

/**
 * API response shape (dates are ISO strings)
 */
interface AIQuotaResponse {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
  isWarning: boolean;
  isLimitReached: boolean;
  error?: string;
}

/**
 * Hook return type
 */
interface UseAIQuotaResult {
  /** Current quota status (null while loading) */
  quota: AIQuotaStatus | null;
  /** Whether the quota is being loaded */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refetch the quota status */
  refetch: () => Promise<void>;
  /** Consume a query and return whether it was allowed */
  consumeQuery: () => Promise<boolean>;
}

/**
 * Convert API response to AIQuotaStatus
 */
function responseToStatus(response: AIQuotaResponse): AIQuotaStatus {
  return {
    allowed: response.allowed,
    used: response.used,
    limit: response.limit,
    remaining: response.remaining,
    resetAt: new Date(response.resetAt),
    isWarning: response.isWarning,
    isLimitReached: response.isLimitReached,
  };
}

/**
 * Hook to manage AI Coach query quota
 *
 * Fetches current quota status and provides methods to:
 * - Refetch the quota status
 * - Consume a query (check-and-increment atomically)
 *
 * @returns UseAIQuotaResult object
 */
export function useAIQuota(): UseAIQuotaResult {
  const { isLoaded, isSignedIn } = useUser();
  const [quota, setQuota] = useState<AIQuotaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coach/quota');
      const data = await response.json();

      if (!response.ok) {
        // 403 means user doesn't have Flow - this is expected, not an error
        if (response.status === 403) {
          setQuota(null);
          setError(null);
        } else {
          throw new Error(data.error || 'Failed to fetch quota');
        }
      } else {
        setQuota(responseToStatus(data));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quota');
      setQuota(null);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  // Fetch quota on mount and when auth changes
  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const consumeQuery = useCallback(async (): Promise<boolean> => {
    if (!isSignedIn) {
      setError('You must be signed in');
      return false;
    }

    try {
      const response = await fetch('/api/coach/quota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.status === 429) {
        // Limit reached
        setQuota(responseToStatus(data));
        return false;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to consume query');
      }

      setQuota(responseToStatus(data));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to consume query');
      return false;
    }
  }, [isSignedIn]);

  return {
    quota,
    isLoading,
    error,
    refetch: fetchQuota,
    consumeQuery,
  };
}
