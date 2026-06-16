import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateAuthHeader } from "@/lib/crypto-utils";
import { resolveEventTweets } from "@/lib/discover/tweets";
import type { MediaItem } from "@/lib/types";

// ============================================================================
// Constants
// ============================================================================

/** Max events to process per run (bounds Brave calls + execution time). */
const DEFAULT_MAX = 15;
const HARD_MAX = 40;

/** Target tweet embeds per event. */
const TARGET_TWEETS = 2;

function clampParam(value: string | null, fallback: number, max: number): number {
  const n = value ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}

// ============================================================================
// Cron / Maintenance Handler
// ============================================================================

/**
 * Attach real tweet embeds to events that have none.
 *
 * After the handle-only cleanup, any twitter media item that remains is a real
 * tweet — so events whose media contains no twitter item are the ones lacking
 * tweets. For each, find up to TARGET_TWEETS real tweets via Brave and append
 * them. Best-effort: events with no findable tweets are left unchanged.
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

    // 3. Find events whose media contains no twitter item
    const { data: events, error } = await supabase
      .from("events")
      .select("id, title, media")
      .not("media", "cs", '[{"type":"twitter"}]')
      .limit(max);

    if (error) {
      console.error("Failed to query events for tweet enrichment:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        message: "No events needing tweets remaining",
        status: "done",
        processed: 0,
      });
    }

    // 4. Find + append real tweets for each.
    const updated: Array<{ id: string; added: number }> = [];
    const none: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];

    for (const event of events) {
      const media: MediaItem[] = Array.isArray(event.media) ? event.media : [];
      const found = await resolveEventTweets(event.title, media, TARGET_TWEETS);

      if (found.length === 0) {
        none.push(event.id);
        continue;
      }

      const { error: updateError } = await supabase
        .from("events")
        .update({ media: [...media, ...found] })
        .eq("id", event.id);

      if (updateError) {
        failed.push({ id: event.id, reason: updateError.message });
        continue;
      }

      updated.push({ id: event.id, added: found.length });
    }

    return NextResponse.json({
      message: `Added tweets to ${updated.length}, none found for ${none.length}, failed ${failed.length}`,
      status: "success",
      processed: events.length,
      updated,
      none,
      failed,
    });
  } catch (error) {
    console.error("Re-enrich tweets cron error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
