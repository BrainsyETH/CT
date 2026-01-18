const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Format a date string to "MMM d, yyyy" format (e.g., "Nov 11, 2022")
 * Parses YYYY-MM-DD directly without timezone conversion.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (typeof dateString !== "string") {
    return "";
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) {
    return dateString;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const monthName = MONTHS[month - 1];
  if (!monthName || !Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return dateString;
  }

  return `${monthName} ${day}, ${year}`;
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
export function getYear(dateString: string | null | undefined): number | null {
  if (typeof dateString !== "string") {
    return null;
  }

  const match = /^(\d{4})-/.exec(dateString);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  return Number.isFinite(year) ? year : null;
}
