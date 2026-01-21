import { NextResponse } from "next/server";
import { getEventsOnThisDay } from "@/lib/events-db";
import { POSTING_SLOTS, getCurrentChicagoTime, formatDateString } from "@/lib/farcaster/time-utils";
import type { Event, PostingSlot } from "@/lib/types";

export interface ScheduledSlot {
  slot: PostingSlot;
  event: Event | null;
}

export interface ScheduledDay {
  date: string; // YYYY-MM-DD
  displayDate: string; // "January 21" format
  dayOfWeek: string; // "Tuesday"
  isToday: boolean;
  slots: ScheduledSlot[];
}

export interface ScheduledPostsResponse {
  success: boolean;
  currentChicagoTime: string;
  days: ScheduledDay[];
  error?: string;
}

/**
 * GET /api/admin/scheduled-posts
 *
 * Returns scheduled posts for today and the next N days.
 * Query params:
 *   - days: number of days to fetch (default: 4, meaning today + 3)
 *
 * No authentication required - this is read-only data.
 */
export async function GET(request: Request): Promise<NextResponse<ScheduledPostsResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const numDays = Math.min(Math.max(parseInt(daysParam || "4", 10), 1), 7); // 1-7 days

    const chicagoNow = getCurrentChicagoTime();
    const days: ScheduledDay[] = [];

    for (let i = 0; i < numDays; i++) {
      const targetDate = new Date(chicagoNow);
      targetDate.setDate(chicagoNow.getDate() + i);

      // Get events for this day (matches month/day across all years)
      const events = await getEventsOnThisDay(targetDate, { limit: 5 });

      // Map events to slots
      const slots: ScheduledSlot[] = POSTING_SLOTS.map((slot, index) => ({
        slot,
        event: events[index] || null,
      }));

      // Format the display date
      const displayDate = targetDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        timeZone: "America/Chicago",
      });

      const dayOfWeek = targetDate.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "America/Chicago",
      });

      days.push({
        date: formatDateString(targetDate),
        displayDate,
        dayOfWeek,
        isToday: i === 0,
        slots,
      });
    }

    return NextResponse.json({
      success: true,
      currentChicagoTime: chicagoNow.toISOString(),
      days,
    });
  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    return NextResponse.json(
      {
        success: false,
        currentChicagoTime: new Date().toISOString(),
        days: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
