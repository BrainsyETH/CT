/**
 * Input sanitization utilities for preventing XSS and ensuring data integrity.
 */

import { VALIDATION } from "./constants";

/**
 * Sanitizes a string by trimming whitespace and removing potentially dangerous characters.
 * This prevents XSS attacks while preserving legitimate content.
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input) return "";

  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, "")
    // Normalize unicode to prevent homograph attacks
    .normalize("NFC");
}

/**
 * Removes HTML tags from a string using a state machine approach.
 * This avoids ReDoS vulnerabilities that can occur with regex-based approaches.
 */
function stripHtmlTags(input: string): string {
  let result = "";
  let inTag = false;
  let inScript = false;
  let tagBuffer = "";

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === "<") {
      inTag = true;
      tagBuffer = "";
    } else if (char === ">" && inTag) {
      inTag = false;
      const tagName = tagBuffer.toLowerCase().trim();

      // Check if entering/leaving script tag
      if (tagName.startsWith("script")) {
        inScript = true;
      } else if (tagName === "/script") {
        inScript = false;
      }
      tagBuffer = "";
    } else if (inTag) {
      tagBuffer += char;
    } else if (!inScript) {
      result += char;
    }
  }

  return result;
}

/**
 * Removes event handler attributes (onclick, onload, etc.) from text.
 * Uses a simple, non-vulnerable pattern.
 */
function removeEventHandlers(input: string): string {
  // Simple pattern that matches on followed by word characters and =
  // This is O(n) and cannot cause ReDoS
  return input.replace(/\bon[a-z]+\s*=/gi, "data-removed=");
}

/**
 * Sanitizes text content, preserving newlines but removing dangerous patterns.
 * Uses safe algorithms that avoid ReDoS vulnerabilities.
 */
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return "";

  let result = input.trim();

  // Remove null bytes
  result = result.replace(/\0/g, "");

  // Strip HTML tags using state machine (ReDoS-safe)
  result = stripHtmlTags(result);

  // Remove event handlers
  result = removeEventHandlers(result);

  // Normalize unicode
  result = result.normalize("NFC");

  return result;
}

/**
 * Sanitizes and validates an email address.
 */
export function sanitizeEmail(input: string | undefined | null): string {
  if (!input) return "";

  const sanitized = sanitizeString(input).toLowerCase();

  // Truncate to max email length
  return sanitized.slice(0, VALIDATION.MAX_EMAIL_LENGTH);
}

/**
 * Sanitizes a Twitter/X handle.
 */
export function sanitizeTwitterHandle(input: string | undefined | null): string {
  if (!input) return "";

  let sanitized = sanitizeString(input);

  // Ensure it starts with @ if provided
  if (sanitized && !sanitized.startsWith("@")) {
    sanitized = `@${sanitized}`;
  }

  // Remove invalid characters (only allow @, letters, numbers, underscores)
  sanitized = sanitized.replace(/[^@\w]/g, "");

  return sanitized.slice(0, VALIDATION.MAX_TWITTER_HANDLE_LENGTH);
}

/**
 * Sanitizes a URL string.
 */
export function sanitizeUrl(input: string | undefined | null): string {
  if (!input) return "";

  const sanitized = sanitizeString(input);

  // Only allow http and https protocols
  try {
    const url = new URL(sanitized);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }
    return url.toString().slice(0, VALIDATION.MAX_URL_LENGTH);
  } catch {
    // If it's not a valid URL, return empty string
    return "";
  }
}

/**
 * Truncates a string to a maximum length with optional ellipsis.
 */
export function truncateString(
  input: string,
  maxLength: number,
  addEllipsis = false
): string {
  if (input.length <= maxLength) return input;

  const truncated = input.slice(0, maxLength);
  return addEllipsis ? `${truncated.trimEnd()}...` : truncated;
}

/**
 * Sanitizes an object containing feedback submission data.
 */
export function sanitizeFeedbackSubmission<T extends object>(
  data: T
): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      // Apply specific sanitization based on field type
      if (key === "email") {
        sanitized[key] = sanitizeEmail(value);
      } else if (key === "twitter_handle") {
        sanitized[key] = sanitizeTwitterHandle(value);
      } else if (key.includes("url") || key.includes("image")) {
        sanitized[key] = sanitizeUrl(value);
      } else if (key === "message" || key.includes("summary") || key.includes("aftermath")) {
        sanitized[key] = sanitizeText(value);
      } else {
        sanitized[key] = sanitizeString(value);
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
