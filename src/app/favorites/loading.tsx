import Skeleton from "@/components/ui/Skeleton";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

export default function FavoritesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
