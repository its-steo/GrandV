import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: string | number | null | undefined,
  currency: string = "KSh"
): string {
  if (amount == null) return `${currency} 0.00`;  // Handle null or undefined

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `${currency} 0.00`;

  return `${currency} ${numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value: string | number): string {
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value
  if (isNaN(numValue)) return "0"

  return numValue.toLocaleString("en-US")
}

export function getImageUrl(imagePath: string | null | undefined): string {
  const pathStr = imagePath?.toString() || ""

  if (!pathStr || pathStr.trim() === "") {
    // Use external service for fallback (adjust size as needed)
    return "https://placehold.co/300x300?text=No+Image&font=montserrat"
  }

  if (pathStr.startsWith("http")) {
    return pathStr
  }

  // Prepend the backend URL for relative paths (this remains unchanged)
  return `https://grandview-shop.onrender.com${pathStr}`
  //return `http://localhost:8000${pathStr}`
}