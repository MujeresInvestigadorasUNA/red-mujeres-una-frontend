import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function normalizeMediaUrl(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return /^(https?:\/\/|\/|data:)/i.test(trimmed) ? trimmed : null;
  }

  if (value && typeof value === "object") {
    const candidate = value.url || value.signed_url || value.photo || value.src || value.href;
    return normalizeMediaUrl(candidate);
  }

  return null;
}
