import { getTwitterClient, getTwitterConfig } from "./client";
import { formatTwitterPost } from "./format-post";
import type { Event } from "@/lib/types";

export interface PostTwitterResult {
  success: boolean;
  tweetId?: string;
  tweetUrl?: string;
  error?: string;
}

/**
 * Posts an event to Twitter using twitter-api-v2
 */
export async function postEventToTwitter(event: Event): Promise<PostTwitterResult> {
  try {
    const client = getTwitterClient();
    const { username } = getTwitterConfig();

    // Format the post
    const payload = formatTwitterPost(event);

    // Publish the tweet using v2 API
    const response = await client.v2.tweet(payload.text);

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
