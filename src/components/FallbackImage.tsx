"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type FallbackImageProps = Omit<ImageProps, "src"> & {
  src: string;
  /** Shown if `src` fails to load (404s, rejects hotlinking, expired URL, etc.). */
  fallbackSrc: string;
};

/**
 * next/image wrapper that swaps to `fallbackSrc` when the primary image fails
 * to load. Without this, a broken remote event image renders as a blank box —
 * notably in the event detail modal, which (unlike the timeline card) had no
 * error handling. Error state resets when `src` changes so reused instances
 * (e.g. the carousel navigating between items) re-evaluate the new source.
 */
export function FallbackImage({ src, fallbackSrc, alt, onError, ...props }: FallbackImageProps) {
  const [errored, setErrored] = useState(false);

  // Reset error state when the source changes (React's adjust-state-on-prop-change
  // pattern), so a reused instance re-tries the new src instead of staying on the fallback.
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setErrored(false);
  }

  return (
    <Image
      {...props}
      src={errored ? fallbackSrc : src}
      alt={alt}
      onError={(event) => {
        if (!errored) setErrored(true);
        onError?.(event);
      }}
    />
  );
}
