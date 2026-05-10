import Skeleton from "@/components/ui/Skeleton";
import { OrderCardSkeleton } from "@/components/ui/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
