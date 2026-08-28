"use client";
import React, { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: string; message: string; type: "success" | "error" | "info" };

const ToastContext = createContext<{ show: (msg: string, type?: Toast["type"]) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={`px-4 py-3 rounded-2xl text-sm font-semibold shadow-lg border backdrop-blur pointer-events-auto ${
              t.type === "success"
                ? "bg-emerald-600 text-white border-emerald-500"
                : t.type === "error"
                ? "bg-red-600 text-white border-red-500"
                : "bg-slate-900 text-white border-slate-800"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
