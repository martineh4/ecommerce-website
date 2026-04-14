"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import StarRating from "./StarRating";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0] ?? "",
      quantity: 1,
      stock: product.stock,
    });
  };

  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-lg transition-shadow duration-200">
        {/* Image */}
        <div className="relative h-64 bg-gray-100 overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.featured && <Badge variant="info">Featured</Badge>}
            {product.stock === 0 && <Badge variant="danger">Out of Stock</Badge>}
            {product.stock > 0 && product.stock <= 5 && (
              <Badge variant="warning">Only {product.stock} left</Badge>
            )}
          </div>

          {/* Favorite */}
          <div className="absolute top-3 right-3">
            <FavoriteButton productId={product.id} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {product.category && (
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {product.category.name}
            </p>
          )}
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>

          {avgRating > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <StarRating rating={avgRating} />
              <span className="text-xs text-gray-500">({product.reviews?.length})</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="shrink-0"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
