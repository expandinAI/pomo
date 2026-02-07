// src/lib/db/chat-storage.ts
//
// IndexedDB CRUD for coach chat messages (local-only, no sync)

import { getDB } from './database';
import type { DBChatMessage } from './types';

/**
 * Save a single chat message to IndexedDB
 */
export async function saveChatMessage(message: DBChatMessage): Promise<void> {
  const db = getDB();
  await db.chatMessages.put(message);
}

/**
 * Load all messages for a conversation, sorted by createdAt
 */
export async function loadConversation(conversationId: string): Promise<DBChatMessage[]> {
  const db = getDB();
  return db.chatMessages
    .where('conversationId')
    .equals(conversationId)
    .sortBy('createdAt');
}

/**
 * Get the most recent conversation ID (for auto-resume on modal open)
 */
export async function getLatestConversationId(): Promise<string | null> {
  const db = getDB();
  const latest = await db.chatMessages.orderBy('createdAt').last();
  return latest?.conversationId ?? null;
}

/**
 * Delete all messages for a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const db = getDB();
  await db.chatMessages.where('conversationId').equals(conversationId).delete();
}

/**
 * Generate a new conversation ID
 */
export function newConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
