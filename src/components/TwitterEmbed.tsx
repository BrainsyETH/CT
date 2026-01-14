"use client";

import { useEffect, useRef, useState } from "react";
import type { TwitterMedia } from "@/lib/types";

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
function extractTweetId(url: string): string | null {
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

export function TwitterEmbed({ twitter, theme = "light" }: TwitterEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(false);

  // Check if we have valid twitter data
  const hasTweetUrl = twitter.tweet_url && twitter.tweet_url.trim() !== "";
  const hasAccountHandle = twitter.account_handle && twitter.account_handle.trim() !== "";
  const hasValidData = hasTweetUrl || hasAccountHandle;

  // Get stable identifiers for the tweet
  const tweetUrl = twitter.tweet_url || "";
  const accountHandle = twitter.account_handle || "";

  useEffect(() => {
    if (hasValidData && isInView) {
      void ensureTwitterScript();
    }
  }, [hasValidData, isInView]);

  useEffect(() => {
    if (!hasValidData) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [hasValidData]);

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

    // Skip if already loaded (prevents re-clearing on re-renders)
    if (
      hasLoadedRef.current &&
      hasExistingEmbed &&
      ((currentTweetId && existingTweetId === currentTweetId) ||
        (currentTimelineHandle && existingTimelineHandle === currentTimelineHandle))
    ) {
      setIsLoading(false);
      return;
    }

    const embedTweet = async () => {
      try {
        await ensureTwitterScript();

        if (!window.twttr) {
          throw new Error("Twitter widget not available");
        }

        // Clear container
        container.innerHTML = "";

        if (tweetUrl) {
          const tweetId = currentTweetId;
          if (!tweetId) {
            throw new Error("Invalid tweet URL");
          }

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

    embedTweet();
  }, [tweetUrl, accountHandle, theme, hasValidData]);

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
    <div className="w-full">
      {isLoading && (
        <div className={`flex items-center justify-center w-full h-64 rounded-lg animate-pulse ${
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
        className={`twitter-embed-container ${isLoading ? "invisible" : ""}`}
      />
    </div>
  );
}
