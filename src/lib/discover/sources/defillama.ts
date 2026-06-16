/**
 * DefiLlama hacks/exploits source.
 *
 * Pulls the public DefiLlama hacks dataset (free, no auth) and maps each
 * exploit to a crimeline Event with accurate date + dollar amount (no
 * hallucination). Narratives are polished into CT voice downstream; the
 * structured funds_lost_usd stays authoritative.
 *
 * @see https://defillama.com/hacks
 */

import type { Event, CrimelineType } from "@/lib/types";

const HACKS_URL = "https://api.llama.fi/hacks";
const FETCH_TIMEOUT_MS = 20_000;

/** Minimum USD lost for a hack to be worth a CT event. */
export const HACK_MIN_USD = 1_000_000;

/**
 * Raw DefiLlama hack record. Field names are parsed defensively — confirm
 * against a live response if mapping looks off.
 */
export interface DefiLlamaHack {
  name?: string;
  date?: number; // unix seconds
  amount?: number; // USD or millions (auto-detected below)
  classification?: string;
  technique?: string;
  chain?: string | string[];
  source?: string;
  link?: string;
}

/**
 * Fetch all hacks from DefiLlama.
 */
export async function fetchHacks(): Promise<DefiLlamaHack[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(HACKS_URL, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`DefiLlama hacks HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.hacks)) return data.hacks;
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * DefiLlama sometimes stores `amount` in millions of USD and sometimes in raw
 * USD. Detect from the dataset's magnitude and return a normalizer.
 */
export function buildAmountNormalizer(hacks: DefiLlamaHack[]): (h: DefiLlamaHack) => number {
  const amounts = hacks
    .map((h) => h.amount)
    .filter((n): n is number => typeof n === "number" && n > 0);
  const max = amounts.length > 0 ? Math.max(...amounts) : 0;
  // If even the largest loss is under $100k, the values are denominated in millions.
  const inMillions = max > 0 && max < 100_000;
  return (h) => (typeof h.amount === "number" ? h.amount * (inMillions ? 1_000_000 : 1) : 0);
}

/** Format a USD amount as $292M / $1.2B / $46M. */
function formatUsd(usd: number): string {
  if (usd >= 1_000_000_000) return `$${(usd / 1_000_000_000).toFixed(usd % 1_000_000_000 === 0 ? 0 : 1)}B`;
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd)}`;
}

/** Map a DefiLlama technique/classification to our CrimelineType vocab. */
function mapCrimelineType(hack: DefiLlamaHack): CrimelineType {
  const t = `${hack.technique ?? ""} ${hack.classification ?? ""} ${hack.name ?? ""}`.toLowerCase();
  if (/bridge/.test(t)) return "BRIDGE HACK";
  if (/rug|exit scam/.test(t)) return "RUG PULL";
  if (/oracle|price manipulation/.test(t)) return "ORACLE MANIPULATION";
  if (/private key|access control|wallet|key compromise|admin/.test(t)) return "CUSTODY FAILURE";
  if (/governance/.test(t)) return "GOVERNANCE ATTACK";
  if (/reentran|smart contract|logic|flash loan|exploit|vulnerab/.test(t)) return "PROTOCOL EXPLOIT";
  if (/exchange|cex/.test(t)) return "EXCHANGE HACK";
  if (/fraud|ponzi|scam/.test(t)) return "FRAUD";
  return "OTHER";
}

/** Derive timeline categories from the hack. */
function deriveCategories(hack: DefiLlamaHack, type: CrimelineType): string[] {
  const cats = new Set<string>(["Security"]);
  if (type === "BRIDGE HACK") cats.add("Bridge");
  else if (type === "EXCHANGE HACK") cats.add("Centralized Exchange");
  else if (type === "RUG PULL" || type === "FRAUD") cats.add("Scam");
  else cats.add("DeFi Protocol");
  return [...cats];
}

const kebab = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "hack";

/** Convert a unix-seconds timestamp to YYYY-MM-DD (UTC). */
function toDateString(unixSeconds: number): string | null {
  if (!Number.isFinite(unixSeconds) || unixSeconds <= 0) return null;
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

/**
 * Map a DefiLlama hack to a draft crimeline Event with a factual summary.
 * Returns null if the record is unusable (no name/date). The summary is later
 * polished into CT voice; funds_lost_usd stays authoritative.
 */
export function mapHackToEvent(hack: DefiLlamaHack, amountUsd: number): Event | null {
  const name = (hack.name ?? "").trim();
  const date = toDateString(hack.date ?? 0);
  if (!name || !date) return null;

  const type = mapCrimelineType(hack);
  const chain = Array.isArray(hack.chain) ? hack.chain.join(", ") : hack.chain;
  const technique = hack.technique || hack.classification || "an exploit";
  const amountStr = formatUsd(amountUsd);

  const factParts = [
    `On ${date}, ${name} lost ${amountStr}`,
    chain ? ` on ${chain}` : "",
    ` via ${technique}.`,
    hack.classification ? ` Classification: ${hack.classification}.` : "",
  ];

  const link = hack.link || hack.source;

  return {
    id: `${kebab(name)}-${date}`,
    date,
    title: `${name} Exploited for ${amountStr}`,
    summary: factParts.join(""),
    category: deriveCategories(hack, type),
    tags: ["SECURITY", "FAILURE"],
    mode: ["crimeline", "timeline"],
    links: link ? [{ label: "DefiLlama", url: link }] : [],
    media: [],
    metrics: {},
    crimeline: {
      type,
      funds_lost_usd: amountUsd,
      root_cause: hack.technique ? [hack.technique] : [],
      status: "Unknown",
    },
  } as Event;
}
