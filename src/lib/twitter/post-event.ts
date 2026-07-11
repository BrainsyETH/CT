import { getTwitterClient, getTwitterConfig } from "./client";
import { formatTwitterPost } from "./format-post";
import { formatDate } from "@/lib/formatters";
import type { TwitterApi } from "twitter-api-v2";
import type { Event } from "@/lib/types";

export interface PostTwitterResult {
  success: boolean;
  tweetId?: string;
  tweetUrl?: string;
  /** Whether a real image was attached (vs. text-only fallback). */
  hasImage?: boolean;
  error?: string;
}

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "https://chainofevents.xyz"
  );
}

/**
 * Build the 1200x630 branded card image URL for an event — the same card the
 * event page exposes as its twitter:image. The card renderer always returns a
 * valid PNG (its error path still renders a branded fallback), so this is a
 * reliable image source regardless of the event's own image quality.
 */
function buildCardImageUrl(event: Event): string {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const eventMode = event.mode.includes("crimeline") ? "crimeline" : "timeline";
  const params = new URLSearchParams({
    title: event.title,
    date: formatDate(event.date),
    summary: event.summary,
    mode: eventMode,
  });
  const imageForCard = event.video?.poster_url || event.image;
  if (imageForCard) {
    params.set("image", imageForCard);
  }
  return `${siteUrl}/api/twitter?${params.toString()}`;
}

/**
 * Fetch the branded card PNG and upload it to Twitter as native media.
 * Returns the media id, or null if the image can't be fetched/uploaded (the
 * caller then posts text-only so a media hiccup never blocks the tweet).
 */
async function uploadEventCardMedia(
  client: TwitterApi,
  event: Event
): Promise<string | null> {
  try {
    const response = await fetch(buildCardImageUrl(event));
    if (!response.ok) {
      console.error(`Card image fetch failed: HTTP ${response.status}`);
      return null;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength === 0) return null;

    // v1 media upload works with the OAuth 1.0a user-context creds the bot uses.
    const mediaId = await client.v1.uploadMedia(buffer, { mimeType: "image/png" });

    // Best-effort alt text for accessibility; never block on it.
    try {
      await client.v1.createMediaMetadata(mediaId, {
        alt_text: { text: event.title.slice(0, 1000) },
      });
    } catch (altError) {
      console.warn("Failed to set media alt text:", altError);
    }

    return mediaId;
  } catch (error) {
    console.error("Failed to upload event card media:", error);
    return null;
  }
}

/**
 * Posts an event to Twitter using twitter-api-v2.
 *
 * Attaches the branded event card as native media so every tweet has a valid
 * image, instead of relying on X to unfurl the link into a preview card (which
 * X frequently suppresses). Falls back to text-only if media upload fails.
 */
export async function postEventToTwitter(event: Event): Promise<PostTwitterResult> {
  try {
    const client = getTwitterClient();
    const { username } = getTwitterConfig();

    // Format the post text (first sentence + event URL)
    const payload = formatTwitterPost(event);

    // Attach the branded card as native media (best-effort).
    const mediaId = await uploadEventCardMedia(client, event);

    // Publish the tweet. With media when available, text-only otherwise.
    const response = mediaId
      ? await client.v2.tweet(payload.text, {
          media: { media_ids: [mediaId] as [string] },
        })
      : await client.v2.tweet(payload.text);

    if (!response.data?.id) {
      return {
        success: false,
        error: "No tweet ID returned from Twitter API",
      };
    }

    const tweetId = response.data.id;
    const tweetUrl = `https://twitter.com/${username}/status/${tweetId}`;

    return {
      success: true,
      tweetId,
      tweetUrl,
      hasImage: Boolean(mediaId),
    };
  } catch (error) {
    console.error("Failed to post to Twitter:", error);

    // Handle specific Twitter API errors
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Handle twitter-api-v2 specific error format
    if (typeof error === "object" && error !== null && "data" in error) {
      const apiError = error as { data?: { detail?: string; title?: string } };
      errorMessage = apiError.data?.detail || apiError.data?.title || errorMessage;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
