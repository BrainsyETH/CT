import type { Event, TwitterPostPayload } from "@/lib/types";

/**
 * Formats an event into a Twitter post payload
 * - Text: First sentence from summary + event URL
 * - Twitter has 280 character limit, so we need to be concise
 */
export function formatTwitterPost(event: Event): TwitterPostPayload {
  // Extract first sentence from summary
  const firstSentence = getFirstSentence(event.summary);

  // Build event URL
  const siteUrl = getSiteUrl();
  const eventUrl = `${siteUrl}/event/${event.id}`;

  // Calculate available space for text (280 - URL length - space - buffer)
  // Twitter uses t.co for URL shortening (23 chars max)
  const urlLength = 23;
  const maxTextLength = 280 - urlLength - 2; // 2 for newlines

  // Truncate text if needed
  let text = firstSentence;
  if (text.length > maxTextLength) {
    text = text.slice(0, maxTextLength - 3) + "...";
  }

  // Combine text with URL
  const fullText = `${text}\n\n${eventUrl}`;

  return {
    text: fullText,
    eventUrl,
  };
}

/**
 * Extracts the first sentence from text
 * Handles edge cases with abbreviations, etc.
 */
function getFirstSentence(text: string): string {
  // Simple approach: split on ". " and take first part
  const sentences = text.split(". ");
  if (sentences.length === 0) return text;

  let firstSentence = sentences[0].trim();

  // Ensure it ends with a period
  if (!firstSentence.endsWith(".")) {
    firstSentence += ".";
  }

  return firstSentence;
}

/**
 * Gets the site URL from environment variables
 */
function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "https://chainofevents.xyz"
  );
}
