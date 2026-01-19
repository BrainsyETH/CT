import type { QuizFrameState, FrameButtonAction } from "@/lib/types";

/**
 * Generate Frame HTML with metadata tags
 */
export function generateFrameHTML(config: {
  imageUrl: string;
  buttons: FrameButtonAction[];
  postUrl?: string;
  state?: string;
  aspectRatio?: "1:1" | "1.91:1";
  inputText?: string;
}): string {
  const { imageUrl, buttons, postUrl, state, aspectRatio = "1.91:1", inputText } = config;

  const buttonTags = buttons
    .map((button, index) => {
      const idx = index + 1;
      let tags = `<meta property="fc:frame:button:${idx}" content="${button.label}" />`;

      if (button.action) {
        tags += `\n    <meta property="fc:frame:button:${idx}:action" content="${button.action}" />`;
      }

      if (button.target) {
        tags += `\n    <meta property="fc:frame:button:${idx}:target" content="${button.target}" />`;
      }

      return tags;
    })
    .join("\n    ");

  const inputTag = inputText
    ? `<meta property="fc:frame:input:text" content="${inputText}" />`
    : "";

  const postUrlTag = postUrl ? `<meta property="fc:frame:post_url" content="${postUrl}" />` : "";

  const stateTag = state ? `<meta property="fc:frame:state" content="${state}" />` : "";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Crypto History Quiz</title>

    <!-- Frame metadata -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${imageUrl}" />
    <meta property="fc:frame:image:aspect_ratio" content="${aspectRatio}" />
    ${buttonTags}
    ${postUrlTag}
    ${stateTag}
    ${inputTag}

    <!-- OG metadata for sharing -->
    <meta property="og:title" content="Crypto History Quiz" />
    <meta property="og:description" content="Test your crypto knowledge and win $EVENT tokens!" />
    <meta property="og:image" content="${imageUrl}" />
  </head>
  <body>
    <h1>Crypto History Quiz</h1>
    <p>View this in a Farcaster client to interact with the quiz!</p>
  </body>
</html>`;
}

/**
 * Encode quiz state as base64 for Frame state parameter
 */
export function encodeQuizState(state: QuizFrameState): string {
  const json = JSON.stringify(state);
  return Buffer.from(json).toString("base64");
}

/**
 * Decode quiz state from base64 Frame state parameter
 */
export function decodeQuizState(encodedState: string): QuizFrameState | null {
  try {
    const json = Buffer.from(encodedState, "base64").toString("utf-8");
    return JSON.parse(json) as QuizFrameState;
  } catch (error) {
    console.error("[Frame] Error decoding state:", error);
    return null;
  }
}

/**
 * Parse Frame message from Farcaster POST request
 */
export interface FrameMessage {
  fid: number;
  username?: string;
  buttonIndex: number;
  inputText?: string;
  state?: string;
  castHash?: string;
  castFid?: number;
  timestamp: number;
}

export function parseFrameMessage(body: any): FrameMessage | null {
  try {
    // Farcaster Frame POST structure
    const untrustedData = body.untrustedData || {};
    const trustedData = body.trustedData || {};

    return {
      fid: untrustedData.fid || 0,
      username: untrustedData.username,
      buttonIndex: untrustedData.buttonIndex || 1,
      inputText: untrustedData.inputText,
      state: untrustedData.state,
      castHash: untrustedData.castHash,
      castFid: untrustedData.castFid,
      timestamp: untrustedData.timestamp || Date.now(),
    };
  } catch (error) {
    console.error("[Frame] Error parsing frame message:", error);
    return null;
  }
}

/**
 * Validate Frame signature (for production)
 * This would verify the message is actually from Farcaster
 */
export async function validateFrameMessage(body: any): Promise<boolean> {
  // TODO: Implement Farcaster signature validation
  // For MVP, we'll skip this but should add it for production
  // Use @farcaster/frame-sdk or similar library

  return true; // For now, accept all messages
}

/**
 * Get base URL for Frame endpoints
 */
export function getFrameBaseUrl(): string {
  // In production, use Vercel URL or custom domain
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to localhost for development
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

/**
 * Generate image URL for Frame
 */
export function getFrameImageUrl(path: string): string {
  const baseUrl = getFrameBaseUrl();
  return `${baseUrl}${path}`;
}

/**
 * Generate post URL for Frame button actions
 */
export function getFramePostUrl(path: string): string {
  const baseUrl = getFrameBaseUrl();
  return `${baseUrl}${path}`;
}

/**
 * Shuffle array (for randomizing answer order)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format date for display
 */
export function formatQuizDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Calculate percentage
 */
export function calculatePercentage(score: number, total: number): number {
  return Math.round((score / total) * 100);
}

/**
 * Get rank emoji
 */
export function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (rank <= 10) return "🏆";
  return "📊";
}

/**
 * Get streak emoji
 */
export function getStreakEmoji(streak: number): string {
  if (streak >= 10) return "🔥🔥🔥";
  if (streak >= 5) return "🔥🔥";
  if (streak >= 2) return "🔥";
  return "";
}

/**
 * Format score for display
 */
export function formatScore(score: number, total: number): string {
  const percentage = calculatePercentage(score, total);
  return `${score}/${total} (${percentage}%)`;
}

/**
 * Generate progress bar (visual)
 */
export function generateProgressBar(score: number, total: number, length: number = 10): string {
  const filled = Math.round((score / total) * length);
  const empty = length - filled;
  return "▓".repeat(filled) + "░".repeat(empty);
}
