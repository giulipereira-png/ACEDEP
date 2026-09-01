import { db, doc, setDoc, updateDoc, deleteDoc, cleanFirestoreData } from './firebase';

export interface OfflineSyncOperation {
  id: string;
  timestamp: string;
  collection: string;
  docId: string;
  action: 'set' | 'update' | 'delete';
  payload?: any;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = 'acedep_offline_sync_queue';
const BACKUP_PREFIX = 'acedep_backup_';

/**
 * Safely saves data to localStorage as a safety backup layer.
 */
export function saveLocalStorageBackup<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(`${BACKUP_PREFIX}${key}`, serialized);
    // Also save a timestamp of the last local backup
    localStorage.setItem(`${BACKUP_PREFIX}${key}_last_saved`, new Date().toISOString());
  } catch (err) {
    console.warn(`[Offline Backup] Could not save backup for key "${key}":`, err);
  }
}

/**
 * Safely retrieves backup data from localStorage, falling back to default data if empty or invalid.
 */
export function getLocalStorageBackup<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`${BACKUP_PREFIX}${key}`);
    if (item) {
      const parsed = JSON.parse(item);
      if (parsed !== undefined && parsed !== null) {
        return parsed as T;
      }
    }
  } catch (err) {
    console.warn(`[Offline Backup] Error reading backup for key "${key}":`, err);
  }
  return fallback;
}

/**
 * Enqueues an operation to be re-attempted when online.
 */
export function enqueueOfflineOperation(op: Omit<OfflineSyncOperation, 'id' | 'timestamp' | 'retryCount'>): void {
  if (typeof window === 'undefined') return;
  try {
    const existingQueue = getOfflineSyncQueue();
    const newOperation: OfflineSyncOperation = {
      ...op,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    // Filter out previous duplicate pending actions on the same document to avoid redundancy
    const filteredQueue = existingQueue.filter(
      (item) => !(item.collection === op.collection && item.docId === op.docId && item.action === op.action)
    );

    filteredQueue.push(newOperation);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filteredQueue));
    console.log(`[Offline Queue] Enqueued offline ${op.action} operation for ${op.collection}/${op.docId}`);
  } catch (err) {
    console.warn('[Offline Queue] Error saving offline operation:', err);
  }
}

/**
 * Retrieves all pending offline operations from localStorage.
 */
export function getOfflineSyncQueue(): OfflineSyncOperation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Offline Queue] Error reading sync queue:', err);
  }
  return [];
}

/**
 * Retrieves the count of pending offline operations.
 */
export function getOfflineQueueLength(): number {
  return getOfflineSyncQueue().length;
}

/**
 * Clears or updates the offline sync queue.
 */
export function clearOfflineSyncQueue(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  } catch {}
}

/**
 * Processes all pending operations in the offline queue and syncs them to Firestore.
 */
export async function processOfflineSyncQueue(): Promise<{ processed: number; failed: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { processed: 0, failed: 0 };
  }

  const queue = getOfflineSyncQueue();
  if (queue.length === 0) {
    return { processed: 0, failed: 0 };
  }

  console.log(`[Offline Queue] Processing ${queue.length} pending offline operations...`);
  const remainingQueue: OfflineSyncOperation[] = [];
  let processedCount = 0;

  for (const op of queue) {
    try {
      const docRef = doc(db, op.collection, op.docId);

      if (op.action === 'set') {
        const cleaned = cleanFirestoreData(op.payload || {});
        await setDoc(docRef, cleaned, { merge: true });
        processedCount++;
      } else if (op.action === 'update') {
        const cleaned = cleanFirestoreData(op.payload || {});
        await updateDoc(docRef, cleaned);
        processedCount++;
      } else if (op.action === 'delete') {
        await deleteDoc(docRef);
        processedCount++;
      }
    } catch (err) {
      console.warn(`[Offline Queue] Failed to process operation ${op.id} (${op.collection}/${op.docId}):`, err);
      // Keep in queue if retries < 5
      if (op.retryCount < 5) {
        remainingQueue.push({
          ...op,
          retryCount: op.retryCount + 1,
        });
      }
    }
  }

  if (remainingQueue.length > 0) {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remainingQueue));
  } else {
    clearOfflineSyncQueue();
  }

  return { processed: processedCount, failed: remainingQueue.length };
}

// Set up automatic listeners to process offline queue when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Offline Queue] Network connection restored. Flushed pending offline changes.');
    processOfflineSyncQueue().catch((err) => console.warn('[Offline Queue] Error on online flush:', err));
  });
}
