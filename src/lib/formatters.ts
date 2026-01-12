const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Format a date string to "MMM d, yyyy" format (e.g., "Nov 11, 2022")
 * Parses YYYY-MM-DD directly without timezone conversion.
 */
export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
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
 * Format funds lost value - checks for valid number first, then falls back to "Unknown"
 */
export function formatFundsLost(value: number | undefined): string {
  // Check if value is a valid number
  if (typeof value === "number" && !isNaN(value) && isFinite(value)) {
    return formatCurrency(value);
  }
  // Fallback to Unknown if no valid value
  return "Unknown";
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
 * Extract year from ISO date string (YYYY-MM-DD)
 */
export function getYear(dateString: string): number {
  return parseInt(dateString.split('-')[0], 10);
}
