"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  productIds: string[];
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  setFavorites: (productIds: string[]) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Store only IDs, not full product objects. Product data can change (price,
      // name) and would become stale; IDs stay stable and keep localStorage small.
      productIds: [],

      addFavorite: (productId) => {
        set((state) => ({
          // Set dedup guards against double-clicks or concurrent calls adding
          // the same ID twice before the async API request completes.
          productIds: Array.from(new Set([...state.productIds, productId])),
        }));
      },

      removeFavorite: (productId) => {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        }));
      },

      isFavorite: (productId) => {
        return get().productIds.includes(productId);
      },

      // setFavorites is called on login to hydrate the store from the server,
      // replacing the anonymous guest state with the user's real favorites.
      setFavorites: (productIds) => {
        set({ productIds });
      },
    }),
    { name: "favorites-storage" }
  )
);
