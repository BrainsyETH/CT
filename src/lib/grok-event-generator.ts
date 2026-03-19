/**
 * xAI (Grok) Event Generator
 *
 * Uses xAI's OpenAI-compatible API to generate structured crypto history events
 * from Brave Search results. Enforces the same controlled vocabulary as the
 * existing event-extractor via the shared SYSTEM_PROMPT.
 */

import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./event-extractor";
import { FALLBACK_IMAGES } from "./constants";
import type { Event, EventTag, Mode } from "./types";
import type { BraveSearchResult } from "./brave-search";

// ============================================================================
// Constants
// ============================================================================

const XAI_BASE_URL = "https://api.x.ai/v1";
const DEFAULT_MODEL = "grok-3";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ============================================================================
// User Prompt Builder
// ============================================================================

function buildUserPrompt(
  searchResults: BraveSearchResult[],
  month: number,
  day: number,
  existingTitles: string[]
): string {
  const monthName = MONTH_NAMES[month - 1];

  const existingList =
    existingTitles.length > 0
      ? existingTitles.map((t) => `- ${t}`).join("\n")
      : "None";

  const resultsList = searchResults
    .map(
      (r) =>
        `---\nTitle: ${r.title}\nURL: ${r.url}\nDescription: ${r.description}\n---`
    )
    .join("\n");

  return `TODAY'S DATE CONTEXT: ${monthName} ${day}

You are researching cryptocurrency and blockchain events that occurred on ${monthName} ${day} throughout history (from 2009 to ${new Date().getFullYear()}, including this year). Using the search results below, identify 5 real, verifiable events that happened specifically on this calendar date. Include events from recent years (2024-${new Date().getFullYear()}) as well as historic ones.

EXISTING EVENTS IN OUR DATABASE (DO NOT DUPLICATE):
${existingList}

SEARCH RESULTS:
${resultsList}

INSTRUCTIONS:
1. Generate exactly 5 event objects as a JSON array
2. Each event MUST have occurred on ${monthName} ${day} of a specific year - do NOT guess dates
3. Focus on events that would resonate with Crypto Twitter (CT):
   - Major hacks, exploits, and security incidents
   - Protocol launches and milestones
   - Market events (crashes, ATHs, liquidations)
   - Regulatory actions and legal drama
   - CT Lore moments (viral tweets, community drama, memes)
   - Notable ZachXBT investigations or Cobie calls
4. Prefer events with strong narratives and community significance
5. Each event id must be in kebab-case ending with -YYYY-MM-DD of the event date
6. Include source URLs in the links array
7. If you cannot find 5 verified events for this exact date, return fewer rather than fabricating events
8. For any security incidents, include full crimeline data with mode ["crimeline"] or ["timeline", "crimeline"]

IMAGE REQUIREMENTS:
9. For the "image" field, ONLY use URLs from these domains (Next.js will reject all others):
   - pbs.twimg.com (Twitter/X image CDN — PREFERRED)
   - i.imgur.com
   - imgs.search.brave.com
   - images.unsplash.com
   If you cannot find a valid image from these domains, set image to null (a fallback will be applied automatically).
   NEVER use random news site image URLs — they WILL break.

TWITTER/X MEDIA REQUIREMENTS:
10. For Twitter embeds, ONLY include tweets with REAL, VERIFIED tweet URLs found in the search results above. Format:
    { "type": "twitter", "twitter": { "tweet_url": "https://x.com/USER/status/TWEET_ID", "account_handle": "USER" } }
11. NEVER fabricate or guess tweet URLs/status IDs. If you cannot find a real tweet URL for an event, use ONLY the account_handle (without tweet_url) to show a timeline embed instead:
    { "type": "twitter", "twitter": { "account_handle": "relevant_account" } }
    Good timeline handles: the project's official account, @zachxbt, @CoinDesk, @caborin, @CryptoSlate, @whale_alert
12. It is MUCH better to have 0 tweet embeds than to have broken ones with fake URLs.

Return ONLY a JSON array of event objects. No commentary.`;
}

// ============================================================================
// Response Parsing & Validation
// ============================================================================

/**
 * Parse the xAI response into an array of Event objects.
 * Handles multiple response shapes: array, {events: []}, {event: {}}, or direct object.
 */
