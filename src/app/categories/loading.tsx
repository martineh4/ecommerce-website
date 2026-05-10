import Skeleton from "@/components/ui/Skeleton";
import { CategoryCardSkeleton } from "@/components/ui/Skeleton";

export default function CategoriesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
