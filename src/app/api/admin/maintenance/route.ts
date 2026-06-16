import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateAuthHeader } from "@/lib/crypto-utils";
import { reenrichImages, reenrichTweets } from "@/lib/discover/reenrich";

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const HARD_MAX = 40;

/**
 * POST /api/admin/maintenance
 * Body: { task: "images" | "tweets", max?: number }
 *
 * On-demand backfill of event images / tweets, for the admin maintenance page.
 * Runs the same logic as the reenrich-* crons. Auth: x-admin-secret header.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-secret");
    if (!validateAuthHeader(authHeader, ADMIN_SECRET)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.json().catch(() => ({}));
    const task = body?.task;
    const max = Math.min(Math.max(parseInt(String(body?.max ?? 20), 10) || 20, 1), HARD_MAX);

    if (task === "images") {
      const result = await reenrichImages(supabase, max);
      return NextResponse.json({ success: true, task, ...result });
    }
    if (task === "tweets") {
      const result = await reenrichTweets(supabase, max);
      return NextResponse.json({ success: true, task, ...result });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid task. Use "images" or "tweets".' },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin maintenance error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
