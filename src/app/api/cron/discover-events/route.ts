import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateAuthHeader } from "@/lib/crypto-utils";
import { getCurrentChicagoDateString } from "@/lib/farcaster/time-utils";
import { getAllEventTitlesForDedup } from "@/lib/events-db";
import { searchCryptoHistory } from "@/lib/brave-search";
import { generateHistoryEvents } from "@/lib/grok-event-generator";
import { isDuplicate, isLowSignalEvent } from "@/lib/discover/dedup";
import { insertApprovedEvents } from "@/lib/discover/persist";
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
 * Daily Crypto History Discovery Cron ("this day in history").
 *
 * Uses Brave Search + xAI (Grok) to discover crypto events that happened
 * on today's calendar date in past years. Sanitizes and inserts up to 5 events
 * directly into the `events` table, recording an approved row in
 * `event_submissions` for audit trail.
 *
 * For current/recent events (not tied to today's calendar day), see the
 * sibling `discover-recent` cron.
 *
 * Schedule: Once daily at 13:00 UTC (~7 AM Chicago)
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

    // 5. Fetch ALL live events (id + title) for dedup.
    // Historical discovery for a given calendar day frequently re-surfaces an
    // event we already stored on a DIFFERENT date (news re-covers it later, or
    // the original was mis-dated). A narrow day-window compare misses those and
    // creates cross-date duplicates. We now compare against the whole live set;
    // the dedup matcher's distinctive-word guard keeps generic titles from
    // false-matching. Same-run picks are appended below to block intra-batch
    // dupes too.
    const existingEvents = await getAllEventTitlesForDedup();
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

    // 8. Dedup + date validation
    const skippedEvents: string[] = [];
    const validEvents: Event[] = [];

    for (const event of generatedEvents) {
      if (!matchesMonthDay(event, month, day)) {
        skippedEvents.push(`${event.title} (date mismatch: ${event.date})`);
        continue;
      }

      if (isLowSignalEvent(event.title)) {
        skippedEvents.push(`${event.title} (low-signal)`);
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

    // 9. Auto-approve: sanitize, insert into `events`, record audit rows.
    const { inserted, failed } = await insertApprovedEvents(supabase, eventsToInsert, {
      submitter: CRON_SUBMITTER,
      reviewer: AUTO_REVIEWER,
    });

    // 10. Return
    return NextResponse.json({
      message: `Auto-approved ${inserted.length} events`,
      status: inserted.length > 0 ? "success" : "skipped",
      postDate,
      inserted,
      failedEvents: failed,
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
