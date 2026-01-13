/**
 * General utility functions for the application.
 */

import { RETRY_CONFIG } from "./constants";

/**
 * Creates a debounced version of a function that delays invoking func
 * until after wait milliseconds have elapsed since the last invocation.
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Creates a throttled version of a function that only invokes func
 * at most once per every wait milliseconds.
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const now = Date.now();

    if (now - lastTime >= wait) {
      lastTime = now;
      func.apply(this, args);
    } else if (timeoutId === null) {
      // Schedule trailing call
      timeoutId = setTimeout(() => {
        lastTime = Date.now();
        func.apply(this, args);
        timeoutId = null;
      }, wait - (now - lastTime));
    }
  };
}

/**
 * Retries a function with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = RETRY_CONFIG.MAX_RETRIES,
    baseDelayMs = RETRY_CONFIG.BASE_DELAY_MS,
    maxDelayMs = RETRY_CONFIG.MAX_DELAY_MS,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        // Calculate exponential backoff delay
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);

        onRetry?.(attempt + 1, error);

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Normalizes event category to always be an array.
 */
export function normalizeCategory(category: string | string[]): string[] {
  return Array.isArray(category) ? category : [category];
}

/**
 * Checks if a value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Safely parses a number from a string, returning undefined if invalid.
 */
export function parseNumber(value: string | undefined | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Creates a unique ID for client-side use.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Delays execution for the specified duration.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
