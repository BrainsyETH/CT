import type { NextRequest } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

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
  /**
   * Use distributed rate limiting via Supabase.
   * Falls back to in-memory if Supabase is unavailable.
   * Default: false (for backwards compatibility)
   */
  distributed?: boolean;
};

const GLOBAL_BUCKETS_KEY = "__coe_rate_limit_buckets__";

function getBucketsStore(): Map<string, Bucket> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[GLOBAL_BUCKETS_KEY]) {
    g[GLOBAL_BUCKETS_KEY] = new Map<string, Bucket>();
  }
  return g[GLOBAL_BUCKETS_KEY] as Map<string, Bucket>;
}

/**
 * Get client IP address from request headers.
 *
 * SECURITY NOTE: This function trusts x-forwarded-for and x-real-ip headers.
 * This is safe when deployed on Vercel, Cloudflare, or other reverse proxies
 * that set these headers correctly and strip any client-provided values.
 *
 * If deploying to an environment where these headers can be spoofed,
 * consider:
 * 1. Only trusting headers from known proxy IPs
 * 2. Using a different header set by your specific infrastructure
 * 3. Falling back to connection-level IP detection
 */
export function getClientIp(request: NextRequest): string {
  // On Vercel, x-forwarded-for is set by the infrastructure and is trustworthy
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

// Lazy-initialized Supabase client for distributed rate limiting
let distributedRateLimitClient: SupabaseClient | null = null;

function getDistributedClient(): SupabaseClient | null {
  if (distributedRateLimitClient) return distributedRateLimitClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  distributedRateLimitClient = createClient(url, key);
  return distributedRateLimitClient;
}

/**
 * Distributed rate limiting using Supabase.
 * Uses a rate_limit_buckets table to track request counts across instances.
 */
async function distributedRateLimit(
  ip: string,
  options: RateLimitOptions
): Promise<RateLimitResult | null> {
  const client = getDistributedClient();
  if (!client) return null;

  const now = Date.now();
  const key = `${options.keyPrefix}:${ip}`;

  try {
    // Use Supabase RPC for atomic rate limiting
    // This calls a Postgres function that handles the upsert and count atomically
    const { data, error } = await client.rpc("check_rate_limit", {
      p_key: key,
      p_limit: options.limit,
      p_window_ms: options.windowMs,
    });

    if (error) {
      console.warn("Distributed rate limit error, falling back to in-memory:", error.message);
      return null;
    }

    if (data) {
      const { allowed, remaining, reset_at_ms } = data;
      if (allowed) {
        return { ok: true, remaining, resetAtMs: reset_at_ms };
      } else {
        const retryAfterSeconds = Math.max(1, Math.ceil((reset_at_ms - now) / 1000));
        return { ok: false, remaining: 0, resetAtMs: reset_at_ms, retryAfterSeconds };
      }
    }

    return null;
  } catch (err) {
    console.warn("Distributed rate limit exception, falling back to in-memory:", err);
    return null;
  }
}

/**
 * In-memory IP rate limiter with optional distributed mode.
 *
 * Notes:
 * - In-memory mode: Best-effort on serverless, buckets persist only within a warm instance.
 * - Distributed mode: Uses Supabase for cross-instance rate limiting.
 * - Falls back to in-memory if distributed fails.
 * - Still very effective at preventing accidental/naive abuse and reducing DB load.
 */
export function rateLimit(request: NextRequest, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const ip = getClientIp(request);

  // In-memory rate limiting (default, always runs as fallback)
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

/**
 * Async rate limiter with distributed support.
 * Use this for critical endpoints where cross-instance rate limiting is important.
 */
export async function rateLimitAsync(
  request: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const ip = getClientIp(request);

  // Try distributed rate limiting first if enabled
  if (options.distributed) {
    const distributedResult = await distributedRateLimit(ip, options);
    if (distributedResult) {
      return distributedResult;
    }
    // Fall through to in-memory on failure
  }

  // Fall back to in-memory rate limiting
  return rateLimit(request, options);
}
