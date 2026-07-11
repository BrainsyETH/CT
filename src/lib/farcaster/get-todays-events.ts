import { getEventsOnThisDay, getEventForSlot as getEventForSlotDb } from "@/lib/events-db";
import type { Event } from "@/lib/types";

/**
 * Gets all events that match today's month and day (ignoring year)
 * Sorts by year descending (most recent first), then by ID
 * Returns up to 5 events
 *
 * Now uses Supabase database instead of events.json
 */
export async function getTodaysEvents(dateInChicago: Date): Promise<Event[]> {
  const events = await getEventsOnThisDay(dateInChicago, { limit: 5 });
  return events;
}

/**
 * Gets a specific event by slot index from today's events.
 *
 * Options are forwarded to the DB layer — pass `fallbackToRecent` (with
 * `excludeIds`) to keep an automated bot from going silent on calendar days
 * that have no "on this day" event.
 *
 * Now uses Supabase database instead of events.json
 */
export async function getEventForSlot(
  dateInChicago: Date,
  slotIndex: number,
  options?: { fallbackToRecent?: boolean; excludeIds?: string[] }
): Promise<Event | null> {
  const event = await getEventForSlotDb(dateInChicago, slotIndex, options);
  return event;
}
