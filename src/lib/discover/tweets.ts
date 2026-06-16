/**
 * Find real, relevant tweets to embed on an event.
 *
 * Uses Brave to locate real tweet permalinks about the event topic and returns
 * them as Twitter media items, skipping any already present. Best-effort: real
 * embeddable tweets aren't always findable, so this may return fewer than
 * requested (or none).
 */

import { searchEventTweets } from "@/lib/brave-search";
import type { MediaItem } from "@/lib/types";

/** Extract the numeric status id from a tweet URL, if present. */
function statusId(url: string | undefined): string | null {
  return url?.match(/\/status\/(\d+)/)?.[1] ?? null;
}

/**
 * Return up to `limit` new tweet media items for the topic, excluding any
 * tweets already in `existingMedia`.
 */
export async function resolveEventTweets(
  topic: string,
  existingMedia: MediaItem[],
  limit = 2
): Promise<MediaItem[]> {
  const seenIds = new Set<string>();
  for (const item of existingMedia) {
    if (item.type === "twitter") {
      const id = statusId(item.twitter?.tweet_url);
      if (id) seenIds.add(id);
    }
  }

  const candidates = await searchEventTweets(topic, limit + 2);

  const items: MediaItem[] = [];
  for (const candidate of candidates) {
    const id = statusId(candidate.tweet_url);
    if (!id || seenIds.has(id)) continue;
    seenIds.add(id);
    items.push({
      type: "twitter",
      twitter: { tweet_url: candidate.tweet_url, account_handle: candidate.account_handle },
    });
    if (items.length >= limit) break;
  }

  return items;
}
