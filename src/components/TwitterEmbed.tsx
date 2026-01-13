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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we have valid twitter data
  const hasTweetUrl = twitter.tweet_url && twitter.tweet_url.trim() !== "";
  const hasAccountHandle = twitter.account_handle && twitter.account_handle.trim() !== "";
  const hasValidData = hasTweetUrl || hasAccountHandle;

  useEffect(() => {
    // Skip if no valid data
    if (!hasValidData) {
      setError("No Twitter content provided");
      setIsLoading(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Load Twitter widget script and wait for it to be ready
    const loadTwitterScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        // If already loaded and ready
        if (window.twttr?.widgets) {
          resolve();
          return;
        }

        // Check if script is already in DOM but not ready yet
        const existingScript = document.querySelector('script[src*="platform.twitter.com/widgets.js"]');
        if (existingScript && window.twttr) {
          window.twttr.ready(() => resolve());
          return;
        }

        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.onload = () => {
          // Wait for twttr.ready callback
          if (window.twttr) {
            window.twttr.ready(() => resolve());
          } else {
            reject(new Error("Twitter widget failed to initialize"));
          }
        };
        script.onerror = () => reject(new Error("Failed to load Twitter widget"));
        document.head.appendChild(script);
      });
    };

    const embedTweet = async () => {
      try {
        await loadTwitterScript();

        if (!window.twttr) {
          throw new Error("Twitter widget not available");
        }

        // Clear container
        container.innerHTML = "";

        if (twitter.tweet_url) {
          const tweetId = extractTweetId(twitter.tweet_url);
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
        } else if (twitter.account_handle) {
          // For account timelines, we use an anchor tag that Twitter converts
          const anchor = document.createElement("a");
          anchor.className = "twitter-timeline";
          anchor.href = `https://twitter.com/${twitter.account_handle}`;
          anchor.dataset.theme = theme;
          anchor.dataset.height = "400";
          anchor.dataset.dnt = "true";
          container.appendChild(anchor);
          window.twttr.widgets.load(container);
        }

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tweet");
        setIsLoading(false);
      }
    };

    embedTweet();
  }, [twitter, theme, hasValidData]);

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
        className={`twitter-embed-container ${isLoading ? "hidden" : ""}`}
      />
    </div>
  );
}
