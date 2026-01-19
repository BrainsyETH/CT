import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentSlot,
  getCurrentChicagoDateString,
  getTodaysEvents,
  getEventForSlot,
  POSTING_SLOTS,
} from "@/lib/farcaster";
import { formatTwitterPost, validateTwitterEnv } from "@/lib/twitter";

/**
 * Twitter Bot Test Endpoint
 *
 * This endpoint allows testing the Twitter bot without actually posting.
 * It shows what would be posted for a given date and slot.
 *
 * Usage:
 * - GET /api/cron/twitter-test - Check current slot and event
 * - GET /api/cron/twitter-test?date=2009-01-03 - Check events for a specific date
 * - GET /api/cron/twitter-test?date=2009-01-03&slot=0 - Check specific slot for a date
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const slotParam = searchParams.get("slot");

    // Check environment configuration
    let envStatus: { configured: boolean; error?: string } = { configured: true };
    try {
      validateTwitterEnv();
    } catch (error) {
      envStatus = {
        configured: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Use provided date or current Chicago date
    const postDate = dateParam || getCurrentChicagoDateString();
    const testDate = new Date(postDate + "T12:00:00Z"); // Use noon to avoid timezone issues

    // Get current slot info
    const currentSlot = getCurrentSlot();

    // Get all events for this date
    const allEvents = await getTodaysEvents(testDate);

    // If slot is specified, get that specific event
    let slotEvent = null;
    let slotIndex: number | null = null;
    if (slotParam !== null) {
      slotIndex = parseInt(slotParam, 10);
      if (slotIndex >= 0 && slotIndex < POSTING_SLOTS.length) {
        slotEvent = await getEventForSlot(testDate, slotIndex);
      }
    } else if (currentSlot) {
      slotIndex = currentSlot.index;
      slotEvent = await getEventForSlot(testDate, currentSlot.index);
    }

    // Format what the tweet would look like
    let formattedTweet = null;
    if (slotEvent) {
      formattedTweet = formatTwitterPost(slotEvent);
    }

    return NextResponse.json({
      status: "test",
      message: "This is a test endpoint - no tweets are sent",
      environment: envStatus,
      currentTime: {
        chicagoDate: getCurrentChicagoDateString(),
        currentSlot: currentSlot ? currentSlot.label : "Not a posting hour",
        currentSlotIndex: currentSlot?.index ?? null,
      },
      testParameters: {
        date: postDate,
        slotIndex,
      },
      allPostingSlots: POSTING_SLOTS.map((slot) => ({
        index: slot.index,
        hour: slot.hour,
        label: slot.label,
      })),
      eventsForDate: allEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        mode: e.mode,
      })),
      eventForSlot: slotEvent
        ? {
            id: slotEvent.id,
            title: slotEvent.title,
            date: slotEvent.date,
            summary: slotEvent.summary,
          }
        : null,
      formattedTweet: formattedTweet
        ? {
            text: formattedTweet.text,
            eventUrl: formattedTweet.eventUrl,
            characterCount: formattedTweet.text.length,
          }
        : null,
    });
  } catch (error) {
    console.error("Twitter test endpoint error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
