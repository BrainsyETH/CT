import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateAuthHeader } from "@/lib/crypto-utils";
import { getCurrentChicagoDateString } from "@/lib/farcaster/time-utils";
import { getEventsWithinDayWindow } from "@/lib/events-db";
import { searchCryptoHistory } from "@/lib/brave-search";
import { generateHistoryEvents } from "@/lib/grok-event-generator";
import { sanitizeEventMedia } from "@/lib/event-sanitize";
import type { Event } from "@/lib/types";

// ============================================================================
// Constants
// ============================================================================

/** Sentinel value to identify cron-generated submissions */
const CRON_SUBMITTER = "cron:discover-events";

/** Sentinel value for the auto-approval reviewer */
const AUTO_REVIEWER = "cron:auto-approve";

/** Maximum events to submit per run */
const MAX_EVENTS = 5;

/**
 * Dedup window in days (+/-). The same event is sometimes reported under
 * slightly different dates across sources, so candidates are compared against
 * existing events within this many days of the target date, not just the exact
 * day. The title-similarity gate still applies, so distinct events on nearby
 * days are not suppressed.
 */
const DEDUP_DAY_WINDOW = 1;

// ============================================================================
// Deduplication
// ============================================================================

/**
 * English/CT stop words stripped before computing title similarity so that
 * shared boilerplate ("the", "for", "new") doesn't make distinct events
 * collide (e.g. "SEC Sues Ripple" vs "SEC Sues Coinbase").
 */
const STOP_WORDS = new Set([
  "a", "an", "the", "of", "for", "in", "on", "at", "to", "and", "or", "as",
  "by", "with", "from", "into", "amid", "over", "after", "before", "is", "are",
  "was", "were", "be", "been", "it", "its", "this", "that", "new", "now",
]);

/** Title similarity (Jaccard over content words) at/above which two events are duplicates. */
const SIMILARITY_THRESHOLD = 0.7;

/** Minimum word count for a title to be trusted in a substring-containment match. */
const MIN_SUBSTRING_WORDS = 3;

