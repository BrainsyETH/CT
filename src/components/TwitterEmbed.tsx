"use client";

import { useEffect, useRef, useState } from "react";
import type { TwitterMedia } from "@/lib/types";
import { isMobile } from "@/lib/utils";

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
}

let twitterScriptPromise: Promise<void> | null = null;
const tweetLoadPromises = new Map<string, Promise<HTMLElement | null>>();
const tweetCache = new Map<string, HTMLElement>();
let prefetchContainer: HTMLDivElement | null = null;

const getCacheKey = (tweetId: string, theme: "light" | "dark") => `${tweetId}:${theme}`;

const getPrefetchContainer = () => {
  if (prefetchContainer) return prefetchContainer;
  if (typeof document === "undefined") return null;
  prefetchContainer = document.createElement("div");
  prefetchContainer.setAttribute("data-twitter-prefetch", "true");
  prefetchContainer.style.position = "absolute";
  prefetchContainer.style.left = "-9999px";
  prefetchContainer.style.top = "0";
  prefetchContainer.style.width = "550px";
  prefetchContainer.style.height = "1px";
  prefetchContainer.style.overflow = "hidden";
  document.body.appendChild(prefetchContainer);
  return prefetchContainer;
};

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

export async function prefetchTweetEmbed(
  tweetUrl: string,
  theme: "light" | "dark" = "light"
): Promise<void> {
  const tweetId = extractTweetId(tweetUrl);
  if (!tweetId) return;

  const cacheKey = getCacheKey(tweetId, theme);
  if (tweetCache.has(cacheKey)) {
    return;
  }
  if (tweetLoadPromises.has(cacheKey)) {
    return;
  }

  const containerHost = getPrefetchContainer();
  if (!containerHost) return;

  const loadPromise = (async () => {
    await ensureTwitterScript();

    if (!window.twttr) {
      return null;
    }

    const container = document.createElement("div");
    containerHost.appendChild(container);

    const tweetElement = await window.twttr.widgets.createTweet(tweetId, container, {
      theme,
      dnt: true,
      align: "center",
    });

    if (!tweetElement) {
      container.remove();
      return null;
    }

    container.remove();
    tweetCache.set(cacheKey, tweetElement);
    return tweetElement;
  })()
    .catch(() => null)
    .finally(() => {
      tweetLoadPromises.delete(cacheKey);
    });

  tweetLoadPromises.set(cacheKey, loadPromise);
  await loadPromise;
}

export function TwitterEmbed({ twitter, theme = "light" }: TwitterEmbedProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [isScrollIdle, setIsScrollIdle] = useState(true);

  // Check if we have valid twitter data
  const hasTweetUrl = twitter.tweet_url && twitter.tweet_url.trim() !== "";
  const hasAccountHandle = twitter.account_handle && twitter.account_handle.trim() !== "";
  const hasValidData = hasTweetUrl || hasAccountHandle;

  // Get stable identifiers for the tweet
  const tweetUrl = twitter.tweet_url || "";
  const accountHandle = twitter.account_handle || "";
  const openUrl = tweetUrl || (accountHandle ? `https://twitter.com/${accountHandle}` : "");

  // Preload Twitter script earlier when component mounts (not just when in view)
  useEffect(() => {
    if (hasValidData) {
      void ensureTwitterScript();
    }
  }, [hasValidData]);

  useEffect(() => {
    if (!hasValidData) return;
    if (typeof window === "undefined") return;

    // Use faster timeout on mobile for better responsiveness
    const scrollIdleTimeout = getIsMobile() ? 50 : 150;

    const handleScroll = () => {
      setIsScrollIdle(false);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrollIdle(true);
      }, scrollIdleTimeout);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [hasValidData]);

  useEffect(() => {
    if (!hasValidData) {
      return;
    }

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    // Reset in-view state when component remounts or data changes
    setIsInView(false);
    setIsLoading(true);
    hasLoadedRef.current = false;

    // Use smaller rootMargin on mobile for better performance
    const rootMargin = getIsMobile() ? "300px" : "600px";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Don't disconnect immediately - keep observing in case of rapid navigation
          }
        });
      },
      { rootMargin, threshold: 0.1 }
    );

    observer.observe(wrapper);

    return () => {
      observer.disconnect();
    };
  }, [hasValidData, tweetUrl, accountHandle]);

  useEffect(() => {
    // Skip if no valid data
    if (!hasValidData) {
      setError("No Twitter content provided");
      setIsLoading(false);
      return;
    }

    if (!isInView) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

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

        // Only wait for scroll idle if we're actively scrolling
        // This allows immediate loading when jumping to a section
        if (!isScrollIdle && !hasExistingEmbed) {
          // Wait a bit for scroll to settle, but don't block too long
          const scrollWaitTimeout = getIsMobile() ? 100 : 200;
          await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), scrollWaitTimeout);
          });
        }

        // Use requestIdleCallback only if available and scroll is idle
        const idleTimeout = getIsMobile() ? 200 : 500;
        if (typeof window !== "undefined" && "requestIdleCallback" in window && isScrollIdle) {
          await new Promise<void>((resolve) => {
            window.requestIdleCallback(() => resolve(), { timeout: idleTimeout });
          });
        }

        await ensureTwitterScript();

        if (!window.twttr) {
          throw new Error("Twitter widget not available");
        }

        if (tweetUrl) {
          const tweetId = currentTweetId;
          if (!tweetId) {
            throw new Error("Invalid tweet URL");
          }

          const cacheKey = getCacheKey(tweetId, theme);
          const cachedTweet = tweetCache.get(cacheKey);
          if (cachedTweet) {
            // Clear container first, then add cached tweet
            container.innerHTML = "";
            // Use requestAnimationFrame to ensure smooth transition
            requestAnimationFrame(() => {
              cachedTweet.parentElement?.removeChild(cachedTweet);
              container.appendChild(cachedTweet);
              hasLoadedRef.current = true;
              container.dataset.tweetId = tweetId;
              delete container.dataset.timelineHandle;
              setIsLoading(false);
            });
            return;
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
          // Use requestAnimationFrame to ensure smooth transition
          requestAnimationFrame(() => {
            hasLoadedRef.current = true;
            container.dataset.tweetId = tweetId;
            delete container.dataset.timelineHandle;
            tweetCache.set(getCacheKey(tweetId, theme), tweetElement);
            setIsLoading(false);
          });
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

    // Use a small delay to batch rapid navigation
    const timeoutId = setTimeout(() => {
      embedTweet();
    }, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [tweetUrl, accountHandle, theme, hasValidData, isInView, isScrollIdle]);

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

  return (
    <div className="w-full relative" ref={wrapperRef}>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center w-full min-h-[300px] rounded-lg animate-pulse z-10 ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
        }`}>
          <svg
            className={`w-12 h-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
      )}
      <div
        ref={containerRef}
        className={`twitter-embed-container pointer-events-none sm:pointer-events-auto ${
          isLoading ? "opacity-0 min-h-[300px]" : "opacity-100 transition-opacity duration-300"
        }`}
      />
      {openUrl && (
        <a
          href={openUrl}
          target="_blank"
          rel="noreferrer"
          className={`mt-2 inline-flex items-center gap-1 text-xs font-medium sm:hidden ${
            theme === "dark"
              ? "text-gray-300 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Open on X
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 17l10-10M7 7h10v10" />
          </svg>
        </a>
      )}
    </div>
  );
}
