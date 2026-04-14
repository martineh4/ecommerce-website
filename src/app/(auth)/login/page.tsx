"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary-600">
            <Package className="h-7 w-7" />
            ShopNext
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Welcome back</h1>
        <p className="text-center text-gray-500 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Create one
            </Link>
          </p>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-600">Demo accounts:</p>
          <p>User: user@example.com / user123</p>
          <p>Admin: admin@example.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
