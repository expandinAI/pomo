/**
 * Initial Upload Service
 *
 * Handles the one-time upload of local IndexedDB data to Supabase
 * when a user creates an account (Local → Cloud upgrade).
 *
 * Upload order:
 * 1. Projects first (sessions reference them)
 * 2. Sessions with mapped server project IDs
 * 3. Settings
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getDB } from '@/lib/db/database';
import { loadProjects } from '@/lib/db/projects';
import { loadSessions } from '@/lib/db/sessions';
import { getAllSettings } from '@/lib/db/settings';
import { markAsSynced } from '@/lib/db/types';
import type { DBSession, DBProject } from '@/lib/db/types';
import type { Database, Json } from '@/lib/supabase/types';

/**
 * Summary of local data available for upload
 */
export interface LocalDataSummary {
  sessionCount: number;
  projectCount: number;
  hasSettings: boolean;
  totalItems: number;
}

/**
 * Progress callback for upload status
 */
export interface UploadProgress {
  phase: 'projects' | 'sessions' | 'settings' | 'done';
  current: number;
  total: number;
  message: string;
}

/**
 * Result of the upload operation
 */
export interface UploadResult {
  success: boolean;
  projectsUploaded: number;
  sessionsUploaded: number;
  settingsUploaded: boolean;
  errors: string[];
}

/**
 * Get a summary of local data that can be uploaded
 */
export async function getLocalDataSummary(): Promise<LocalDataSummary> {
  const [sessions, projects, settings] = await Promise.all([
    loadSessions(),
    loadProjects(),
    getAllSettings(),
  ]);

  // Only count work sessions as "particles"
  const workSessions = sessions.filter(s => s.type === 'work');
  const settingsCount = Object.keys(settings).length;

  return {
    sessionCount: workSessions.length,
    projectCount: projects.length,
    hasSettings: settingsCount > 0,
    totalItems: workSessions.length + projects.length + (settingsCount > 0 ? 1 : 0),
  };
}

/**
 * Check if there's any local data worth uploading
 */
export async function hasLocalData(): Promise<boolean> {
  const summary = await getLocalDataSummary();
  return summary.totalItems > 0;
}

/**
 * Convert brightness value (0.3-1.0) to hex color string
 */
function brightnessToHex(brightness: number): string {
  // Clamp brightness to valid range
  const clamped = Math.max(0.3, Math.min(1.0, brightness));
  // Convert to grayscale hex (0.3 = #4D4D4D, 1.0 = #FFFFFF)
  const value = Math.round(clamped * 255);
  const hex = value.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
}

/**
 * Map local session type to Supabase mode
 */
function mapSessionType(type: DBSession['type']): 'work' | 'break' | 'longBreak' {
  switch (type) {
    case 'work':
      return 'work';
    case 'shortBreak':
      return 'break';
    case 'longBreak':
      return 'longBreak';
    default:
      return 'work';
  }
}

/**
 * Calculate started_at from completedAt and duration
 */
function calculateStartedAt(completedAt: string, durationSeconds: number): string {
  const endTime = new Date(completedAt);
  const startTime = new Date(endTime.getTime() - durationSeconds * 1000);
  return startTime.toISOString();
}

/**
 * Perform the initial upload of local data to Supabase
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - Supabase user ID (from users table)
 * @param onProgress - Optional callback for progress updates
 * @returns Upload result with counts and any errors
 */
