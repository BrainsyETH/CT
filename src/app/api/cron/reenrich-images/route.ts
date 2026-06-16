import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateAuthHeader } from "@/lib/crypto-utils";
import { reenrichImages } from "@/lib/discover/reenrich";

/** Max events to process per run (bounds image fetches + execution time). */
const DEFAULT_MAX = 15;
const HARD_MAX = 40;

function clampParam(value: string | null, fallback: number, max: number): number {
  const n = value ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}

/**
 * Backfill real images onto events lacking one (Brave Image Search → source
 * og:image → re-host to Vercel Blob). Processes up to ?max events per run
 * (default 15). Run repeatedly to clear the backlog. Auth-gated by CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && !validateAuthHeader(authHeader, cronSecret, true)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const max = clampParam(request.nextUrl.searchParams.get("max"), DEFAULT_MAX, HARD_MAX);
    const result = await reenrichImages(supabase, max);

    return NextResponse.json({
      message: result.done
        ? "No events needing image enrichment remaining"
        : `Re-enriched ${result.replaced.length}, cleared ${result.cleared.length}, unchanged ${result.unchanged.length}, failed ${result.failed.length}`,
      status: result.done ? "done" : "success",
      ...result,
    });
  } catch (error) {
    console.error("Re-enrich images cron error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
