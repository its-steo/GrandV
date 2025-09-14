import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: string | number, currency = "KSH"): string {
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
  if (isNaN(numAmount)) return `${currency} 0.00`

  return `${currency} ${numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatNumber(value: string | number): string {
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value
  if (isNaN(numValue)) return "0"

  return numValue.toLocaleString("en-US")
}
