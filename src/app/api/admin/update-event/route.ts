import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Event } from "@/lib/types";
import { validateAuthHeader } from "@/lib/crypto-utils";

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function PUT(request: Request) {
  try {
    // Validate admin secret
    const authHeader = request.headers.get("x-admin-secret");

    if (!ADMIN_SECRET) {
      console.error("ADMIN_SECRET not configured");
      return NextResponse.json(
        { success: false, error: "Server configuration error: ADMIN_SECRET not set" },
        { status: 500 }
      );
    }

    if (!authHeader || !validateAuthHeader(authHeader, ADMIN_SECRET)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing admin secret" },
        { status: 401 }
      );
    }

    // Validate Supabase config
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return NextResponse.json(
        { success: false, error: "Server configuration error: Supabase not configured" },
        { status: 500 }
      );
    }

    // Parse request body
    const event: Event = await request.json();

    // Validate required fields
    if (!event.id || !event.date || !event.title || !event.summary) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: id, date, title, summary" },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
      return NextResponse.json(
        { success: false, error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if event exists
    const { data: existing, error: fetchError } = await supabase
      .from("events")
      .select("id")
      .eq("id", event.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: `Event with id "${event.id}" not found` },
        { status: 404 }
      );
    }

    // Prepare event data for update
    const updateData = {
      date: event.date,
      title: event.title,
      summary: event.summary,
      category: event.category || [],
      tags: event.tags || [],
      mode: event.mode || ["timeline"],
      image: event.image || null,
      media: event.media || [],
      links: event.links || [],
      metrics: event.metrics || {},
      crimeline: event.crimeline || null,
      updated_at: new Date().toISOString(),
    };

    // Update in Supabase
    const { data, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", event.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Event updated successfully", event: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
