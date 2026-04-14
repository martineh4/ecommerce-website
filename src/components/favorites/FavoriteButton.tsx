"use client";

import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useFavoritesStore } from "@/store/favoritesStore";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
}

export default function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isFavorite = useFavoritesStore((s) => s.isFavorite(productId));
  const addFavorite = useFavoritesStore((s) => s.addFavorite);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/login");
      return;
    }

    if (isFavorite) {
      removeFavorite(productId);
      await fetch(`/api/favorites?productId=${productId}`, { method: "DELETE" });
    } else {
      addFavorite(productId);
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "p-2 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
        )}
      />
    </button>
  );
}