/** Lowercase, strip punctuation to spaces, and collapse whitespace. */
function normalizeTitle(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** Content words of a normalized title, with stop words removed. */
function contentWords(norm: string): Set<string> {
  return new Set(norm.split(" ").filter((w) => w && !STOP_WORDS.has(w)));
}

/** Jaccard similarity between two word sets: |A∩B| / |A∪B|. */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Check if a candidate event is a duplicate of an existing event.
 * Matches on exact id, content-word Jaccard similarity (>= SIMILARITY_THRESHOLD),
 * or substring containment when the shorter title carries enough signal.
 */
function isDuplicate(
  candidate: Event,
  existingTitles: string[],
  existingIds: string[]
): boolean {
  // Exact ID match
  if (existingIds.includes(candidate.id)) return true;

  const candidateNorm = normalizeTitle(candidate.title);
  if (!candidateNorm) return false;
  const candidateWords = contentWords(candidateNorm);
  const candidateWordCount = candidateNorm.split(" ").length;

  for (const title of existingTitles) {
    const existingNorm = normalizeTitle(title);
    if (!existingNorm) continue; // guard: empty title would match everything

    // Content-word Jaccard similarity
    if (jaccard(candidateWords, contentWords(existingNorm)) >= SIMILARITY_THRESHOLD) {
      return true;
    }

    // Substring containment — only trust it when the shorter title has enough
    // words, so short generic titles don't swallow unrelated candidates.
    const existingWordCount = existingNorm.split(" ").length;
    if (
      Math.min(candidateWordCount, existingWordCount) >= MIN_SUBSTRING_WORDS &&
      (candidateNorm.includes(existingNorm) || existingNorm.includes(candidateNorm))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Validate that an event's date matches the expected month/day.
 */
function matchesMonthDay(event: Event, month: number, day: number): boolean {
  const parts = event.date.split("-");
  if (parts.length !== 3) return false;
  return parseInt(parts[1], 10) === month && parseInt(parts[2], 10) === day;
}

// ============================================================================
// Cron Handler
// ============================================================================

/**
 * Daily Crypto History Discovery Cron
 *
 * Uses Brave Search + xAI (Grok) to discover crypto events that happened
 * on today's calendar date in history. Sanitizes and inserts up to 5 events
 * directly into the `events` table, recording an approved row in
 * `event_submissions` for audit trail.
 *
 * Schedule: Once daily at 11:00 UTC (~5-6 AM Chicago)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Auth
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && !validateAuthHeader(authHeader, cronSecret, true)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Supabase init
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Get today's date in Chicago timezone
    const postDate = getCurrentChicagoDateString();
    const [, monthStr, dayStr] = postDate.split("-");
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    // 4. Idempotency check — skip if already submitted MAX_EVENTS today
    const todayStart = `${postDate}T00:00:00.000Z`;
    const todayEnd = `${postDate}T23:59:59.999Z`;
    const { data: existingRuns } = await supabase
      .from("event_submissions")
      .select("id")
      .eq("submitted_by_email", CRON_SUBMITTER)
      .gte("submitted_at", todayStart)
      .lte("submitted_at", todayEnd);

    const todaySubmissionCount = existingRuns?.length ?? 0;
    if (todaySubmissionCount >= MAX_EVENTS) {
      return NextResponse.json({
        message: `Already submitted ${todaySubmissionCount} events today (max ${MAX_EVENTS})`,
        status: "skipped",
        postDate,
      });
    }

    const remainingSlots = MAX_EVENTS - todaySubmissionCount;

    // 5. Fetch existing events for dedup.
    // Scope is intentionally limited to events already LIVE within a small
    // +/- DEDUP_DAY_WINDOW window around this calendar day (plus same-run picks,
    // tracked below) — the same event is often reported under slightly
    // different dates, so we compare against nearby days, not just the exact
    // one. We no longer dedup against the full pending/approved submission
    // queue: cross-date titles caused false positives, and stale `pending` rows
    // (never posted) would suppress valid re-discovery. Since events are
    // auto-approved straight into `events`, the live set is the authoritative
    // "already have it" reference.
    const chicagoDate = new Date(postDate + "T00:00:00Z");
    const existingEvents = await getEventsWithinDayWindow(chicagoDate, DEDUP_DAY_WINDOW);
    const existingIds = existingEvents.map((e) => e.id);
    const existingTitles = existingEvents.map((e) => e.title);

    // 6. Brave Search
    const searchResults = await searchCryptoHistory(month, day);

    if (searchResults.length === 0) {
      return NextResponse.json({
        message: "No search results found",
        status: "skipped",
        postDate,
      });
    }

    // 7. xAI generation
    const generatedEvents = await generateHistoryEvents(
      searchResults,
      month,
      day,
      existingTitles
    );

    if (generatedEvents.length === 0) {
      return NextResponse.json({
        message: "xAI returned no valid events",
        status: "skipped",
        postDate,
        searchResultCount: searchResults.length,
      });
    }

    // 8. Dedup filter
    const skippedEvents: string[] = [];
    const validEvents: Event[] = [];

    for (const event of generatedEvents) {
      // 9. Date validation
      if (!matchesMonthDay(event, month, day)) {
        skippedEvents.push(`${event.title} (date mismatch: ${event.date})`);
        continue;
      }

      if (isDuplicate(event, existingTitles, existingIds)) {
        skippedEvents.push(`${event.title} (duplicate)`);
        continue;
      }

      validEvents.push(event);

      // Track this event's title/id to prevent intra-batch duplicates
      existingTitles.push(event.title);
      existingIds.push(event.id);
    }

    const eventsToInsert = validEvents.slice(0, remainingSlots);

    if (eventsToInsert.length === 0) {
      return NextResponse.json({
        message: "All generated events were duplicates or invalid",
        status: "skipped",
        postDate,
        generatedCount: generatedEvents.length,
        skippedEvents,
      });
    }

    // 10. Auto-approve: sanitize each event, insert into `events`, then
    // record an approved submission for audit trail. Failures are isolated
    // per-event so one bad row doesn't block the rest.
    const reviewedAt = new Date().toISOString();
    const insertedEvents: Array<{ id: string; title: string; date: string; warnings?: string[] }> = [];
    const failedEvents: Array<{ id: string; reason: string }> = [];

    for (const event of eventsToInsert) {
      // sanitizeEventMedia only touches image/media; id/title/date/summary
      // come from the validated `event` object.
      const { event: sanitized, warnings } = sanitizeEventMedia(event);

      const insertData = {
        id: event.id,
        date: event.date,
        title: event.title,
        summary: event.summary,
        category: event.category || [],
        tags: event.tags || [],
        mode: event.mode || ["timeline"],
        image: sanitized.image || null,
        media: sanitized.media || [],
        links: event.links || [],
        metrics: event.metrics || {},
        crimeline: event.crimeline || null,
      };

      const { error: eventInsertError } = await supabase
        .from("events")
        .insert([insertData]);

      if (eventInsertError) {
        console.error(`Failed to insert event "${event.id}":`, eventInsertError);
        failedEvents.push({ id: event.id, reason: eventInsertError.message });
        continue;
      }

      const { error: submissionInsertError } = await supabase
        .from("event_submissions")
        .insert({
          status: "approved" as const,
          submitted_by_email: CRON_SUBMITTER,
          event_data: { ...event, ...sanitized },
          reviewed_by: AUTO_REVIEWER,
          reviewed_at: reviewedAt,
          created_event_id: event.id,
        });

      if (submissionInsertError) {
        // Audit-record failure shouldn't fail the run — the event is live.
        console.error(
          `Event "${event.id}" inserted but submission audit row failed:`,
          submissionInsertError
        );
      }

      insertedEvents.push({
        id: event.id,
        title: event.title,
        date: event.date,
        warnings: warnings.length > 0 ? warnings : undefined,
      });
    }

    // 11. Return
    return NextResponse.json({
      message: `Auto-approved ${insertedEvents.length} events`,
      status: insertedEvents.length > 0 ? "success" : "skipped",
      postDate,
      inserted: insertedEvents,
      failedEvents,
      skippedEvents,
      searchResultCount: searchResults.length,
      generatedCount: generatedEvents.length,
    });
  } catch (error) {
    console.error("Discover events cron error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
