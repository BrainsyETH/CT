import eventsData from "@/data/events.json";
import type { Event } from "@/lib/types";

const events = eventsData as Event[];

/**
 * Gets all events that match today's month and day (ignoring year)
 * Sorts by year descending (most recent first), then by ID
 * Returns up to 5 events
 */
export function getTodaysEvents(dateInChicago: Date): Event[] {
  const month = dateInChicago.getMonth() + 1; // 1-12
  const day = dateInChicago.getDate(); // 1-31

  const matchingEvents = events.filter((event) => {
    const eventDate = new Date(event.date + "T00:00:00Z"); // Parse as UTC
    const eventMonth = eventDate.getUTCMonth() + 1;
    const eventDay = eventDate.getUTCDate();

    return eventMonth === month && eventDay === day;
  });

  // Sort by year descending (most recent events first), then by ID
  const sortedEvents = matchingEvents.sort((a, b) => {
    const yearA = new Date(a.date).getFullYear();
    const yearB = new Date(b.date).getFullYear();

    if (yearA !== yearB) {
      return yearB - yearA; // Newer years first
    }

    // If same year, sort by ID alphabetically
    return a.id.localeCompare(b.id);
  });

  // Return up to 5 events
  return sortedEvents.slice(0, 5);
}

/**
 * Gets a specific event by slot index from today's events
 */
export function getEventForSlot(dateInChicago: Date, slotIndex: number): Event | null {
  const todaysEvents = getTodaysEvents(dateInChicago);
  return todaysEvents[slotIndex] || null;
}
