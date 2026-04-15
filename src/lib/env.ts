const required = ["DATABASE_URL", "NEXTAUTH_SECRET"] as const;

// Only validate at runtime (not during next build).
// NEXT_PHASE is set to 'phase-production-build' during `next build`.
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
