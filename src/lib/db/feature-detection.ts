// src/lib/db/feature-detection.ts

let _isAvailable: boolean | null = null;

/**
 * Check if IndexedDB is available
 * Caches result after first check
 */
export function isIndexedDBAvailable(): boolean {
  if (_isAvailable !== null) return _isAvailable;

  try {
    // Check if indexedDB exists
    if (typeof indexedDB === 'undefined') {
      _isAvailable = false;
      return false;
    }

    // Try to open a test database (catches Safari private mode)
    const testDB = indexedDB.open('__test__');
    testDB.onerror = () => {
      _isAvailable = false;
    };
    testDB.onsuccess = () => {
      indexedDB.deleteDatabase('__test__');
      _isAvailable = true;
    };

    // Assume available until proven otherwise
    _isAvailable = true;
    return true;
  } catch {
    _isAvailable = false;
    return false;
  }
}

/**
 * Storage mode - IndexedDB or localStorage fallback
 */
export type StorageMode = 'indexeddb' | 'localstorage';

export function getStorageMode(): StorageMode {
  return isIndexedDBAvailable() ? 'indexeddb' : 'localstorage';
}

/**
 * Reset the cached availability check (for testing)
 */
export function resetAvailabilityCache(): void {
  _isAvailable = null;
}
