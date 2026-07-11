"use client";

import { useEffect, useMemo, useState } from "react";
import { useModeStore } from "@/store/mode-store";
import { generateEventSlug } from "@/lib/formatters";
import type { Event } from "@/lib/types";

interface ShareButtonProps {
  event: Event;
  overImage?: boolean;
}

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
  </svg>
);

const FarcasterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M5.32 3h13.36l1.32 5.3h-1.06l-.66-2.65A1.33 1.33 0 0016.99 4.4H7.01a1.33 1.33 0 00-1.29 1.25L5.06 8.3H4L5.32 3zM4 9.63h16V21H4V9.63zm3.33 2.65v2.65a2.67 2.67 0 005.34 0v-2.65h-1.34v2.65a1.33 1.33 0 01-2.66 0v-2.65H7.33zm6.67 0v2.65a1.33 1.33 0 002.66 0v-2.65H18v2.65a2.67 2.67 0 01-5.34 0v-2.65H14z" />
  </svg>
);

const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

const ShareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 12.632a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
    />
  </svg>
);

const CodeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

export function ShareButton({ event, overImage = false }: ShareButtonProps) {
  const { mode } = useModeStore();
  const [baseUrl, setBaseUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
      setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
    }
  }, []);

  const shareUrl = useMemo(() => {
    if (!baseUrl) {
      return "";
    }
    const slug = generateEventSlug(event.title, event.date);
    return `${baseUrl}/event/${slug}`;
  }, [baseUrl, event.title, event.date]);

  // Get first sentence of summary for share text
  const getFirstSentence = (text: string): string => {
    if (!text) return "";
    const match = text.match(/^[^.!?]+[.!?]/);
    if (match) return match[0].trim();
    return text.length > 150 ? `${text.slice(0, 147)}...` : text;
  };

  const shareText = useMemo(
    () => `${event.title} — ${getFirstSentence(event.summary)}`,
    [event.title, event.summary]
  );

  const handleTwitterShare = () => {
    if (!shareUrl) return;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}&via=chainofevents`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleFarcasterShare = () => {
    if (!shareUrl) return;
    const text = encodeURIComponent(shareText);
    const url = `https://farcaster.xyz/~/compose?text=${text}&embeds[]=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=600");
  };

  const handleNativeShare = async () => {
    if (!shareUrl || !navigator.share) return;
    try {
      await navigator.share({
        title: event.title,
        text: shareText,
        url: shareUrl,
      });
    } catch {
      // User dismissed the share sheet - nothing to do.
    }
  };

  const handleShareAsImage = () => {
    if (!baseUrl) return;
    // Mirror the params the OG metadata path uses so the opened image matches
    // what actually renders when the link is shared.
    const eventMode = event.mode.includes("crimeline") ? "crimeline" : "timeline";
    const params = new URLSearchParams({
      title: event.title,
      date: event.date,
      summary: event.summary,
      mode: eventMode,
    });
    const imageForOg = event.video?.poster_url || event.image;
    if (imageForOg) {
      params.set("image", imageForOg);
    }
    window.open(`${baseUrl}/api/og?${params.toString()}`, "_blank");
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

  const handleCopyEmbed = async () => {
    if (!baseUrl) return;
    const embedCode = `<iframe src="${baseUrl}/embed/${encodeURIComponent(event.id)}" width="420" height="480" frameborder="0" title="${event.title.replace(/"/g, "&quot;")} — Chain of Events"></iframe>`;
    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy embed code:", err);
    }
  };

  const baseStyles = overImage
    ? "bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
    : mode === "crimeline"
    ? "text-gray-300 hover:text-purple-200 hover:bg-purple-900/40"
    : "text-gray-500 hover:text-teal-700 hover:bg-teal-100";

  return (
    <div className="flex items-center gap-1.5" data-share-button>
      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          disabled={!shareUrl}
          className={`flex items-center justify-center p-1.5 rounded-lg text-xs font-semibold transition-colors ${baseStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Share"
          title="Share"
        >
          <ShareIcon className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={handleTwitterShare}
        disabled={!shareUrl}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${baseStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Share on Twitter"
        title="Share on X/Twitter"
      >
        <TwitterIcon className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={handleFarcasterShare}
        disabled={!shareUrl}
        className={`flex items-center justify-center p-1.5 rounded-lg text-xs font-semibold transition-colors ${baseStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Share on Farcaster"
        title="Share on Farcaster"
      >
        <FarcasterIcon className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={handleShareAsImage}
        disabled={!baseUrl}
        className={`flex items-center justify-center p-1.5 rounded-lg text-xs font-semibold transition-colors ${baseStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Share as image"
        title="Open as shareable image"
      >
        <ImageIcon className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={handleCopyEmbed}
        disabled={!baseUrl}
        className={`flex items-center justify-center p-1.5 rounded-lg text-xs font-semibold transition-colors ${baseStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={embedCopied ? "Embed code copied" : "Copy embed code"}
        title={embedCopied ? "Embed code copied!" : "Copy embed code for your site"}
      >
        {embedCopied ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <CodeIcon className="w-3.5 h-3.5" />
        )}
      </button>
      <button
        type="button"
        onClick={handleCopy}
        disabled={!shareUrl}
        className={`flex items-center justify-center p-1.5 rounded-lg text-xs font-semibold transition-colors ${baseStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={copied ? "Copied" : "Copy share URL"}
        title={copied ? "Copied!" : "Copy link"}
      >
        {copied ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <LinkIcon className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
