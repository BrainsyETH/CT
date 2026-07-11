/**
 * Event data sanitization for images and media.
 *
 * Ensures event image URLs are from Next.js-whitelisted domains and
 * Twitter embeds have valid (non-fabricated) tweet URLs. Used by both
 * the cron event generator and the admin approval flow.
 */

import { FALLBACK_IMAGES } from "./constants";
import type { Event, MediaItem } from "./types";

// ============================================================================
// Allowed Image Domains
// ============================================================================
//
// Domains we ACCEPT/SELECT for new event images. This is the gate used by
// isAllowedImageUrl (generation + Brave image enrichment). It is intentionally
// stricter than next.config.ts remotePatterns: next.config still lists
// preview.redd.it so legacy rows that already store Reddit URLs render (and
// degrade to the fallback via FallbackImage on the inevitable 403) without
// throwing "hostname not configured" at render time. We just refuse to pick
// new Reddit URLs, since Reddit blocks hotlinking from both the browser and
// our image optimizer.

export const ALLOWED_IMAGE_HOSTNAMES = [
  "pbs.twimg.com",
  "i.imgur.com",
  // NOTE: imgs.search.brave.com intentionally excluded — URLs expire within hours
  // NOTE: preview.redd.it intentionally excluded — Reddit blocks hotlinking (403)
  "images.unsplash.com",
  "99bitcoins.com",
  "img.paragraph.com",
  "public.bnbstatic.com",
  "placeholder.co",
  "asset-metadata-service-production.s3.amazonaws.com",
];

/** Image hostnames the discovery prompts should prefer (same as the accept list). */
export const PROMPT_PREFERRED_IMAGE_HOSTNAMES = ALLOWED_IMAGE_HOSTNAMES;

/** Vercel Blob storage subdomain pattern (fallback images) */
const VERCEL_BLOB_SUFFIX = ".public.blob.vercel-storage.com";

/**
 * Check if an image URL is from a domain whitelisted in next.config.ts.
 */
export function isAllowedImageUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    // Check Vercel Blob storage
    if (hostname.endsWith(VERCEL_BLOB_SUFFIX)) return true;
    // Check explicit allowlist
    return ALLOWED_IMAGE_HOSTNAMES.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
}

/**
 * Hosts we never pick as an image candidate even when we re-host it:
 * - imgs.search.brave.com: Brave's proxy URLs expire within hours.
 * - *.redd.it: Reddit blocks hotlinking AND server-side fetches (403), so
 *   re-hosting reliably fails; don't waste the primary candidate slot on it.
 */
const NON_REHOSTABLE_HOSTS = ["imgs.search.brave.com"];
const NON_REHOSTABLE_SUFFIXES = [".redd.it"];

/**
 * Whether an image URL is worth attempting to re-host to Blob.
 *
 * Unlike isAllowedImageUrl (a narrow render-time domain gate), this accepts an
 * image from ANY origin — because resolveEventImage re-hosts it to Vercel Blob,
 * which makes the final URL permanent and whitelisted regardless of source. We
 * only reject origins that are known to expire or block our fetch, so the
 * enrichment pipeline stops discarding otherwise-good news/article images.
 */
export function isRehostableImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();
    if (NON_REHOSTABLE_HOSTS.includes(hostname)) return false;
    if (NON_REHOSTABLE_SUFFIXES.some((s) => hostname.endsWith(s))) return false;
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Event Sanitization
// ============================================================================

export interface SanitizeResult {
  event: Partial<Event>;
  warnings: string[];
}

/**
 * Sanitize an event's image and media fields to ensure they work with
 * Next.js Image component and Twitter embed widget.
 *
 * - Replaces non-whitelisted image URLs with mode-aware fallbacks
 * - Strips Twitter media with suspicious/fabricated tweet URLs
 * - Strips image media from non-whitelisted domains
 *
 * Returns the sanitized event and a list of warnings for admin review.
 */
export function sanitizeEventMedia(eventData: Partial<Event>): SanitizeResult {
  const warnings: string[] = [];
  const event = { ...eventData };

  // --- Image validation ---
  if (event.image === "") {
    event.image = undefined;
  }
  if (event.image && !isAllowedImageUrl(event.image)) {
    warnings.push(
      `Image replaced: "${event.image}" is not from a whitelisted domain`
    );
    event.image = undefined;
  }

  // Apply mode-aware fallback
  const isCrimeline = event.mode?.includes("crimeline");
  if (!event.image) {
    event.image = isCrimeline
      ? FALLBACK_IMAGES.CRIMELINE
      : FALLBACK_IMAGES.TIMELINE;
  }

  // --- Media validation ---
  if (event.media && Array.isArray(event.media)) {
    const cleanMedia: MediaItem[] = [];

    for (const item of event.media) {
      // Twitter media validation
      if (item.type === "twitter") {
        const twitter = item.twitter;
        if (!twitter) continue;

        // Drop handle-only timeline embeds: X no longer reliably renders
        // account-timeline widgets, so they show as a blank box. We keep only
        // real single-tweet embeds (a valid tweet_url).
        if (!twitter.tweet_url) {
          if (twitter.account_handle) {
            warnings.push(
              `Tweet dropped: handle-only embed for @${twitter.account_handle} renders blank`
            );
          }
          continue;
        }

        // Validate tweet_url has a real status ID (15+ digits)
        const match = twitter.tweet_url.match(/\/status\/(\d+)/);
        if (!match || match[1].length < 15) {
          warnings.push(
            `Tweet stripped: "${twitter.tweet_url}" has suspicious status ID`
          );
          continue;
        }

        cleanMedia.push(item);
        continue;
      }

      // Image media validation
      if (item.type === "image") {
        if (!item.image?.url) continue;
        if (!isAllowedImageUrl(item.image.url)) {
          warnings.push(
            `Image media stripped: "${item.image.url}" is not from a whitelisted domain`
          );
          continue;
        }
        cleanMedia.push(item);
        continue;
      }

      // Other media types (video, etc.) pass through
      cleanMedia.push(item);
    }

    event.media = cleanMedia;
  }

  return { event, warnings };
}
