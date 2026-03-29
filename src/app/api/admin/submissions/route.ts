import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sanitizeEventMedia } from "@/lib/event-sanitize";
import { validateAuthHeader } from "@/lib/crypto-utils";
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
    if (!validateAuthHeader(authHeader, ADMIN_SECRET)) {
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
    if (!validateAuthHeader(authHeader, ADMIN_SECRET)) {
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
        { success: false, error: `Submission not found: ${fetchError?.message || "no data"}` },
        { status: 404 }
      );
    }

    // Block re-rejection, but allow re-approval of "approved" submissions
    // that are missing their event in the events table
    if (action === "reject" && submission.status === "rejected") {
      return NextResponse.json(
        { success: false, error: "Submission already rejected" },
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
    const rawEventData = event_data_override || submission.event_data;

    // Handle case where event_data might be stringified JSON
    const eventData: Partial<Event> =
      typeof rawEventData === "string" ? JSON.parse(rawEventData) : rawEventData;

    if (!eventData || !eventData.id || !eventData.date || !eventData.title || !eventData.summary) {
      return NextResponse.json(
        {
          success: false,
          error: "Event data missing required fields (id, date, title, summary)",
          debug: {
            hasEventData: !!eventData,
            hasId: !!eventData?.id,
            hasDate: !!eventData?.date,
            hasTitle: !!eventData?.title,
            hasSummary: !!eventData?.summary,
            eventDataKeys: eventData ? Object.keys(eventData) : [],
          },
        },
        { status: 400 }
      );
    }

    // Check if event already exists in events table
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventData.id)
      .single();

    if (existing) {
      // If already approved and event exists, just update the submission link
      if (submission.status === "approved") {
        return NextResponse.json({
          success: true,
          message: `Event "${eventData.id}" already exists in events table`,
          event_id: eventData.id,
        });
      }
      return NextResponse.json(
        { success: false, error: `Event with id "${eventData.id}" already exists in events table` },
        { status: 409 }
      );
    }

    // Sanitize image and media before insertion
    const { event: sanitized, warnings } = sanitizeEventMedia(eventData);

    // Insert the event — match the exact same format as submit-event/route.ts
    const insertData = {
      id: sanitized.id,
      date: sanitized.date,
      title: sanitized.title,
      summary: sanitized.summary,
      category: sanitized.category || [],
      tags: sanitized.tags || [],
      mode: sanitized.mode || ["timeline"],
      image: sanitized.image || null,
      media: sanitized.media || [],
      links: sanitized.links || [],
      metrics: sanitized.metrics || {},
      crimeline: sanitized.crimeline || null,
    };

    const { error: insertError } = await supabase
      .from("events")
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      console.error("Event insert error:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to insert event: ${insertError.message}`,
          code: insertError.code,
          details: insertError.details,
        },
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
    }

    return NextResponse.json({
      success: true,
      message: `Event "${eventData.id}" approved and created`,
      event_id: eventData.id,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
