import { useState, useEffect } from "react";

/**
 * Custom hook for mobile detection that avoids unnecessary re-renders.
 * Uses a singleton pattern to ensure detection only happens once.
 */

// Singleton to track if detection has already happened
let detectedMobile: boolean | null = null;
let hasDetected = false;

function detectMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Returns true if the user is on a mobile device.
 * Detection only happens once on first call, avoiding re-renders.
 */
export function useMobileDetection(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    // Use cached value if available (for subsequent renders)
    if (hasDetected) return detectedMobile ?? false;
    return false;
  });

  useEffect(() => {
    // Only detect once per app lifecycle
    if (!hasDetected) {
      detectedMobile = detectMobile();
      hasDetected = true;
      setIsMobile(detectedMobile);
    } else if (isMobile !== detectedMobile) {
      // Sync state if somehow out of sync
      setIsMobile(detectedMobile ?? false);
    }
  }, []);

  return isMobile;
}

/**
 * Imperative function for when you need the value synchronously.
 * Returns false during SSR.
 */
export function getIsMobile(): boolean {
  if (!hasDetected) {
    if (typeof window === "undefined") return false;
    detectedMobile = detectMobile();
    hasDetected = true;
  }
  return detectedMobile ?? false;
}
