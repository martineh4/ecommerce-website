import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Prisma returns Decimal objects for numeric DB fields. These are not plain
// numbers and will fail TypeScript checks in strict/build mode. This helper
// serialises any Prisma result to a plain JS object, converting every Decimal
// to a number so downstream components receive the expected types.
function decimalReplacer(_key: string, value: unknown): unknown {
  if (
    value !== null &&
    typeof value === "object" &&
    "toNumber" in value &&
    typeof (value as { toNumber: unknown }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return value;
}

export function serializeData<T>(data: unknown): T {
  return JSON.parse(JSON.stringify(data, decimalReplacer));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(price));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
