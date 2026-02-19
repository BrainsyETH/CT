import type { Event, ZoraPostPayload } from "@/lib/types";
import { generateEventSlug, formatDate } from "@/lib/formatters";
import { generateCoinSymbol } from "./symbol";

/**
 * Formats an event into a Zora post payload.
 * - name: Event title
 * - symbol: Date-based ticker (e.g., "FEB19A")
 * - description: First sentence of summary
 * - metadataUri: HTTPS endpoint serving metadata JSON
 * - imageUrl: OG image URL for the event
 * - eventUrl: Link to the event page
 */
export function formatZoraPost(
  event: Event,
  postDate: string,
  slotIndex: number
): ZoraPostPayload {
  const firstSentence = getFirstSentence(event.summary);
  const siteUrl = getSiteUrl();
  const slug = generateEventSlug(event.title, event.date);
  const eventUrl = `${siteUrl}/event/${slug}`;
  const metadataUri = `${siteUrl}/api/zora-metadata/${slug}`;

  // Build OG image URL with event details
  const ogParams = new URLSearchParams({
    title: event.title,
    date: formatDate(event.date),
  });
  if (event.summary) {
    ogParams.set("summary", event.summary);
  }
  if (event.image) {
    ogParams.set("image", event.image);
  }
  if (event.mode && event.mode.length > 0) {
    ogParams.set("mode", event.mode[0]);
  }
  const imageUrl = `${siteUrl}/api/og?${ogParams.toString()}`;

  const symbol = generateCoinSymbol(postDate, slotIndex);

  return {
    name: event.title,
    symbol,
    description: firstSentence,
    metadataUri,
    imageUrl,
    eventUrl,
  };
}

function getFirstSentence(text: string): string {
  const sentences = text.split(". ");
  if (sentences.length === 0) return text;

  let firstSentence = sentences[0].trim();

  if (!firstSentence.endsWith(".")) {
    firstSentence += ".";
  }

  return firstSentence;
}

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "https://chainofevents.xyz"
  );
}
