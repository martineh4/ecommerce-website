"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { CartItemLocal } from "@/types";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: CartItemLocal;
}

export default function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200 last:border-0">
      {/* Image */}
      <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-2xl">📦</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-sm text-primary-600 font-semibold mt-0.5">{formatPrice(item.price)}</p>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="p-1.5 hover:bg-gray-100 transition-colors"
            >
              <Minus className="h-3.5 w-3.5 text-gray-600" />
            </button>
            <span className="px-3 text-sm font-medium text-gray-900">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className="p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5 text-gray-600" />
            </button>
          </div>

          <button
            onClick={() => removeItem(item.productId)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-sm font-semibold text-gray-900 shrink-0">
        {formatPrice(item.price * item.quantity)}
      </div>
    </div>
  );
}
