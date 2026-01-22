import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isPHI(text: string): boolean {
  // Simple heuristic to detect potential PHI patterns
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
    /\b[A-Z]{2}\d{6}\b/, // Client ID pattern
    /\bpatient\s+(name|id|information|data)\b/i,
    /\bclient\s+(name|id|diagnosis|medical|condition)\b/i,
    /\bPHI\b/i,
    /\bprotected\s+health\s+information\b/i,
    /\bmedicaid\s+id\b/i,
    /\bdate\s+of\s+birth\b/i,
    /\bDOB\b/i,
  ];

  return phiPatterns.some((pattern) => pattern.test(text));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
