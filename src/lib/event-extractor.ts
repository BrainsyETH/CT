/**
 * Event Extractor - AI-powered event data extraction from URLs
 *
 * Uses OpenAI GPT to analyze web page content and extract structured event data
 * matching the Chain of Events schema.
 */

import OpenAI from "openai";
import type { Event, EventTag, Mode } from "./types";
import { CATEGORIES, EVENT_TAGS, CRIMELINE_TYPES, OUTCOME_STATUSES, MODE_OPTIONS } from "./constants";

// ============================================================================
// Types
// ============================================================================

export interface ExtractionHints {
  mode?: Mode;
  categories?: string[];
  date?: string;
  context?: string;
}

export interface ExtractionResult {
  success: boolean;
  event?: Event;
  raw?: string;
  error?: string;
}

// ============================================================================
// System Prompt
// ============================================================================

const SYSTEM_PROMPT = `You are an assistant that extracts crypto/blockchain event data from web pages for the Chain of Events historical timeline.

OUTPUT: Return a single valid JSON object matching this exact schema:
{
  "id": "kebab-case-slug-YYYY-MM-DD",
  "date": "YYYY-MM-DD",
  "title": "Event Title (max 200 chars)",
  "summary": "2-4 sentence factual description (max 5000 chars)",
  "category": ["Category1", "Category2"],
  "tags": ["TAG1", "TAG2"],
  "mode": ["timeline"],
  "image": null,
  "links": [{"label": "Source Name", "url": "https://..."}],
  "media": [],
  "metrics": {"btc_price_usd": null},
  "crimeline": null
}

VALID CATEGORIES: ${CATEGORIES.join(", ")}
VALID TAGS: ${EVENT_TAGS.join(", ")}
VALID MODES: ${MODE_OPTIONS.join(", ")}

For CRIMELINE events (hacks, exploits, frauds, collapses), also include:
"crimeline": {
  "type": "TYPE",
  "funds_lost_usd": number or null,
  "victims_estimated": "string" or null,
  "root_cause": ["cause1", "cause2"] or null,
  "aftermath": "string" or null,
  "status": "STATUS"
}

VALID CRIMELINE TYPES: ${CRIMELINE_TYPES.join(", ")}
VALID OUTCOME STATUSES: ${OUTCOME_STATUSES.join(", ")}

RULES:
- id: Use lowercase-kebab-case with date suffix, e.g., "mt-gox-hack-2014-02-24"
- date: Extract exact date from source. Use YYYY-MM-DD format. If only year/month known, use first of month/year.
- title: Concise, factual, max 200 characters
- summary: 2-4 factual sentences. Include specific numbers, amounts, and key facts.
- category: Pick 1-3 most relevant categories from the valid list
- tags: Pick 1-4 most relevant tags from the valid list
- mode: Use ["timeline"] for historical events, ["crimeline"] for hacks/frauds/failures, or ["timeline", "crimeline"] for both
- links: Always include the source URL with an appropriate label

Return ONLY the JSON object, no markdown code blocks, no explanation.`;

// ============================================================================
// URL Content Fetcher
// ============================================================================

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Fetch and extract text content from a URL
 */
export async function fetchUrlContent(url: string): Promise<string> {
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

    return text;
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
  try {
    content = await fetchUrlContent(url);
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

  userMessage += `\nPAGE CONTENT:\n${content.slice(0, 8000)}`;

  // Call OpenAI
  const client = new OpenAI({ apiKey: openaiKey });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4-turbo-preview",
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

      // Handle wrapped responses (e.g., { event: {...} } or { events: [...] })
      if (parsed.event) {
        event = parsed.event;
      } else if (parsed.events && Array.isArray(parsed.events)) {
        event = parsed.events[0];
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

      return {
        success: true,
        event,
        raw,
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