function parseEventsResponse(raw: string): Event[] {
  const parsed = JSON.parse(raw);

  let events: Event[];
  if (Array.isArray(parsed)) {
    events = parsed;
  } else if (parsed.events && Array.isArray(parsed.events)) {
    events = parsed.events;
  } else if (parsed.event) {
    events = [parsed.event];
  } else if (parsed.id && parsed.title) {
    events = [parsed];
  } else {
    throw new Error("Unexpected response shape from xAI");
  }

  return events
    .filter((e) => e.id && e.date && e.title && e.summary)
    .map((event) => normalizeEvent(event));
}

/** Domains whitelisted in next.config.ts for Next.js Image component */
const ALLOWED_IMAGE_HOSTNAMES = [
  "pbs.twimg.com",
  "i.imgur.com",
  "imgs.search.brave.com",
  "images.unsplash.com",
  "99bitcoins.com",
  "img.paragraph.com",
  "preview.redd.it",
  "public.bnbstatic.com",
  "placeholder.co",
];

/**
 * Check if an image URL is from an allowed domain.
 */
function isAllowedImageUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return ALLOWED_IMAGE_HOSTNAMES.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
}

/**
 * Normalize an event's arrays and apply media/image validation.
 */
function normalizeEvent(event: Event): Event {
  // Normalize arrays
  event.category = Array.isArray(event.category) ? event.category : [event.category || "Other"];
  event.tags = Array.isArray(event.tags) ? (event.tags as EventTag[]) : [];
  event.mode = Array.isArray(event.mode) ? (event.mode as Mode[]) : ["timeline"];
  event.links = Array.isArray(event.links) ? event.links : [];
  event.media = Array.isArray(event.media) ? event.media : [];

  // Image validation — only allow whitelisted domains, use fallback otherwise
  if (event.image && !isAllowedImageUrl(event.image)) {
    console.warn(
      `Event "${event.id}" image from non-whitelisted domain, using fallback: ${event.image}`
    );
    event.image = undefined;
  }

  // Apply mode-aware fallback image
  const isCrimeline = event.mode?.includes("crimeline");
  if (!event.image) {
    event.image = isCrimeline ? FALLBACK_IMAGES.CRIMELINE : FALLBACK_IMAGES.TIMELINE;
  }

  // Strip Twitter media items with fake/unverifiable tweet URLs
  // Keep items that have only account_handle (timeline embeds) or have a tweet_url
  // from a search result (real URLs have numeric status IDs of 15+ digits)
  event.media = event.media.filter((item) => {
    if (item.type !== "twitter") return true;
    const twitter = item.twitter;
    if (!twitter) return false;

    // If it only has account_handle (no tweet_url), keep it as a timeline embed
    if (!twitter.tweet_url && twitter.account_handle) return true;

    // Validate tweet_url has a real-looking status ID (15-20 digits)
    if (twitter.tweet_url) {
      const match = twitter.tweet_url.match(/\/status\/(\d+)/);
      if (!match || match[1].length < 15) {
        console.warn(
          `Event "${event.id}" stripped suspicious tweet URL: ${twitter.tweet_url}`
        );
        // Convert to timeline-only embed if we have the handle
        if (twitter.account_handle) {
          item.twitter = { account_handle: twitter.account_handle };
          return true;
        }
        return false;
      }
    }

    return true;
  });

  // Also validate image media items
  event.media = event.media.filter((item) => {
    if (item.type !== "image") return true;
    if (!item.image?.url) return false;
    if (!isAllowedImageUrl(item.image.url)) {
      console.warn(
        `Event "${event.id}" stripped image media from non-whitelisted domain: ${item.image.url}`
      );
      return false;
    }
    return true;
  });

  return event;
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generate crypto history events for a given calendar date using xAI (Grok).
 *
 * @param searchResults - Brave Search results to feed as context
 * @param month - Calendar month (1-12)
 * @param day - Calendar day (1-31)
 * @param existingTitles - Titles of events already in the DB for deduplication
 * @returns Array of generated Event objects (up to 5)
 */
export async function generateHistoryEvents(
  searchResults: BraveSearchResult[],
  month: number,
  day: number,
  existingTitles: string[]
): Promise<Event[]> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY environment variable is not set");
  }

  const model = process.env.XAI_MODEL || DEFAULT_MODEL;

  const client = new OpenAI({
    apiKey,
    baseURL: XAI_BASE_URL,
  });

  const userPrompt = buildUserPrompt(searchResults, month, day, existingTitles);

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("No response from xAI");
  }

  try {
    return parseEventsResponse(raw);
  } catch (error) {
    console.error("Failed to parse xAI response:", error);
    console.error("Raw response:", raw.slice(0, 1000));
    throw new Error(
      `Failed to parse xAI response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
