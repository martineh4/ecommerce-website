const required = ["DATABASE_URL", "NEXTAUTH_SECRET"] as const;

// Next.js executes module-level code at build time when pre-rendering pages,
// but Vercel doesn't inject secret env vars during the build phase — only at
// runtime. NEXT_PHASE is the official way to distinguish these two contexts.
if (process.env.NEXT_PHASE !== "phase-production-build") {
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(
        `Missing required environment variable: ${key}\n` +
          `Set it in your .env file (local) or Vercel dashboard (production).`
      );
    }
  }
}
