// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function toAnnual(monthly: number): number {
  return monthly * 12;
}
export function savingsPercent(savings: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((savings / total) * 100));
}
export function generateAuditId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function pluralise(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  return plural ?? `${word}s`;
}