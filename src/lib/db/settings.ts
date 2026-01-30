// src/lib/db/settings.ts
//
// IndexedDB API for Settings
//
// Settings are stored as a single document with key 'user-settings'.
// This allows atomic reads/writes and simplifies future sync.

import { getDB } from './database';
import type { DBSettings } from './types';

/**
 * Get all settings from IndexedDB
 */
export async function getAllSettings(): Promise<Record<string, unknown>> {
  const db = getDB();
  const doc = await db.settings.get('user-settings');
  return doc?.value ?? {};
}

/**
 * Get a specific setting value with a default
 */
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const settings = await getAllSettings();
  if (key in settings) {
    return settings[key] as T;
  }
  return defaultValue;
}

/**
 * Set a single setting value
 */
export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = getDB();
  const existing = await db.settings.get('user-settings');

  const newValue = {
    ...(existing?.value ?? {}),
    [key]: value,
  };

  const doc: DBSettings = {
    key: 'user-settings',
    value: newValue,
    localUpdatedAt: new Date().toISOString(),
  };

  await db.settings.put(doc);
}

/**
 * Set multiple settings at once (atomic)
 */
export async function setSettings(settings: Record<string, unknown>): Promise<void> {
  const db = getDB();
  const existing = await db.settings.get('user-settings');

  const newValue = {
    ...(existing?.value ?? {}),
    ...settings,
  };

  const doc: DBSettings = {
    key: 'user-settings',
    value: newValue,
    localUpdatedAt: new Date().toISOString(),
  };

  await db.settings.put(doc);
}

/**
 * Delete a specific setting
 */
export async function deleteSetting(key: string): Promise<void> {
  const db = getDB();
  const existing = await db.settings.get('user-settings');

  if (!existing) return;

  const newValue = { ...existing.value };
  delete newValue[key];

  const doc: DBSettings = {
    key: 'user-settings',
    value: newValue,
    localUpdatedAt: new Date().toISOString(),
  };

  await db.settings.put(doc);
}

/**
 * Clear all settings (for testing/reset)
 */
export async function clearAllSettings(): Promise<void> {
  const db = getDB();
  await db.settings.delete('user-settings');
}
