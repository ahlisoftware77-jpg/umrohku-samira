import * as firestore from 'firebase/firestore';

// Global usage counters key
const USAGE_KEY = 'samira_firestore_usage_offset_map';

interface ProjectStats {
  reads: number;
  writes: number;
  deletes: number;
  lastUpdated: string;
}

interface UsageMap {
  [projectId: string]: ProjectStats;
}

const getInitialStatsMap = (): UsageMap => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(USAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return {};
};

export const statsMap = getInitialStatsMap();

const saveStats = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USAGE_KEY, JSON.stringify(statsMap));
    window.dispatchEvent(new CustomEvent('firestore-usage-updated', { detail: statsMap }));
  }
};

const getStatsForProject = (projectId: string): ProjectStats => {
  if (!statsMap[projectId]) {
    statsMap[projectId] = { reads: 0, writes: 0, deletes: 0, lastUpdated: new Date().toISOString() };
  }
  return statsMap[projectId];
};

const getDbInstance = (ref: any) => {
  try {
    if (ref) {
      if (ref.firestore) return ref.firestore;
      if (ref.query && ref.query.firestore) return ref.query.firestore;
    }
  } catch (e) {}
  return null;
};

// Debounced sync timeouts map per project id
const syncTimeouts: Record<string, any> = {};

const syncToFirestore = (dbInstance: any, projectId: string) => {
  if (typeof window === 'undefined' || !dbInstance) return;
  
  if (syncTimeouts[projectId]) {
    clearTimeout(syncTimeouts[projectId]);
  }

  syncTimeouts[projectId] = setTimeout(async () => {
    try {
      const pStats = statsMap[projectId];
      if (!pStats) return;

      const readsToSend = pStats.reads;
      const writesToSend = pStats.writes;
      const deletesToSend = pStats.deletes;

      if (readsToSend === 0 && writesToSend === 0 && deletesToSend === 0) return;

      const metricsRef = firestore.doc(dbInstance, 'system_metrics', 'firestore_usage');
      
      await firestore.setDoc(metricsRef, {
        reads: firestore.increment(readsToSend),
        writes: firestore.increment(writesToSend),
        deletes: firestore.increment(deletesToSend),
        lastUpdated: firestore.serverTimestamp()
      }, { merge: true });

      // Deduct the sent amounts
      pStats.reads -= readsToSend;
      pStats.writes -= writesToSend;
      pStats.deletes -= deletesToSend;
      saveStats();
    } catch (err) {
      console.error(`Failed to sync Firestore usage metrics for project ${projectId}:`, err);
    }
  }, 4000);
};

export function trackRead(ref: any, docCount: number = 1) {
  const dbInstance = getDbInstance(ref);
  const projectId = dbInstance?.app?.options?.projectId || 'default';
  
  const pStats = getStatsForProject(projectId);
  pStats.reads += docCount;
  pStats.lastUpdated = new Date().toISOString();
  saveStats();
  
  if (dbInstance) {
    syncToFirestore(dbInstance, projectId);
  }
}

export function trackWrite(ref: any, docCount: number = 1) {
  const dbInstance = getDbInstance(ref);
  const projectId = dbInstance?.app?.options?.projectId || 'default';
  
  const pStats = getStatsForProject(projectId);
  pStats.writes += docCount;
  pStats.lastUpdated = new Date().toISOString();
  saveStats();
  
  if (dbInstance) {
    syncToFirestore(dbInstance, projectId);
  }
}

export function trackDelete(ref: any, docCount: number = 1) {
  const dbInstance = getDbInstance(ref);
  const projectId = dbInstance?.app?.options?.projectId || 'default';
  
  const pStats = getStatsForProject(projectId);
  pStats.deletes += docCount;
  pStats.lastUpdated = new Date().toISOString();
  saveStats();
  
  if (dbInstance) {
    syncToFirestore(dbInstance, projectId);
  }
}

// Proxied Firestore functions with exact signatures
export const getDoc: typeof firestore.getDoc = async (ref, ...args) => {
  trackRead(ref, 1);
  return await firestore.getDoc(ref, ...args);
};

export const getDocs: typeof firestore.getDocs = async (ref, ...args) => {
  const result = await firestore.getDocs(ref, ...args);
  trackRead(ref, result.size || 1);
  return result;
};

export const setDoc: typeof firestore.setDoc = async (ref, ...args) => {
  trackWrite(ref, 1);
  return await firestore.setDoc(ref, ...args);
};

export const updateDoc: typeof firestore.updateDoc = async (ref, ...args) => {
  trackWrite(ref, 1);
  return await firestore.updateDoc(ref, ...args);
};

export const deleteDoc: typeof firestore.deleteDoc = async (ref, ...args) => {
  trackDelete(ref, 1);
  return await firestore.deleteDoc(ref, ...args);
};

export const onSnapshot: typeof firestore.onSnapshot = (ref, ...args) => {
  const originalCallback = typeof args[0] === 'function' ? args[0] : (args[1] as any);
  const wrappedCallback = (snapshot: any) => {
    const count = snapshot.size !== undefined ? snapshot.size : 1;
    trackRead(ref, count || 1);
    if (originalCallback) originalCallback(snapshot);
  };

  if (typeof args[0] === 'function') {
    args[0] = wrappedCallback as any;
  } else if (typeof args[1] === 'function') {
    args[1] = wrappedCallback as any;
  }

  return firestore.onSnapshot(ref, ...args);
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
