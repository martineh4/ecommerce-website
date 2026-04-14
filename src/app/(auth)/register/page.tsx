"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Registration failed.");
      setLoading(false);
      return;
    }

    // Auto sign in
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push("/");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary-600">
            <Package className="h-7 w-7" />
            ShopNext
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Create account</h1>
        <p className="text-center text-gray-500 mb-8">Join ShopNext today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Full Name"
            placeholder="John Doe"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Input
            id="confirm"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            required
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
