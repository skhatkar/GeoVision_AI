"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

// Global toast event system
const toastListeners: ((toast: ToastMessage) => void)[] = [];

export function toast(msg: Omit<ToastMessage, "id">) {
  const id = Math.random().toString(36).slice(2);
  const payload: ToastMessage = { id, duration: 4000, ...msg };
  toastListeners.forEach((fn) => fn(payload));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (t: ToastMessage) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => remove(t.id), t.duration ?? 4000);
    };
    toastListeners.push(handler);
    return () => {
      const idx = toastListeners.indexOf(handler);
      if (idx !== -1) toastListeners.splice(idx, 1);
    };
  }, [remove]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />,
    error: <AlertCircle size={16} className="text-destructive shrink-0" />,
    info: <Info size={16} className="text-primary shrink-0" />,
    warning: <AlertTriangle size={16} className="text-amber-500 shrink-0" />,
  };

  const borders: Record<ToastType, string> = {
    success: "border-emerald-500/30 bg-emerald-500/10",
    error: "border-destructive/30 bg-destructive/10",
    info: "border-primary/30 bg-primary/10",
    warning: "border-amber-500/30 bg-amber-500/10",
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl
            min-w-[280px] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300
            ${borders[t.type]}
          `}
        >
          {icons[t.type]}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground">{t.title}</p>
            {t.description && (
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{t.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => remove(t.id)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-0.5"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
