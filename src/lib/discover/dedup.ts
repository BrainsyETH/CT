/**
 * Title-based deduplication for event discovery.
 *
 * Shared by the historical ("this day in history") and recent-news discovery
 * crons so both use identical matching rules.
 */

import type { Event } from "@/lib/types";

/**
 * English/CT stop words stripped before computing title similarity so that
 * shared boilerplate ("the", "for", "new") doesn't make distinct events
 * collide (e.g. "SEC Sues Ripple" vs "SEC Sues Coinbase").
 */
const STOP_WORDS = new Set([
  "a", "an", "the", "of", "for", "in", "on", "at", "to", "and", "or", "as",
  "by", "with", "from", "into", "amid", "over", "after", "before", "is", "are",
  "was", "were", "be", "been", "it", "its", "this", "that", "new", "now",
]);

/** Title similarity (Jaccard over content words) at/above which two events are duplicates. */
const SIMILARITY_THRESHOLD = 0.7;

/** Minimum word count for a title to be trusted in a substring-containment match. */
const MIN_SUBSTRING_WORDS = 3;

/** Lowercase, strip punctuation to spaces, and collapse whitespace. */
function normalizeTitle(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** Content words of a normalized title, with stop words removed. */
function contentWords(norm: string): Set<string> {
  return new Set(norm.split(" ").filter((w) => w && !STOP_WORDS.has(w)));
}

/** Jaccard similarity between two word sets: |A∩B| / |A∪B|. */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Check if a candidate event is a duplicate of an existing event.
 * Matches on exact id, content-word Jaccard similarity (>= SIMILARITY_THRESHOLD),
 * or substring containment when the shorter title carries enough signal.
 */
export function isDuplicate(
  candidate: Event,
  existingTitles: string[],
  existingIds: string[]
): boolean {
  // Exact ID match
  if (existingIds.includes(candidate.id)) return true;

  const candidateNorm = normalizeTitle(candidate.title);
  if (!candidateNorm) return false;
  const candidateWords = contentWords(candidateNorm);
  const candidateWordCount = candidateNorm.split(" ").length;

  for (const title of existingTitles) {
    const existingNorm = normalizeTitle(title);
    if (!existingNorm) continue; // guard: empty title would match everything

    // Content-word Jaccard similarity
    if (jaccard(candidateWords, contentWords(existingNorm)) >= SIMILARITY_THRESHOLD) {
      return true;
    }

    // Substring containment — only trust it when the shorter title has enough
    // words, so short generic titles don't swallow unrelated candidates.
    const existingWordCount = existingNorm.split(" ").length;
    if (
      Math.min(candidateWordCount, existingWordCount) >= MIN_SUBSTRING_WORDS &&
      (candidateNorm.includes(existingNorm) || existingNorm.includes(candidateNorm))
    ) {
      return true;
    }
  }

  return false;
}
