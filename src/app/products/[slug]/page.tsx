import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatPrice, serializeData } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import StarRating from "@/components/products/StarRating";
import Badge from "@/components/ui/Badge";
import ProductCard from "@/components/products/ProductCard";
import type { Product, Category, Review } from "@/types";

export const dynamic = "force-dynamic";

type ProductDetail = Product & {
  category: Category;
  reviews: (Review & { user: { id: string; name: string; image: string | null } })[];
  _count: { favorites: number; reviews: number };
};

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const raw = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { favorites: true, reviews: true } },
    },
  });

  if (!raw) notFound();

  const product = serializeData<ProductDetail>(raw);

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

  const relatedRaw = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: { select: { rating: true } },
      _count: { select: { favorites: true, reviews: true } },
    },
  });

  const related = serializeData<Product[]>(relatedRaw);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-primary-600">Products</Link>
        <ChevronRight className="h-4 w-4" />
        {product.category && (
          <>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-primary-600">
              {product.category.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative h-[480px] rounded-2xl overflow-hidden bg-gray-100">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-6xl">📦</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1).map((img, i) => (
                <div key={i} className="relative h-24 rounded-xl overflow-hidden bg-gray-100">
                  <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover" sizes="100px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {product.category && (
            <Link href={`/categories/${product.category.slug}`} className="text-sm font-medium text-primary-600 hover:underline">
              {product.category.name}
            </Link>
          )}

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
            <FavoriteButton productId={product.id} className="shrink-0" />
          </div>

          {/* Rating */}
          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={avgRating} size="md" />
              <span className="text-sm text-gray-500">
                {avgRating.toFixed(1)} ({product._count.reviews} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="text-4xl font-bold text-gray-900">{formatPrice(product.price)}</div>

          {/* Stock */}
          <div>
            {product.stock === 0 ? (
              <Badge variant="danger">Out of Stock</Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="warning">Only {product.stock} left in stock</Badge>
            ) : (
              <Badge variant="success">In Stock ({product.stock} available)</Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Add to cart */}
          <AddToCartButton product={product} />
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Customer Reviews ({product._count.reviews})
          </h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                      {review.user?.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{review.user?.name}</span>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                {review.comment && <p className="text-gray-600 text-sm mt-2">{review.comment}</p>}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
