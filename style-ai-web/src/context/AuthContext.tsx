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
  demoLogin: (name?: string, email?: string) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  demoLogin: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const demoLogin = (name = "Demo Stylist", email = "demo@styleai.app") => {
    const mockUser = {
      uid: "demo-user-123",
      email,
      displayName: name,
      emailVerified: true,
    } as unknown as User;
    setUser(mockUser);
    const mockProfile: UserProfile = {
      ...defaultProfile,
      email,
      fullName: name,
      skinType: "Sensitive",
      preferredFabric: "Organic Cotton",
      comfortScore: 96,
    };
    setProfile(mockProfile);
    try {
      localStorage.setItem("style_ai_demo_user", JSON.stringify(mockUser));
      localStorage.setItem("style_ai_demo_profile", JSON.stringify(mockProfile));
    } catch {}
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const p = await getUserProfile(auth.currentUser.uid);
      setProfile(p);
    }
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("style_ai_demo_user");
      const savedProfile = localStorage.getItem("style_ai_demo_profile");
      if (savedUser && savedProfile) {
        setUser(JSON.parse(savedUser));
        setProfile(JSON.parse(savedProfile));
        setLoading(false);
      }
    } catch {}
  }, []);

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
