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
 * Build media array from event data, filtering out empty items
 * Supports both new media array and legacy image/video fields
 */
export function getMediaItems(event: Event): MediaItem[] {
  // If event has new media array, filter to only valid items
  if (event.media && event.media.length > 0) {
    const validMedia = event.media.filter(isValidMediaItem);
    if (validMedia.length > 0) {
      return validMedia;
    }
  }

  // Build from legacy fields for backward compatibility
  const items: MediaItem[] = [];

  if (event.video && event.video.url) {
    items.push({ type: "video", video: event.video });
  }

  if (event.image && !event.video) {
    items.push({ type: "image", image: { url: event.image, alt: event.title } });
  }

  return items;
}
