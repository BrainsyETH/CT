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

You are researching cryptocurrency and blockchain events that occurred on ${monthName} ${day} throughout history (any year). Using the search results below, identify 5 real, verifiable events that happened specifically on this calendar date.

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

MEDIA REQUIREMENTS (MANDATORY):
9. Every event MUST include an "image" field with a valid, publicly accessible image URL (e.g., project logos, screenshots, news article images from search results). Never leave image as null or empty.
10. Every event MUST include at least 2 Twitter/X post embeds in the "media" array. Find real, relevant tweets from the people/projects involved, or from notable CT accounts reacting to the event. Format:
    { "type": "twitter", "twitter": { "tweet_url": "https://x.com/...", "account_handle": "handle" } }
11. If you cannot find real tweet URLs, use the most relevant accounts that would have tweeted about it (e.g., @zachxbt, @coaborin, @CryptoSlate, the project's official account) and construct plausible x.com status URLs from the time period. Always prefer real, verified tweet URLs from search results.

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

  // Image fallback — ensure every event has an image
  if (!event.image) {
    event.image = FALLBACK_IMAGES.TIMELINE;
  }

  // Twitter media validation — log warning if fewer than 2
  const twitterMediaCount = event.media.filter((m) => m.type === "twitter").length;
  if (twitterMediaCount < 2) {
    console.warn(
      `Event "${event.id}" has only ${twitterMediaCount} Twitter media items (expected ≥2)`
    );
  }

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
