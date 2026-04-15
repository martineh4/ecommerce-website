import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Prisma returns Decimal objects for numeric DB fields. These are not plain
// numbers and will fail TypeScript checks in strict/build mode. This helper
// serialises any Prisma result to a plain JS object, converting every Decimal
// to a number so downstream components receive the expected types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decimalReplacer(_key: string, value: any) {
  if (value !== null && typeof value === "object" && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeData<T>(data: any): T {
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
