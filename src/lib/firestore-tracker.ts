import * as firestore from 'firebase/firestore';

// Global usage counters key
const USAGE_KEY = 'samira_firestore_usage_offset';

interface UsageStats {
  reads: number;
  writes: number;
  deletes: number;
  lastUpdated: string;
}

const getInitialStats = (): UsageStats => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(USAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return { reads: 0, writes: 0, deletes: 0, lastUpdated: new Date().toISOString() };
};

export const stats = getInitialStats();

const saveStats = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USAGE_KEY, JSON.stringify(stats));
    window.dispatchEvent(new CustomEvent('firestore-usage-updated', { detail: stats }));
  }
};

// Debounced sync to database (using raw untracked firestore calls to avoid infinite loops)
let syncTimeout: any = null;

const syncToFirestore = () => {
  if (typeof window === 'undefined') return;
  if (syncTimeout) clearTimeout(syncTimeout);

  syncTimeout = setTimeout(async () => {
    try {
      const { app } = await import('@/lib/firebase');
      const rawDb = firestore.getFirestore(app);
      const metricsRef = firestore.doc(rawDb, 'system_metrics', 'firestore_usage');
      
      const readsToSend = stats.reads;
      const writesToSend = stats.writes;
      const deletesToSend = stats.deletes;

      if (readsToSend === 0 && writesToSend === 0 && deletesToSend === 0) return;

      await firestore.setDoc(metricsRef, {
        reads: firestore.increment(readsToSend),
        writes: firestore.increment(writesToSend),
        deletes: firestore.increment(deletesToSend),
        lastUpdated: firestore.serverTimestamp()
      }, { merge: true });

      // Deduct the sent amounts
      stats.reads -= readsToSend;
      stats.writes -= writesToSend;
      stats.deletes -= deletesToSend;
      saveStats();
    } catch (err) {
      console.error('Failed to sync Firestore usage metrics:', err);
    }
  }, 4000);
};

export function trackRead(docCount: number = 1) {
  stats.reads += docCount;
  stats.lastUpdated = new Date().toISOString();
  saveStats();
  syncToFirestore();
}

export function trackWrite(docCount: number = 1) {
  stats.writes += docCount;
  stats.lastUpdated = new Date().toISOString();
  saveStats();
  syncToFirestore();
}

export function trackDelete(docCount: number = 1) {
  stats.deletes += docCount;
  stats.lastUpdated = new Date().toISOString();
  saveStats();
  syncToFirestore();
}

// Proxied Firestore functions with exact signatures
export const getDoc: typeof firestore.getDoc = async (...args) => {
  trackRead(1);
  return await firestore.getDoc(...args);
};

export const getDocs: typeof firestore.getDocs = async (...args) => {
  const result = await firestore.getDocs(...args);
  trackRead(result.size || 1);
  return result;
};

export const setDoc: typeof firestore.setDoc = async (...args) => {
  trackWrite(1);
  return await firestore.setDoc(...args);
};

export const updateDoc: typeof firestore.updateDoc = async (...args) => {
  trackWrite(1);
  return await firestore.updateDoc(...args);
};

export const deleteDoc: typeof firestore.deleteDoc = async (...args) => {
  trackDelete(1);
  return await firestore.deleteDoc(...args);
};

export const onSnapshot: typeof firestore.onSnapshot = (...args) => {
  const originalCallback = typeof args[1] === 'function' ? args[1] : (args[2] as any);
  const wrappedCallback = (snapshot: any) => {
    const count = snapshot.size !== undefined ? snapshot.size : 1;
    trackRead(count || 1);
    if (originalCallback) originalCallback(snapshot);
  };

  if (typeof args[1] === 'function') {
    args[1] = wrappedCallback as any;
  } else if (typeof args[2] === 'function') {
    args[2] = wrappedCallback as any;
  }

  return firestore.onSnapshot(...args);
};

// Re-export standard query tools
export {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
