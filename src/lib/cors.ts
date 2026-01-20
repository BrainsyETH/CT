/**
 * CORS utilities for API routes.
 *
 * Provides consistent CORS header management for the public API.
 */

/**
 * Standard CORS headers for the public API.
 * These allow cross-origin requests from any origin.
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400", // 24 hours
} as const;

/**
 * Adds CORS headers to an existing headers object.
 */
export function withCorsHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...CORS_HEADERS,
    ...headers,
  };
}

/**
 * Creates a preflight response for OPTIONS requests.
 */
export function handleCorsPreFlight(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
