"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  max = 5,
  size = "sm",
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            starSize,
            i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
            interactive && "cursor-pointer hover:scale-110 transition-transform"
          )}
          onClick={() => interactive && onRatingChange?.(i + 1)}
        />
      ))}
    </div>
  );
}
