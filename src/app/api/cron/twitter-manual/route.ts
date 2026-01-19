import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentChicagoDateString,
  getEventForSlot,
  POSTING_SLOTS,
} from "@/lib/farcaster";
import { postEventToTwitter, validateTwitterEnv } from "@/lib/twitter";

/**
 * Twitter Bot Manual Trigger Endpoint
 *
 * This endpoint allows manually triggering a Twitter post.
 * Requires authentication via TWITTER_MANUAL_SECRET.
 *
 * WARNING: This endpoint does NOT save to the database to avoid
 * conflicts with the cron job. Use only for testing.
 *
 * Usage:
 * POST /api/cron/twitter-manual?date=2009-01-03&slot=0&secret=YOUR_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const slotParam = searchParams.get("slot");
    const secretParam = searchParams.get("secret");

    // Verify secret
    const expectedSecret = process.env.TWITTER_MANUAL_SECRET;
    if (!expectedSecret) {
      return NextResponse.json(
        { error: "TWITTER_MANUAL_SECRET not configured" },
        { status: 500 }
      );
    }
    if (secretParam !== expectedSecret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    // Validate environment
    try {
      validateTwitterEnv();
    } catch (error) {
      return NextResponse.json(
        {
          error: "Twitter environment not configured",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Parse parameters
    const postDate = dateParam || getCurrentChicagoDateString();
    const slotIndex = slotParam !== null ? parseInt(slotParam, 10) : 0;

    if (slotIndex < 0 || slotIndex >= POSTING_SLOTS.length) {
      return NextResponse.json(
        { error: `Invalid slot index. Must be 0-${POSTING_SLOTS.length - 1}` },
        { status: 400 }
      );
    }

    // Get the event for this slot
    const testDate = new Date(postDate + "T12:00:00Z");
    const event = await getEventForSlot(testDate, slotIndex);

    if (!event) {
      return NextResponse.json(
        {
          error: "No event available for this slot",
          date: postDate,
          slotIndex,
        },
        { status: 404 }
      );
    }

    // Post to Twitter
    const result = await postEventToTwitter(event);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to post to Twitter",
          details: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Posted successfully (NOT saved to database)",
      status: "success",
      warning: "This manual post was NOT saved to database to avoid cron conflicts",
      slot: POSTING_SLOTS[slotIndex].label,
      postDate,
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
      },
      tweet: {
        id: result.tweetId,
        url: result.tweetUrl,
      },
    });
  } catch (error) {
    console.error("Twitter manual trigger error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
