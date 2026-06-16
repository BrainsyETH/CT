/**
 * Resolve the best real image for an event and re-host it to Vercel Blob.
 *
 * Sourcing order:
 *   1. Brave Image Search for the event title (whitelisted domains)
 *   2. The og:image of the event's source article links
 *
 * Whichever is found is re-hosted to Blob so the stored URL is permanent and
 * always renders. Returns null only if no candidate image can be found at all
 * (the caller keeps the branded fallback in that case).
 */

import { findEventImage } from "@/lib/brave-search";
import { fetchOgImage } from "@/lib/event-extractor";
import { isAllowedImageUrl } from "@/lib/event-sanitize";
import { rehostImageToBlob } from "./rehost-image";

export interface ResolveImageInput {
  title: string;
  categories: string[];
  links?: Array<{ label?: string; url: string }>;
}

/** Max source links to probe for an og:image before giving up. */
const MAX_LINKS_TO_PROBE = 3;

export async function resolveEventImage(input: ResolveImageInput): Promise<string | null> {
  // 1. Brave Image Search (already restricted to whitelisted domains)
  let candidate = await findEventImage(input.title, input.categories);

  // 2. Source article og:image (any domain — we re-host it)
  if (!candidate && input.links?.length) {
    for (const link of input.links.slice(0, MAX_LINKS_TO_PROBE)) {
      if (!link?.url) continue;
      const og = await fetchOgImage(link.url);
      if (og) {
        candidate = og;
        break;
      }
    }
  }

  if (!candidate) return null;

  // Re-host so the stored URL never hotlink-blocks or expires.
  const rehosted = await rehostImageToBlob(candidate, input.title);
  if (rehosted) return rehosted;

  // Re-host unavailable (e.g. no Blob token): keep the candidate only if it's
  // already from a whitelisted, renderable domain.
  return isAllowedImageUrl(candidate) ? candidate : null;
}
