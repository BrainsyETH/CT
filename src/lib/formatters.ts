/**
 * Format a date string to "MMM d, yyyy" format (e.g., "Nov 11, 2022")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a number using compact notation (e.g., $8.7B, $350M)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a number using compact notation without currency symbol
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Extract year from ISO date string
 */
export function getYear(dateString: string): number {
  return new Date(dateString).getFullYear();
}
