/**
 * Event Extractor - AI-powered event data extraction from URLs
 *
 * Uses OpenAI GPT to analyze web page content and extract structured event data
 * matching the Chain of Events schema.
 */

import OpenAI from "openai";
import type { Event, EventTag, Mode } from "./types";

// ============================================================================
// Types
// ============================================================================

export interface ExtractionHints {
  mode?: Mode;
  categories?: string[];
  date?: string;
  context?: string;
  image?: string;
}

export interface ExtractionResult {
  success: boolean;
  event?: Event;
  raw?: string;
  error?: string;
  extractedImage?: string;
}

// ============================================================================
// System Prompt
// ============================================================================

const SYSTEM_PROMPT = `HARD RULES
- Output MUST be valid JSON: an array of event objects (even if only 1 event).
- Do NOT include any commentary, markdown, or extra keys outside the schema shown below.
- Use only the existing controlled vocabularies provided (Categories, Tags, Modes, Crimeline Types).
- Each event must be self-contained and consistent.
- Never duplicate an existing event id or event. If unsure, create a new unique id.
- Prefer primary sources: X/Twitter links from the people/projects involved. If unavailable, use reputable reporting.

CONTROLLED VOCABULARY (MUST MATCH EXACTLY)
Modes: ["timeline", "crimeline"]

Crimeline Types (only if mode includes "crimeline"):
["BRIDGE HACK","CUSTODY FAILURE","EXCHANGE HACK","FRAUD","GOVERNANCE ATTACK","LEVERAGE COLLAPSE","ORACLE MANIPULATION","PROTOCOL EXPLOIT","RUG PULL","SOCIAL MEDIA HACK"]

Categories:
["Bitcoin","Bridge","Bull Runs","CT Lore","Centralized Exchange","Culture","Dances","DeFi","DeFi Protocol","ETFs","Ethereum","Gaming","Lending","Market Structure","Memecoins","NFT","NFTs","Privacy","Regulation","Security","Stablecoin","Wallet/Key Compromise","ZachXBT"]

Tags:
["ATH","CULTURAL","ECONOMIC","FAILURE","MILESTONE","REGULATORY","SECURITY","TECH"]

SCHEMA (match types exactly)
{
  "id": "kebab-case-YYYY-MM-DD",
  "date": "YYYY-MM-DD",
  "title": "string",
  "summary": "3-5 sentences. Concrete details. No generic fluff. No em dashes.",
  "category": ["One or more Categories from list", "No more than 3 categories"],
  "tags": ["One or more Tags from list"],
  "mode": ["timeline" and/or "crimeline"],
  "image": "string URL (no placeholders)",
  "media": [
    { "type": "video", "video": { "provider": "", "url": "", "embed_url": "", "poster_url": "" } },
    { "type": "twitter", "twitter": { "tweet_url": "", "account_handle": "" } },
     { "type": "twitter", "twitter": { "tweet_url": "", "account_handle": "" } }
  ],
  "links": [{ "label": "string", "url": "https://..." }],
  "metrics": { },
  "crimeline": {
    "type": "Crimeline Type from list",
    "funds_lost_usd": 0,
    "market_impact_usd": "string or number (optional)",
    "victims_estimated": "string",
    "root_cause": ["bullet-like strings"],
    "aftermath": "string",
    "status": "Resolved | Ongoing | Total loss | Partial recovery | Funds recovered"
  }
}

LOGIC RULES
- If mode includes "crimeline", include the full "crimeline" object.
- If mode is only "timeline", omit the "crimeline" object entirely.
- Always include 3 media items, they can be placeholders, but must be valid JSON.
- "links" should include at least 1 URL. Prefer 2-3 if available. Heavily prioritize video and tweets over other links. Do not link to search queries. Keep link Titles short and Capitalized.
- Put the most "iconic" X/Twitter link into media[twitter].twitter.tweet_url when possible.
- Keep summaries tight but specific: who/what/when/how much/why it mattered. No em dashes.
- If additional Twitter/Xlinks are provided in the Additional Context field, include the Twitter links in the media array.
- Always include historical context. 
- If a number is uncertain, use an approximate with "~" in the summary, but still provide best estimate in crimeline.funds_lost_usd when relevant.`;

// ============================================================================
// URL Content Fetcher
// ============================================================================

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface FetchResult {
  text: string;
  ogImage?: string;
}

/**
 * Extract og:image URL from HTML
 */
function extractOgImage(html: string): string | undefined {
  // Try og:image first
  const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (ogMatch?.[1]) return ogMatch[1];

  // Try alternate attribute order
  const ogMatch2 = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (ogMatch2?.[1]) return ogMatch2[1];

  // Try twitter:image
  const twitterMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
  if (twitterMatch?.[1]) return twitterMatch[1];

  // Try alternate attribute order for twitter
  const twitterMatch2 = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
  if (twitterMatch2?.[1]) return twitterMatch2[1];

  return undefined;
}

