import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateAuthHeader } from "@/lib/crypto-utils";
import { getCurrentChicagoDateString } from "@/lib/farcaster/time-utils";
import { getEventsOnThisDay } from "@/lib/events-db";
import { searchCryptoHistory } from "@/lib/brave-search";
import { generateHistoryEvents } from "@/lib/grok-event-generator";
import type { Event } from "@/lib/types";

// ============================================================================
// Constants
// ============================================================================

/** Sentinel value to identify cron-generated submissions */
const CRON_SUBMITTER = "cron:discover-events";

/** Maximum events to submit per run */
const MAX_EVENTS = 5;

// ============================================================================
// Deduplication
// ============================================================================

/**
 * Check if a candidate event is a duplicate of an existing event.
 * Uses exact ID match and title word-overlap similarity (>70%).
 */
function isDuplicate(
  candidate: Event,
  existingTitles: string[],
  existingIds: string[]
): boolean {
  // Exact ID match
  if (existingIds.includes(candidate.id)) return true;

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const candidateNorm = normalize(candidate.title);
  const candidateWords = new Set(candidateNorm.split(/\s+/).filter(Boolean));

  for (const title of existingTitles) {
    const existingNorm = normalize(title);
    const existingWords = new Set(existingNorm.split(/\s+/).filter(Boolean));

    // Word overlap similarity (>60% = duplicate)
    const overlap = [...candidateWords].filter((w) => existingWords.has(w)).length;
    const maxSize = Math.max(candidateWords.size, existingWords.size);
    if (maxSize > 0 && overlap / maxSize > 0.6) return true;

    // Substring match — if either title contains the other's key phrase
    if (candidateNorm.includes(existingNorm) || existingNorm.includes(candidateNorm)) return true;
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
 * on today's calendar date in history. Submits 3-5 events to the
 * event_submissions table for admin approval.
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

    // 5. Fetch existing events for dedup
    const chicagoDate = new Date(postDate + "T00:00:00Z");
    const existingEvents = await getEventsOnThisDay(chicagoDate);
    const existingIds = existingEvents.map((e) => e.id);
    const existingTitles = existingEvents.map((e) => e.title);

    // 6. Also check pending + approved submissions to avoid duplicates
    const { data: pendingSubmissions } = await supabase
      .from("event_submissions")
      .select("event_data")
      .in("status", ["pending", "approved"]);

    if (pendingSubmissions) {
      for (const sub of pendingSubmissions) {
        const eventData = sub.event_data as Partial<Event>;
        if (eventData?.title) {
          existingTitles.push(eventData.title);
        }
        if (eventData?.id) {
          existingIds.push(eventData.id);
        }
      }
    }

    // 7. Brave Search
    const searchResults = await searchCryptoHistory(month, day);

    if (searchResults.length === 0) {
      return NextResponse.json({
        message: "No search results found",
        status: "skipped",
        postDate,
      });
    }

    // 8. xAI generation
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

    // 9. Dedup filter
    const skippedEvents: string[] = [];
    const validEvents: Event[] = [];

    for (const event of generatedEvents) {
      // 10. Date validation
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

    // 11. Insert into event_submissions
    const rows = eventsToInsert.map((event) => ({
      status: "pending" as const,
      submitted_by_email: CRON_SUBMITTER,
      event_data: event,
    }));

    const { data: insertedRows, error: insertError } = await supabase
      .from("event_submissions")
      .insert(rows)
      .select("id, event_data");

    if (insertError) {
      console.error("Failed to insert submissions:", insertError);
      return NextResponse.json(
        {
          error: "Failed to save submissions",
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    // 12. Return
    return NextResponse.json({
      message: `Submitted ${eventsToInsert.length} events for approval`,
      status: "success",
      postDate,
      submitted: eventsToInsert.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        categories: e.category,
      })),
      skippedEvents,
      searchResultCount: searchResults.length,
      generatedCount: generatedEvents.length,
      insertedIds: insertedRows?.map((r) => r.id),
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
