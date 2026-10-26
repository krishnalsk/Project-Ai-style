"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User, getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, UserProfile, saveUserProfile, defaultProfile, logout as firebaseLogout } from "@/lib/firebaseAuth";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  demoLogin: (name?: string, email?: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  updateProfile: async () => {},
  demoLogin: () => {},
  logout: async () => {},
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

  const logoutUser = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("style_ai_demo_user");
        localStorage.removeItem("style_ai_demo_profile");
      }
      setUser(null);
      setProfile(null);
      await firebaseLogout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const p = await getUserProfile(auth.currentUser.uid);
      setProfile(p);
    }
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    setProfile((prev) => {
      const merged: UserProfile = { ...(prev || defaultProfile), ...updated };
      if (user?.uid) {
        saveUserProfile(user.uid, merged).catch(console.error);
      }
      try {
        localStorage.setItem("style_ai_demo_profile", JSON.stringify(merged));
      } catch {}
      return merged;
    });
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("style_ai_demo_user");
      const savedProfile = localStorage.getItem("style_ai_demo_profile");
      if (savedUser && savedProfile) {
        const parsedUser = JSON.parse(savedUser);
        const parsedProfile = JSON.parse(savedProfile);
        queueMicrotask(() => {
          setUser(parsedUser);
          setProfile(parsedProfile);
          setLoading(false);
        });
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
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const p = await getUserProfile(firebaseUser.uid);
          setProfile(p);
        } catch {
          setProfile(null);
        }
      } else {
        // If not a firebase user, check if we have demo session in localStorage
        try {
          const savedUser = localStorage.getItem("style_ai_demo_user");
          const savedProfile = localStorage.getItem("style_ai_demo_profile");
          if (savedUser && savedProfile) {
            setUser(JSON.parse(savedUser));
            setProfile(JSON.parse(savedProfile));
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, updateProfile, demoLogin, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