/**
 * Fetch and extract text content and og:image from a URL
 */
export async function fetchUrlContent(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract og:image before stripping HTML
    const ogImage = extractOgImage(html);

    // Basic HTML to text conversion
    // Remove script, style, nav, footer, header, aside tags and their content
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
      .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, "")
      // Remove all remaining HTML tags
      .replace(/<[^>]+>/g, " ")
      // Decode common HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim();

    return { text, ogImage };
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================================
// Event Extraction
// ============================================================================

/**
 * Extract event data from a URL using OpenAI
 */
export async function extractEventFromUrl(
  url: string,
  hints?: ExtractionHints,
  apiKey?: string
): Promise<ExtractionResult> {
  const openaiKey = apiKey || process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return {
      success: false,
      error: "OpenAI API key not configured",
    };
  }

  // Validate URL
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        success: false,
        error: "URL must use http or https protocol",
      };
    }
  } catch {
    return {
      success: false,
      error: "Invalid URL format",
    };
  }

  // Fetch URL content
  let content: string;
  let extractedImage: string | undefined;
  try {
    const fetchResult = await fetchUrlContent(url);
    content = fetchResult.text;
    extractedImage = fetchResult.ogImage;
    if (content.length < 100) {
      content = `[Limited content extracted from URL. Please rely on the URL itself and any hints provided.]`;
    }
  } catch (error) {
    // Continue with limited info if fetch fails (common for Twitter/X)
    content = `[Could not fetch content from URL: ${error instanceof Error ? error.message : "Unknown error"}. Please use the URL and hints to generate the event.]`;
  }

  // Build user message with hints
  let userMessage = `SOURCE URL: ${url}\n\n`;

  if (hints?.mode) {
    userMessage += `SUGGESTED MODE: ${hints.mode}\n`;
  }
  if (hints?.categories?.length) {
    userMessage += `SUGGESTED CATEGORIES: ${hints.categories.join(", ")}\n`;
  }
  if (hints?.date) {
    userMessage += `KNOWN DATE: ${hints.date}\n`;
  }
  if (hints?.context) {
    userMessage += `ADDITIONAL CONTEXT: ${hints.context}\n`;
  }
  // Pass image hint (user-provided takes precedence over extracted)
  const imageUrl = hints?.image || extractedImage;
  if (imageUrl) {
    userMessage += `IMAGE URL: ${imageUrl}\n`;
  }

  userMessage += `\nPAGE CONTENT:\n${content.slice(0, 8000)}`;

  // Call OpenAI with configurable model
  const client = new OpenAI({ apiKey: openaiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4-turbo";

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content;

    if (!raw) {
      return {
        success: false,
        error: "No response from OpenAI",
      };
    }

    // Parse and validate the response
    let event: Event;
    try {
      const parsed = JSON.parse(raw);

      // Handle various response formats:
      // - Array at top level: [{ event }]
      // - Wrapped in events key: { events: [{ event }] }
      // - Wrapped in event key: { event: { ... } }
      // - Direct object: { id, date, ... }
      if (Array.isArray(parsed)) {
        event = parsed[0];
      } else if (parsed.events && Array.isArray(parsed.events)) {
        event = parsed.events[0];
      } else if (parsed.event) {
        event = parsed.event;
      } else {
        event = parsed;
      }

      // Basic validation
      if (!event.id || !event.date || !event.title || !event.summary) {
        return {
          success: false,
          error: "AI response missing required fields (id, date, title, summary)",
          raw,
        };
      }

      // Ensure arrays are arrays
      event.category = Array.isArray(event.category) ? event.category : [event.category || "Other"];
      event.tags = Array.isArray(event.tags) ? (event.tags as EventTag[]) : [];
      event.mode = Array.isArray(event.mode) ? (event.mode as Mode[]) : ["timeline"];
      event.links = Array.isArray(event.links) ? event.links : [];
      event.media = Array.isArray(event.media) ? event.media : [];

      // Add source URL to links if not already present
      const hasSourceUrl = event.links?.some((link) => link.url === url);
      if (!hasSourceUrl) {
        event.links = event.links || [];
        event.links.unshift({ label: "Source", url });
      }

      // Use extracted image if event doesn't have one
      if (!event.image && extractedImage) {
        event.image = extractedImage;
      }

      return {
        success: true,
        event,
        raw,
        extractedImage,
      };
    } catch (parseError) {
      return {
        success: false,
        error: `Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
        raw,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `OpenAI API error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
