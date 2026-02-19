/**
 * Generates a Zora coin symbol based on date and slot index.
 * Format: 3-letter month abbreviation + day + slot letter (A-E)
 *
 * Examples:
 *   Slot 0 on Feb 19 → "FEB19A"
 *   Slot 3 on Dec 5  → "DEC5D"
 *   Slot 4 on Jan 15 → "JAN15E"
 */

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

const SLOT_LETTERS = ["A", "B", "C", "D", "E"];

export function generateCoinSymbol(date: string, slotIndex: number): string {
  // date is YYYY-MM-DD format (Chicago timezone post date)
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
  }

  const month = parseInt(match[2], 10); // 1-12
  const day = parseInt(match[3], 10); // 1-31

  const monthAbbr = MONTHS[month - 1];
  if (!monthAbbr) {
    throw new Error(`Invalid month: ${month}`);
  }

  const slotLetter = SLOT_LETTERS[slotIndex];
  if (!slotLetter) {
    throw new Error(`Invalid slot index: ${slotIndex}. Expected 0-4`);
  }

  return `${monthAbbr}${day}${slotLetter}`;
}
