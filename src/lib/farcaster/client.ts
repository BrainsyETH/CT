import { NeynarAPIClient } from "@neynar/nodejs-sdk";

/**
 * Farcaster client using Neynar API
 * Requires environment variables:
 * - NEYNAR_API_KEY
 * - FARCASTER_SIGNER_UUID
 * - FARCASTER_USERNAME
 */

let neynarClient: NeynarAPIClient | null = null;

export function getNeynarClient(): NeynarAPIClient {
  if (!neynarClient) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error("NEYNAR_API_KEY environment variable is not set");
    }
    neynarClient = new NeynarAPIClient({ apiKey });
  }
  return neynarClient;
}

export function validateFarcasterEnv(): void {
  const required = ["NEYNAR_API_KEY", "FARCASTER_SIGNER_UUID", "FARCASTER_USERNAME"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Farcaster environment variables: ${missing.join(", ")}`
    );
  }
}

export function getFarcasterConfig() {
  validateFarcasterEnv();

  return {
    signerUuid: process.env.FARCASTER_SIGNER_UUID!,
    username: process.env.FARCASTER_USERNAME!,
  };
}
