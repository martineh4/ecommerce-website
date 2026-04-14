import Link from "next/link";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning",
  PROCESSING: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
};

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <Link href={`/orders/${order.id}`} className="block group">
      <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Order ID</p>
            <p className="font-mono text-sm font-medium text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
          </div>
          <Badge variant={statusVariant[order.status] ?? "default"}>{order.status}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium text-gray-900 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Items</p>
            <p className="font-medium text-gray-900 mt-0.5">{order.items?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-gray-500">Total</p>
            <p className="font-bold text-gray-900 mt-0.5">{formatPrice(order.total)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
