import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export const getMetricValueColor = (key, val) => {
  const lowerKey = key.toLowerCase();
  if (lowerKey === 'entropy' || lowerKey === 'scrutiny') {
    return val > 10 ? 'text-red-400/90' : val < 10 ? 'text-cyan-400' : 'text-gray-200';
  }
  return val > 10 ? 'text-cyan-400' : val < 10 ? 'text-red-400/90' : 'text-gray-200';
}

export const getEffectColor = (key, delta) => {
  const lowerKey = key.toLowerCase();
  if (lowerKey === 'entropy' || lowerKey === 'scrutiny') {
    return delta > 0 ? 'text-red-400' : 'text-green-400';
  }
  return delta > 0 ? 'text-green-400' : 'text-red-400';
}