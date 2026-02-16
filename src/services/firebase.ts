// ============================================================
// Frenchie Trivia — Firebase Configuration
// Uses Firebase JS SDK (works with Expo Go, no native deps)
// ============================================================

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  Auth,
  User as FirebaseUser,
} from 'firebase/auth';

// Firebase config — replace with your actual values
// or use EXPO_PUBLIC_ env vars
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
};

let app: FirebaseApp;
let auth: Auth;

export function initFirebase(): { app: FirebaseApp; auth: Auth } {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  return { app, auth };
}

export function getFirebaseAuth(): Auth {
  if (!auth) initFirebase();
  return auth;
}

// --- Auth helpers ---

export async function firebaseSignInAnonymously(): Promise<FirebaseUser> {
  const a = getFirebaseAuth();
  const result = await signInAnonymously(a);
  return result.user;
}

export async function firebaseSignUp(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const a = getFirebaseAuth();
  const result = await createUserWithEmailAndPassword(a, email, password);
  return result.user;
}

export async function firebaseSignIn(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const a = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(a, email, password);
  return result.user;
}

export async function firebaseSignOut(): Promise<void> {
  const a = getFirebaseAuth();
  await signOut(a);
}

export async function getFirebaseIdToken(): Promise<string | null> {
  const a = getFirebaseAuth();
  const user = a.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
