import { NextResponse } from "next/server";
import { extractEventFromUrl, type ExtractionHints } from "@/lib/event-extractor";
import { validateAuthHeader } from "@/lib/crypto-utils";
import type { Mode } from "@/lib/types";

interface RequestBody {
  url: string;
  hints?: ExtractionHints;
}

export async function POST(request: Request) {
  try {
    // Validate admin secret using timing-safe comparison
    const authHeader = request.headers.get("x-admin-secret");
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      console.error("ADMIN_SECRET not configured");
      return NextResponse.json(
        { success: false, error: "Server configuration error: ADMIN_SECRET not set" },
        { status: 500 }
      );
    }

    if (!validateAuthHeader(authHeader, adminSecret)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing admin secret" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: RequestBody = await request.json();

    if (!body.url) {
      return NextResponse.json(
        { success: false, error: "Missing required field: url" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      const parsed = new URL(body.url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json(
          { success: false, error: "URL must use http or https protocol" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Validate hints if provided
    const hints: ExtractionHints = {};

    if (body.hints) {
      if (body.hints.mode) {
        const validModes: Mode[] = ["timeline", "crimeline", "both"];
        if (!validModes.includes(body.hints.mode)) {
          return NextResponse.json(
            { success: false, error: `Invalid mode. Must be one of: ${validModes.join(", ")}` },
            { status: 400 }
          );
        }
        hints.mode = body.hints.mode;
      }

      if (body.hints.categories) {
        hints.categories = Array.isArray(body.hints.categories)
          ? body.hints.categories
          : [body.hints.categories];
      }

      if (body.hints.date) {
        // Validate date format YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(body.hints.date)) {
          return NextResponse.json(
            { success: false, error: "Invalid date format. Use YYYY-MM-DD" },
            { status: 400 }
          );
        }
        hints.date = body.hints.date;
      }

      if (body.hints.context) {
        hints.context = body.hints.context.slice(0, 2000); // Limit context length
      }
    }

    // Extract event data
    const result = await extractEventFromUrl(body.url, hints);

    if (!result.success) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error extracting event:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
