import { NextRequest, NextResponse } from "next/server";
import { getAllEvents } from "@/lib/events-db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/v1/events
 *
 * List all events with optional filtering and pagination
 *
 * Query parameters:
 *   - limit: number (default: 50, max: 100)
 *   - offset: number (default: 0)
 *   - category: string[] (comma-separated)
 *   - tags: string[] (comma-separated)
 *   - mode: string[] (comma-separated, e.g., "timeline" or "crimeline")
 *   - orderBy: "date" | "title" (default: "date")
 *   - orderDirection: "asc" | "desc" (default: "desc")
 *
 * Response:
 *   {
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
      keyPrefix: "api:v1:events:list",
      limit: 120,
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

    // Parse pagination parameters
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 50;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    // Parse filter parameters
    const categoryParam = searchParams.get("category");
    const tagsParam = searchParams.get("tags");
    const modeParam = searchParams.get("mode");

    const category = categoryParam
      ? categoryParam.split(",").map((c) => c.trim())
      : undefined;
    const tags = tagsParam
      ? tagsParam.split(",").map((t) => t.trim())
      : undefined;
    const mode = modeParam
      ? modeParam.split(",").map((m) => m.trim())
      : undefined;

    // Parse ordering parameters
    const orderBy = (searchParams.get("orderBy") as "date" | "title") || "date";
    const orderDirection =
      (searchParams.get("orderDirection") as "asc" | "desc") || "desc";

    // Validate orderBy
    if (orderBy !== "date" && orderBy !== "title") {
      return NextResponse.json(
        { error: "Invalid orderBy parameter. Must be 'date' or 'title'" },
        { status: 400 }
      );
    }

    // Validate orderDirection
    if (orderDirection !== "asc" && orderDirection !== "desc") {
      return NextResponse.json(
        { error: "Invalid orderDirection parameter. Must be 'asc' or 'desc'" },
        { status: 400 }
      );
    }

    // Fetch events
    const { events, total } = await getAllEvents({
      limit,
      offset,
      category,
      tags,
      mode,
      orderBy,
      orderDirection,
    });

    // Build response with pagination info
    const response = {
      events,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };

    // Add caching headers (cache for 1 hour)
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error in /api/v1/events:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch events",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
