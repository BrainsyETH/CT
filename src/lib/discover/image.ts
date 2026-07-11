/**
 * Resolve the best real image for an event and re-host it to Vercel Blob.
 *
 * Sourcing order:
 *   1. The og:image of the event's source article(s) — the article's own hero
 *      image is the most event-specific, highest-quality option.
 *   2. Brave Image Search for the event title — broad fallback (tends to return
 *      generic logos/stock art, so it's tried second).
 *
 * Whichever is found is re-hosted to Blob so the stored URL is permanent and
 * always renders. Returns null only if no candidate image can be found at all
 * (the caller keeps the branded fallback in that case).
 */

import { findEventImage } from "@/lib/brave-search";
import { fetchOgImage } from "@/lib/event-extractor";
import { isAllowedImageUrl, isRehostableImageUrl } from "@/lib/event-sanitize";
import { rehostImageToBlob } from "./rehost-image";

export interface ResolveImageInput {
  title: string;
  categories: string[];
  links?: Array<{ label?: string; url: string }>;
}

/** Max source links to probe for an og:image before giving up. */
const MAX_LINKS_TO_PROBE = 3;

export async function resolveEventImage(input: ResolveImageInput): Promise<string | null> {
  let candidate: string | null = null;

  // 1. Source article og:image — the event-specific hero image (best quality).
  if (input.links?.length) {
    for (const link of input.links.slice(0, MAX_LINKS_TO_PROBE)) {
      if (!link?.url) continue;
      const og = await fetchOgImage(link.url);
      if (og && isRehostableImageUrl(og)) {
        candidate = og;
        break;
      }
    }
  }

  // 2. Brave Image Search fallback (any origin — we re-host it).
  if (!candidate) {
    candidate = await findEventImage(input.title, input.categories);
  }

  if (!candidate) return null;

  // Re-host so the stored URL never hotlink-blocks or expires.
  const rehosted = await rehostImageToBlob(candidate, input.title);
  if (rehosted) return rehosted;

  // Re-host unavailable (e.g. no Blob token): keep the candidate only if it's
  // already from a whitelisted, renderable domain.
  return isAllowedImageUrl(candidate) ? candidate : null;
}
