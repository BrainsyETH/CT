import { NextRequest, NextResponse } from "next/server";
import {
  getEventForSlot,
  postEventToFarcaster,
  getCurrentChicagoDateString,
  POSTING_SLOTS,
} from "@/lib/farcaster";

/**
 * Manual Farcaster Post Trigger
 *
 * This endpoint allows you to manually trigger a post to Farcaster
 * Useful for testing the actual posting flow
 *
 * Query parameters:
 * - date: YYYY-MM-DD (required)
 * - slot: 0-4 (required)
 * - secret: Your manual trigger secret (for security)
 *
 * Example:
 * /api/cron/farcaster-manual?date=2009-01-03&slot=0&secret=YOUR_SECRET
 *
 * WARNING: This WILL post to Farcaster! Use for testing only.
 * Does NOT save to database to avoid conflicts with the main cron job.
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    const slotParam = searchParams.get("slot");
    const secretParam = searchParams.get("secret");

    // Security check
    const manualSecret = process.env.FARCASTER_MANUAL_SECRET;
    if (manualSecret && secretParam !== manualSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate parameters
    if (!dateParam) {
      return NextResponse.json(
        { error: "Missing required parameter: date (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    if (slotParam === null) {
      return NextResponse.json(
        { error: "Missing required parameter: slot (0-4)" },
        { status: 400 }
      );
    }

    const slotIndex = parseInt(slotParam, 10);
    if (isNaN(slotIndex) || slotIndex < 0 || slotIndex > 4) {
      return NextResponse.json(
        { error: "Invalid slot. Must be 0-4" },
        { status: 400 }
      );
    }

    // Parse the date
    const targetDate = new Date(dateParam + "T00:00:00Z");
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Get the event
    const event = await getEventForSlot(targetDate, slotIndex);
    if (!event) {
      return NextResponse.json({
        message: "No event for this date and slot",
        date: dateParam,
        slot: POSTING_SLOTS[slotIndex],
      });
    }

    // Post to Farcaster
    const result = await postEventToFarcaster(event);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to post to Farcaster",
          details: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Posted successfully (manual trigger - not saved to database)",
      status: "success",
      date: dateParam,
      slot: POSTING_SLOTS[slotIndex],
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
      },
      cast: {
        hash: result.castHash,
        url: result.castUrl,
      },
      warning: "This post was NOT saved to the database. Use the cron endpoint for production.",
    });
  } catch (error) {
    console.error("Manual post error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
