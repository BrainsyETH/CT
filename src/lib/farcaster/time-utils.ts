import type { PostingSlot } from "@/lib/types";

/**
 * Posting slots in Chicago timezone (America/Chicago)
 * These handle CST/CDT automatically via Intl.DateTimeFormat
 */
export const POSTING_SLOTS: PostingSlot[] = [
  { index: 0, hour: 10, label: "10:00 AM" },
  { index: 1, hour: 13, label: "1:00 PM" },
  { index: 2, hour: 16, label: "4:00 PM" },
  { index: 3, hour: 19, label: "7:00 PM" },
  { index: 4, hour: 22, label: "10:00 PM" },
];

/**
 * Gets the current date and time in America/Chicago timezone
 */
export function getCurrentChicagoTime(): Date {
  // Get current time in Chicago timezone
  const now = new Date();
  const chicagoTimeString = now.toLocaleString("en-US", {
    timeZone: "America/Chicago",
  });
  return new Date(chicagoTimeString);
}

/**
 * Gets the current hour in Chicago timezone (0-23)
 */
export function getCurrentChicagoHour(): number {
  const chicagoTime = getCurrentChicagoTime();
  return chicagoTime.getHours();
}

/**
 * Gets the current date string in YYYY-MM-DD format (Chicago timezone)
 */
export function getCurrentChicagoDateString(): string {
  const chicagoTime = getCurrentChicagoTime();
  return formatDateString(chicagoTime);
}

/**
 * Formats a Date to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Determines which posting slot (if any) matches the current hour
 * Returns null if not a posting hour
 */
export function getCurrentSlot(): PostingSlot | null {
  const currentHour = getCurrentChicagoHour();
  return POSTING_SLOTS.find((slot) => slot.hour === currentHour) || null;
}

/**
 * Checks if we're within a posting window (±15 minutes of a slot hour)
 * This provides more flexibility for cron timing
 */
export function isWithinPostingWindow(): PostingSlot | null {
  const chicagoTime = getCurrentChicagoTime();
  const currentHour = chicagoTime.getHours();
  const currentMinute = chicagoTime.getMinutes();

  // Check if we're within ±15 minutes of any slot
  for (const slot of POSTING_SLOTS) {
    // Within the slot hour (0-59 minutes)
    if (currentHour === slot.hour) {
      return slot;
    }

    // 15 minutes before the slot (previous hour, 45-59 minutes)
    if (currentHour === slot.hour - 1 && currentMinute >= 45) {
      return slot;
    }

    // 15 minutes after the slot (same hour, 0-15 minutes)
    if (currentHour === slot.hour && currentMinute <= 15) {
      return slot;
    }
  }

  return null;
}
