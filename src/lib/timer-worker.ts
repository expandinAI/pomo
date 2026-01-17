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

type WorkerIncomingMessage = StartMessage | PauseMessage | ResetMessage | StopMessage;

// Message types from worker to main thread
interface TickMessage {
  type: 'TICK';
  remaining: number;
}

interface CompleteMessage {
  type: 'COMPLETE';
}

export type WorkerOutgoingMessage = TickMessage | CompleteMessage;

// Worker state
let intervalId: ReturnType<typeof setInterval> | null = null;
let startTime: number | null = null;
let duration: number = 0;
let elapsedAtPause: number = 0;

function calculateRemaining(): number {
  if (startTime === null) return duration;
  const elapsed = elapsedAtPause + (Date.now() - startTime) / 1000;
  return Math.max(0, Math.ceil(duration - elapsed));
}

function tick(): void {
  const remaining = calculateRemaining();
  self.postMessage({ type: 'TICK', remaining } as TickMessage);

  if (remaining <= 0) {
    stopTimer();
    self.postMessage({ type: 'COMPLETE' } as CompleteMessage);
  }
}

function startTimer(totalDuration: number, alreadyElapsed: number = 0): void {
  stopTimer();
  duration = totalDuration;
  elapsedAtPause = alreadyElapsed;
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
      startTimer(message.duration, message.elapsed ?? 0);
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
  }
};
