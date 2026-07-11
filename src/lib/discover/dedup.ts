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

/**
 * Overlap-coefficient threshold (|A∩B| / min(|A|,|B|)) for catching the SAME
 * event reworded across a re-discovery. Jaccard alone misses these because the
 * differing tail words drag the union up (e.g. "Meerkat Finance Rug Pull Drains
 * $31M on BSC" vs "Meerkat Finance Rug Pull Confirmed on BSC" → Jaccard 0.36 but
 * overlap 0.67). Guarded by MIN_OVERLAP_WORDS + a distinctive shared word so
 * generic titles ("Bitcoin Mining Stocks Face …") don't over-merge.
 */
const OVERLAP_THRESHOLD = 0.6;
const MIN_OVERLAP_WORDS = 4;

/**
 * Common crypto words that carry little identifying signal on their own. A
 * duplicate match via the overlap rule must share at least one word OUTSIDE
 * this set (a project name, person, ticker, or number) to count.
 */
const GENERIC_WORDS = new Set([
  // Assets / generic nouns
  "crypto", "cryptocurrency", "bitcoin", "btc", "ethereum", "eth", "token",
  "tokens", "coin", "coins", "price", "market", "markets", "trading", "trade",
  "exchange", "defi", "blockchain", "network", "protocol", "project",
  "stocks", "stock", "report", "news", "update", "million", "billion",
  // Topic / action words — describe WHAT happened, not WHICH entity, so they
  // must not by themselves make two titles look like the same event.
  "launch", "launches", "launched", "mining", "miner", "miners", "hack",
  "hacked", "hacks", "exploit", "exploited", "exploits", "rug", "pull", "pulls",
  "depeg", "depegs", "collapse", "collapses", "collapsed", "drains", "drained",
  "stolen", "steal", "unlock", "unlocks", "unlocked", "fork", "forks",
  "upgrade", "upgrades", "arrest", "arrested", "lawsuit", "sues", "sued",
  "halving", "airdrop", "mainnet", "breach", "breached", "scam", "scams",
  "fraud", "volatility", "regulatory", "surge", "surges", "rally", "dump",
  "dumps", "pump", "crash", "crashes", "panic", "face", "faces", "sees",
  "hits", "sparks", "amid",
]);

/**
 * A word is "distinctive" if it isn't a generic crypto term and either is long
 * enough to be a name or contains a digit (an amount/ticker/date).
 */
function isDistinctive(word: string): boolean {
  if (GENERIC_WORDS.has(word)) return false;
  return word.length >= 4 || /\d/.test(word);
}

/** Overlap coefficient: |A∩B| / min(|A|,|B|). */
function overlapCoefficient(a: Set<string>, b: Set<string>): { ratio: number; shared: Set<string> } {
  const shared = new Set<string>();
  for (const w of a) if (b.has(w)) shared.add(w);
  const min = Math.min(a.size, b.size);
  return { ratio: min === 0 ? 0 : shared.size / min, shared };
}

/**
 * Low-signal, non-event titles that the discovery crons should never persist:
 * recurring promos, price-prediction SEO bait, how-to/guide spam, and giveaway
 * farming. Kept deliberately narrow to avoid dropping real events.
 */
const LOW_SIGNAL_PATTERNS: RegExp[] = [
  /\bword of the day\b/i,
  /\bprice prediction\b/i,
  /\bprice analysis\b/i,
  /\bhow to (buy|sell|stake|mine|trade)\b/i,
  /\b(best|top)\s+\d+\s+(coins|tokens|altcoins|memecoins)\b/i,
  /\bgiveaway\b/i,
  /\bpromo code\b/i,
  /\bcoupon\b/i,
  /\bwhat is\b.*\?/i,
  /\bexplained\b\s*$/i,
];

/**
 * Whether an event title looks like low-signal SEO/promo content rather than a
 * real historical event. Used by the discovery crons to skip junk at ingest.
 */
export function isLowSignalEvent(title: string): boolean {
  if (!title || !title.trim()) return true;
  return LOW_SIGNAL_PATTERNS.some((re) => re.test(title));
}

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

    const existingWords = contentWords(existingNorm);

    // Content-word Jaccard similarity
    if (jaccard(candidateWords, existingWords) >= SIMILARITY_THRESHOLD) {
      return true;
    }

    // Overlap coefficient — catches the same event reworded across a
    // re-discovery, where Jaccard is dragged down by the differing tail. Only
    // fires when both titles carry enough words AND they share a distinctive
    // (non-generic) term, so unrelated generic-crypto titles don't merge.
    const { ratio, shared } = overlapCoefficient(candidateWords, existingWords);
    if (
      Math.min(candidateWords.size, existingWords.size) >= MIN_OVERLAP_WORDS &&
      ratio >= OVERLAP_THRESHOLD &&
      [...shared].some(isDistinctive)
    ) {
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
