/**
 * Brave Search API wrapper for crypto history discovery.
 *
 * Searches for cryptocurrency events that occurred on a given calendar date
 * using multiple query strategies to maximize coverage.
 */

// ============================================================================
// Types
// ============================================================================

export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
}

interface BraveWebResult {
  title?: string;
  url?: string;
  description?: string;
}

interface BraveSearchResponse {
  web?: {
    results?: BraveWebResult[];
  };
}

// ============================================================================
// Constants
// ============================================================================

const BRAVE_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search";
const FETCH_TIMEOUT_MS = 15_000;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ============================================================================
// Search Implementation
// ============================================================================

/**
 * Execute a single Brave Search query.
 */
async function executeBraveQuery(
  query: string,
  apiKey: string,
  count = 10
): Promise<BraveSearchResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({ q: query, count: String(count) });
    const response = await fetch(`${BRAVE_SEARCH_URL}?${params}`, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Brave Search HTTP ${response.status}: ${response.statusText}`);
    }

    const data: BraveSearchResponse = await response.json();
    const results = data.web?.results ?? [];

    return results
      .filter((r): r is Required<Pick<BraveWebResult, "title" | "url">> & BraveWebResult =>
        Boolean(r.title && r.url)
      )
      .map((r) => ({
        title: r.title!,
        url: r.url!,
        description: r.description ?? "",
      }));
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Search Brave for crypto history events on a given calendar date.
 *
 * Runs multiple queries to maximize coverage across all years (2014-present):
 * 1. General "on this day in crypto" query
 * 2. Broader crypto history query covering past years
 * 3. Current/recent year events for this date
 * 4. Twitter/X-specific query for real tweet embeds
 *
 * Returns deduplicated results (up to 40).
 */
export async function searchCryptoHistory(
  month: number,
  day: number
): Promise<BraveSearchResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    throw new Error("BRAVE_SEARCH_API_KEY environment variable is not set");
  }

  const monthName = MONTH_NAMES[month - 1];
  if (!monthName) {
    throw new Error(`Invalid month: ${month}`);
  }

  const currentYear = new Date().getFullYear();
  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");

  const queries = [
    // General "on this day" query
    `"on this day in crypto" ${monthName} ${day}`,
    // Broad crypto history for this calendar date (all years)
    `cryptocurrency blockchain "${monthName} ${day}" hack OR exploit OR launch OR milestone OR regulation 2014..${currentYear}`,
    // Current and recent year events for this exact date
    `crypto "${currentYear}-${paddedMonth}-${paddedDay}" OR "${currentYear - 1}-${paddedMonth}-${paddedDay}" OR "${monthName} ${day}, ${currentYear}" OR "${monthName} ${day}, ${currentYear - 1}"`,
    // Twitter/X query for real tweet embeds with status URLs
    `site:x.com crypto "${monthName} ${day}" hack OR launch OR exploit OR milestone`,
  ];

  // Run all queries in parallel
  const queryResults = await Promise.allSettled(
    queries.map((q) => executeBraveQuery(q, apiKey))
  );

  // Collect all successful results
  const allResults: BraveSearchResult[] = [];
  for (const result of queryResults) {
    if (result.status === "fulfilled") {
      allResults.push(...result.value);
    } else {
      console.error("Brave Search query failed:", result.reason);
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique: BraveSearchResult[] = [];
  for (const result of allResults) {
    const normalizedUrl = result.url.toLowerCase().replace(/\/+$/, "");
    if (!seen.has(normalizedUrl)) {
      seen.add(normalizedUrl);
      unique.push(result);
    }
  }

  return unique.slice(0, 40);
}
