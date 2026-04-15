"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import Button from "@/components/ui/Button";

interface Product {
  id: string;
  name: string;
  price: number | { toString(): string };
  images: string[];
  stock: number;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0] ?? "",
      quantity: qty,
      stock: product.stock,
    });
    addToast(`${product.name} added to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 pt-2">
      {/* Quantity selector */}
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="p-2.5 hover:bg-gray-100 transition-colors"
        >
          <Minus className="h-4 w-4 text-gray-600" />
        </button>
        <span className="px-4 text-sm font-medium text-gray-900">{qty}</span>
        <button
          onClick={() => setQty(Math.min(product.stock, qty + 1))}
          disabled={qty >= product.stock}
          className="p-2.5 hover:bg-gray-100 transition-colors disabled:opacity-40"
        >
          <Plus className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      <Button
        size="lg"
        onClick={handleAdd}
        disabled={product.stock === 0}
        className="flex-1"
      >
        <ShoppingCart className="h-5 w-5" />
        {added ? "Added!" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
}
