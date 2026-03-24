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
import { isAllowedImageUrl } from "./event-sanitize";
import type { Event, EventTag, Mode } from "./types";
import type { BraveSearchResult } from "./brave-search";
import { findEventImage } from "./brave-search";

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
      (r) => {
        let entry = `---\nTitle: ${r.title}\nURL: ${r.url}\nDescription: ${r.description}`;
        if (r.thumbnail) {
          entry += `\nImage: ${r.thumbnail}`;
        }
        entry += "\n---";
        return entry;
      }
    )
    .join("\n");

  // Collect all valid thumbnails for the prompt
  const availableImages = searchResults
    .filter((r) => r.thumbnail)
    .map((r) => r.thumbnail!);

  return `TODAY'S DATE CONTEXT: ${monthName} ${day}

You are a Crypto Twitter (CT) historian building a "This Day in Crypto" archive. Find 5 real, verifiable events that happened on ${monthName} ${day} throughout crypto history (2009-${new Date().getFullYear()}).

CRITICAL: Prioritize HISTORICAL events (2009-2023) over current year news. At least 3 of the 5 events should be from prior years. We want deep CT lore — hacks, exploits, protocol deaths, arrests, viral moments — not today's market recaps or whale moves. Current-year events are only worth including if they are genuinely significant (not just "BTC went up 3%").

Use the search results below as source material, but you may also use your own knowledge of crypto history to identify events that happened on this date. If you know of a significant event on ${monthName} ${day} that isn't in the search results, include it — just make sure it's real and verifiable.

EXISTING EVENTS (DO NOT DUPLICATE):
${existingList}

SEARCH RESULTS:
${resultsList}

═══════════════════════════════════════════════════════════════
WHAT MAKES AN EVENT "CT ENOUGH"
═══════════════════════════════════════════════════════════════

The best events have DRAMA, NAMED ACTORS, and COMMUNITY SIGNIFICANCE. Prioritize in this order:

TIER 1 (always include if available):
- Hacks, exploits, rug pulls with $ amounts and named perpetrators/victims
- ZachXBT investigations, on-chain detective work, doxxings
- Arrests, indictments, sentencings of crypto figures (SBF, Do Kwon, 3AC, etc.)
- Protocol deaths, bank runs, depegs (Terra/LUNA, FTX collapse, SVB)
- CT lore moments (viral tweets, memes that became movements, community drama)

TIER 2 (good filler):
- Regulatory bombshells (SEC lawsuits, ETF approvals/denials, executive orders)
- Market ATHs/crashes with specific numbers and community reaction
- Major protocol launches that changed DeFi/NFTs/L2s

TIER 3 (only if nothing better exists):
- Generic "Protocol X raised $Y" or "Company X launched feature Y"
- Exchange listings or token launches without drama

═══════════════════════════════════════════════════════════════
VOICE & TONE — WRITE LIKE CT, NOT COINDESK
═══════════════════════════════════════════════════════════════

Your summaries should feel like they were written by someone who LIVES on Crypto Twitter. Follow these patterns from our best events:

GOOD (CT voice): "In peak CT irony, ZachXBT's investigation exposing Axiom Exchange insider trading spawned a Polymarket prediction market—which itself became an insider trading bonanza. At least 12 wallets placed heavy bets before the reveal, collectively profiting over $1 million."

GOOD (CT voice): "Former U.S. government contractor John 'Lick' Daghita was arrested in Saint Martin after allegedly stealing $46 million from U.S. Marshals Service wallets. Authorities found him with a briefcase containing cash, hard drives, and hardware wallets."

GOOD (CT voice): "During a major Bitcoin price crash, Bitcointalk user GameKyuubi posted a rant titled 'I AM HODLING' after misspelling 'holding' while drunk on whiskey. The typo instantly became legendary and evolved into the universal mantra for diamond hands."

BAD (CoinDesk voice): "The protocol successfully implemented its planned upgrade, bringing improvements to scalability and security for the ecosystem's growing user base."

Key voice rules:
- Name specific people, handles, and amounts. Never be vague.
- Include the absurd detail that makes the story memorable (the briefcase, the drunk typo, the pirate roleplay)
- Say WHY CT cared, not just what happened
- Use "CT" as a proper noun referring to the community
- No em dashes. No corporate PR language. No "ecosystem" or "innovative."
- 3-5 sentences. Every sentence must add new information.

═══════════════════════════════════════════════════════════════
CT ACCOUNTS FOR CONTEXT (use as twitter media handles when relevant):
@zachxbt @cobie @loomdart @coldbloodshill @degenspartan @Pentoshi
@laurashin @balajis @GCRClassic @staborin @haborin @Drift @statelayer
@messari @ryanselkis @viktorbunin @staborin @erikvoorhees @chainlinkgod
@gainzy @trustlessstate @foobar @seedphrase @nick_eth @tier10k
@bantg @sizechad @icebergy_ @cburniske @scottmelker @cryptocred
@tokenterminal @asvanevik @JustinDrake @sergeynazarov @haborin
═══════════════════════════════════════════════════════════════

TECHNICAL REQUIREMENTS:
1. Each event MUST have occurred on ${monthName} ${day} of a specific year — do NOT guess dates
2. Event id in kebab-case ending with -YYYY-MM-DD
3. Include source URLs in the links array
4. Return fewer than 5 rather than fabricating events
5. For security incidents, include full crimeline data with mode ["crimeline"] or ["timeline", "crimeline"]
6. Use categories from: Bitcoin, Bridge, Bull Runs, CT Lore, Centralized Exchange, Culture, DeFi, DeFi Protocol, ETFs, Ethereum, Gaming, Lending, Market Structure, Memecoins, NFTs, Privacy, Regulation, Security, Stablecoin, Wallet/Key Compromise, ZachXBT
7. Use tags from: ATH, CULTURAL, ECONOMIC, FAILURE, MILESTONE, REGULATORY, SECURITY, TECH

IMAGE REQUIREMENTS:
8. For "image", you MUST use an image URL from the search results above.
   - Look for "Image:" lines in the search results — these are real, stable URLs.
   - Match each event to the most relevant search result image.
   - DO NOT fabricate or guess image URLs. Only use URLs that appear verbatim in the search results above.
   - If no search result has a relevant image, set image to null (a fallback is applied automatically).
   - NEVER use imgs.search.brave.com (expires within hours).
   - NEVER use empty string "" — always use null instead.${availableImages.length > 0 ? `\n\nAVAILABLE IMAGES FROM SEARCH RESULTS (use these!):\n${availableImages.map((u) => `   - ${u}`).join("\n")}` : ""}

TWITTER/X MEDIA REQUIREMENTS:
9. ONLY include tweets with REAL, VERIFIED URLs from the search results. Format:
   { "type": "twitter", "twitter": { "tweet_url": "https://x.com/USER/status/TWEET_ID", "account_handle": "USER" } }
10. NEVER fabricate tweet URLs. If no real URL exists, use account_handle only for a timeline embed:
    { "type": "twitter", "twitter": { "account_handle": "relevant_handle" } }
11. Zero real tweets is better than fake ones.

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

  // Image validation — treat empty string as no image, only allow whitelisted domains
  if (event.image === "") {
    event.image = undefined;
  }
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
    const events = parseEventsResponse(raw);

    // Enrich events missing images via Brave Image Search
    await enrichEventImages(events);

    return events;
  } catch (error) {
    console.error("Failed to parse xAI response:", error);
    console.error("Raw response:", raw.slice(0, 1000));
    throw new Error(
      `Failed to parse xAI response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// ============================================================================
// Image Enrichment
// ============================================================================

/**
 * For events still using the fallback image, search Brave Images for a
 * real image from a whitelisted domain. Mutates events in place.
 */
async function enrichEventImages(events: Event[]): Promise<void> {
  const needsImage = events.filter(
    (e) =>
      !e.image ||
      e.image === FALLBACK_IMAGES.TIMELINE ||
      e.image === FALLBACK_IMAGES.CRIMELINE
  );

  if (needsImage.length === 0) return;

  // Search for images in parallel (one per event)
  const results = await Promise.allSettled(
    needsImage.map((event) =>
      findEventImage(event.title, event.category)
    )
  );

  for (let i = 0; i < needsImage.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled" && result.value) {
      needsImage[i].image = result.value;
      console.log(
        `Image found for "${needsImage[i].title}": ${result.value}`
      );
    }
  }
}
