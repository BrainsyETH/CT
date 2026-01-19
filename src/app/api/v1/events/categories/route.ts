import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/events-db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/v1/events/categories
 *
 * Get all distinct categories across all events
 *
 * Response:
 *   {
 *     categories: string[]
 *   }
 */
export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request, {
      keyPrefix: "api:v1:events:categories",
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

    const categories = await getCategories();

    const response = {
      categories,
    };

    // Add caching headers (cache for 1 day since categories rarely change)
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Error in /api/v1/events/categories:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
