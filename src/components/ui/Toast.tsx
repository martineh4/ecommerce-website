"use client";

import { X, ShoppingCart } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg pointer-events-auto animate-fade-in min-w-[220px]"
        >
          <ShoppingCart className="h-4 w-4 text-primary-400 shrink-0" />
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
