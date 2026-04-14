import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, CheckCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning",
  PROCESSING: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
};

const statusSteps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, images: true, slug: true } },
        },
      },
    },
  });

  if (!order) notFound();

  const currentStep = order.status === "CANCELLED" ? -1 : statusSteps.indexOf(order.status as typeof statusSteps[number]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/orders" className="hover:text-primary-600">Orders</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">#{order.id.slice(-8).toUpperCase()}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-500 text-sm mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })}
          </p>
        </div>
        <Badge variant={statusVariant[order.status] ?? "default"}>{order.status}</Badge>
      </div>

      {/* Progress tracker */}
      {order.status !== "CANCELLED" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i <= currentStep ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {i < currentStep ? <CheckCircle className="h-5 w-5" /> : i + 1}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 text-center hidden sm:block">{step}</span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? "bg-primary-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Items Ordered</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <Link href={`/products/${item.product.slug}`}>
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {item.product.images[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">📦</div>
                  )}
                </div>
              </Link>
              <div className="flex-1">
                <Link href={`/products/${item.product.slug}`} className="font-medium text-gray-900 hover:text-primary-600 text-sm">
                  {item.product.name}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatPrice(Number(item.price) * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 text-sm">
        <h2 className="font-semibold text-gray-900 mb-2">Order Summary</h2>
        {order.address && (
          <div className="flex justify-between text-gray-600">
            <span>Delivery Address</span>
            <span className="text-right max-w-xs">{order.address}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(order.total)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="text-green-600">Free</span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between font-bold text-gray-900 text-base">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
