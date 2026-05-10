// No persist middleware — toasts are ephemeral feedback and should not survive
// a page reload.
import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message) => {
    // Random base-36 ID avoids collisions when multiple toasts fire in quick
    // succession; a simple counter would reset to 0 on module reload in dev.
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message }] }));
    // Close over `id` so the timeout removes exactly this toast even if others
    // were added or removed while the timer was running.
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
