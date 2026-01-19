import type { Event, FarcasterPostPayload } from "@/lib/types";

/**
 * Formats an event into a Farcaster post payload
 * - Caption: First sentence from summary only (no hashtags)
 * - Embeds: Event's canonical URL (for OG unfurl)
 */
export function formatEventPost(event: Event): FarcasterPostPayload {
  // Extract first sentence from summary
  const firstSentence = getFirstSentence(event.summary);

  // Build canonical event URL
  const siteUrl = getSiteUrl();
  const eventUrl = `${siteUrl}?event=${event.id}`;

  return {
    text: firstSentence,
    embeds: [{ url: eventUrl }],
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
