import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateAuthHeader } from "@/lib/crypto-utils";
import { getEventsByDateRange } from "@/lib/events-db";
import { searchRecentCryptoNews } from "@/lib/brave-search";
import { generateRecentEvents } from "@/lib/grok-event-generator";
import { isDuplicate } from "@/lib/discover/dedup";
import { insertApprovedEvents } from "@/lib/discover/persist";
import type { Event } from "@/lib/types";

// ============================================================================
// Constants
// ============================================================================

/** Sentinel value to identify cron-generated submissions */
const CRON_SUBMITTER = "cron:discover-recent";

/** Sentinel value for the auto-approval reviewer */
const AUTO_REVIEWER = "cron:auto-approve";

/** Maximum events to submit per run */
const MAX_EVENTS = 5;

/** Trailing window (in days) the recent-news pass searches and validates against. */
const RECENT_WINDOW_DAYS = 14;

/** Format a Date as YYYY-MM-DD (UTC). */
function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Validate that an event's date is a real date within [start, end] (inclusive).
 * String comparison is valid for zero-padded YYYY-MM-DD.
 */
function isWithinWindow(event: Event, start: string, end: string): boolean {
  const date = event.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  return date >= start && date <= end;
}

// ============================================================================
// Cron Handler
// ============================================================================

/**
 * Daily Recent Crypto News Discovery Cron.
 *
 * Unlike the sibling `discover-events` cron (which finds events on today's
 * calendar date across past years), this pass finds CURRENT events from the
 * last RECENT_WINDOW_DAYS and places each on its real date — so the timeline
 * keeps advancing with fresh events. Auto-approves up to 5 events per run.
 *
 * Schedule: Once daily at 14:00 UTC (~8 AM Chicago)
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

    // 3. Compute the trailing window [today - N, today] in UTC
    const now = new Date();
    const windowStartDate = new Date(now);
    windowStartDate.setUTCDate(now.getUTCDate() - RECENT_WINDOW_DAYS);
    const windowStart = toDateString(windowStartDate);
    const windowEnd = toDateString(now);

    // 4. Idempotency check — skip if already submitted MAX_EVENTS today
    const todayStart = `${windowEnd}T00:00:00.000Z`;
    const todayEnd = `${windowEnd}T23:59:59.999Z`;
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
        windowStart,
        windowEnd,
      });
    }

    const remainingSlots = MAX_EVENTS - todaySubmissionCount;

    // 5. Fetch existing live events in the window for dedup (plus same-run picks).
    const { events: existingEvents } = await getEventsByDateRange(
      windowStart,
      windowEnd,
      { limit: 200 }
    );
    const existingIds = existingEvents.map((e) => e.id);
    const existingTitles = existingEvents.map((e) => e.title);

    // 6. Brave Search — recent crypto news across the window
    const searchResults = await searchRecentCryptoNews(RECENT_WINDOW_DAYS);

    if (searchResults.length === 0) {
      return NextResponse.json({
        message: "No search results found",
        status: "skipped",
        windowStart,
        windowEnd,
      });
    }

    // 7. xAI generation
    const generatedEvents = await generateRecentEvents(
      searchResults,
      existingTitles,
      windowStart,
      windowEnd
    );

    if (generatedEvents.length === 0) {
      return NextResponse.json({
        message: "xAI returned no valid events",
        status: "skipped",
        windowStart,
        windowEnd,
        searchResultCount: searchResults.length,
      });
    }

    // 8. Dedup + window validation
    const skippedEvents: string[] = [];
    const validEvents: Event[] = [];

    for (const event of generatedEvents) {
      if (!isWithinWindow(event, windowStart, windowEnd)) {
        skippedEvents.push(`${event.title} (out of window: ${event.date})`);
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
        message: "All generated events were duplicates or out of window",
        status: "skipped",
        windowStart,
        windowEnd,
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
      windowStart,
      windowEnd,
      inserted,
      failedEvents: failed,
      skippedEvents,
      searchResultCount: searchResults.length,
      generatedCount: generatedEvents.length,
    });
  } catch (error) {
    console.error("Discover recent cron error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
