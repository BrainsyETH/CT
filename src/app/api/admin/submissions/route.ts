import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Event } from "@/lib/types";

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * GET /api/admin/submissions - List submissions with optional status filter
 * POST /api/admin/submissions - Approve or reject a submission
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-secret");
    if (!ADMIN_SECRET || !authHeader || authHeader !== ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const status = request.nextUrl.searchParams.get("status");
    let query = supabase
      .from("event_submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, submissions: data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-secret");
    if (!ADMIN_SECRET || !authHeader || authHeader !== ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { submission_id, action, review_notes, event_data_override } = body as {
      submission_id: string;
      action: "approve" | "reject";
      review_notes?: string;
      event_data_override?: Event;
    };

    if (!submission_id || !action) {
      return NextResponse.json(
        { success: false, error: "Missing submission_id or action" },
        { status: 400 }
      );
    }

    // Fetch the submission
    const { data: submission, error: fetchError } = await supabase
      .from("event_submissions")
      .select("*")
      .eq("id", submission_id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.status !== "pending" && submission.status !== "needs_review") {
      return NextResponse.json(
        { success: false, error: `Submission already ${submission.status}` },
        { status: 409 }
      );
    }

    if (action === "reject") {
      const { error: updateError } = await supabase
        .from("event_submissions")
        .update({
          status: "rejected",
          reviewed_by: "admin",
          reviewed_at: new Date().toISOString(),
          review_notes: review_notes || null,
        })
        .eq("id", submission_id);

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: "Submission rejected" });
    }

    // Approve: insert event into events table, then update submission
    const eventData: Event = event_data_override || submission.event_data;

    if (!eventData.id || !eventData.date || !eventData.title || !eventData.summary) {
      return NextResponse.json(
        { success: false, error: "Event data missing required fields (id, date, title, summary)" },
        { status: 400 }
      );
    }

    // Check for duplicate event ID
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventData.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Event with id "${eventData.id}" already exists` },
        { status: 409 }
      );
    }

    // Insert the event
    const insertData = {
      id: eventData.id,
      date: eventData.date,
      title: eventData.title,
      summary: eventData.summary,
      category: eventData.category || [],
      tags: eventData.tags || [],
      mode: eventData.mode || ["timeline"],
      image: eventData.image || null,
      media: eventData.media || [],
      links: eventData.links || [],
      metrics: eventData.metrics || {},
      crimeline: eventData.crimeline || null,
    };

    const { error: insertError } = await supabase
      .from("events")
      .insert([insertData]);

    if (insertError) {
      return NextResponse.json(
        { success: false, error: `Failed to insert event: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Update submission status
    const { error: updateError } = await supabase
      .from("event_submissions")
      .update({
        status: "approved",
        reviewed_by: "admin",
        reviewed_at: new Date().toISOString(),
        review_notes: review_notes || null,
        created_event_id: eventData.id,
      })
      .eq("id", submission_id);

    if (updateError) {
      console.error("Failed to update submission status:", updateError);
      // Event was created but submission status wasn't updated — not critical
    }

    return NextResponse.json({
      success: true,
      message: `Event "${eventData.id}" approved and created`,
      event_id: eventData.id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
