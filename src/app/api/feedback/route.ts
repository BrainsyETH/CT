import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { FeedbackSubmission } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: FeedbackSubmission = await request.json();

    // Validate required fields
    if (!body.type || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields: type and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate feedback type
    if (!["new_event", "edit_event", "general"].includes(body.type)) {
      return NextResponse.json(
        { error: "Invalid feedback type" },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from("feedback_submissions")
      .insert([
        {
          type: body.type,
          email: body.email,
          twitter_handle: body.twitter_handle || null,
          event_id: body.event_id || null,
          event_title: body.event_title || null,
          event_date: body.event_date || null,
          event_summary: body.event_summary || null,
          event_category: body.event_category || null,
          event_tags: body.event_tags || null,
          event_mode: body.event_mode || null,
          event_image_url: body.event_image_url || null,
          event_source_url: body.event_source_url || null,
          crimeline_type: body.crimeline_type || null,
          crimeline_funds_lost: body.crimeline_funds_lost || null,
          crimeline_status: body.crimeline_status || null,
          crimeline_root_cause: body.crimeline_root_cause || null,
          crimeline_aftermath: body.crimeline_aftermath || null,
          message: body.message || null,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to submit feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Feedback submitted successfully", data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
