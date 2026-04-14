import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";
import ProductGrid from "@/components/products/ProductGrid";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: { _count: { select: { products: true } } },
  });

  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { categoryId: category.id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: { select: { rating: true } },
      _count: { select: { favorites: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/categories" className="hover:text-primary-600">Categories</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="text-gray-500 mt-2">{category.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-1">{category._count.products} products</p>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
