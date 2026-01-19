import { NextRequest, NextResponse } from "next/server";
import { getEventById } from "@/lib/events-db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/v1/events/[id]
 *
 * Get a specific event by ID
 *
 * Response:
 *   Event object or 404 if not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limited = rateLimit(request, {
      keyPrefix: "api:v1:events:by-id",
      limit: 180,
      windowMs: 60_000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "Retry-After": String(limited.retryAfterSeconds),
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const event = await getEventById(id);

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Add caching headers (cache for 1 day since events rarely change)
    return NextResponse.json(event, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Error in /api/v1/events/[id]:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
