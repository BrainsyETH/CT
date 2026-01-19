import { NextRequest, NextResponse } from "next/server";
import { searchEvents } from "@/lib/events-db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/v1/events/search
 *
 * Search events by title or summary
 *
 * Query parameters:
 *   - q: string (required, search query)
 *   - limit: number (default: 20, max: 100)
 *   - offset: number (default: 0)
 *   - mode: string[] (comma-separated)
 *
 * Response:
 *   {
 *     query: string,
 *     events: Event[],
 *     pagination: {
 *       total: number,
 *       limit: number,
 *       offset: number,
 *       hasMore: boolean
 *     }
 *   }
 */
export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request, {
      keyPrefix: "api:v1:events:search",
      limit: 60,
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

    const searchParams = request.nextUrl.searchParams;

    // Parse required query parameter
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query (q) is required" },
        { status: 400 }
      );
    }

    // Parse pagination parameters
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 20;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    // Parse mode filter
    const modeParam = searchParams.get("mode");
    const mode = modeParam
      ? modeParam.split(",").map((m) => m.trim())
      : undefined;

    // Search events
    const { events, total } = await searchEvents(query.trim(), {
      limit,
      offset,
      mode,
    });

    // Build response
    const response = {
      query: query.trim(),
      events,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };

    // Add caching headers (cache search results for 30 minutes)
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Error in /api/v1/events/search:", error);
    return NextResponse.json(
      {
        error: "Failed to search events",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
