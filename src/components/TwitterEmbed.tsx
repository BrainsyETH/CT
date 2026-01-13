"use client";

import { useEffect, useRef, useState } from "react";
import type { TwitterMedia } from "@/lib/types";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
        createTweet: (
          tweetId: string,
          container: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement>;
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
  const patterns = [
    /twitter\.com\/\w+\/status\/(\d+)/,
    /x\.com\/\w+\/status\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function TwitterEmbed({ twitter, theme = "light" }: TwitterEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Load Twitter widget script if not already loaded
    const loadTwitterScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.twttr) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.onload = () => resolve();
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

          await window.twttr.widgets.createTweet(tweetId, container, {
            theme: theme,
            dnt: true, // Do not track
            align: "center",
          });
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
  }, [twitter, theme]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center text-gray-500 dark:text-gray-400">
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
        <div className="flex items-center justify-center w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
          <svg
            className="w-12 h-12 text-gray-400 dark:text-gray-500"
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
