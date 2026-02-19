import type { Event, FarcasterPostPayload } from "@/lib/types";
import { generateEventSlug } from "@/lib/formatters";

/**
 * Formats an event into a Farcaster post payload
 * - Caption: First sentence from summary + URL (URL in text ensures link always appears)
 * - Embeds: Event slug URL for clean sharing (uses OG image via /event/[slug] metadata)
 */
export function formatEventPost(event: Event): FarcasterPostPayload {
  // Extract first sentence from summary
  const firstSentence = getFirstSentence(event.summary);

  // Build clean event URL using slug
  const siteUrl = getSiteUrl();
  const slug = generateEventSlug(event.title, event.date);
  const eventUrl = `${siteUrl}/event/${slug}`;

  // Include URL in text to ensure link always appears (embeds don't always unfurl)
  const text = `${firstSentence}\n\n${eventUrl}`;

  return {
    text,
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
