"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion, PanInfo } from "framer-motion";
import { TwitterEmbed } from "./TwitterEmbed";
import { detectVideoProvider, getEmbedUrl, getVideoThumbnailUrl, isIframeProvider } from "@/lib/video-utils";
import { FALLBACK_IMAGES } from "@/lib/constants";
import type { MediaItem, Event } from "@/lib/types";

interface MediaCarouselProps {
  media: MediaItem[];
  event: Event;
  isCrimeline: boolean;
  onImageExpand?: (imageUrl: string) => void;
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
  onClose?: () => void;
}

const TwitterBirdIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
  </svg>
);

// Helper to get poster/thumbnail for a media item
function getMediaPoster(item: MediaItem, event: Event, isCrimeline: boolean): string {
  if (item.type === "video" && item.video) {
    const provider = detectVideoProvider(item.video.url) ?? item.video.provider;
    return (
      item.video.poster_url ||
      (provider ? getVideoThumbnailUrl(provider, item.video.url) : null) ||
      event.image ||
      (isCrimeline ? FALLBACK_IMAGES.CRIMELINE : FALLBACK_IMAGES.TIMELINE)
    );
  }
  if (item.type === "image" && item.image?.url) {
    return item.image.url;
  }
  return event.image || (isCrimeline ? FALLBACK_IMAGES.CRIMELINE : FALLBACK_IMAGES.TIMELINE);
}

// Helper to pause all videos in a container
function pauseAllVideos(container: HTMLElement | null) {
  if (!container) return;
  const videos = container.querySelectorAll("video");
  videos.forEach((video) => {
    video.pause();
    video.currentTime = 0;
  });
  // Also handle iframes (YouTube, Vimeo) by removing and re-adding src
  const iframes = container.querySelectorAll("iframe");
  iframes.forEach((iframe) => {
    const src = iframe.src;
    iframe.src = "";
    iframe.src = src;
  });
}

