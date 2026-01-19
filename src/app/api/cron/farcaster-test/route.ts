import { NextRequest, NextResponse } from "next/server";
import {
  getTodaysEvents,
  formatEventPost,
  getCurrentChicagoDateString,
  POSTING_SLOTS,
} from "@/lib/farcaster";

/**
 * Farcaster Bot Test Endpoint
 *
 * This endpoint allows you to test the bot without actually posting to Farcaster
 * It shows what would be posted for each slot today
 *
 * Query parameters:
 * - date: YYYY-MM-DD (optional, defaults to today in Chicago)
 * - slot: 0-4 (optional, shows specific slot)
 * - preview: true/false (optional, shows formatted post without posting)
 *
 * Examples:
 * /api/cron/farcaster-test
 * /api/cron/farcaster-test?date=2009-01-03
 * /api/cron/farcaster-test?date=2009-01-03&slot=0
 * /api/cron/farcaster-test?preview=true
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    const slotParam = searchParams.get("slot");

    // Get the date to check (either from param or today)
    let targetDate: Date;
    if (dateParam) {
      // Parse the provided date
      targetDate = new Date(dateParam + "T00:00:00Z");
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
      }
    } else {
      // Use today in Chicago timezone
      const chicagoDateString = getCurrentChicagoDateString();
      targetDate = new Date(chicagoDateString + "T00:00:00Z");
    }

    // Get all events for this date
    const events = getTodaysEvents(targetDate);

    // If specific slot requested
    if (slotParam !== null) {
      const slotIndex = parseInt(slotParam, 10);
      if (isNaN(slotIndex) || slotIndex < 0 || slotIndex > 4) {
        return NextResponse.json(
          { error: "Invalid slot. Must be 0-4" },
          { status: 400 }
        );
      }

      const event = events[slotIndex];
      if (!event) {
        return NextResponse.json({
          message: "No event for this slot",
          date: targetDate.toISOString().split("T")[0],
          slot: POSTING_SLOTS[slotIndex],
          totalEvents: events.length,
        });
      }

      const post = formatEventPost(event);
      return NextResponse.json({
        date: targetDate.toISOString().split("T")[0],
        slot: POSTING_SLOTS[slotIndex],
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          summary: event.summary,
        },
        post,
      });
    }

    // Show all slots for this date
    const slots = POSTING_SLOTS.map((slot) => {
      const event = events[slot.index];
      if (!event) {
        return {
          slot,
          event: null,
          post: null,
        };
      }

      const post = formatEventPost(event);
      return {
        slot,
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          summary: event.summary,
        },
        post,
      };
    });

    return NextResponse.json({
      date: targetDate.toISOString().split("T")[0],
      totalEvents: events.length,
      slots,
      allEvents: events.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
      })),
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
