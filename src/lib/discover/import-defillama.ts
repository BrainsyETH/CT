/**
 * Orchestrates importing DefiLlama hacks into the events pipeline:
 * fetch → filter (>= $1M, optional window) → map → dedup → enrich (image +
 * tweets) → polish into CT voice → auto-approve insert.
 *
 * Shared by the discover-defillama cron and the admin maintenance button.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAllEvents } from "@/lib/events-db";
import { polishCrimelineNarratives } from "@/lib/grok-event-generator";
import { isDuplicate } from "./dedup";
import { insertApprovedEvents } from "./persist";
import { resolveEventImage } from "./image";
import { resolveEventTweets } from "./tweets";
import {
  fetchHacks,
  buildAmountNormalizer,
  mapHackToEvent,
  HACK_MIN_USD,
} from "./sources/defillama";
import type { Event } from "@/lib/types";

const CRON_SUBMITTER = "cron:discover-defillama";
const AUTO_REVIEWER = "cron:auto-approve";
const HARD_MAX = 25;

export interface ImportOptions {
  /** Ignore the date window and consider the full historical hacks DB. */
  all?: boolean;
  /** Trailing window in days when not `all` (default 90). */
  days?: number;
  /** Max events to insert this run. */
  max: number;
}

export interface ImportResult {
  fetched: number;
  eligible: number;
  candidates: number;
  inserted: Array<{ id: string; title: string; date: string }>;
  skippedDuplicates: number;
  failed: Array<{ id: string; reason: string }>;
  /** True when no more eligible non-duplicate hacks remain to import. */
  done: boolean;
}

export async function importDefiLlamaHacks(
  supabase: SupabaseClient,
  opts: ImportOptions
): Promise<ImportResult> {
  const max = Math.min(Math.max(opts.max ?? 10, 1), HARD_MAX);

  const hacks = await fetchHacks();
  const amountOf = buildAmountNormalizer(hacks);
  const cutoffMs = opts.all ? null : Date.now() - (opts.days ?? 90) * 86_400_000;

  // Eligible: >= threshold and (all || within window)
  const eligible = hacks.filter((h) => {
    if (amountOf(h) < HACK_MIN_USD) return false;
    if (cutoffMs !== null) {
      const ms = (h.date ?? 0) * 1000;
      if (!ms || ms < cutoffMs) return false;
    }
    return true;
  });

  // Map → drop unusable → newest first
  const mapped = eligible
    .map((h) => mapHackToEvent(h, amountOf(h)))
    .filter((e): e is Event => e !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  // Load existing events for dedup
  const { events: existing } = await getAllEvents({ limit: 500 });
  const existingIds = existing.map((e) => e.id);
  const existingTitles = existing.map((e) => e.title);

  // Select up to `max` non-duplicate candidates
  const candidates: Event[] = [];
  let skippedDuplicates = 0;
  for (const event of mapped) {
    if (candidates.length >= max) break;
    if (isDuplicate(event, existingTitles, existingIds)) {
      skippedDuplicates++;
      continue;
    }
    candidates.push(event);
    existingTitles.push(event.title);
    existingIds.push(event.id);
  }

  if (candidates.length > 0) {
    // Enrich with the factual title (more searchable), then polish into CT voice.
    await Promise.allSettled(
      candidates.map(async (event) => {
        const [img, tweets] = await Promise.all([
          resolveEventImage({ title: event.title, categories: event.category, links: event.links }),
          resolveEventTweets(event.title, event.media ?? [], 2),
        ]);
        if (img) event.image = img;
        if (tweets.length > 0) event.media = [...(event.media ?? []), ...tweets];
      })
    );
    await polishCrimelineNarratives(candidates);
  }

  const { inserted, failed } = await insertApprovedEvents(supabase, candidates, {
    submitter: CRON_SUBMITTER,
    reviewer: AUTO_REVIEWER,
  });

  return {
    fetched: hacks.length,
    eligible: eligible.length,
    candidates: candidates.length,
    inserted: inserted.map(({ id, title, date }) => ({ id, title, date })),
    skippedDuplicates,
    failed,
    // No fresh candidates this run → every eligible hack already exists.
    done: candidates.length === 0,
  };
}
