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
      productIds: [],

      addFavorite: (productId) => {
        set((state) => ({
          productIds: [...new Set([...state.productIds, productId])],
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

      setFavorites: (productIds) => {
        set({ productIds });
      },
    }),
    { name: "favorites-storage" }
  )
);
