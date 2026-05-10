import "next-auth";

// NextAuth's built-in Session.user only has name/email/image. Augmenting the
// module here adds `id` and `role` so TypeScript knows about the fields we
// attach in the session callback in lib/auth.ts.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      image?: string | null;
    };
  }
}
