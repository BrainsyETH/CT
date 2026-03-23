/**
 * Brave Search API wrapper for crypto history discovery.
 *
 * Searches for cryptocurrency events that occurred on a given calendar date
 * using multiple query strategies to maximize coverage.
 */

import { isAllowedImageUrl } from "./event-sanitize";

// ============================================================================
// Types
// ============================================================================

export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  /** Thumbnail URL from Brave results, only included if not from Brave's expiring proxy */
  thumbnail?: string;
}

interface BraveWebResult {
  title?: string;
  url?: string;
  description?: string;
  thumbnail?: {
    src?: string;
  };
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

/**
 * Check if a Brave thumbnail URL is usable (not Brave's own proxy which expires).
 * We pass through all other thumbnails — downstream validation in event-sanitize.ts
 * handles final whitelisting against next.config.ts domains.
 */
function isUsableThumbnail(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    // Brave's own image proxy expires within hours — always exclude
    if (hostname === "imgs.search.brave.com") return false;
    return true;
  } catch {
    return false;
  }
}

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
      .map((r) => {
        const result: BraveSearchResult = {
          title: r.title!,
          url: r.url!,
          description: r.description ?? "",
        };
        // Pass through thumbnail if it's from a usable domain (not imgs.search.brave.com which expires)
        const thumbSrc = r.thumbnail?.src;
        if (thumbSrc && isUsableThumbnail(thumbSrc)) {
          result.thumbnail = thumbSrc;
        }
        return result;
      });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Search Brave for crypto history events on a given calendar date.
 *
 * Runs multiple targeted queries to surface CT-native content:
 * 1. "On this day in crypto" listicles
 * 2. Hacks, exploits, rug pulls, and security drama
 * 3. CT culture, lore, and named actors (ZachXBT, Cobie, etc.)
 * 4. Current/recent year events for this date
 * 5. Twitter/X posts from CT accounts for real tweet embeds
 *
 * Returns deduplicated results (up to 50).
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
    // General "on this day" crypto history
    `"on this day in crypto" "${monthName} ${day}"`,

    // Broader "this day in crypto" variants
    `crypto history "${monthName} ${day}" bitcoin OR ethereum OR defi`,

    // Hacks, exploits, rug pulls — the bread and butter of CT
    `crypto "${monthName} ${day}" hack OR exploit OR "rug pull" OR drained OR stolen OR vulnerability`,

    // CT lore, named actors, community drama
    `crypto "${monthName} ${day}" zachxbt OR cobie OR "do kwon" OR sbf OR "sam bankman" OR vitalik OR "cz binance" OR "rug pull" OR "on-chain" OR memecoin`,

    // Current and recent year events for this exact date
    `crypto blockchain "${currentYear}-${paddedMonth}-${paddedDay}" OR "${currentYear - 1}-${paddedMonth}-${paddedDay}" OR "${monthName} ${day}, ${currentYear}" OR "${monthName} ${day}, ${currentYear - 1}"`,

    // Historical crypto events across multiple years
    `"${monthName} ${day}" crypto bitcoin ethereum launch OR hack OR crash OR milestone OR fork OR upgrade`,

    // Twitter/X posts from CT-native accounts for real tweet embeds
    `site:x.com "${monthName} ${day}" (zachxbt OR cobie OR loomdart OR degenspartan OR Pentoshi OR laurashin OR balajis OR coldbloodshill) crypto`,
  ];

  // Run all queries in parallel (15 results each for better coverage)
  const queryResults = await Promise.allSettled(
    queries.map((q) => executeBraveQuery(q, apiKey, 15))
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

  return unique.slice(0, 75);
}

// ============================================================================
// Image Search — find images from whitelisted domains for events
// ============================================================================

interface BraveImageResult {
  thumbnail?: { src?: string };
  properties?: { url?: string };
  url?: string;
}

interface BraveImageSearchResponse {
  results?: BraveImageResult[];
}

const BRAVE_IMAGE_SEARCH_URL = "https://api.search.brave.com/res/v1/images/search";

/**
 * Search Brave Images for a query and return the first image URL
 * that matches our whitelisted domains (next.config.ts remotePatterns).
 */
async function searchBraveImages(
  query: string,
  apiKey: string
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({
      q: query,
      count: "20",
      safesearch: "off",
    });
    const response = await fetch(`${BRAVE_IMAGE_SEARCH_URL}?${params}`, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(`Brave Image Search HTTP ${response.status} for "${query}"`);
      return null;
    }

    const data: BraveImageSearchResponse = await response.json();
    const results = data.results ?? [];

    // Find the first image from a whitelisted domain
    for (const result of results) {
      // properties.url is the actual source image URL
      const sourceUrl = result.properties?.url || result.url;
      if (sourceUrl && isAllowedImageUrl(sourceUrl)) {
        return sourceUrl;
      }
      // Also check thumbnail.src as a fallback
      const thumbUrl = result.thumbnail?.src;
      if (thumbUrl && isAllowedImageUrl(thumbUrl)) {
        return thumbUrl;
      }
    }

    return null;
  } catch (error) {
    console.warn(`Brave Image Search failed for "${query}":`, error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Find an image from a whitelisted domain for an event.
 * Tries multiple search strategies: event title, category + keywords, etc.
 */
export async function findEventImage(
  eventTitle: string,
  categories: string[]
): Promise<string | null> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return null;

  // Strategy 1: Search for the event title + "crypto"
  const titleResult = await searchBraveImages(
    `${eventTitle} crypto`,
    apiKey
  );
  if (titleResult) return titleResult;

  // Strategy 2: Search with category keywords on image-heavy sites
  const categoryTerms = categories.join(" ");
  const siteResult = await searchBraveImages(
    `${categoryTerms} crypto site:reddit.com OR site:imgur.com`,
    apiKey
  );
  if (siteResult) return siteResult;

  return null;
}
