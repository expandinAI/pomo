'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorkerOutgoingMessage } from '@/lib/timer-worker';

interface UseTimerWorkerOptions {
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

interface UseTimerWorkerReturn {
  timeRemaining: number;
  start: (duration: number, elapsed?: number) => void;
  pause: () => void;
  reset: (duration: number) => void;
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
  const { onComplete, onTick } = options;
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isSupported, setIsSupported] = useState(true);

  const workerRef = useRef<Worker | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  // Keep refs up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTickRef.current = onTick;
  }, [onComplete, onTick]);

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
            onTickRef.current?.(message.remaining);
            break;
          case 'COMPLETE':
            onCompleteRef.current?.();
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

  const start = useCallback((duration: number, elapsed: number = 0) => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'START', duration, elapsed });
    }
  }, []);

  const pause = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'PAUSE' });
    }
  }, []);

  const reset = useCallback((duration: number) => {
    setTimeRemaining(duration);
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESET', duration });
    }
  }, []);

  return {
    timeRemaining,
    start,
    pause,
    reset,
    isSupported,
  };
}
