import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "electronics" },
      update: {},
      create: {
        name: "Electronics",
        slug: "electronics",
        description: "Gadgets, devices, and tech accessories",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
      },
    }),
    prisma.category.upsert({
      where: { slug: "clothing" },
      update: {},
      create: {
        name: "Clothing",
        slug: "clothing",
        description: "Apparel for men, women, and children",
        image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800",
      },
    }),
    prisma.category.upsert({
      where: { slug: "home-garden" },
      update: {},
      create: {
        name: "Home & Garden",
        slug: "home-garden",
        description: "Furniture, decor, and outdoor essentials",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
      },
    }),
    prisma.category.upsert({
      where: { slug: "sports" },
      update: {},
      create: {
        name: "Sports",
        slug: "sports",
        description: "Equipment and gear for every sport",
        image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800",
      },
    }),
    prisma.category.upsert({
      where: { slug: "books" },
      update: {},
      create: {
        name: "Books",
        slug: "books",
        description: "Fiction, non-fiction, and educational titles",
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
      },
    }),
  ]);

  const [electronics, clothing, homeGarden, sports, books] = categories;

  // Seed products
  const products = [
    {
      name: "Wireless Noise-Cancelling Headphones",
      slug: "wireless-noise-cancelling-headphones",
      description:
        "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.",
      price: 299.99,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        "https://images.unsplash.com/photo-1546435770-a3e736ab1108?w=800",
      ],
      stock: 50,
      featured: true,
      categoryId: electronics.id,
    },
    {
      name: "4K Ultra HD Smart TV 55\"",
      slug: "4k-ultra-hd-smart-tv-55",
      description:
        "Immersive 55-inch 4K display with HDR, built-in streaming apps, and voice control.",
      price: 799.99,
      images: [
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800",
      ],
      stock: 20,
      featured: true,
      categoryId: electronics.id,
    },
    {
      name: "Mechanical Gaming Keyboard",
      slug: "mechanical-gaming-keyboard",
      description:
        "RGB backlit mechanical keyboard with tactile switches, N-key rollover, and programmable macros.",
      price: 129.99,
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
      ],
      stock: 75,
      featured: false,
      categoryId: electronics.id,
    },
    {
      name: "Smartphone Pro Max",
      slug: "smartphone-pro-max",
      description:
        "Latest flagship smartphone with 200MP camera, 5G connectivity, and all-day battery life.",
      price: 1099.99,
      images: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      ],
      stock: 35,
      featured: true,
      categoryId: electronics.id,
    },
    {
      name: "Classic Leather Jacket",
      slug: "classic-leather-jacket",
      description:
        "Genuine leather jacket with a timeless design, quilted lining, and multiple pockets.",
      price: 249.99,
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
      ],
      stock: 30,
      featured: true,
      categoryId: clothing.id,
    },
    {
      name: "Running Shoes Elite",
      slug: "running-shoes-elite",
      description:
        "Lightweight performance running shoes with responsive cushioning and breathable mesh upper.",
      price: 119.99,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      ],
      stock: 60,
      featured: false,
      categoryId: clothing.id,
    },
    {
      name: "Premium Cotton T-Shirt",
      slug: "premium-cotton-t-shirt",
      description:
        "Soft, breathable 100% organic cotton tee. Available in a wide range of colors.",
      price: 29.99,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      ],
      stock: 200,
      featured: false,
      categoryId: clothing.id,
    },
    {
      name: "Modern Sofa Set",
      slug: "modern-sofa-set",
      description:
        "Elegant 3-piece sofa set with high-density foam cushions and durable fabric upholstery.",
      price: 1299.99,
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
      ],
      stock: 10,
      featured: true,
      categoryId: homeGarden.id,
    },
    {
      name: "Ceramic Plant Pot Set",
      slug: "ceramic-plant-pot-set",
      description:
        "Set of 3 handcrafted ceramic pots in gradient earth tones. Perfect for succulents and herbs.",
      price: 39.99,
      images: [
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800",
      ],
      stock: 80,
      featured: false,
      categoryId: homeGarden.id,
    },
    {
      name: "Professional Yoga Mat",
      slug: "professional-yoga-mat",
      description:
        "Non-slip, eco-friendly yoga mat with alignment lines, 6mm thickness, and carry strap.",
      price: 59.99,
      images: [
        "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800",
      ],
      stock: 45,
      featured: false,
      categoryId: sports.id,
    },
    {
      name: "Adjustable Dumbbell Set",
      slug: "adjustable-dumbbell-set",
      description:
        "Space-saving adjustable dumbbells ranging from 5 to 52.5 lbs per dumbbell. Quick-select dial.",
      price: 349.99,
      images: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
      ],
      stock: 25,
      featured: true,
      categoryId: sports.id,
    },
    {
      name: "The Art of Clean Code",
      slug: "the-art-of-clean-code",
      description:
        "A practical guide to writing maintainable, readable, and efficient software.",
      price: 34.99,
      images: [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
      ],
      stock: 100,
      featured: false,
      categoryId: books.id,
    },
    {
      name: "Atomic Habits",
      slug: "atomic-habits",
      description:
        "An easy and proven way to build good habits and break bad ones by James Clear.",
      price: 19.99,
      images: [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
      ],
      stock: 150,
      featured: true,
      categoryId: books.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  // Seed admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Seed regular user
  const userPassword = await bcrypt.hash("user123", 12);
  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "user@example.com",
      password: userPassword,
      role: "USER",
    },
  });

  console.log("✅ Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
