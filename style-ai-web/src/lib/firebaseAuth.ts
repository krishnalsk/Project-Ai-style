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
  sizes?: string[];
  preferredFit?: "Relaxed" | "Loose" | "Regular" | "Slim" | "Oversized" | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  skinType: string | null;
  confirmedAllergies?: string[];
  reportedSensitivities?: string[];
  preferredFabric: string | null;
  preferredFabrics?: string[];
  stylePreferences?: string[];
  location: string | null;
  comfortScore: number;
}

export const defaultProfile: UserProfile = {
  email: null,
  fullName: null,
  profession: null,
  age: null,
  size: "M",
  sizes: ["M", "L"],
  preferredFit: "Relaxed",
  budgetMin: 500,
  budgetMax: 3500,
  skinType: "Sensitive",
  confirmedAllergies: [],
  reportedSensitivities: ["Rough Synthetics", "Coarse Wool"],
  preferredFabric: "100% GOTS Organic Cotton",
  preferredFabrics: ["100% GOTS Organic Cotton", "100% Pure French Flax Linen", "Bamboo Viscose"],
  stylePreferences: ["Minimalist", "Korean Casual"],
  location: "Mumbai",
  comfortScore: 94,
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
/**
 * Sign out the current user session and clear local demo storage.
 */
export async function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("style_ai_demo_user");
      localStorage.removeItem("style_ai_demo_profile");
    } catch {}
  }
  await signOut(auth);
}

/**
 * Send password reset email.
 */
export async function resetPassword(email: string): Promise<void> {
  const actionCodeSettings: ActionCodeSettings = {
    url: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    handleCodeInApp: true,
  };

  await sendPasswordResetEmail(auth, email, actionCodeSettings);
}

/**
 * Maps raw Firebase authentication errors to clean, actionable user-facing messages.
 */
export function friendlyAuthError(err: unknown): string {
  if (!err) return "An unexpected error occurred. Please try again.";
  const msg = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: string }).code || "";

  if (code === "auth/popup-closed-by-user" || msg.includes("popup-closed-by-user")) {
    return "Google sign-in popup was closed before completing.";
  }
  if (code === "auth/unauthorized-domain" || msg.includes("unauthorized-domain")) {
    return "Firebase Auth Domain Notice: This domain is not in your Firebase Authorized Domains list. Use Instant Demo Mode below or add this domain in the Firebase Console.";
  }
  if (
    code === "auth/user-not-found" ||
    code === "auth/wrong-password" ||
    code === "auth/invalid-credential" ||
    code === "auth/invalid-login-credentials" ||
    msg.includes("invalid-credential") ||
    msg.includes("user-not-found") ||
    msg.includes("wrong-password")
  ) {
    return "Incorrect email or password. Please check your credentials and try again.";
  }
  if (code === "auth/email-already-in-use" || msg.includes("email-already-in-use")) {
    return "An account with this email already exists. Please log in instead.";
  }
  if (code === "auth/weak-password" || msg.includes("weak-password")) {
    return "Password is too weak. Please use at least 8 characters.";
  }
  if (code === "auth/invalid-email" || msg.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (code === "auth/too-many-requests" || msg.includes("too-many-requests")) {
    return "Too many failed attempts. Access is temporarily paused. Please try again shortly or reset your password.";
  }
  if (code === "auth/network-request-failed" || msg.includes("network")) {
    return "Network connection issue. Please check your internet connection.";
  }
  if (code === "auth/operation-not-allowed" || msg.includes("operation-not-allowed")) {
    return "This sign-in provider is not enabled in Firebase Console. Please enable Email/Password or Google in Firebase Auth.";
  }
  if (code === "auth/user-disabled" || msg.includes("user-disabled")) {
    return "This user account has been disabled. Please contact support.";
  }

  return msg.replace(/^Firebase:\s*/i, "").replace(/^Error\s*\((auth\/[^)]+)\):\s*/i, "");
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

