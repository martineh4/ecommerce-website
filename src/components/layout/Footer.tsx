import Link from "next/link";
import { Package } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <Package className="h-6 w-6 text-primary-400" />
              ShopNext
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              Your one-stop destination for electronics, fashion, home goods, and more. Quality products at great prices.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-white transition-colors">Featured</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">Orders</Link></li>
              <li><Link href="/favorites" className="hover:text-white transition-colors">Favorites</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          &copy; {new Date().getFullYear()} ShopNext. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
