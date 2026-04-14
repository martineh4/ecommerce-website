export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  featured: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  reviews?: Review[];
  _count?: { reviews: number; favorites: number };
  averageRating?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  image: string | null;
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  user?: User;
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  product?: Product;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user?: Pick<User, "id" | "name" | "image">;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface CartItemLocal {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export interface ProductFilters {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "popular";
  page?: number;
  limit?: number;
}
