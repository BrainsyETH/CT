import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getCurrentSlot,
  getCurrentChicagoDateString,
  getEventForSlot,
  postEventToFarcaster,
} from "@/lib/farcaster";
import type { FarcasterBotPost } from "@/lib/types";

/**
 * Farcaster Bot Cron Handler
 *
 * This endpoint is called by Vercel Cron (every 15 minutes)
 * It checks if the current time matches a posting slot and posts an event if needed
 *
 * Security: Vercel Cron automatically includes a special header for verification
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request from Vercel
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize Supabase client with service role key for write access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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
      .from("farcaster_bot_posts")
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
    const event = getEventForSlot(chicagoTime, currentSlot.index);

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

    // Post to Farcaster
    const result = await postEventToFarcaster(event);

    if (!result.success) {
      console.error("Failed to post to Farcaster:", result.error);
      return NextResponse.json(
        {
          error: "Failed to post to Farcaster",
          details: result.error,
        },
        { status: 500 }
      );
    }

    // Save to database
    const postRecord: Omit<FarcasterBotPost, "id" | "posted_at"> = {
      post_date: postDate,
      slot_index: currentSlot.index,
      slot_hour: currentSlot.hour,
      event_id: event.id,
      event_date: event.date,
      cast_hash: result.castHash!,
      cast_url: result.castUrl || null,
    };

    const { data: savedPost, error: saveError } = await supabase
      .from("farcaster_bot_posts")
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
        cast: {
          hash: result.castHash,
          url: result.castUrl,
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
      cast: {
        hash: result.castHash,
        url: result.castUrl,
      },
      savedPost,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
