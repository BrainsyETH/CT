import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sanitizeFeedbackSubmission, sanitizeEmail } from "@/lib/sanitize";
import { validateFeedbackSubmission } from "@/lib/validation";
import { RATE_LIMIT } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rawBody = await request.json();

    // Validate with Zod schema (handles type, email format, and all field lengths)
    const { submission, errors } = validateFeedbackSubmission(rawBody);

    if (errors || !submission) {
      // Extract user-friendly error messages from Zod errors
      const errorMessages = errors?.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { error: errorMessages || "Invalid submission data" },
        { status: 400 }
      );
    }

    // Sanitize validated inputs for XSS protection
    const body = sanitizeFeedbackSubmission(submission);

    // Rate limiting: Check submissions from this email in the last hour
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT.WINDOW_MS).toISOString();

    const { count, error: countError } = await supabase
      .from("feedback_submissions")
      .select("*", { count: "exact", head: true })
      .eq("email", sanitizeEmail(body.email))
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("Rate limit check error:", countError);
      // Continue anyway - don't block submission if rate limit check fails
    } else if (count !== null && count >= RATE_LIMIT.MAX_SUBMISSIONS) {
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
          email: sanitizeEmail(body.email),
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
          event_video_url: body.event_video_url || null,
          event_video_provider: body.event_video_provider || null,
          event_video_poster_url: body.event_video_poster_url || null,
          event_video_caption: body.event_video_caption || null,
          event_video_orientation: body.event_video_orientation || null,
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
