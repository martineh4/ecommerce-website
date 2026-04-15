import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serializeData } from "@/lib/utils";
import OrderCard from "@/components/orders/OrderCard";
import type { Order } from "@/types";
import { PackageX } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const orders = serializeData<Order[]>(
    await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, images: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  );

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <PackageX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h1>
        <p className="text-gray-500 mb-8">Your order history will appear here.</p>
        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
