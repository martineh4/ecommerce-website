import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones } from "lucide-react";
import prisma from "@/lib/prisma";
import { serializeData } from "@/lib/utils";
import ProductCard from "@/components/products/ProductCard";
import CategoryCard from "@/components/categories/CategoryCard";
import Button from "@/components/ui/Button";
import type { Product, Category } from "@/types";

async function getFeaturedData() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      take: 4,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: { select: { rating: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      take: 4,
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
  ]);
  return serializeData<{ products: Product[]; categories: Category[] }>({ products, categories });
}

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
  { icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: ShieldCheck, title: "Secure Checkout", desc: "SSL encrypted payments" },
  { icon: Headphones, title: "24/7 Support", desc: "We're always here" },
];

export default async function HomePage() {
  const { products, categories } = await getFeaturedData();

  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              New Arrivals 2025
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Shop Smarter,<br />Live Better
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Discover thousands of products across electronics, fashion, home & garden, sports, and more — all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100 font-semibold">
                  Shop Now <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-2 bg-primary-50 rounded-lg shrink-0">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-500 mt-1">Browse our wide selection of product categories</p>
          </div>
          <Link href="/categories" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500 mt-1">Hand-picked favorites from our collection</p>
          </div>
          <Link href="/products?featured=true" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-10 md:p-16 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to find your next favorite?</h2>
          <p className="text-white/80 mb-8 text-lg">
            Explore thousands of products with amazing deals.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100 font-semibold">
              Start Shopping <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
