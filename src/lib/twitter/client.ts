import { TwitterApi } from "twitter-api-v2";

/**
 * Twitter client using twitter-api-v2
 * Requires environment variables:
 * - TWITTER_API_KEY (Consumer Key)
 * - TWITTER_API_SECRET (Consumer Secret)
 * - TWITTER_ACCESS_TOKEN
 * - TWITTER_ACCESS_SECRET
 */

let twitterClient: TwitterApi | null = null;

export function getTwitterClient(): TwitterApi {
  if (!twitterClient) {
    validateTwitterEnv();

    twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });
  }
  return twitterClient;
}

export function validateTwitterEnv(): void {
  const required = [
    "TWITTER_API_KEY",
    "TWITTER_API_SECRET",
    "TWITTER_ACCESS_TOKEN",
    "TWITTER_ACCESS_SECRET",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Twitter environment variables: ${missing.join(", ")}`
    );
  }
}

export function getTwitterConfig() {
  validateTwitterEnv();

  return {
    username: process.env.TWITTER_USERNAME || "chainofevents",
  };
}
