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
 * Runs 3 queries to maximize coverage:
 * 1. General "on this day in crypto" query
 * 2. Broader crypto history query
 * 3. Twitter/X-specific query for tweet media embeds
 *
 * Returns deduplicated results (up to 30).
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

  const queries = [
    `"on this day in crypto" ${monthName} ${day}`,
    `crypto history "${monthName} ${day}" bitcoin OR ethereum OR hack OR defi`,
    `site:x.com OR site:twitter.com crypto "${monthName} ${day}" hack OR launch OR exploit OR milestone`,
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

  return unique.slice(0, 30);
}
