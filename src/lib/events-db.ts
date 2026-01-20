/**
 * Events Database Layer
 *
 * This module provides a clean interface for querying events from Supabase.
 * All event queries should go through these functions to maintain consistency.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Event } from "@/lib/types";

// ============================================================================
// Constants
// ============================================================================

/** Default limit for paginated queries */
const DEFAULT_LIMIT = 50;

/** Maximum limit for paginated queries to prevent abuse */
const MAX_LIMIT = 500;

// ============================================================================
// Client Management (Singleton Pattern)
// ============================================================================

let serverClient: SupabaseClient | null = null;
let publicClient: SupabaseClient | null = null;

/**
 * Create a Supabase client for server-side queries
 * Uses service role key for unrestricted access (RLS still applies)
 * Uses singleton pattern for efficiency
 */
export function getEventsClient(): SupabaseClient {
  if (serverClient) return serverClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration for events");
  }

  serverClient = createClient(supabaseUrl, supabaseKey);
  return serverClient;
}

/**
 * Create a Supabase client for client-side queries (read-only)
 * Uses anon key with RLS protection
 * Uses singleton pattern for efficiency
 */
export function getEventsClientPublic(): SupabaseClient {
  if (publicClient) return publicClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase public configuration for events");
  }

  publicClient = createClient(supabaseUrl, anonKey);
  return publicClient;
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

  // Apply pagination with sensible defaults and max limits
  const limit = Math.min(options?.limit || DEFAULT_LIMIT, MAX_LIMIT);
  const offset = options?.offset || 0;

  query = query.limit(limit);

  if (offset > 0) {
    query = query.range(offset, offset + limit - 1);
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

  // Use a DB view that exposes computed month/day columns for correct + efficient filtering.
  // See: scripts/supabase/events_month_day_view.sql
  let query = client
    .from("events_with_month_day")
    .select("id,date,title,summary,category,tags,mode,image,media,links,metrics,crimeline")
    .eq("month", month)
    .eq("day", day);

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

  return (data || []) as unknown as Event[];
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
 * Search events by title and summary
 * Uses full-text search on both fields for comprehensive results
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

  // Use Postgres full-text search on title
  // Also search in summary using OR condition for broader matches
  let dbQuery = client
    .from("events")
    .select("*", { count: "exact" })
    .or(`title.plfts.${query},summary.plfts.${query}`);

  // Apply mode filter if specified
  if (options?.mode && options.mode.length > 0) {
    dbQuery = dbQuery.overlaps("mode", options.mode);
  }

  // Apply pagination with sensible limits
  const limit = Math.min(options?.limit || DEFAULT_LIMIT, MAX_LIMIT);
  const offset = options?.offset || 0;

  dbQuery = dbQuery.limit(limit);

  if (offset > 0) {
    dbQuery = dbQuery.range(offset, offset + limit - 1);
  }

  // Order by date (most recent first)
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
 * Uses optimized RPC function when available, falls back to JS deduplication
 */
export async function getCategories(): Promise<string[]> {
  const client = getEventsClient();

  // Try optimized RPC function first
  try {
    const { data: rpcData, error: rpcError } = await client.rpc("get_distinct_categories");

    if (!rpcError && rpcData) {
      return rpcData.map((row: { category: string }) => row.category);
    }
  } catch {
    // RPC function not available, fall back to JS approach
  }

  // Fallback: Get all unique categories across all events (less efficient)
  const { data, error } = await client.from("events").select("category");

  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }

  // Flatten and deduplicate
  const categories = new Set<string>();
  (data || []).forEach((event: { category?: string[] }) => {
    if (event.category) {
      event.category.forEach((cat: string) => categories.add(cat));
    }
  });

  return Array.from(categories).sort();
}

/**
 * Get distinct tags from all events
 * Uses optimized RPC function when available, falls back to JS deduplication
 */
export async function getTags(): Promise<string[]> {
  const client = getEventsClient();

  // Try optimized RPC function first
  try {
    const { data: rpcData, error: rpcError } = await client.rpc("get_distinct_tags");

    if (!rpcError && rpcData) {
      return rpcData.map((row: { tag: string }) => row.tag);
    }
  } catch {
    // RPC function not available, fall back to JS approach
  }

  // Fallback: Get all unique tags across all events (less efficient)
  const { data, error } = await client.from("events").select("tags");

  if (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }

  // Flatten and deduplicate
  const tags = new Set<string>();
  (data || []).forEach((event: { tags?: string[] }) => {
    if (event.tags) {
      event.tags.forEach((tag: string) => tags.add(tag));
    }
  });

  return Array.from(tags).sort();
}
