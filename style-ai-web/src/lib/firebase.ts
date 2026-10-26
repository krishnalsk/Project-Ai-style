// src/lib/firebase.ts
// Firebase initialization singleton for Style AI Web matching Android project: best-3-52312

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

if (!isConfigured && typeof window !== "undefined") {
  console.warn(
    "Notice: Missing Firebase environment variables. Using offline/demo capability. To connect real Firebase, configure .env.local."
  );
}

// Ensure non-empty config object to avoid Firebase SDK crash during static builds
const resolvedConfig = isConfigured
  ? firebaseConfig
  : {
      apiKey: "AIzaMockApiKeyForDemoAndStaticBuildOnly000",
      authDomain: "style-ai-demo.firebaseapp.com",
      projectId: "style-ai-demo",
      storageBucket: "style-ai-demo.firebasestorage.app",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:mockappid000",
    };

// Singleton initialization safe for Next.js hot-reloads
const app = getApps().length === 0 ? initializeApp(resolvedConfig) : getApp();

export const auth = getAuth(app);

// Modern Firestore initialization with multi-tab offline cache support
function initializeFirestoreDb() {
  if (typeof window !== "undefined") {
    try {
      return initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      // If already initialized (e.g. during fast refresh / hot reload), fallback to existing instance
      return getFirestore(app);
    }
  }
  return getFirestore(app);
}

export const db = initializeFirestoreDb();

// Create GoogleAuthProvider on-demand to avoid shared singleton mutation
export function createGoogleProvider(): GoogleAuthProvider {
  return new GoogleAuthProvider();
}

export default app;
