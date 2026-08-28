"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User, getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, UserProfile, saveUserProfile, defaultProfile } from "@/lib/firebaseAuth";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const p = await getUserProfile(auth.currentUser.uid);
      setProfile(p);
    }
  };

  useEffect(() => {
    let active = true;

    async function handleAuthRedirect() {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user && active) {
          const user = result.user;
          const existingProfile = await getUserProfile(user.uid);
          if (!existingProfile) {
            await saveUserProfile(user.uid, {
              ...defaultProfile,
              email: user.email,
              fullName: user.displayName,
            });
          }
          const updatedProfile = await getUserProfile(user.uid);
          if (active) {
            setProfile(updatedProfile);
          }
        }
      } catch (err) {
        console.error("Error handling redirect sign-in:", err);
      }
    }

    handleAuthRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!active) return;
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const p = await getUserProfile(firebaseUser.uid);
          setProfile(p);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
