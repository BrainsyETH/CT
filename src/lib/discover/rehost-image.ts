/**
 * Re-host an external image into the project's Vercel Blob store.
 *
 * Images stored on arbitrary third-party domains are unreliable: some expire
 * (Brave proxy), some block hotlinking (Reddit), and most aren't whitelisted
 * for next/image. Re-hosting to Vercel Blob gives a permanent, hotlinkable,
 * already-whitelisted URL (*.public.blob.vercel-storage.com), so images
 * actually render.
 *
 * Uses BLOB_READ_WRITE_TOKEN (auto-injected by Vercel when a Blob store is
 * linked to the project). Degrades gracefully to null if the token is missing
 * or the source can't be fetched.
 */

import { put } from "@vercel/blob";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const BLOB_SUFFIX = ".public.blob.vercel-storage.com";

/**
 * Download `sourceUrl` and upload it to Vercel Blob. Returns the blob URL, or
 * null if re-hosting isn't possible (no token, non-image, fetch failure).
 * If the source is already a Blob URL, it's returned unchanged.
 */
export async function rehostImageToBlob(
  sourceUrl: string,
  keyHint: string
): Promise<string | null> {
  if (sourceUrl.includes(BLOB_SUFFIX)) return sourceUrl; // already hosted
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn("BLOB_READ_WRITE_TOKEN not set; skipping image re-host");
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(sourceUrl, {
      headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) return null;

    const ext = (contentType.split("/")[1] || "jpg").split(";")[0].replace(/[^a-z0-9]/gi, "") || "jpg";
    const safeHint = keyHint.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "event";

    const { url } = await put(`events/${safeHint}.${ext}`, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: true,
    });
    return url;
  } catch (error) {
    console.warn(`Failed to re-host image ${sourceUrl}:`, error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
