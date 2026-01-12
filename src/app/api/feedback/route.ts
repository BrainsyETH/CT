import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { FeedbackSubmission } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const RATE_LIMIT = 5; // Max submissions per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

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

    // Rate limiting: Check submissions from this email in the last hour
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();

    const { count, error: countError } = await supabase
      .from("feedback_submissions")
      .select("*", { count: "exact", head: true })
      .eq("email", body.email.toLowerCase())
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("Rate limit check error:", countError);
      // Continue anyway - don't block submission if rate limit check fails
    } else if (count !== null && count >= RATE_LIMIT) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: "1 hour"
        },
        { status: 429 }
      );
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from("feedback_submissions")
      .insert([
        {
          type: body.type,
          email: body.email.toLowerCase(),
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
