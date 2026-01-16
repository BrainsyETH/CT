/**
 * Debug utility for gating debug logging in production
 * Set NEXT_PUBLIC_DEBUG=true in environment to enable debug logging
 */

export function isDebugEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEBUG === 'true';
}
