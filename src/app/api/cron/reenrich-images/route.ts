import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateAuthHeader } from "@/lib/crypto-utils";
import { resolveEventImage } from "@/lib/discover/image";
import { FALLBACK_IMAGES } from "@/lib/constants";

// ============================================================================
// Constants
// ============================================================================

/** Max events to process per run (bounds image fetches + execution time). */
const DEFAULT_MAX = 15;
const HARD_MAX = 40;

/**
 * Events that lack a real, displayable image and should be (re)enriched:
 * - null image
 * - the branded fallback placeholders
 * - preview.redd.it: Reddit blocks hotlinking (403)
 * - imgs.search.brave.com: Brave proxy URLs expire within hours
 */
const NEEDS_IMAGE_FILTERS = [
  "image.is.null",
  `image.eq.${FALLBACK_IMAGES.TIMELINE}`,
  `image.eq.${FALLBACK_IMAGES.CRIMELINE}`,
  "image.ilike.%preview.redd.it%",
  "image.ilike.%imgs.search.brave.com%",
];

/** Image sources that are broken (vs. the fallback, which is intentional). */
function isBrokenSource(image: string | null): boolean {
  if (!image) return false;
  return image.includes("preview.redd.it") || image.includes("imgs.search.brave.com");
}

function clampParam(value: string | null, fallback: number, max: number): number {
  const n = value ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}

// ============================================================================
// Cron / Maintenance Handler
// ============================================================================

/**
 * Re-enrich event images that aren't real/displayable.
 *
 * For each target event, finds a real image (Brave Image Search or the source
 * article's og:image) and re-hosts it to Vercel Blob so it always renders. If
 * no image can be found, a broken source (Reddit/expired proxy) is nulled so
 * the branded fallback shows; an existing fallback is left as-is.
 *
 * Processes up to ?max events per run (default 15). Run repeatedly to work
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

    // 3. Find events lacking a real image
    const { data: events, error } = await supabase
      .from("events")
      .select("id, title, category, image, links")
      .or(NEEDS_IMAGE_FILTERS.join(","))
      .limit(max);

    if (error) {
      console.error("Failed to query events for re-enrichment:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        message: "No events needing image enrichment remaining",
        status: "done",
        processed: 0,
      });
    }

    // 4. Resolve + re-host a real image for each.
    const replaced: Array<{ id: string; image: string }> = [];
    const cleared: string[] = [];
    const unchanged: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];

    for (const event of events) {
      const categories = Array.isArray(event.category) ? event.category : [];
      const links = Array.isArray(event.links) ? event.links : [];

      const newImage = await resolveEventImage({ title: event.title, categories, links });

      // No replacement found: null a broken source so the fallback renders;
      // leave an existing fallback/null untouched.
      let value: string | null;
      if (newImage) {
        value = newImage;
      } else if (isBrokenSource(event.image)) {
        value = null;
      } else {
        unchanged.push(event.id);
        continue;
      }

      const { error: updateError } = await supabase
        .from("events")
        .update({ image: value })
        .eq("id", event.id);

      if (updateError) {
        failed.push({ id: event.id, reason: updateError.message });
        continue;
      }

      if (newImage) replaced.push({ id: event.id, image: newImage });
      else cleared.push(event.id);
    }

    return NextResponse.json({
      message: `Re-enriched ${replaced.length}, cleared ${cleared.length}, unchanged ${unchanged.length}, failed ${failed.length}`,
      status: "success",
      processed: events.length,
      replaced,
      cleared,
      unchanged,
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
