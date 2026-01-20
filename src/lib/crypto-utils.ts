/**
 * Cryptographic utilities for secure operations.
 */

import { timingSafeEqual } from "crypto";

/**
 * Performs a timing-safe comparison of two strings.
 * This prevents timing attacks where an attacker could deduce
 * the secret by measuring response times.
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 */
export function safeCompare(a: string | undefined | null, b: string | undefined | null): boolean {
  if (!a || !b) return false;

  // If lengths don't match, we still need to do constant-time comparison
  // to avoid leaking length information
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  // If lengths differ, compare against a dummy buffer of equal length
  // This ensures constant-time comparison regardless of length mismatch
  if (aBuffer.length !== bBuffer.length) {
    // Create a buffer of the same length as 'a' filled with the contents of 'b'
    // (truncated or padded), then compare. This leaks nothing about where they differ.
    const paddedB = Buffer.alloc(aBuffer.length);
    bBuffer.copy(paddedB, 0, 0, Math.min(aBuffer.length, bBuffer.length));
    timingSafeEqual(aBuffer, paddedB);
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

/**
 * Validates an authorization header against an expected secret.
 * Supports both raw token and "Bearer <token>" formats.
 *
 * @param authHeader - The authorization header value
 * @param expectedSecret - The expected secret value
 * @param requireBearer - If true, expects "Bearer <token>" format
 * @returns true if valid, false otherwise
 */
export function validateAuthHeader(
  authHeader: string | null,
  expectedSecret: string | undefined,
  requireBearer = false
): boolean {
  if (!authHeader || !expectedSecret) return false;

  if (requireBearer) {
    if (!authHeader.startsWith("Bearer ")) return false;
    const token = authHeader.slice(7); // Remove "Bearer " prefix
    return safeCompare(token, expectedSecret);
  }

  return safeCompare(authHeader, expectedSecret);
}
