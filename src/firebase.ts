import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import rawConfig from '../firebase-applet-config.json';

const localConfig = (rawConfig || {}) as Record<string, string>;

// Priority 1: Environment variables (Vercel production / .env)
// Priority 2: Local config file (AI Studio / local dev)
// Priority 3: Fallback defaults matching dependable-almanac-h9v0l
const projectId =
  import.meta.env.VITE_FIREBASE_PROJECT_ID ||
  localConfig.projectId ||
  'dependable-almanac-h9v0l';

const apiKey =
  import.meta.env.VITE_FIREBASE_API_KEY ||
  localConfig.apiKey ||
  '';

const appId =
  import.meta.env.VITE_FIREBASE_APP_ID ||
  localConfig.appId ||
  '';

const authDomain =
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
  localConfig.authDomain ||
  (projectId ? `${projectId}.firebaseapp.com` : '');

const storageBucket =
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
  localConfig.storageBucket ||
  (projectId ? `${projectId}.firebasestorage.app` : '');

const messagingSenderId =
  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
  localConfig.messagingSenderId ||
  '384648529311';

const firestoreDatabaseId =
  import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
  localConfig.firestoreDatabaseId ||
  'ai-studio-diwalicelebratio-aff6810a-ab8a-44ed-86e2-37b9a727d7b0';

export const firebaseConfig = {
  apiKey,
  projectId,
  appId,
  authDomain,
  storageBucket,
  messagingSenderId,
  firestoreDatabaseId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

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
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
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
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  const jsonString = JSON.stringify(errInfo);
  console.error('Firestore Error: ', jsonString);
  throw new Error(jsonString);
}

async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: client is offline.');
    }
  }
}

void testFirestoreConnection();
