import type { SessionType } from '@/styles/design-tokens';

export interface CompletedSession {
  id: string;
  type: SessionType;
  duration: number; // in seconds (total = planned + overflow)
  completedAt: string; // ISO date string
  task?: string; // Task description
  estimatedPomodoros?: number; // 1-4+ pomodoros
  presetId?: string; // ID of the preset used for this session
  projectId?: string; // Optional project assignment
  overflowDuration?: number; // Time spent past 0:00 (in seconds)
  estimatedDuration?: number; // Planned duration in seconds (from Smart Input or preset)
}

const STORAGE_KEY = 'particle_session_history';
const OLD_STORAGE_KEY = 'pomo_session_history';
const MAX_SESSIONS = 100;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function loadSessions(): CompletedSession[] {
  if (typeof window === 'undefined') return [];

  try {
    // Migrate from old key if exists
    const oldStored = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldStored && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, oldStored);
      localStorage.removeItem(OLD_STORAGE_KEY);
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore errors
  }
  return [];
}

export function saveSessions(sessions: CompletedSession[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export interface TaskData {
  task?: string;
  estimatedPomodoros?: number;
  presetId?: string;
  projectId?: string;
  overflowDuration?: number;
  estimatedDuration?: number;
}

export function getSessionById(id: string): CompletedSession | null {
  const sessions = loadSessions();
  return sessions.find(s => s.id === id) || null;
}

export function updateSession(
  id: string,
  updates: Partial<Pick<CompletedSession, 'task' | 'projectId' | 'duration'>>
): CompletedSession | null {
  const sessions = loadSessions();
  const index = sessions.findIndex(s => s.id === id);
  if (index === -1) return null;

  const updated = { ...sessions[index] };
  if (updates.task !== undefined) updated.task = updates.task || undefined;
  if (updates.projectId !== undefined) updated.projectId = updates.projectId || undefined;
  if (updates.duration !== undefined) updated.duration = updates.duration;

  sessions[index] = updated;
  saveSessions(sessions);
  return updated;
}

export function deleteSession(id: string): boolean {
  const sessions = loadSessions();
  const index = sessions.findIndex(s => s.id === id);
  if (index === -1) return false;

  sessions.splice(index, 1);
  saveSessions(sessions);
  return true;
}

export function addSession(
  type: SessionType,
  duration: number,
  taskData?: TaskData
): CompletedSession {
  const session: CompletedSession = {
    id: generateId(),
    type,
    duration,
    completedAt: new Date().toISOString(),
    ...(taskData?.task && { task: taskData.task }),
    ...(taskData?.estimatedPomodoros && { estimatedPomodoros: taskData.estimatedPomodoros }),
    ...(taskData?.presetId && { presetId: taskData.presetId }),
    ...(taskData?.projectId && { projectId: taskData.projectId }),
    ...(taskData?.overflowDuration && { overflowDuration: taskData.overflowDuration }),
    ...(taskData?.estimatedDuration && { estimatedDuration: taskData.estimatedDuration }),
  };

  const sessions = loadSessions();
  sessions.unshift(session); // Add to beginning

  // Keep only last MAX_SESSIONS
  const trimmed = sessions.slice(0, MAX_SESSIONS);
  saveSessions(trimmed);

  return session;
}

export function clearSessions(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Get sessions from the last N days
export function getSessionsFromDays(days: number): CompletedSession[] {
  const sessions = loadSessions();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return sessions.filter(
    (session) => new Date(session.completedAt) >= cutoffDate
  );
}

// Group sessions by date (YYYY-MM-DD)
export function groupSessionsByDate(
  sessions: CompletedSession[]
): Map<string, CompletedSession[]> {
  const groups = new Map<string, CompletedSession[]>();

  for (const session of sessions) {
    const date = new Date(session.completedAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
    const existing = groups.get(date) || [];
    existing.push(session);
    groups.set(date, existing);
  }

  return groups;
}

// Calculate total duration for a list of sessions
export function getTotalDuration(sessions: CompletedSession[]): number {
  return sessions.reduce((total, session) => total + session.duration, 0);
}

// Format duration as hours, minutes, and seconds (for small values)
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  // Show seconds for values under 1 minute (e.g., small overflow times)
  return `${secs}s`;
}

// Format date as relative or absolute
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const sessionDate = new Date(date);
  sessionDate.setHours(0, 0, 0, 0);

  if (sessionDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (sessionDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
}

// Format time of day
export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Get today's completed work sessions
export function getTodaySessions(): CompletedSession[] {
  const sessions = loadSessions();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return sessions.filter(session => {
    const sessionDate = new Date(session.completedAt);
    return sessionDate >= today && session.type === 'work';
  });
}

// Format time in 24-hour format (HH:MM)
export function formatTime24h(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Format session info for hover display
export function formatSessionInfo(
  session: CompletedSession,
  projectName?: string
): string {
  const time = formatTime24h(session.completedAt);
  const duration = formatDuration(session.duration);
  const parts = [time, duration];

  if (session.task) {
    parts.push(session.task.length > 30 ? session.task.slice(0, 27) + '...' : session.task);
  }
  if (projectName) {
    parts.push(projectName);
  }
  return parts.join(' · ');
}
