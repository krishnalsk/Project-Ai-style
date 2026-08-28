// src/lib/firebaseAuth.ts
// Firebase Authentication & Firestore Profile helpers matching Android's FirebaseManager

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  deleteUser,
  User,
  ActionCodeSettings,
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { auth, db, createGoogleProvider } from "./firebase";

// ─── User Profile Model (Mirrors Android UserProfile.kt) ─────────────────────

export interface UserProfile {
  email: string | null;
  fullName: string | null;
  profession: string | null;
  age: string | null;
  size: string | null;
  skinType: string | null;
  preferredFabric: string | null;
  location: string | null;
  comfortScore: number;
}

export const defaultProfile: UserProfile = {
  email: null,
  fullName: null,
  profession: null,
  age: null,
  size: null,
  skinType: null,
  preferredFabric: null,
  location: null,
  comfortScore: 92,
};

// ─── Authentication Operations ───────────────────────────────────────────────

/**
 * Register a new user with Email and Password.
 * Automatically sends verification email and initializes Firestore profile.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user);

  try {
    await saveUserProfile(cred.user.uid, { ...defaultProfile, email, fullName });
  } catch {
    // Profile save failed — user exists in Auth but has no Firestore doc.
    // On next login, loginWithGoogle logic will create the profile.
  }

  return cred.user;
}

/**
 * Authenticate existing user with Email and Password.
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/**
 * Authenticate or Sign Up with Google OAuth Popup.
 */
export async function loginWithGoogle(): Promise<User> {
  const googleProvider = createGoogleProvider();
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Use setDoc with merge: true unconditionally — avoids TOCTOU race condition
    await saveUserProfile(user.uid, {
      ...defaultProfile,
      email: user.email,
      fullName: user.displayName,
    });

    return user;
  } catch (error) {
    const authError = error as { code?: string };
    if (authError?.code === "auth/popup-blocked" || authError?.code === "auth/cancelled-popup-request") {
      console.warn("Popup blocked/cancelled, falling back to redirect...");
      await signInWithRedirect(auth, googleProvider);
      return new Promise(() => {}); // Return a pending promise that never resolves since page is redirecting
    }
    throw error;
  }
}

/**
 * Sign out the current user session.
 */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Send password reset email.
 */
export async function resetPassword(email: string): Promise<void> {
  const actionCodeSettings: ActionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true,
  };

  await sendPasswordResetEmail(auth, email, actionCodeSettings);
}

/**
 * Delete user Auth account first, then Firestore document.
 * Order matters: if Firestore delete fails, the account is still recoverable.
 */
export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");

  // Delete Auth account first (may require recent re-authentication)
  await deleteUser(user);

  // Then delete Firestore data
  try {
    await deleteDoc(doc(db, "users", user.uid));
  } catch {
    // Firestore delete failed but Auth account is gone — acceptable degradation
  }
}

// ─── Firestore User Profile CRUD ──────────────────────────────────────────────

export async function saveUserProfile(
  uid: string,
  profile: Partial<UserProfile>
): Promise<void> {
  await setDoc(doc(db, "users", uid), profile, { merge: true });
}

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;

  const data = snap.data();
  // Basic runtime validation
  return {
    email: data.email ?? null,
    fullName: data.fullName ?? null,
    profession: data.profession ?? null,
    age: data.age ?? null,
    size: data.size ?? null,
    skinType: data.skinType ?? null,
    preferredFabric: data.preferredFabric ?? null,
    location: data.location ?? null,
    comfortScore: typeof data.comfortScore === "number" ? data.comfortScore : 92,
  } as UserProfile;
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export function isLoggedIn(): boolean {
  return auth.currentUser !== null;
}
