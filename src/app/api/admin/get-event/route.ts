import { NextResponse } from "next/server";
import { getEventById, searchEvents, getAllEvents } from "@/lib/events-db";

/**
 * GET /api/admin/get-event
 *
 * Fetch event(s) for the admin editor.
 * Query params:
 *   - id: Get a specific event by ID
 *   - search: Search events by title/summary
 *   - limit: Max results for search (default: 20)
 *
 * No authentication required - events are public data.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search");
    const limitParam = searchParams.get("limit");
    const limit = Math.min(parseInt(limitParam || "20", 10), 100);

    // Get specific event by ID
    if (id) {
      const event = await getEventById(id);

      if (!event) {
        return NextResponse.json(
          { success: false, error: `Event with id "${id}" not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, event });
    }

    // Search events
    if (search) {
      const { events, total } = await searchEvents(search, { limit });
      return NextResponse.json({ success: true, events, total });
    }

    // Return recent events if no filter specified
    const { events, total } = await getAllEvents({
      limit,
      orderBy: "date",
      orderDirection: "desc",
    });

    return NextResponse.json({ success: true, events, total });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
