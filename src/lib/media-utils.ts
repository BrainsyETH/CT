import type { MediaItem, Event } from "./types";

/**
 * Check if a media item has valid, non-empty data
 */
export function isValidMediaItem(item: MediaItem): boolean {
  switch (item.type) {
    case "video":
      // Video needs at least a URL
      return Boolean(item.video?.url && item.video.url.trim() !== "");

    case "twitter":
      // Twitter needs either a tweet URL or account handle
      return Boolean(
        (item.twitter?.tweet_url && item.twitter.tweet_url.trim() !== "") ||
        (item.twitter?.account_handle && item.twitter.account_handle.trim() !== "")
      );

    case "image":
      // Image needs a URL
      return Boolean(item.image?.url && item.image.url.trim() !== "");

    default:
      return false;
  }
}

/**
 * Build media array from event data, filtering out empty items.
 * Supports both new media array and legacy image/video fields.
 *
 * The event image is placed FIRST so the detail modal's carousel opens on a
 * reliable visual. Otherwise it opens on the first media item, which for
 * auto-discovered events is often a handle-only Twitter timeline embed that
 * X renders as a blank box — making it look like the event has no image.
 */
export function getMediaItems(event: Event): MediaItem[] {
  const items: MediaItem[] = [];

  // If event has new media array, filter to only valid items
  if (event.media && event.media.length > 0) {
    const validMedia = event.media.filter(isValidMediaItem);
    items.push(...validMedia);
  } else {
    // Build from legacy fields for backward compatibility
    if (event.video && event.video.url) {
      items.push({ type: "video", video: event.video });
    }
  }

  // Lead with event.image (when present and not already in the list) so the
  // carousel's first slide is the image rather than a possibly-blank embed.
  const hasImageItem = items.some(item => item.type === "image" && item.image?.url === event.image);
  if (event.image && !hasImageItem) {
    items.unshift({ type: "image", image: { url: event.image, alt: event.title } });
  }

  return items;
}
