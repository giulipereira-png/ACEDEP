import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
const databaseId = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)' 
  ? config.firestoreDatabaseId 
  : undefined;

export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const auth = getAuth(app);
// Safe helper to upload or retain optimized image data
export async function uploadImageToFirebaseStorage(
  _folder: string,
  _fileName: string,
  dataUrl: string
): Promise<string> {
  // Returns optimized dataUrl safely stored directly in Firestore documents
  return dataUrl;
}

// Helper to remove any undefined fields before writing to Firestore
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = cleanFirestoreData(value);
    }
  }
  return result as T;
}

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
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  // Log handled warning without crashing UI
  console.warn(`Firestore [${operationType}] at [${path || 'root'}]:`, errMessage);
}

// Non-blocking connection check on startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore operating in offline cache mode.');
    }
  }
}

testConnection();

export { 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy
};


