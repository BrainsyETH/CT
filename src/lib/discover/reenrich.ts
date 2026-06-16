/**
 * Maintenance routines that backfill images and tweets onto existing events.
 *
 * Shared by the cron routes (Bearer-auth, scheduled) and the admin maintenance
 * page (admin-auth, on-demand) so both run identical logic.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveEventImage } from "./image";
import { resolveEventTweets } from "./tweets";
import { FALLBACK_IMAGES } from "@/lib/constants";
import type { MediaItem } from "@/lib/types";

/** Target tweet embeds per event. */
const TARGET_TWEETS = 2;

/**
 * Events that lack a real, displayable image:
 * - null image, the branded fallbacks, Reddit (hotlink-blocked), expired Brave proxy.
 */
const NEEDS_IMAGE_FILTERS = [
  "image.is.null",
  `image.eq.${FALLBACK_IMAGES.TIMELINE}`,
  `image.eq.${FALLBACK_IMAGES.CRIMELINE}`,
  "image.ilike.%preview.redd.it%",
  "image.ilike.%imgs.search.brave.com%",
];

function isBrokenSource(image: string | null): boolean {
  if (!image) return false;
  return image.includes("preview.redd.it") || image.includes("imgs.search.brave.com");
}

export interface ReenrichImagesResult {
  processed: number;
  replaced: Array<{ id: string; image: string }>;
  cleared: string[];
  unchanged: string[];
  failed: Array<{ id: string; reason: string }>;
  done: boolean;
}

/**
 * Find + re-host a real image for up to `max` events lacking one. Nulls a
 * broken source when nothing is found (so the branded fallback renders); leaves
 * an existing fallback untouched.
 */
export async function reenrichImages(
  supabase: SupabaseClient,
  max: number
): Promise<ReenrichImagesResult> {
  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, category, image, links")
    .or(NEEDS_IMAGE_FILTERS.join(","))
    .limit(max);

  if (error) throw new Error(error.message);

  const replaced: Array<{ id: string; image: string }> = [];
  const cleared: string[] = [];
  const unchanged: string[] = [];
  const failed: Array<{ id: string; reason: string }> = [];

  for (const event of events ?? []) {
    const categories = Array.isArray(event.category) ? event.category : [];
    const links = Array.isArray(event.links) ? event.links : [];

    const newImage = await resolveEventImage({ title: event.title, categories, links });

    let value: string | null;
    if (newImage) {
      value = newImage;
    } else if (isBrokenSource(event.image)) {
      value = null;
    } else {
      unchanged.push(event.id);
      continue;
    }

    const { error: updateError } = await supabase
      .from("events")
      .update({ image: value })
      .eq("id", event.id);

    if (updateError) {
      failed.push({ id: event.id, reason: updateError.message });
      continue;
    }

    if (newImage) replaced.push({ id: event.id, image: newImage });
    else cleared.push(event.id);
  }

  const processed = events?.length ?? 0;
  return { processed, replaced, cleared, unchanged, failed, done: processed === 0 };
}

export interface ReenrichTweetsResult {
  processed: number;
  updated: Array<{ id: string; added: number }>;
  none: string[];
  failed: Array<{ id: string; reason: string }>;
  done: boolean;
}

/**
 * Attach up to TARGET_TWEETS real tweets to up to `max` events that have none.
 */
export async function reenrichTweets(
  supabase: SupabaseClient,
  max: number
): Promise<ReenrichTweetsResult> {
  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, media")
    .not("media", "cs", '[{"type":"twitter"}]')
    .limit(max);

  if (error) throw new Error(error.message);

  const updated: Array<{ id: string; added: number }> = [];
  const none: string[] = [];
  const failed: Array<{ id: string; reason: string }> = [];

  for (const event of events ?? []) {
    const media: MediaItem[] = Array.isArray(event.media) ? event.media : [];
    const found = await resolveEventTweets(event.title, media, TARGET_TWEETS);

    if (found.length === 0) {
      none.push(event.id);
      continue;
    }

    const { error: updateError } = await supabase
      .from("events")
      .update({ media: [...media, ...found] })
      .eq("id", event.id);

    if (updateError) {
      failed.push({ id: event.id, reason: updateError.message });
      continue;
    }

    updated.push({ id: event.id, added: found.length });
  }

  const processed = events?.length ?? 0;
  return { processed, updated, none, failed, done: processed === 0 };
}
