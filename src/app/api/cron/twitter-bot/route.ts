import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getCurrentSlot,
  getCurrentChicagoDateString,
  getEventForSlot,
} from "@/lib/farcaster";
import { postEventToTwitter } from "@/lib/twitter";
import { validateAuthHeader } from "@/lib/crypto-utils";
import type { TwitterBotPost } from "@/lib/types";

/**
 * Twitter Bot Cron Handler
 *
 * This endpoint is called by Vercel Cron (every 15 minutes)
 * It checks if the current time matches a posting slot and posts an event if needed
 *
 * Security: Vercel Cron automatically includes a special header for verification
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request from Vercel using timing-safe comparison
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && !validateAuthHeader(authHeader, cronSecret, true)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate environment variables before use
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Initialize Supabase client with service role key for write access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we're in a posting slot
    const currentSlot = getCurrentSlot();
    if (!currentSlot) {
      return NextResponse.json({
        message: "Not a posting hour",
        status: "skipped",
      });
    }

    // Get current date in Chicago timezone
    const postDate = getCurrentChicagoDateString();

    // Check if we've already posted for this slot today
    const { data: existingPost } = await supabase
      .from("twitter_bot_posts")
      .select("*")
      .eq("post_date", postDate)
      .eq("slot_index", currentSlot.index)
      .single();

    if (existingPost) {
      return NextResponse.json({
        message: "Already posted for this slot today",
        status: "skipped",
        slot: currentSlot.label,
        postDate,
        existingPost,
      });
    }

    // Get the event for this slot
    const chicagoTime = new Date(postDate + "T00:00:00Z");
    const event = await getEventForSlot(chicagoTime, currentSlot.index);

    if (!event) {
      // No event for this slot - this is OK, just skip
      return NextResponse.json({
        message: "No event available for this slot",
        status: "skipped",
        slot: currentSlot.label,
        postDate,
        slotIndex: currentSlot.index,
      });
    }

    // Check if we've already posted this specific event today (prevents duplicate events across slots)
    const { data: existingEventPost } = await supabase
      .from("twitter_bot_posts")
      .select("*")
      .eq("post_date", postDate)
      .eq("event_id", event.id)
      .single();

    if (existingEventPost) {
      return NextResponse.json({
        message: "This event was already posted today in a different slot",
        status: "skipped",
        slot: currentSlot.label,
        postDate,
        eventId: event.id,
        existingSlot: existingEventPost.slot_index,
      });
    }

    // Post to Twitter
    const result = await postEventToTwitter(event);

    if (!result.success) {
      console.error("Failed to post to Twitter:", result.error);
      return NextResponse.json(
        {
          error: "Failed to post to Twitter",
          details: result.error,
        },
        { status: 500 }
      );
    }

    // Save to database
    const postRecord: Omit<TwitterBotPost, "id" | "posted_at"> = {
      post_date: postDate,
      slot_index: currentSlot.index,
      slot_hour: currentSlot.hour,
      event_id: event.id,
      event_date: event.date,
      tweet_id: result.tweetId!,
      tweet_url: result.tweetUrl || null,
    };

    const { data: savedPost, error: saveError } = await supabase
      .from("twitter_bot_posts")
      .insert(postRecord)
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save post to database:", saveError);
      // Post was successful but saving failed - log and continue
      return NextResponse.json({
        message: "Posted successfully but failed to save to database",
        status: "partial_success",
        event: {
          id: event.id,
          title: event.title,
        },
        tweet: {
          id: result.tweetId,
          url: result.tweetUrl,
        },
        error: saveError.message,
      });
    }

    return NextResponse.json({
      message: "Posted successfully",
      status: "success",
      slot: currentSlot.label,
      postDate,
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
      },
      tweet: {
        id: result.tweetId,
        url: result.tweetUrl,
      },
      savedPost,
    });
  } catch (error) {
    console.error("Twitter cron job error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
