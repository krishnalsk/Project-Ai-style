"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Spinner from "./Spinner";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner label="Authenticating session..." />
      </div>
    );
  }

  if (!user) {
    // Show spinner while redirect happens — no flash of blank content
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner label="Redirecting to login..." />
      </div>
    );
  }

  return <>{children}</>;
}
