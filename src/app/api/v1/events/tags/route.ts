import { NextRequest, NextResponse } from "next/server";
import { getTags } from "@/lib/events-db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/v1/events/tags
 *
 * Get all distinct tags across all events
 *
 * Response:
 *   {
 *     tags: string[]
 *   }
 */
export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request, {
      keyPrefix: "api:v1:events:tags",
      limit: 240,
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

    const tags = await getTags();

    const response = {
      tags,
    };

    // Add caching headers (cache for 1 day since tags rarely change)
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Error in /api/v1/events/tags:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch tags",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
