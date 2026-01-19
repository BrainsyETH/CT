import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/events-db";

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
