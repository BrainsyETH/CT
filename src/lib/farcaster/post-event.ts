import { getNeynarClient, getFarcasterConfig } from "./client";
import { formatEventPost } from "./format-post";
import type { Event } from "@/lib/types";

export interface PostEventResult {
  success: boolean;
  castHash?: string;
  castUrl?: string;
  error?: string;
}

/**
 * Posts an event to Farcaster using Neynar API
 */
export async function postEventToFarcaster(event: Event): Promise<PostEventResult> {
  try {
    const client = getNeynarClient();
    const { signerUuid, username } = getFarcasterConfig();

    // Format the post
    const payload = formatEventPost(event);

    // Publish the cast
    const response = await client.publishCast({
      signerUuid,
      text: payload.text,
      embeds: payload.embeds.map((e) => ({ url: e.url })),
    });

    // The response contains the cast in response.cast
    const castHash = response.cast.hash;
    const castUrl = `https://warpcast.com/${username}/${castHash.slice(0, 10)}`;

    return {
      success: true,
      castHash,
      castUrl,
    };
  } catch (error) {
    console.error("Failed to post to Farcaster:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
