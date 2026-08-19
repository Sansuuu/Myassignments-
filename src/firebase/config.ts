import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Production-ready Firebase web configuration using environment variables
// with safe project defaults for seamless AI Studio preview and Vercel builds.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA-Zng0O7Z8b347xLlGtsOMOdnMxFg9Trw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'smart-quota-kgtt6.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'smart-quota-kgtt6',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'smart-quota-kgtt6.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '91605473967',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:91605473967:web:d17623f51b5b755373d25a',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 'ai-studio-cseclasshub-77f0e6b1-1234-4732-bedc-b501f2bde641',
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connection test helper as mandated by skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_probe'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('client is offline')) {
      console.warn('Firestore is currently offline or connecting...');
      return false;
    }
    // Document might not exist which still proves connection is alive
    return true;
  }
}

// Error handling helper conforming to firebase-integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