export function MediaCarousel({
  media,
  event,
  isCrimeline,
  onImageExpand,
  closeButtonRef,
  onClose,
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isVideoInView, setIsVideoInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const currentItem = media[currentIndex];

  // Reset video playing state when slide changes
  useEffect(() => {
    setIsVideoActive(false);
    setIsVideoInView(false);
    return () => {
      // Cleanup: pause video when unmounting or changing slides
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [currentIndex]);

  // Use IntersectionObserver to lazy load videos
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    
    // Small delay to ensure DOM is updated after currentIndex change
    const timeoutId = setTimeout(() => {
      const container = videoContainerRef.current;
      if (!container || !container.isConnected) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVideoInView(true);
              observer?.disconnect();
            }
          });
        },
        { rootMargin: "100px" }
      );

      observer.observe(container);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      observer?.disconnect();
    };
  }, [currentIndex]);

  // Pause all videos when component unmounts (modal closes)
  useEffect(() => {
    return () => {
      pauseAllVideos(containerRef.current);
    };
  }, []);

  const goToNext = useCallback(() => {
    // Pause current video before switching
    if (videoRef.current) {
      videoRef.current.pause();
    }
    pauseAllVideos(containerRef.current);
    setCurrentIndex((prev) => (prev + 1) % media.length);
  }, [media.length]);

  const goToPrevious = useCallback(() => {
    // Pause current video before switching
    if (videoRef.current) {
      videoRef.current.pause();
    }
    pauseAllVideos(containerRef.current);
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  }, [media.length]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipeThreshold = 50;
      if (info.offset.x < -swipeThreshold) {
        goToNext();
      } else if (info.offset.x > swipeThreshold) {
        goToPrevious();
      }
    },
    [goToNext, goToPrevious]
  );

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!touchStartRef.current) return;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      const swipeThreshold = 50;
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      if (!isHorizontalSwipe) return;

      if (deltaX < -swipeThreshold) {
        goToNext();
      } else if (deltaX > swipeThreshold) {
        goToPrevious();
      }
    },
    [goToNext, goToPrevious]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    },
    [goToNext, goToPrevious]
  );

  const renderMedia = (item: MediaItem) => {
    switch (item.type) {
      case "video":
        if (!item.video) return null;
        const posterUrl = getMediaPoster(item, event, isCrimeline);
        const resolvedProvider = detectVideoProvider(item.video.url) ?? item.video.provider;
        const isIframe = isIframeProvider(resolvedProvider);
        const iframeSrc = getEmbedUrl(
          resolvedProvider,
          item.video.embed_url || item.video.url
        );
        const canRenderIframe = Boolean(iframeSrc);
        const embedSrc = iframeSrc
          ? `${iframeSrc}${iframeSrc.includes("?") ? "&" : "?"}autoplay=1`
          : null;

        return (
          <div
            ref={videoContainerRef}
            className={`relative w-full ${
              item.video.orientation === "portrait"
                ? "aspect-[9/16] max-h-[70vh]"
                : item.video.orientation === "square"
                ? "aspect-square"
                : "aspect-video"
            } bg-black flex items-center justify-center`}
          >
            {isIframe && canRenderIframe ? (
              isVideoActive && isVideoInView ? (
                <iframe
                  src={embedSrc ?? undefined}
                  className="absolute inset-0 w-full h-full video-container"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  allowFullScreen
                  loading="lazy"
                  title={event.title}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsVideoActive(true)}
                  className="absolute inset-0 w-full h-full cursor-pointer group/video"
                  aria-label="Play video"
                >
                  <Image
                    src={posterUrl}
                    alt={event.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 672px"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover/video:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 rounded-full p-5 backdrop-blur-sm transition-transform duration-300 group-hover/video:scale-110">
                      <svg
                        className="w-12 h-12 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </button>
              )
            ) : isIframe ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
                <div className="text-center space-y-2">
                  <p className="text-sm">Video unavailable for embedding.</p>
                  <a
                    href={item.video.url}
                    className="inline-flex items-center justify-center rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open on provider
                  </a>
                </div>
              </div>
            ) : isVideoActive ? (
              // Self-hosted video - show player when playing
              <video
                ref={videoRef}
                controls
                autoPlay
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                playsInline
                poster={posterUrl}
                className="w-full h-full object-contain"
                preload={isVideoInView ? "metadata" : "none"}
                onEnded={() => setIsVideoActive(false)}
              >
                <source src={item.video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              // Self-hosted video - show poster with play button
              <button
                onClick={() => setIsVideoActive(true)}
                className="absolute inset-0 w-full h-full cursor-pointer group/video"
                aria-label="Play video"
              >
                <Image
                  src={posterUrl}
                  alt={event.title}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 group-hover/video:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full p-5 backdrop-blur-sm transition-transform duration-300 group-hover/video:scale-110">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </button>
            )}
          </div>
        );

      case "twitter":
        if (!item.twitter) return null;
        return (
          <div className={`w-full ${isCrimeline ? "bg-gray-800" : "bg-gray-100"}`}>
            <TwitterEmbed
              twitter={item.twitter}
              theme={isCrimeline ? "dark" : "light"}
            />
          </div>
        );

      case "image":
        const imageUrl = item.image?.url || event.image || (isCrimeline ? FALLBACK_IMAGES.CRIMELINE : FALLBACK_IMAGES.TIMELINE);
        return (
          <div className="relative w-full h-48 md:h-64">
            <button
              onClick={() => onImageExpand?.(imageUrl)}
              className="absolute inset-0 w-full h-full cursor-zoom-in group/image z-10"
              aria-label="View full image"
            >
              <Image
                src={imageUrl}
                alt={item.image?.alt || event.title}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                loading="lazy"
              />
              <div
                className={`absolute inset-0 ${
                  isCrimeline
                    ? "bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"
                    : "bg-gradient-to-t from-white via-white/50 to-transparent"
                }`}
              />
              {/* Zoom hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                <div className="p-3 rounded-full bg-black/60 backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </button>
            {/* Caption */}
            {item.image?.caption && (
              <p className={`absolute bottom-2 left-2 right-2 text-xs z-10 ${
                isCrimeline ? "text-gray-300" : "text-gray-600"
              }`}>
                {item.image.caption}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full media-carousel-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Media carousel"
      aria-roledescription="carousel"
    >
      {/* Header Actions - positioned over media */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        {onClose && (
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg transition-colors bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Media Container with swipe */}
      <motion.div
        drag={media.length > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        className="cursor-grab active:cursor-grabbing"
        style={{ touchAction: "pan-x pan-y" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 50 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
          >
            {renderMedia(currentItem)}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Dot Indicators */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                // Pause current video before switching
                if (videoRef.current) {
                  videoRef.current.pause();
                }
                pauseAllVideos(containerRef.current);
                setCurrentIndex(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? isCrimeline
                    ? "bg-purple-400 w-4"
                    : "bg-teal-500 w-4"
                  : "bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}

      {/* Desktop navigation arrows */}
      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Previous media"
            className="hidden md:flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors z-20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next media"
            className="hidden md:flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors z-20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Media type indicator icons */}
      {media.length > 1 && (
        <div className="absolute top-4 left-4 flex items-center gap-1 z-10">
          {media.map((item, index) => (
            <div
              key={index}
              className={`p-1.5 rounded-md transition-all ${
                index === currentIndex
                  ? "bg-black/70 scale-110"
                  : "bg-black/40"
              }`}
              title={item.type}
            >
              {item.type === "video" && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              {item.type === "twitter" && (
                <TwitterBirdIcon className="w-3 h-3 text-white" />
              )}
              {item.type === "image" && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simplified version for EventCard (preview only, no interaction)
interface MediaPreviewProps {
  media: MediaItem[];
  event: Event;
  isCrimeline: boolean;
}

export function MediaPreview({ media, event, isCrimeline }: MediaPreviewProps) {
  const firstItem = media[0];
  const posterUrl = getMediaPoster(firstItem, event, isCrimeline);
  const hasVideo = firstItem?.type === "video";
  const isTwitter = firstItem?.type === "twitter";
  const previewAspectClass = hasVideo
    ? firstItem?.video?.orientation === "portrait"
      ? "aspect-[9/16] max-h-[70vh]"
      : firstItem?.video?.orientation === "square"
      ? "aspect-square"
      : "aspect-video"
    : "aspect-[16/9]";
  if (firstItem?.type === "video" && firstItem.video) {
    const resolvedProvider = detectVideoProvider(firstItem.video.url) ?? firstItem.video.provider;
    const hasEmbed = isIframeProvider(resolvedProvider)
      ? Boolean(getEmbedUrl(resolvedProvider, firstItem.video.embed_url || firstItem.video.url))
      : true;

    if (!hasEmbed) {
      return (
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <div className="text-center space-y-2 text-white">
            <p className="text-sm">Video unavailable for embedding.</p>
            <a
              href={firstItem.video.url}
              className="inline-flex items-center justify-center rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
              target="_blank"
              rel="noreferrer"
            >
              Open on provider
            </a>
          </div>
        </div>
      );
    }
  }

  if (isTwitter && firstItem?.twitter) {
    return (
      <div className={`w-full ${isCrimeline ? "bg-gray-800" : "bg-gray-100"}`}>
        <TwitterEmbed
          twitter={firstItem.twitter}
          theme={isCrimeline ? "dark" : "light"}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden ${previewAspectClass}`}>
      <Image
        src={posterUrl}
        alt={event.title}
        fill
        unoptimized
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
        loading="lazy"
      />
      <div
        className={`absolute inset-0 ${
          isCrimeline
            ? "bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"
            : "bg-gradient-to-t from-white via-white/20 to-transparent"
        }`}
      />

      {/* Video Play Icon Overlay */}
      {hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 rounded-full p-4 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Dot Indicators (if multiple items) */}
      {media.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {media.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full ${
                index === 0
                  ? isCrimeline
                    ? "bg-purple-400"
                    : "bg-teal-500"
                  : "bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
