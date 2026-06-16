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
  count = 10,
  freshness?: string
): Promise<BraveSearchResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({ q: query, count: String(count) });
    if (freshness) params.set("freshness", freshness);
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

  // Key years in crypto history for targeted searches
  const historicalYears = [2011, 2013, 2014, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
  const historicalDateStrings = historicalYears
    .map((y) => `"${monthName} ${day}, ${y}"`)
    .join(" OR ");

  const queries = [
    // General "on this day" crypto history listicles
    `"on this day in crypto" "${monthName} ${day}"`,

    // Historical events across key crypto years — this is the main driver for CT lore
    `crypto "${monthName} ${day}" (${historicalDateStrings})`,

    // Hacks, exploits, rug pulls — the bread and butter of CT
    `crypto "${monthName} ${day}" hack OR exploit OR "rug pull" OR drained OR stolen OR vulnerability`,

    // CT lore, named actors, community drama
    `crypto "${monthName} ${day}" zachxbt OR cobie OR "do kwon" OR sbf OR "sam bankman" OR vitalik OR "cz binance" OR "rug pull" OR "on-chain" OR memecoin`,

    // Protocol launches, forks, deaths, depegs — the big moments
    `"${monthName} ${day}" crypto (launch OR fork OR upgrade OR "hard fork" OR depeg OR collapse OR arrest OR indictment OR "shut down")`,

    // Current year events (just one query, not the dominant focus)
    `crypto blockchain "${monthName} ${day}, ${currentYear}" OR "${monthName} ${day}, ${currentYear - 1}"`,

    // CT-native sites that cover historical events well
    `"${monthName} ${day}" crypto site:rekt.news OR site:web3isgoinggreat.com OR site:decrypt.co OR site:theblock.co`,

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

/**
 * Format a Date as YYYY-MM-DD (UTC) for Brave's freshness range param.
 */
function toFreshnessDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Search Brave for recent crypto news within a trailing window (default 14 days).
 *
 * Unlike searchCryptoHistory, this is NOT constrained to a single calendar
 * day — it surfaces whatever actually happened across the window so events can
 * be placed on their real dates. Uses Brave's `freshness` date-range filter to
 * bias toward results published in the window.
 *
 * Returns deduplicated results (up to 75).
 */
export async function searchRecentCryptoNews(
  daysBack = 14
): Promise<BraveSearchResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    throw new Error("BRAVE_SEARCH_API_KEY environment variable is not set");
  }

  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setUTCDate(now.getUTCDate() - daysBack);

  // Brave freshness range: YYYY-MM-DDtoYYYY-MM-DD
  const freshness = `${toFreshnessDate(windowStart)}to${toFreshnessDate(now)}`;

  // The window can span more than one month (e.g. a multi-week backfill), so
  // build a "Month Year" hint covering every month it touches.
  const monthLabels: string[] = [];
  const cursor = new Date(Date.UTC(windowStart.getUTCFullYear(), windowStart.getUTCMonth(), 1));
  const lastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  while (cursor <= lastMonth) {
    monthLabels.push(`"${MONTH_NAMES[cursor.getUTCMonth()]} ${cursor.getUTCFullYear()}"`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  const dateHint = monthLabels.join(" OR ");

  const queries = [
    // Hacks, exploits, rug pulls — the bread and butter of CT
    `crypto (${dateHint}) hack OR exploit OR "rug pull" OR drained OR stolen OR vulnerability`,

    // Regulation, enforcement, market structure
    `crypto (${dateHint}) SEC OR lawsuit OR ETF OR indictment OR arrest OR regulation OR settlement`,

    // Launches, unlocks, forks, depegs, collapses
    `crypto (${dateHint}) launch OR mainnet OR "token unlock" OR airdrop OR "hard fork" OR depeg OR collapse OR shutdown`,

    // CT lore, named actors, on-chain drama
    `crypto (${dateHint}) zachxbt OR cobie OR memecoin OR "on-chain" OR drama OR scam`,

    // CT-native and reputable outlets that cover breaking events well
    `crypto news (${dateHint}) site:rekt.news OR site:web3isgoinggreat.com OR site:decrypt.co OR site:theblock.co OR site:dlnews.com OR site:coindesk.com`,

    // "This week/today in crypto" roundups
    `"this week in crypto" OR "crypto news today" (${dateHint})`,

    // Twitter/X posts from CT-native accounts for real tweet embeds
    `site:x.com crypto (${dateHint}) (zachxbt OR cobie OR loomdart OR Pentoshi OR laurashin OR balajis OR tier10k) hack OR exploit OR launch OR breaking`,
  ];

  // Run all queries in parallel, biased to the recent window
  const queryResults = await Promise.allSettled(
    queries.map((q) => executeBraveQuery(q, apiKey, 15, freshness))
  );

  const allResults: BraveSearchResult[] = [];
  for (const result of queryResults) {
    if (result.status === "fulfilled") {
      allResults.push(...result.value);
    } else {
      console.error("Brave recent-news query failed:", result.reason);
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
// Tweet Search — find real tweets about an event for embeds
// ============================================================================

/** x.com path segments that are not user handles. */
const NON_HANDLE_SEGMENTS = new Set([
  "i", "intent", "search", "hashtag", "home", "explore",
  "notifications", "messages", "compose", "settings",
]);

const TWEET_URL_RE = /(?:twitter\.com|x\.com)\/([A-Za-z0-9_]{1,15})\/status\/(\d{15,})/i;

/**
 * Search X/Twitter (via Brave) for real tweets about an event topic and return
 * permalink candidates. Only returns URLs with a real-looking status ID, so
 * the results are safe to embed (no fabrication).
 */
export async function searchEventTweets(
  topic: string,
  limit = 4
): Promise<Array<{ tweet_url: string; account_handle: string }>> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return [];

  const queries = [
    `(site:x.com OR site:twitter.com) ${topic}`,
    `(site:x.com OR site:twitter.com) ${topic} (zachxbt OR cobie OR tier10k OR laurashin OR coindesk OR theblock)`,
  ];

  const queryResults = await Promise.allSettled(
    queries.map((q) => executeBraveQuery(q, apiKey, 15))
  );

  const seenIds = new Set<string>();
  const out: Array<{ tweet_url: string; account_handle: string }> = [];

  for (const result of queryResults) {
    if (result.status !== "fulfilled") continue;
    for (const r of result.value) {
      const match = r.url.match(TWEET_URL_RE);
      if (!match) continue;
      const handle = match[1];
      const id = match[2];
      if (NON_HANDLE_SEGMENTS.has(handle.toLowerCase())) continue;
      if (seenIds.has(id)) continue;
      seenIds.add(id);
      out.push({ tweet_url: `https://x.com/${handle}/status/${id}`, account_handle: handle });
      if (out.length >= limit) return out;
    }
  }

  return out;
}

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
