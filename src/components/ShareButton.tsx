"use client";

import { useEffect, useMemo, useState } from "react";
import { useModeStore } from "@/store/mode-store";
import type { Event } from "@/lib/types";

interface ShareButtonProps {
  event: Event;
  overImage?: boolean;
}

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);

export function ShareButton({ event, overImage = false }: ShareButtonProps) {
  const { mode, searchQuery, selectedTags, sortOrder } = useModeStore();
  const [baseUrl, setBaseUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const shareUrl = useMemo(() => {
    if (!baseUrl) {
      return "";
    }
    const params = new URLSearchParams();
    params.set("event", event.id);

    if (mode !== "timeline") {
      params.set("mode", mode);
    }

    if (searchQuery.trim()) {
      params.set("q", searchQuery);
    }

    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    }

    if (sortOrder === "asc") {
      params.set("sort", sortOrder);
    }

    return `${baseUrl}?${params.toString()}`;
  }, [baseUrl, event.id, mode, searchQuery, selectedTags, sortOrder]);

  // Get first sentence of summary for tweet
  const getFirstSentence = (text: string): string => {
    if (!text) return "";
    const match = text.match(/^[^.!?]+[.!?]/);
    if (match) return match[0].trim();
    return text.length > 150 ? `${text.slice(0, 147)}...` : text;
  };

  const handleTwitterShare = () => {
    if (!shareUrl) return;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const baseStyles = overImage
    ? "bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
    : mode === "crimeline"
    ? "text-gray-300 hover:text-purple-200 hover:bg-purple-900/40"
    : "text-gray-500 hover:text-teal-700 hover:bg-teal-100";

  return (
    <div className="flex items-center gap-2" data-share-button>
      <button
        type="button"
        onClick={handleTwitterShare}
        disabled={!shareUrl}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${baseStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Share on X"
      >
        <TwitterIcon className="w-4 h-4" />
        <span>Share</span>
      </button>
      <button
        type="button"
        onClick={handleCopy}
        disabled={!shareUrl}
        className={`flex items-center justify-center p-2 rounded-lg text-xs font-semibold transition-colors ${baseStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={copied ? "Copied" : "Copy share URL"}
      >
        {copied ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <LinkIcon className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
