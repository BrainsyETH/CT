import { NextRequest, NextResponse } from "next/server";
import { getEventsOnThisDay } from "@/lib/events-db";

/**
 * GET /api/v1/events/on-this-day
 *
 * Get events that occurred on this day in history (any year)
 *
 * Query parameters:
 *   - date: ISO date string (default: today in UTC)
 *   - limit: number (default: 5, max: 20)
 *   - mode: string[] (comma-separated)
 *
 * Response:
 *   {
 *     date: string,
 *     events: Event[]
 *   }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse date parameter
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    // Validate date
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date parameter. Must be a valid ISO date string" },
        { status: 400 }
      );
    }

    // Parse limit parameter
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 20) : 5;

    // Parse mode filter
    const modeParam = searchParams.get("mode");
    const mode = modeParam
      ? modeParam.split(",").map((m) => m.trim())
      : undefined;

    // Fetch events
    const events = await getEventsOnThisDay(date, {
      limit,
      mode,
    });

    // Build response
    const response = {
      date: date.toISOString().split("T")[0], // Return just the date part
      events,
    };

    // Add caching headers (cache for 1 hour, can be stale for 1 day)
    // We use a shorter cache time since this is a popular endpoint
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error in /api/v1/events/on-this-day:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch events",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
