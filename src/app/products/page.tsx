import { Suspense } from "react";
import prisma from "@/lib/prisma";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilters from "@/components/products/ProductFilters";
import { Prisma } from "@prisma/client";

interface SearchParams {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
  featured?: string;
}

async function getProducts(params: SearchParams) {
  const {
    search = "",
    category = "",
    minPrice,
    maxPrice,
    sort = "newest",
    page = "1",
    featured,
  } = params;

  const currentPage = Math.max(1, parseInt(page));
  const limit = 12;
  const skip = (currentPage - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(category && { category: { slug: category } }),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice ? { gte: new Prisma.Decimal(minPrice) } : {}),
            ...(maxPrice ? { lte: new Prisma.Decimal(maxPrice) } : {}),
          },
        }
      : {}),
    ...(featured === "true" ? { featured: true } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : sort === "popular"
      ? { favorites: { _count: "desc" } }
      : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: { select: { rating: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, totalPages: Math.ceil(total / limit), currentPage };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [{ products, total, totalPages, currentPage }, categories] = await Promise.all([
    getProducts(searchParams),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {searchParams.featured === "true" ? "Featured Products" : "All Products"}
        </h1>
        <p className="text-gray-500 mt-1">{total} products found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <Suspense>
            <ProductFilters categories={categories} />
          </Suspense>
        </div>

        {/* Product grid */}
        <div className="flex-1">
          <ProductGrid products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pg = i + 1;
                const params = new URLSearchParams(
                  Object.entries(searchParams).filter(([, v]) => v) as [string, string][]
                );
                params.set("page", String(pg));
                return (
                  <a
                    key={pg}
                    href={`/products?${params}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pg === currentPage
                        ? "bg-primary-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pg}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
