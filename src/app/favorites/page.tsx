import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/products/ProductCard";
import { Heart } from "lucide-react";
import Link from "next/link";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
          reviews: { select: { rating: true } },
          _count: { select: { favorites: true, reviews: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (favorites.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h1>
        <p className="text-gray-500 mb-8">
          Click the heart on any product to save it here.
        </p>
        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
        <p className="text-gray-500 mt-1">{favorites.length} saved products</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((fav) => (
          <ProductCard key={fav.id} product={fav.product} />
        ))}
      </div>
    </div>
  );
}
