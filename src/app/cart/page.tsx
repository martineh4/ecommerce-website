"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import CartItem from "@/components/cart/CartItem";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cartTotal = total();

  const handleCheckout = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (!address.trim()) {
      setError("Please enter a delivery address.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Checkout failed.");
        return;
      }

      const order = await res.json();
      clearCart();
      router.push(`/orders/${order.id}`);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some products to get started!</p>
        <Link href="/products">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
            <div className="pt-4">
              <button
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Clear cart
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">{cartTotal >= 50 ? "Free" : formatPrice(5.99)}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{formatPrice(cartTotal >= 50 ? cartTotal : cartTotal + 5.99)}</span>
              </div>
            </div>

            <Input
              label="Delivery Address"
              placeholder="123 Main St, City, State"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              error={error}
            />

            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              loading={loading}
            >
              {session ? "Place Order" : "Sign In to Checkout"}
            </Button>

            {cartTotal < 50 && (
              <p className="text-xs text-center text-gray-500">
                Add {formatPrice(50 - cartTotal)} more for free shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
