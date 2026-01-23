'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorkerOutgoingMessage } from '@/lib/timer-worker';

interface UseTimerWorkerOptions {
  onComplete?: () => void;
  onTick?: (remaining: number, overflow?: number) => void;
  onReachedZero?: () => void; // Called when timer hits 0 in overflow mode
}

interface UseTimerWorkerReturn {
  timeRemaining: number;
  overflowSeconds: number;
  start: (duration: number, elapsed?: number, overflowEnabled?: boolean) => void;
  pause: () => void;
  reset: (duration: number) => void;
  setOverflow: (enabled: boolean) => void;
  isSupported: boolean;
}

/**
 * Hook for managing a Web Worker-based timer
 *
 * Provides accurate timing even in background tabs by running
 * the timer logic in a separate thread.
 */
export function useTimerWorker(
  initialDuration: number,
  options: UseTimerWorkerOptions = {}
): UseTimerWorkerReturn {
  const { onComplete, onTick, onReachedZero } = options;
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [overflowSeconds, setOverflowSeconds] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const workerRef = useRef<Worker | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);
  const onReachedZeroRef = useRef(onReachedZero);

  // Keep refs up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTickRef.current = onTick;
    onReachedZeroRef.current = onReachedZero;
  }, [onComplete, onTick, onReachedZero]);

  // Initialize worker
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Worker) {
      setIsSupported(false);
      return;
    }

    try {
      // Create worker from the timer-worker file
      const worker = new Worker(
        new URL('../lib/timer-worker.ts', import.meta.url)
      );

      worker.onmessage = (event: MessageEvent<WorkerOutgoingMessage>) => {
        const message = event.data;

        switch (message.type) {
          case 'TICK':
            setTimeRemaining(message.remaining);
            setOverflowSeconds(message.overflow ?? 0);
            onTickRef.current?.(message.remaining, message.overflow);
            break;
          case 'COMPLETE':
            onCompleteRef.current?.();
            break;
          case 'REACHED_ZERO':
            onReachedZeroRef.current?.();
            break;
        }
      };

      worker.onerror = (error) => {
        console.error('Timer worker error:', error);
        setIsSupported(false);
      };

      workerRef.current = worker;

      return () => {
        worker.postMessage({ type: 'STOP' });
        worker.terminate();
        workerRef.current = null;
      };
    } catch (error) {
      console.error('Failed to create timer worker:', error);
      setIsSupported(false);
    }
  }, []);

  const start = useCallback((duration: number, elapsed: number = 0, overflowEnabled: boolean = false) => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'START', duration, elapsed, overflowEnabled });
    }
  }, []);

  const pause = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'PAUSE' });
    }
  }, []);

  const reset = useCallback((duration: number) => {
    setTimeRemaining(duration);
    setOverflowSeconds(0);
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESET', duration });
    }
  }, []);

  const setOverflow = useCallback((enabled: boolean) => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'SET_OVERFLOW', enabled });
    }
  }, []);

  return {
    timeRemaining,
    overflowSeconds,
    start,
    pause,
    reset,
    setOverflow,
    isSupported,
  };
}
