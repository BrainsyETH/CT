import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateAuthHeader } from "@/lib/crypto-utils";
import { importDefiLlamaHacks } from "@/lib/discover/import-defillama";

// Image/tweet enrichment + Grok polish per event can be slow in bulk.
export const maxDuration = 300;

const DEFAULT_MAX = 10;
const HARD_MAX = 25;
const DEFAULT_WINDOW_DAYS = 90;

function clampParam(value: string | null, fallback: number, max: number): number {
  const n = value ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}

/**
 * Import crypto hacks/exploits from DefiLlama (>= $1M) as crimeline events.
 *
 * - Default (daily): recent window only (?days, default 90).
 * - Backfill: ?all=1 walks the full historical hacks DB; run repeatedly (dedup
 *   skips what already exists) until "done".
 * - ?max caps events inserted per run (default 10, max 25).
 *
 * Auth-gated by CRON_SECRET.
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

    const params = request.nextUrl.searchParams;
    const all = params.get("all") === "1" || params.get("all") === "true";
    const days = clampParam(params.get("days"), DEFAULT_WINDOW_DAYS, 3650);
    const max = clampParam(params.get("max"), DEFAULT_MAX, HARD_MAX);

    const result = await importDefiLlamaHacks(supabase, { all, days, max });

    return NextResponse.json({
      message: result.done
        ? "No new DefiLlama hacks to import"
        : `Imported ${result.inserted.length} hacks (${result.skippedDuplicates} dupes skipped)`,
      status: result.done ? "done" : "success",
      mode: all ? "backfill-all" : `recent-${days}d`,
      ...result,
    });
  } catch (error) {
    console.error("Discover DefiLlama cron error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