export async function performInitialUpload(
  supabase: SupabaseClient<Database>,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const db = getDB();
  const errors: string[] = [];
  let projectsUploaded = 0;
  let sessionsUploaded = 0;
  let settingsUploaded = false;

  // Load all local data
  const [localProjects, localSessions, localSettings] = await Promise.all([
    loadProjects(),
    loadSessions(),
    getAllSettings(),
  ]);

  const totalProjects = localProjects.length;
  const totalSessions = localSessions.length;
  const hasSettings = Object.keys(localSettings).length > 0;
  const totalItems = totalProjects + totalSessions + (hasSettings ? 1 : 0);

  // Map local project IDs to server project IDs
  const projectIdMap = new Map<string, string>();

  // Phase 1: Upload projects
  onProgress?.({
    phase: 'projects',
    current: 0,
    total: totalItems,
    message: 'Uploading projects...',
  });

  for (let i = 0; i < localProjects.length; i++) {
    const project = localProjects[i];

    try {
      const serverProjectId = crypto.randomUUID();

      const projectData = {
        id: serverProjectId,
        user_id: userId,
        local_id: project.id,
        name: project.name,
        color: brightnessToHex(project.brightness),
        is_active: !project.archived,
        sort_order: i,
      };

      // Note: The `as never` cast is required because RLS affects type inference
      const { error } = await supabase.from('projects').insert(projectData as never);

      if (error) {
        errors.push(`Project "${project.name}": ${error.message}`);
      } else {
        projectsUploaded++;
        projectIdMap.set(project.id, serverProjectId);

        // Mark local project as synced
        const synced = markAsSynced(project, serverProjectId);
        await db.projects.put(synced);
      }
    } catch (err) {
      errors.push(`Project "${project.name}": ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    onProgress?.({
      phase: 'projects',
      current: i + 1,
      total: totalItems,
      message: `Uploading projects (${i + 1}/${totalProjects})...`,
    });
  }

  // Phase 2: Upload sessions
  onProgress?.({
    phase: 'sessions',
    current: totalProjects,
    total: totalItems,
    message: 'Uploading particles...',
  });

  // Upload sessions in batches for better performance
  const BATCH_SIZE = 50;
  const sessionBatches: DBSession[][] = [];

  for (let i = 0; i < localSessions.length; i += BATCH_SIZE) {
    sessionBatches.push(localSessions.slice(i, i + BATCH_SIZE));
  }

  let sessionIndex = 0;
  for (const batch of sessionBatches) {
    const sessionInserts: Array<{
      id: string;
      user_id: string;
      local_id: string;
      started_at: string;
      ended_at: string;
      duration_seconds: number;
      mode: 'work' | 'break' | 'longBreak';
      project_id: string | null;
      task: string | null;
      is_overflow: boolean;
      overflow_seconds: number;
    }> = [];
    const sessionsToUpdate: Array<{ session: DBSession; serverId: string }> = [];

    for (const session of batch) {
      const serverSessionId = crypto.randomUUID();

      // Map project ID if session has one
      let serverProjectId: string | null = null;
      if (session.projectId) {
        serverProjectId = projectIdMap.get(session.projectId) || null;
      }

      sessionInserts.push({
        id: serverSessionId,
        user_id: userId,
        local_id: session.id,
        started_at: calculateStartedAt(session.completedAt, session.duration),
        ended_at: session.completedAt,
        duration_seconds: session.duration,
        mode: mapSessionType(session.type),
        project_id: serverProjectId,
        task: session.task || null,
        is_overflow: !!session.overflowDuration && session.overflowDuration > 0,
        overflow_seconds: session.overflowDuration || 0,
      });

      sessionsToUpdate.push({
        session,
        serverId: serverSessionId,
      });
    }

    try {
      // Note: The `as never` cast is required because RLS affects type inference
      const { error } = await supabase.from('sessions').insert(sessionInserts as never);

      if (error) {
        errors.push(`Sessions batch: ${error.message}`);
      } else {
        sessionsUploaded += batch.length;

        // Mark local sessions as synced
        for (const { session, serverId } of sessionsToUpdate) {
          const synced = markAsSynced(session, serverId);
          await db.sessions.put(synced);
        }
      }
    } catch (err) {
      errors.push(`Sessions batch: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    sessionIndex += batch.length;
    onProgress?.({
      phase: 'sessions',
      current: totalProjects + sessionIndex,
      total: totalItems,
      message: `Uploading particles (${sessionIndex}/${totalSessions})...`,
    });
  }

  // Phase 3: Upload settings
  if (hasSettings) {
    onProgress?.({
      phase: 'settings',
      current: totalProjects + totalSessions,
      total: totalItems,
      message: 'Uploading settings...',
    });

    try {
      // Convert settings to Json-compatible format
      const settingsJson: Json = Object.fromEntries(
        Object.entries(localSettings).map(([k, v]) => [k, v as Json])
      );

      // Extract specific settings from the generic settings object
      const settingsData: {
        user_id: string;
        settings_json: Json;
        work_duration_seconds?: number;
        break_duration_seconds?: number;
        long_break_duration_seconds?: number;
        sessions_until_long_break?: number;
        auto_start_breaks?: boolean;
        auto_start_work?: boolean;
        sound_enabled?: boolean;
        notification_enabled?: boolean;
        keyboard_hints_visible?: boolean;
      } = {
        user_id: userId,
        settings_json: settingsJson,
      };

      // Map known settings if they exist
      if (localSettings['timer.workDuration']) {
        settingsData.work_duration_seconds = localSettings['timer.workDuration'] as number;
      }
      if (localSettings['timer.shortBreakDuration']) {
        settingsData.break_duration_seconds = localSettings['timer.shortBreakDuration'] as number;
      }
      if (localSettings['timer.longBreakDuration']) {
        settingsData.long_break_duration_seconds = localSettings['timer.longBreakDuration'] as number;
      }
      if (localSettings['timer.sessionsUntilLongBreak']) {
        settingsData.sessions_until_long_break = localSettings['timer.sessionsUntilLongBreak'] as number;
      }
      if (typeof localSettings['timer.autoStartBreaks'] === 'boolean') {
        settingsData.auto_start_breaks = localSettings['timer.autoStartBreaks'] as boolean;
      }
      if (typeof localSettings['timer.autoStartWork'] === 'boolean') {
        settingsData.auto_start_work = localSettings['timer.autoStartWork'] as boolean;
      }
      if (typeof localSettings['sound.enabled'] === 'boolean') {
        settingsData.sound_enabled = localSettings['sound.enabled'] as boolean;
      }
      if (typeof localSettings['notification.enabled'] === 'boolean') {
        settingsData.notification_enabled = localSettings['notification.enabled'] as boolean;
      }
      if (typeof localSettings['keyboard-hints-visible'] === 'boolean') {
        settingsData.keyboard_hints_visible = localSettings['keyboard-hints-visible'] as boolean;
      }

      // Note: The `as never` cast is required because RLS affects type inference
      const { error } = await supabase.from('user_settings').upsert(settingsData as never, {
        onConflict: 'user_id',
      });

      if (error) {
        errors.push(`Settings: ${error.message}`);
      } else {
        settingsUploaded = true;
      }
    } catch (err) {
      errors.push(`Settings: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    onProgress?.({
      phase: 'settings',
      current: totalItems,
      total: totalItems,
      message: 'Settings uploaded',
    });
  }

  // Done
  onProgress?.({
    phase: 'done',
    current: totalItems,
    total: totalItems,
    message: 'Upload complete!',
  });

  return {
    success: errors.length === 0,
    projectsUploaded,
    sessionsUploaded,
    settingsUploaded,
    errors,
  };
}
