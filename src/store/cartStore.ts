// "use client" is required because the persist middleware reads/writes
// localStorage, which only exists in the browser.
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItemLocal } from "@/types";

interface CartState {
  items: CartItemLocal[];
  addItem: (item: CartItemLocal) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  // persist keeps the cart alive across page refreshes and new tabs without
  // requiring a server round-trip for unauthenticated browsing.
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  // Cap at available stock so the client never requests more
                  // units than the server can fulfil.
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        // Treat quantity ≤ 0 as a removal so decrement buttons on the last
        // item don't leave a zero-quantity ghost in the cart.
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      // total and itemCount are functions rather than stored values because
      // Zustand doesn't recompute derived state automatically — storing them
      // as plain numbers would go stale after every items mutation.
      total: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    { name: "cart-storage" }
  )
);
