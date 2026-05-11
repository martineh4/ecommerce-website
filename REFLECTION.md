# Project Reflection — ShopNext

## Background

I built ShopNext as a portfolio project to prove full-stack capability beyond what I could demonstrate through coursework. The goal was something with real complexity: multi-user auth, relational data, stateful client-side behaviour, and deployment — not just a CRUD tutorial with a different coat of paint.

---

## Key Technical Decisions

### Deciding where the server/client boundary sits

The most interesting design challenge in this project was learning to think in Next.js App Router terms — specifically, which components should be Server Components and which need to be Client Components.

My default assumption coming in was "React components are client-side" because that's what I knew. App Router inverts that: components run on the server unless you opt out with `"use client"`. Understanding why that matters — and not just cargo-culting the directive whenever something broke — took real effort.

The pattern I landed on: anything that reads data lives on the server; anything that reacts to user interaction lives on the client. Concretely, the product listing page, order history, and category pages are all async server components that query the database directly. The cart, the favourite button, and the filter sidebar are client components because they need browser APIs, session hooks, or router state.

The trickiest case was `ProductFilters`. It reads URL search params and updates the URL on every input — which means it must be a Client Component even though it doesn't own any persistent state. It reads from the URL and writes back to it, letting the server component above it re-render with new data. Getting comfortable with that pattern — client components as a thin input layer driving server re-renders — was probably the biggest conceptual shift the project forced.

### Keeping the cart client-side

I spent real time deciding where cart state should live. The options were: always fetch from the database, always use local state, or some hybrid.

I chose Zustand with `persist` middleware, which keeps the cart in `localStorage`. That means the cart page loads instantly with no server round-trip and survives page refreshes without the user losing their items. The trade-off is that the client can get out of sync — if stock runs out while items are sitting in someone's cart, the client won't know until checkout. I accepted that trade-off deliberately: the server always re-validates stock inside a database transaction when an order is placed, so overselling isn't actually possible. The client-side cart is a UX convenience; the database is the source of truth.

One decision I'm pleased with: order prices are fetched from the database at checkout time, not taken from the client's cart store. This prevents a user from manipulating the price field in a request and getting a product for less than it costs.

### Making checkout atomic

The order creation endpoint wraps four things in a single Prisma transaction: stock validation, order creation, stock decrement, and cart clearance. Any one of those failing rolls back all of them. Early on I had the order create before the stock check, which would have meant partially committed state on failure. Moving the validation before the write was the right call and something I wouldn't have thought to do without understanding what a transaction is actually for.

---

## Challenges

### Keeping client and server state consistent

By far the hardest thing to reason about was the relationship between the Zustand cart store, the database cart table, and the checkout flow. These are three representations of the same data that can drift apart.

The specific case that caught me out: the `PATCH /api/cart` handler calls `prisma.cartItem.update`, which throws a Prisma `P2025` error if the item doesn't exist — for example, if the same item was deleted in a different tab between when the client read the cart and when it sent the update. Without handling that case, the user gets a 500 with no explanation. The fix was catching `PrismaClientKnownRequestError` and checking the error code before returning a 404. That was the moment I understood that error codes in database libraries are worth knowing — they let you give a useful response instead of a generic server error.

More broadly, reasoning about what happens when the same user has the app open in multiple tabs — with potentially different cart states — was something I hadn't had to think about in previous projects. There's no clean solution, but being explicit about which layer is authoritative (database at checkout, client store everywhere else) made the tradeoffs easier to reason about.

### Build-time failures on Vercel

When I first deployed, the build failed because `prisma.product.findMany` was being called at module level — code that runs during `next build`, not at request time, when the database credentials aren't available. I hadn't thought about the distinction between build time and runtime before.

The fix was a combination of guarding the environment variable check with `process.env.NEXT_PHASE` (Next.js sets this to `"phase-production-build"` during `next build`) and making sure database queries only happen inside request handlers or async server component functions. But understanding *why* the build failed — that Next.js pre-renders pages and evaluates module-level code in the process — was worth more than the fix itself.

---

## What I'd Do Differently

**Add tests from the beginning.** I ended up manually re-checking things every time I touched the cart or order logic. The checkout flow alone — stock validation, transaction rollback, price computation — has enough edge cases that even a handful of integration tests would have caught regressions faster than re-clicking through the UI. Writing tests after the fact is harder; the architecture doesn't always make it easy, and you're less motivated to write them once the feature already "works."

If I did this again, I'd write at minimum one integration test per API route as I built each one. Not for coverage metrics — just to have a reliable way to re-run the important paths when I changed something nearby.

---

## What I Learned

**Security lives at the data layer.** Early on my mental model of "secure" was "check if the user is logged in." By the end, I understood that auth is just the entry point. Every database query needs to scope its results to the authenticated user's ID. Every write needs to validate that the referenced records exist and belong to that user. Trusting client-supplied data — like a price field in a checkout request — is a vulnerability even when the user is authenticated.

**TypeScript strictness pays off later.** Prisma returns `Decimal` objects for numeric fields, not plain numbers. NextAuth's `Session` type doesn't include `id` or `role` by default. Hitting those type errors early and fixing them properly — module augmentation, the `serializeData` helper — meant I never ran into mysterious runtime type mismatches in the browser. Leaning into the type system rather than reaching for `any` made the codebase easier to change with confidence.

**The App Router model is worth understanding deeply.** It took me longer than I expected to internalise the difference between server and client components, and why it matters. Once it clicked, a lot of other decisions became clearer: why sessions are read on the server, why the cart has to live in a client store, why `router.refresh()` is needed after login. The mental model is a prerequisite for making good decisions in Next.js — not just getting things to compile.
