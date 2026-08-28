// src/lib/firebase.ts
// Firebase initialization singleton for Style AI Web matching Android project: best-3-52312

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    "Missing Firebase environment variables. Copy .env.example to .env.local and fill in your Firebase config."
  );
}

// Singleton initialization safe for Next.js hot-reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence for Firestore
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch(() => {
    // Persistence may fail if another tab already has it enabled — this is fine
  });
}

// Create GoogleAuthProvider on-demand to avoid shared singleton mutation
export function createGoogleProvider(): GoogleAuthProvider {
  return new GoogleAuthProvider();
}

export default app;
