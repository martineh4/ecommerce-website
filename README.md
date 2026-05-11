# ShopNext

A full-stack e-commerce web application built with Next.js 14 App Router, TypeScript, and PostgreSQL. Users can browse products, filter by category and price, manage a persistent shopping cart, place orders, save favourites, and leave reviews — all behind a secure JWT-based authentication system.

**Live demo:** [ecommerce-website-hs8zpg9q4-martineh4s-projects.vercel.app](https://ecommerce-website-hs8zpg9q4-martineh4s-projects.vercel.app)  
**Demo credentials:**
| Role | Email | Password |
|------|-------|----------|
| User | user@example.com | user123 |
| Admin | admin@example.com | admin123 |

---

## Features

- **Product catalogue** — search, filter by category and price range, sort by newest / price / popularity, paginated results
- **Product detail** — image gallery, stock status, star ratings, customer reviews, related products
- **Shopping cart** — persisted to `localStorage` via Zustand; survives page refresh without a server round-trip
- **Checkout** — address capture, stock validation, atomic order creation, automatic cart clear
- **Order history** — order list and detail pages with a live status progress tracker
- **Favourites / wishlist** — optimistic UI updates with server persistence
- **Authentication** — email/password register and login, JWT sessions, role-based access (USER / ADMIN)
- **Loading skeletons** — every data-fetching page shows a layout-matched skeleton while streaming
- **Error boundary** — a single root error component catches and recovers from page-level failures

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org) — App Router, Server Components, Server Actions |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 |
| Database | PostgreSQL (hosted on [Neon](https://neon.tech)) |
| ORM | [Prisma](https://prisma.io) v5 |
| Auth | [NextAuth.js](https://next-auth.js.org) v4 — credentials provider, JWT strategy |
| State | [Zustand](https://zustand-demo.pmnd.rs) v5 — cart and favourites with `persist` middleware |
| Validation | [Zod](https://zod.dev) — API route input schemas |
| Icons | [Lucide React](https://lucide.dev) |
| Deployment | [Vercel](https://vercel.com) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local or [Neon](https://neon.tech) free tier)
- npm

### 1 — Clone and install

```bash
git clone https://github.com/martineh4/ecommerce-website.git
cd ecommerce-website
npm install
```

### 2 — Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:pass@host/db?sslmode=require`) |
| `NEXTAUTH_SECRET` | Random secret for signing JWTs — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of the app (`http://localhost:3000` for local dev) |

### 3 — Set up the database

Push the Prisma schema and seed demo data:

```bash
npm run db:push     # create tables from schema.prisma
npm run db:seed     # populate with products, categories, and demo accounts
```

### 4 — Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other useful commands

```bash
npm run build       # production build
npm run lint        # ESLint
npm run db:studio   # Prisma Studio GUI for the database
npm run db:generate # regenerate Prisma client after schema changes
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/                # REST API endpoints (cart, orders, products, auth…)
│   ├── (auth)/             # Login and register pages (route group)
│   ├── products/           # Product list and detail pages
│   ├── categories/         # Category pages
│   ├── orders/             # Order history and detail pages
│   ├── favourites/         # Saved products page
│   ├── cart/               # Cart and checkout page
│   ├── error.tsx           # Root error boundary
│   └── loading.tsx         # Root loading skeleton
├── components/
│   ├── ui/                 # Reusable primitives (Button, Input, Badge, Skeleton…)
│   ├── products/           # ProductCard, ProductGrid, ProductFilters, StarRating
│   ├── cart/               # CartItem
│   ├── orders/             # OrderCard
│   ├── favourites/         # FavouriteButton
│   └── layout/             # Navbar, Footer, Providers
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Singleton Prisma client
│   ├── env.ts              # Runtime environment variable validation
│   └── utils.ts            # cn(), formatPrice(), serializeData()
├── store/
│   ├── cartStore.ts        # Zustand cart (persisted)
│   ├── favouritesStore.ts  # Zustand favourites (persisted)
│   └── toastStore.ts       # Zustand toast notifications
└── types/
    ├── index.ts            # Shared domain types
    └── next-auth.d.ts      # NextAuth session type augmentation
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Demo data seed script
```

---

## Security Notes

- Passwords are hashed with **bcrypt** (cost factor 12) before storage — plaintext is never persisted
- All authenticated API routes verify session via `getServerSession` before touching the database
- Order prices are fetched from the database at checkout time — client-supplied prices are ignored to prevent manipulation
- Input validation is enforced at every API boundary with **Zod** schemas
- Environment variable validation runs at startup and fails fast on missing secrets

---

## How AI Tools Were Used

This project was developed with **Claude Code** (Anthropic's CLI coding assistant) as a collaborative pair-programming tool throughout the development process. Specific tasks it assisted with:

- **Inline code comments** — generating "why" explanations for non-obvious decisions (JWT strategy rationale, Prisma singleton pattern, optimistic UI logic)
- **Error handling** — systematically auditing all API routes, identifying missing try/catch blocks, adding correct HTTP status codes, and discriminating between domain errors (400) and infrastructure errors (500)
- **Security audit** — identifying and fixing a price manipulation vulnerability in the checkout flow, adding missing product-existence checks before foreign-key writes, and enforcing stock limits on cart updates
- **TypeScript improvements** — replacing `any` annotations with properly narrowed `unknown` types and removing lint-suppression comments
- **Loading states** — generating page-matched skeleton components and `loading.tsx` / `error.tsx` files for every data-fetching route

All generated code was reviewed, understood, and intentionally included. AI assistance accelerated boilerplate-heavy work (skeleton layouts, repetitive error wrappers) while I retained ownership of architecture and business logic decisions.

---

## Deployment

The app is configured for zero-setup deployment on Vercel:

1. Import the repository in the [Vercel dashboard](https://vercel.com/new)
2. Add the three environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`) in **Settings → Environment Variables**
3. Deploy — `prisma generate` runs automatically via the `postinstall` script

For the database, [Neon](https://neon.tech) provides a generous free-tier PostgreSQL instance that integrates directly with Vercel.

---

## License

MIT
