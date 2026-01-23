/**
 * Timer Web Worker
 *
 * Runs in a separate thread to maintain accurate timing even when
 * the main thread is throttled (e.g., background tabs).
 *
 * Uses elapsed time calculation instead of decrementing to ensure accuracy.
 */

// Message types from main thread to worker
interface StartMessage {
  type: 'START';
  duration: number; // Total duration in seconds
  elapsed?: number; // Already elapsed time (for resume)
  overflowEnabled?: boolean; // Whether to continue past 0
}

interface PauseMessage {
  type: 'PAUSE';
}

interface ResetMessage {
  type: 'RESET';
  duration: number;
}

interface StopMessage {
  type: 'STOP';
}

interface SetOverflowMessage {
  type: 'SET_OVERFLOW';
  enabled: boolean;
}

type WorkerIncomingMessage = StartMessage | PauseMessage | ResetMessage | StopMessage | SetOverflowMessage;

// Message types from worker to main thread
interface TickMessage {
  type: 'TICK';
  remaining: number;
  overflow?: number; // Seconds past 0 (only when overflow enabled)
}

interface CompleteMessage {
  type: 'COMPLETE';
}

interface ReachedZeroMessage {
  type: 'REACHED_ZERO'; // Sent when timer hits 0 (overflow mode continues after this)
}

export type WorkerOutgoingMessage = TickMessage | CompleteMessage | ReachedZeroMessage;

// Worker state
let intervalId: ReturnType<typeof setInterval> | null = null;
let startTime: number | null = null;
let duration: number = 0;
let elapsedAtPause: number = 0;
let overflowEnabled: boolean = false;
let reachedZeroSent: boolean = false;

function calculateElapsed(): number {
  if (startTime === null) return elapsedAtPause;
  return elapsedAtPause + (Date.now() - startTime) / 1000;
}

function calculateRemaining(): number {
  const elapsed = calculateElapsed();
  return Math.max(0, Math.ceil(duration - elapsed));
}

function calculateOverflow(): number {
  const elapsed = calculateElapsed();
  const overflow = elapsed - duration;
  return overflow > 0 ? Math.floor(overflow) : 0;
}

function tick(): void {
  const remaining = calculateRemaining();
  const overflow = overflowEnabled ? calculateOverflow() : 0;

  self.postMessage({ type: 'TICK', remaining, overflow } as TickMessage);

  // Timer reached 0
  if (remaining <= 0) {
    if (overflowEnabled) {
      // In overflow mode: send REACHED_ZERO once, then continue ticking
      if (!reachedZeroSent) {
        reachedZeroSent = true;
        self.postMessage({ type: 'REACHED_ZERO' } as ReachedZeroMessage);
      }
      // Continue ticking for overflow
    } else {
      // No overflow: stop and complete
      stopTimer();
      self.postMessage({ type: 'COMPLETE' } as CompleteMessage);
    }
  }
}

function startTimer(totalDuration: number, alreadyElapsed: number = 0, overflow: boolean = false): void {
  stopTimer();
  duration = totalDuration;
  elapsedAtPause = alreadyElapsed;
  overflowEnabled = overflow;
  reachedZeroSent = false;
  startTime = Date.now();

  // Initial tick
  tick();

  // Tick every second
  intervalId = setInterval(tick, 1000);
}

function pauseTimer(): void {
  if (startTime !== null) {
    elapsedAtPause += (Date.now() - startTime) / 1000;
  }
  startTime = null;

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function stopTimer(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  startTime = null;
  elapsedAtPause = 0;
  reachedZeroSent = false;
}

function resetTimer(newDuration: number): void {
  stopTimer();
  duration = newDuration;
  self.postMessage({ type: 'TICK', remaining: newDuration } as TickMessage);
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent<WorkerIncomingMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'START':
      startTimer(message.duration, message.elapsed ?? 0, message.overflowEnabled ?? false);
      break;
    case 'PAUSE':
      pauseTimer();
      break;
    case 'RESET':
      resetTimer(message.duration);
      break;
    case 'STOP':
      stopTimer();
      break;
    case 'SET_OVERFLOW':
      overflowEnabled = message.enabled;
      break;
  }
};
