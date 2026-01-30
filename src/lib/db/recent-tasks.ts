// src/lib/db/recent-tasks.ts
//
// IndexedDB API for Recent Tasks
//
// Recent tasks are stored with text as the primary key.
// Limited to MAX_RECENT_TASKS to prevent unbounded growth.

import { getDB } from './database';
import type { DBRecentTask } from './types';

const MAX_RECENT_TASKS = 10;

export interface CreateRecentTaskInput {
  text: string;
  estimatedPomodoros?: number;
}

/**
 * Load all recent tasks, sorted by lastUsed (most recent first)
 */
export async function loadRecentTasks(): Promise<DBRecentTask[]> {
  const db = getDB();
  const tasks = await db.recentTasks.orderBy('lastUsed').reverse().toArray();
  return tasks;
}

/**
 * Get a recent task by its text (primary key)
 */
export async function getRecentTaskByText(text: string): Promise<DBRecentTask | undefined> {
  const db = getDB();
  return db.recentTasks.get(text);
}

/**
 * Add or update a recent task
 *
 * If a task with the same text exists, it updates the lastUsed timestamp.
 * Otherwise, creates a new task.
 * Automatically trims to MAX_RECENT_TASKS.
 */
export async function addRecentTask(input: CreateRecentTaskInput): Promise<DBRecentTask> {
  const normalizedText = input.text.trim();
  if (!normalizedText) {
    throw new Error('Task text cannot be empty');
  }

  const db = getDB();
  const now = new Date().toISOString();

  const task: DBRecentTask = {
    text: normalizedText,
    lastUsed: now,
    estimatedPomodoros: input.estimatedPomodoros,
  };

  // Use put to upsert (insert or update)
  await db.recentTasks.put(task);

  // Trim to MAX_RECENT_TASKS
  await trimRecentTasks();

  return task;
}

/**
 * Update an existing recent task
 */
export async function updateRecentTask(
  text: string,
  updates: Partial<Omit<DBRecentTask, 'text'>>
): Promise<DBRecentTask | undefined> {
  const db = getDB();
  const existing = await db.recentTasks.get(text);

  if (!existing) {
    return undefined;
  }

  const updated: DBRecentTask = {
    ...existing,
    ...updates,
    text, // text is the primary key, cannot change
  };

  await db.recentTasks.put(updated);
  return updated;
}

/**
 * Delete a recent task by text
 */
export async function deleteRecentTask(text: string): Promise<void> {
  const db = getDB();
  await db.recentTasks.delete(text);
}

/**
 * Clear all recent tasks
 */
export async function clearRecentTasks(): Promise<void> {
  const db = getDB();
  await db.recentTasks.clear();
}

/**
 * Get total count of recent tasks
 */
export async function getRecentTaskCount(): Promise<number> {
  const db = getDB();
  return db.recentTasks.count();
}

/**
 * Trim recent tasks to MAX_RECENT_TASKS
 * Removes the oldest tasks (by lastUsed) if over the limit
 */
async function trimRecentTasks(): Promise<void> {
  const db = getDB();
  const count = await db.recentTasks.count();

  if (count <= MAX_RECENT_TASKS) {
    return;
  }

  // Get all tasks sorted by lastUsed ascending (oldest first)
  const tasks = await db.recentTasks.orderBy('lastUsed').toArray();

  // Delete oldest tasks to get back to MAX_RECENT_TASKS
  const toDelete = tasks.slice(0, count - MAX_RECENT_TASKS);

  for (const task of toDelete) {
    await db.recentTasks.delete(task.text);
  }
}

/**
 * Filter tasks by search query (fuzzy match)
 */
export async function filterRecentTasks(query: string): Promise<DBRecentTask[]> {
  const tasks = await loadRecentTasks();

  if (!query.trim()) {
    return tasks;
  }

  const lowerQuery = query.toLowerCase();
  return tasks.filter((task) => task.text.toLowerCase().includes(lowerQuery));
}
