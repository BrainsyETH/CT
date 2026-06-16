import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateAuthHeader } from "@/lib/crypto-utils";
import { findEventImage } from "@/lib/brave-search";

// ============================================================================
// Constants
// ============================================================================

/** Max events to process per run (bounds Brave API calls + execution time). */
const DEFAULT_MAX = 20;
const HARD_MAX = 50;

/**
 * Image sources that cannot be displayed and should be replaced:
 * - preview.redd.it: Reddit blocks hotlinking (403 to the image optimizer)
 * - imgs.search.brave.com: Brave's proxy URLs expire within hours
 */
const BROKEN_IMAGE_PATTERNS = [
  "image.ilike.%preview.redd.it%",
  "image.ilike.%imgs.search.brave.com%",
];

function clampParam(value: string | null, fallback: number, max: number): number {
  const n = value ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}

// ============================================================================
// Cron / Maintenance Handler
// ============================================================================

/**
 * Re-enrich event images that point at undisplayable sources.
 *
 * Finds events whose stored image is from a broken source (Reddit hotlink-
 * protected URLs, expired Brave proxy URLs) and tries to replace it with an
 * image from a hotlinkable, whitelisted domain via Brave Image Search. If no
 * usable replacement is found, the image is set to null so the app renders its
 * branded fallback instead of a broken box.
 *
 * Process up to ?max events per run (default 20). Run repeatedly to work
 * through the backlog. Auth-gated by CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Auth
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && !validateAuthHeader(authHeader, cronSecret, true)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Supabase init
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const max = clampParam(request.nextUrl.searchParams.get("max"), DEFAULT_MAX, HARD_MAX);

    // 3. Find events with broken image sources
    const { data: events, error } = await supabase
      .from("events")
      .select("id, title, category, image")
      .or(BROKEN_IMAGE_PATTERNS.join(","))
      .limit(max);

    if (error) {
      console.error("Failed to query events for re-enrichment:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        message: "No events with broken images remaining",
        status: "done",
        processed: 0,
      });
    }

    // 4. Try to find a replacement image from a hotlinkable domain for each.
    const replaced: Array<{ id: string; image: string }> = [];
    const cleared: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];

    for (const event of events) {
      const categories = Array.isArray(event.category) ? event.category : [];
      const newImage = await findEventImage(event.title, categories);

      // If no usable replacement, null the field so the app uses its fallback
      // (better a clean branded placeholder than a broken Reddit box).
      const value = newImage ?? null;

      const { error: updateError } = await supabase
        .from("events")
        .update({ image: value })
        .eq("id", event.id);

      if (updateError) {
        failed.push({ id: event.id, reason: updateError.message });
        continue;
      }

      if (newImage) {
        replaced.push({ id: event.id, image: newImage });
      } else {
        cleared.push(event.id);
      }
    }

    return NextResponse.json({
      message: `Re-enriched ${replaced.length}, cleared ${cleared.length}, failed ${failed.length}`,
      status: "success",
      processed: events.length,
      replaced,
      cleared,
      failed,
    });
  } catch (error) {
    console.error("Re-enrich images cron error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
