import { VideoProvider } from "./types";

/**
 * Normalize video provider string (handles typos like "self-hosted" vs "self_hosted")
 */
export function normalizeProvider(provider: string): VideoProvider {
  const normalized = provider.toLowerCase().replace(/-/g, "_");
  if (normalized === "self_hosted" || normalized === "selfhosted") {
    return "self_hosted";
  }
  return normalized as VideoProvider;
}

/**
 * Extracts video ID from a YouTube URL
 */
export function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/shorts\/([^&?/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Extracts video ID from a Vimeo URL
 */
export function getVimeoVideoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] || null;
}

/**
 * Generates an embed URL from a video watch URL
 */
export function getEmbedUrl(provider: VideoProvider, url: string): string | null {
  if (provider === "youtube") {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  if (provider === "vimeo") {
    const videoId = getVimeoVideoId(url);
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  }

  // For mux and self_hosted, return the URL as-is
  return url;
}

/**
 * Generates a thumbnail URL for a video
 */
export function getVideoThumbnailUrl(
  provider: VideoProvider,
  url: string
): string | null {
  if (provider === "youtube") {
    const videoId = getYouTubeVideoId(url);
    // maxresdefault provides the highest quality thumbnail
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : null;
  }

  // Vimeo requires API call for thumbnails, return null to use poster_url
  // Mux and self_hosted should provide poster_url directly
  return null;
}

/**
 * Detects video provider from URL
 */
export function detectVideoProvider(url: string): VideoProvider | null {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  }
  if (url.includes("vimeo.com")) {
    return "vimeo";
  }
  if (url.includes("mux.com") || url.includes("stream.mux.com")) {
    return "mux";
  }
  // Check for common video file extensions for self-hosted
  if (/\.(mp4|webm|m3u8|mov)(\?|$)/i.test(url)) {
    return "self_hosted";
  }
  return null;
}

/**
 * Checks if a provider uses iframe embedding
 */
export function isIframeProvider(provider: VideoProvider | string): boolean {
  const normalized = normalizeProvider(provider as string);
  return normalized === "youtube" || normalized === "vimeo";
}
