"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Category } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Search, X } from "lucide-react";

interface ProductFiltersProps {
  categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    router.push("/products");
  };

  const hasFilters =
    searchParams.has("search") ||
    searchParams.has("category") ||
    searchParams.has("minPrice") ||
    searchParams.has("maxPrice") ||
    searchParams.has("sort");

  return (
    <aside className="w-full space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Filters</h2>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="mb-4 text-red-600 hover:text-red-700 hover:bg-red-50">
            <X className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div>
        <Input
          label="Search"
          placeholder="Search products..."
          leftIcon={<Search className="h-4 w-4" />}
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => updateFilter("search", e.target.value)}
        />
      </div>

      {/* Category */}
      <div>
        <Select
          label="Category"
          value={searchParams.get("category") ?? ""}
          onChange={(e) => updateFilter("category", e.target.value)}
          options={[
            { value: "", label: "All Categories" },
            ...categories.map((c) => ({ value: c.slug, label: c.name })),
          ]}
        />
      </div>

      {/* Sort */}
      <div>
        <Select
          label="Sort By"
          value={searchParams.get("sort") ?? "newest"}
          onChange={(e) => updateFilter("sort", e.target.value)}
          options={[
            { value: "newest", label: "Newest First" },
            { value: "price_asc", label: "Price: Low to High" },
            { value: "price_desc", label: "Price: High to Low" },
            { value: "popular", label: "Most Popular" },
          ]}
        />
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            defaultValue={searchParams.get("minPrice") ?? ""}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
          />
          <span className="text-gray-400">–</span>
          <Input
            type="number"
            placeholder="Max"
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
          />
        </div>
      </div>
    </aside>
  );
}
