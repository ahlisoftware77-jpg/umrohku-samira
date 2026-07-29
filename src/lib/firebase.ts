import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const hasFirebaseKeys = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!hasFirebaseKeys && typeof window !== 'undefined') {
  console.warn(
    'Warning: Firebase API Key is not configured. Please define NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local file.'
  );
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCfkOcMFkFCHvArDqKKOPRkKYFqJu7aBrM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "landing-umroh.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "landing-umroh",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "landing-umroh.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "104581499400",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:104581499400:web:108ccf05aeeac6e9389fbd",
};

// Initialize Firebase Default Instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Dynamic Multi-Database Cluster Initializer Cache
const dynamicApps: Record<string, { app: any; db: any; auth: any }> = {};

export function getDynamicFirebaseInstance(customConfig?: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}) {
  if (!customConfig || !customConfig.projectId || !customConfig.apiKey) {
    return { app, auth, db };
  }

  const appName = `app_${customConfig.projectId}`;
  if (dynamicApps[appName]) {
    return dynamicApps[appName];
  }

  const existingApp = getApps().find(a => a.name === appName);
  const targetApp = existingApp || initializeApp(customConfig, appName);
  const targetAuth = getAuth(targetApp);
  const targetDb = getFirestore(targetApp);

  const instance = { app: targetApp, auth: targetAuth, db: targetDb };
  dynamicApps[appName] = instance;
  return instance;
}

export { app, auth, db };
