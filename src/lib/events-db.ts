/**
 * Events Database Layer
 *
 * This module provides a clean interface for querying events from Supabase.
 * All event queries should go through these functions to maintain consistency.
 */

import { createClient } from "@supabase/supabase-js";
import type { Event } from "@/lib/types";

/**
 * Create a Supabase client for server-side queries
 * Uses service role key for unrestricted access (RLS still applies)
 */
export function getEventsClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration for events");
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Create a Supabase client for client-side queries (read-only)
 * Uses anon key with RLS protection
 */
export function getEventsClientPublic() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase public configuration for events");
  }

  return createClient(supabaseUrl, anonKey);
}

/**
 * Get all events (with optional filters)
 */
export async function getAllEvents(options?: {
  limit?: number;
  offset?: number;
  category?: string[];
  tags?: string[];
  mode?: string[];
  orderBy?: "date" | "title";
  orderDirection?: "asc" | "desc";
}): Promise<{ events: Event[]; total: number }> {
  const client = getEventsClient();

  let query = client.from("events").select("*", { count: "exact" });

  // Apply filters
  if (options?.category && options.category.length > 0) {
    query = query.overlaps("category", options.category);
  }

  if (options?.tags && options.tags.length > 0) {
    query = query.overlaps("tags", options.tags);
  }

  if (options?.mode && options.mode.length > 0) {
    query = query.overlaps("mode", options.mode);
  }

  // Apply ordering
  const orderBy = options?.orderBy || "date";
  const orderDirection = options?.orderDirection || "desc";
  query = query.order(orderBy, { ascending: orderDirection === "asc" });

  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }

  return {
    events: (data || []) as Event[],
    total: count || 0,
  };
}

/**
 * Get a single event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  const client = getEventsClient();

  const { data, error } = await client
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    console.error("Error fetching event:", error);
    throw error;
  }

  return data as Event;
}

/**
 * Get events that occurred on this day in history (any year)
 * Matches month and day, ignoring year
 */
export async function getEventsOnThisDay(
  date: Date,
  options?: {
    limit?: number;
    mode?: string[];
  }
): Promise<Event[]> {
  const client = getEventsClient();

  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate(); // 1-31

  // Use raw SQL for month/day extraction
  let query = client
    .from("events")
    .select("*")
    .filter("date", "gte", `0001-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`)
    .filter("date", "lte", `9999-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);

  // Apply mode filter if specified
  if (options?.mode && options.mode.length > 0) {
    query = query.overlaps("mode", options.mode);
  }

  // Sort by year descending (most recent events first)
  query = query.order("date", { ascending: false });

  // Apply limit
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching events on this day:", error);
    throw error;
  }

  // Additional client-side filter to ensure exact month/day match
  // (The SQL filter above is a range approximation)
  const filteredData = (data || []).filter((event) => {
    const eventDate = new Date(event.date + "T00:00:00Z");
    const eventMonth = eventDate.getUTCMonth() + 1;
    const eventDay = eventDate.getUTCDate();
    return eventMonth === month && eventDay === day;
  });

  return filteredData as Event[];
}

/**
 * Get a specific event for a slot on a given day
 * Used by the Farcaster bot
 */
export async function getEventForSlot(
  date: Date,
  slotIndex: number
): Promise<Event | null> {
  const events = await getEventsOnThisDay(date, { limit: 5 });
  return events[slotIndex] || null;
}

/**
 * Search events by title or summary
 */
export async function searchEvents(
  query: string,
  options?: {
    limit?: number;
    offset?: number;
    mode?: string[];
  }
): Promise<{ events: Event[]; total: number }> {
  const client = getEventsClient();

  // Use Postgres full-text search
  let dbQuery = client
    .from("events")
    .select("*", { count: "exact" })
    .textSearch("title", query, {
      type: "websearch",
      config: "english",
    });

  // Apply mode filter if specified
  if (options?.mode && options.mode.length > 0) {
    dbQuery = dbQuery.overlaps("mode", options.mode);
  }

  // Apply pagination
  if (options?.limit) {
    dbQuery = dbQuery.limit(options.limit);
  }

  if (options?.offset) {
    dbQuery = dbQuery.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    );
  }

  // Order by relevance (Postgres will handle this with full-text search)
  dbQuery = dbQuery.order("date", { ascending: false });

  const { data, error, count } = await dbQuery;

  if (error) {
    console.error("Error searching events:", error);
    throw error;
  }

  return {
    events: (data || []) as Event[],
    total: count || 0,
  };
}

/**
 * Get events by date range
 */
export async function getEventsByDateRange(
  startDate: string,
  endDate: string,
  options?: {
    limit?: number;
    offset?: number;
    mode?: string[];
  }
): Promise<{ events: Event[]; total: number }> {
  const client = getEventsClient();

  let query = client
    .from("events")
    .select("*", { count: "exact" })
    .gte("date", startDate)
    .lte("date", endDate);

  // Apply mode filter if specified
  if (options?.mode && options.mode.length > 0) {
    query = query.overlaps("mode", options.mode);
  }

  // Order by date
  query = query.order("date", { ascending: false });

  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching events by date range:", error);
    throw error;
  }

  return {
    events: (data || []) as Event[],
    total: count || 0,
  };
}

/**
 * Get distinct categories from all events
 */
export async function getCategories(): Promise<string[]> {
  const client = getEventsClient();

  // Get all unique categories across all events
  const { data, error } = await client
    .from("events")
    .select("category");

  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }

  // Flatten and deduplicate
  const categories = new Set<string>();
  (data || []).forEach((event: any) => {
    if (event.category) {
      event.category.forEach((cat: string) => categories.add(cat));
    }
  });

  return Array.from(categories).sort();
}

/**
 * Get distinct tags from all events
 */
export async function getTags(): Promise<string[]> {
  const client = getEventsClient();

  // Get all unique tags across all events
  const { data, error } = await client
    .from("events")
    .select("tags");

  if (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }

  // Flatten and deduplicate
  const tags = new Set<string>();
  (data || []).forEach((event: any) => {
    if (event.tags) {
      event.tags.forEach((tag: string) => tags.add(tag));
    }
  });

  return Array.from(tags).sort();
}
