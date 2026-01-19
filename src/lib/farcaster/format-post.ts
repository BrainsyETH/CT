import type { Event, FarcasterPostPayload } from "@/lib/types";

/**
 * Formats an event into a Farcaster post payload
 * - Caption: First sentence from summary only (no hashtags)
 * - Embeds: Farcaster-specific URL (uses OG image with title at bottom)
 */
export function formatEventPost(event: Event): FarcasterPostPayload {
  // Extract first sentence from summary
  const firstSentence = getFirstSentence(event.summary);

  // Build Farcaster-specific event URL
  // Uses /fc/[id] route which has OG image with title at bottom
  const siteUrl = getSiteUrl();
  const eventUrl = `${siteUrl}fc/${event.id}`;

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
