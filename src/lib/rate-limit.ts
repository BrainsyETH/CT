import type { NextRequest } from "next/server";

type Bucket = {
  count: number;
  resetAtMs: number;
};

type RateLimitResult =
  | { ok: true; remaining: number; resetAtMs: number }
  | { ok: false; remaining: 0; resetAtMs: number; retryAfterSeconds: number };

type RateLimitOptions = {
  /**
   * Namespace for this limiter (separate counters per route family).
   * Example: "api:v1:events"
   */
  keyPrefix: string;
  /** Max requests per window per IP */
  limit: number;
  /** Window size in ms */
  windowMs: number;
};

const GLOBAL_BUCKETS_KEY = "__coe_rate_limit_buckets__";

function getBucketsStore(): Map<string, Bucket> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[GLOBAL_BUCKETS_KEY]) {
    g[GLOBAL_BUCKETS_KEY] = new Map<string, Bucket>();
  }
  return g[GLOBAL_BUCKETS_KEY] as Map<string, Bucket>;
}

export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    // x-forwarded-for can be a comma-separated list; first is original client.
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

/**
 * In-memory IP rate limiter.
 *
 * Notes:
 * - Best-effort on serverless: buckets persist only within a warm instance.
 * - Still very effective at preventing accidental/naive abuse and reducing DB load.
 */
export function rateLimit(request: NextRequest, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const ip = getClientIp(request);
  const buckets = getBucketsStore();

  const key = `${options.keyPrefix}:${ip}`;
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAtMs) {
    const resetAtMs = now + options.windowMs;
    buckets.set(key, { count: 1, resetAtMs });
    return { ok: true, remaining: Math.max(0, options.limit - 1), resetAtMs };
  }

  if (existing.count >= options.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAtMs - now) / 1000));
    return { ok: false, remaining: 0, resetAtMs: existing.resetAtMs, retryAfterSeconds };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { ok: true, remaining: Math.max(0, options.limit - existing.count), resetAtMs: existing.resetAtMs };
}

