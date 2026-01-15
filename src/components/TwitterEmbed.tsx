"use client";

import { useEffect, useRef, useState } from "react";
import type { TwitterMedia } from "@/lib/types";
import { isMobile } from "@/lib/utils";
import { embedQueue } from "@/lib/embed-queue";

// Cache mobile detection to avoid repeated checks
let mobileCache: boolean | null = null;
const getIsMobile = () => {
  if (mobileCache === null && typeof window !== "undefined") {
    mobileCache = isMobile();
  }
  return mobileCache ?? false;
};

declare global {
  interface Window {
    twttr?: {
      ready: (callback: () => void) => void;
      widgets: {
        load: (element?: HTMLElement) => void;
        createTweet: (
          tweetId: string,
          container: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement | null>;
      };
    };
  }
}

interface TwitterEmbedProps {
  twitter: TwitterMedia;
  theme?: "light" | "dark";
  autoLoad?: boolean; // Auto-load without activation button (default: true)
  isInModal?: boolean; // Whether this is in a modal context (default: false)
}

let twitterScriptPromise: Promise<void> | null = null;

const ensureTwitterScript = (): Promise<void> => {
  if (twitterScriptPromise) {
    return twitterScriptPromise;
  }

  twitterScriptPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    if (window.twttr?.widgets) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src*="platform.twitter.com/widgets.js"]');
    if (existingScript && window.twttr) {
      window.twttr.ready(() => resolve());
      return;
    }

    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => {
      if (window.twttr) {
        window.twttr.ready(() => resolve());
      } else {
        reject(new Error("Twitter widget failed to initialize"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load Twitter widget"));
    document.head.appendChild(script);
  });

  return twitterScriptPromise;
};

// Preload Twitter script for faster loading in modals
export const preloadTwitterScript = (): void => {
  if (typeof window === "undefined") return;
  if (window.twttr?.widgets) return;
  if (document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) return;
  
  // Start loading script in background
  ensureTwitterScript().catch(() => {
    // Silently fail preload - will retry when needed
  });
};

// Extract tweet ID from various Twitter/X URL formats
export function extractTweetId(url: string): string | null {
  // Remove query parameters and hash first
  const cleanUrl = url.split("?")[0].split("#")[0];

  const patterns = [
    /twitter\.com\/\w+\/status\/(\d+)/,
    /x\.com\/\w+\/status\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function TwitterEmbed({ 
  twitter, 
  theme = "light",
  autoLoad = true,
  isInModal = false,
}: TwitterEmbedProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);
  const cancelLoadRef = useRef<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [isActivated, setIsActivated] = useState(autoLoad);

  // Check if we have valid twitter data
  const hasTweetUrl = twitter.tweet_url && twitter.tweet_url.trim() !== "";
  const hasAccountHandle = twitter.account_handle && twitter.account_handle.trim() !== "";
  const hasValidData = hasTweetUrl || hasAccountHandle;

  // Get stable identifiers for the tweet
  const tweetUrl = twitter.tweet_url || "";
  const accountHandle = twitter.account_handle || "";
  const openUrl = tweetUrl || (accountHandle ? `https://twitter.com/${accountHandle}` : "");
  const openUrl = tweetUrl || (accountHandle ? `https://twitter.com/${accountHandle}` : "");

  useEffect(() => {
    if (!hasValidData) {
      return;
    }

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (!isActivated) {
      setIsInView(false);
      setIsLoading(false);
      return;
    }

    // In modal context with autoLoad, immediately set as in view and skip observer
    if (isInModal && autoLoad) {
      setIsInView(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    // Reset in-view state when component remounts or data changes
    setIsInView(false);
    setIsLoading(true);
    hasLoadedRef.current = false;

    // Adjust rootMargin based on context
    // Modal context: smaller margin since modal is fixed
    // Preview context: larger margin for better preloading
    const rootMargin = isInModal
      ? getIsMobile() ? "50px" : "100px"
      : getIsMobile() ? "300px" : "600px";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          } else {
            setIsInView(false);
          }
        });
      },
      { rootMargin, threshold: 0.1 }
    );

    observer.observe(wrapper);

    return () => {
      observer.disconnect();
    };
  }, [hasValidData, tweetUrl, accountHandle, isActivated, isInModal, autoLoad]);

  useEffect(() => {
    // Skip if no valid data
    if (!hasValidData) {
      setError("No Twitter content provided");
      setIsLoading(false);
      return;
    }

    if (!isActivated || !isInView) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      // Use requestAnimationFrame to wait for container to be ready
      const rafId = requestAnimationFrame(() => {
        // Container should be ready on next frame
      });
      return () => cancelAnimationFrame(rafId);
    }

    const currentTweetId = extractTweetId(tweetUrl);
    const currentTimelineHandle = accountHandle.trim();
    const existingTweetId = container.dataset.tweetId;
    const existingTimelineHandle = container.dataset.timelineHandle;
    const hasExistingEmbed = container.querySelector(
      "iframe, .twitter-tweet, .twitter-timeline"
    );

    // Skip if already loaded with correct content (prevents re-clearing on re-renders)
    if (
      hasLoadedRef.current &&
      hasExistingEmbed &&
      ((currentTweetId && existingTweetId === currentTweetId) ||
        (currentTimelineHandle && existingTimelineHandle === currentTimelineHandle))
    ) {
      setIsLoading(false);
      return;
    }

    // Reset loading state when content changes
    if (
      (currentTweetId && existingTweetId !== currentTweetId) ||
      (currentTimelineHandle && existingTimelineHandle !== currentTimelineHandle)
    ) {
      setIsLoading(true);
      hasLoadedRef.current = false;
    }

    const embedTweet = async () => {
      try {
        // If we already have the correct embed loaded, don't reload
        if (hasLoadedRef.current && hasExistingEmbed) {
          return;
        }

        // In modal context, load immediately without any delays
        if (isInModal) {
          // Pre-load script immediately
          await ensureTwitterScript();
        } else {
          // For non-modal context, use minimal delays
          // Small delay to avoid blocking initial render
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              setTimeout(() => resolve(), 50);
            });
          });
          await ensureTwitterScript();
        }

        if (!window.twttr) {
          throw new Error("Twitter widget not available");
        }

        if (tweetUrl) {
          const tweetId = currentTweetId;
          if (!tweetId) {
            throw new Error("Invalid tweet URL");
          }

          // Clear container before creating new tweet
          container.innerHTML = "";
          
          const tweetElement = await window.twttr.widgets.createTweet(tweetId, container, {
            theme: theme,
            dnt: true, // Do not track
            align: "center",
          });

          // createTweet returns null if tweet can't be embedded
          if (!tweetElement) {
            throw new Error("Tweet could not be loaded");
          }

          // Tweet was created successfully
          hasLoadedRef.current = true;
          container.dataset.tweetId = tweetId;
          delete container.dataset.timelineHandle;
          setIsLoading(false);
        } else if (accountHandle) {
          // For account timelines, we use an anchor tag that Twitter converts
          const anchor = document.createElement("a");
          anchor.className = "twitter-timeline";
          anchor.href = `https://twitter.com/${accountHandle}`;
          anchor.dataset.theme = theme;
          anchor.dataset.height = "400";
          anchor.dataset.dnt = "true";
          container.appendChild(anchor);
          window.twttr.ready(() => {
            window.twttr?.widgets.load(container);
            hasLoadedRef.current = true;
            container.dataset.timelineHandle = currentTimelineHandle;
            delete container.dataset.tweetId;
            setIsLoading(false);
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tweet");
        setIsLoading(false);
      }
    };

    // Queue the embed load to limit concurrent loads
    const loadId = `twitter-${currentTweetId || currentTimelineHandle || Date.now()}`;
    const priority = isInModal ? 10 : 5; // Higher priority in modal
    
    // Cancel any existing queued load
    if (cancelLoadRef.current) {
      cancelLoadRef.current();
    }

    cancelLoadRef.current = embedQueue.enqueue({
      id: loadId,
      type: "twitter",
      priority,
      loadFn: embedTweet,
    });

    return () => {
      if (cancelLoadRef.current) {
        cancelLoadRef.current();
        cancelLoadRef.current = null;
      }
    };
  }, [tweetUrl, accountHandle, theme, hasValidData, isInView, isActivated, isInModal]);

  if (error) {
    return (
      <div className={`flex items-center justify-center w-full h-64 rounded-lg ${
        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
      }`}>
        <div className={`text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          <svg
            className="w-12 h-12 mx-auto mb-2 opacity-50"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Show activation button only if autoLoad is false
  if (!isActivated && !autoLoad) {
    return (
      <div className="w-full relative embed-container--tweet" ref={wrapperRef}>
        <div
          className={`flex flex-col items-center justify-center gap-3 w-full min-h-[300px] rounded-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}
        >
          <svg
            className={`w-12 h-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <div className="text-center space-y-2">
            <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Tweet preview is ready when you are.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsActivated(true);
                setIsLoading(true);
              }}
              className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
                theme === "dark"
                  ? "bg-purple-500/80 text-white hover:bg-purple-500"
                  : "bg-teal-500 text-white hover:bg-teal-600"
              }`}
            >
              Load tweet
            </button>
            {openUrl && (
              <div>
                <a
                  href={openUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`text-xs font-medium underline ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Open on X
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative embed-container--tweet py-6 rounded-lg" ref={wrapperRef}>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center w-full min-h-[200px] rounded-lg z-10 ${
          theme === "dark" ? "bg-gray-800/50" : "bg-gray-100/50"
        }`}>
          <div className="flex flex-col items-center gap-2">
            <svg
              className={`w-8 h-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"} animate-pulse`}
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {isInModal && (
              <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                Loading tweet...
              </p>
            )}
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className={`twitter-embed-container rounded-lg ${
          isLoading ? "opacity-0 min-h-[200px]" : "opacity-100 transition-opacity duration-200"
        }`}
      />
    </div>
  );
}
