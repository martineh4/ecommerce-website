const required = ["DATABASE_URL", "NEXTAUTH_SECRET"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Set it in your .env file (local) or Vercel dashboard (production).`
    );
  }
}
