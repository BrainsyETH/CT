"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { TagPills } from "./TagPills";
import { ShareButton } from "./ShareButton";
import { formatDate, formatCurrency, formatFundsLost } from "@/lib/formatters";
import type { Event } from "@/lib/types";

const FALLBACK_IMAGE_TIMELINE = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/chain_of_events_small.png";
const FALLBACK_IMAGE_CRIMELINE = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/CoE_Crimeline.png";

interface EventDetailModalProps {
  events: Event[];
}

export function EventDetailModal({ events }: EventDetailModalProps) {
  const { mode, selectedEventId, setSelectedEventId } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const prefersReducedMotion = useReducedMotion();

  const event = events.find((e) => e.id === selectedEventId);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Close modal handler
  const closeModal = useCallback(() => {
    setSelectedEventId(null);
  }, [setSelectedEventId]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isImageExpanded) {
          setIsImageExpanded(false);
        } else {
          closeModal();
        }
      }
    };

    if (selectedEventId) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";

      // Return focus to the triggering element when modal closes without scrolling
      if (previousActiveElement.current && !selectedEventId) {
        previousActiveElement.current.focus({ preventScroll: true });
      }
    };
  }, [selectedEventId, closeModal, isImageExpanded]);

  // Focus trap within modal
  useEffect(() => {
    if (!selectedEventId || !modalRef.current) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [selectedEventId]);

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { type: "spring" as const, damping: 25, stiffness: 300 },
      };

  const backdropAnimationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };

  return (
    <AnimatePresence>
      {event && (
        <>
          {/* Backdrop */}
          <motion.div
            {...backdropAnimationProps}
            onClick={closeModal}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            {...animationProps}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[85vh] overflow-y-auto z-50 rounded-xl shadow-2xl"
          >
            <div
              className={`${
                isCrimeline
                  ? "bg-gray-900 border-2 border-purple-900/50"
                  : "soft-card"
              }`}
            >
              {/* Event Image */}
              <div className="relative w-full h-48 md:h-64">
                <button
                  onClick={() => setIsImageExpanded(true)}
                  className="absolute inset-0 w-full h-full cursor-zoom-in group/image z-10"
                  aria-label="View full image"
                >
                  <Image
                    src={event.image || (isCrimeline ? FALLBACK_IMAGE_CRIMELINE : FALLBACK_IMAGE_TIMELINE)}
                    alt={event.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 672px"
                    priority
                  />
                  <div
                    className={`absolute inset-0 ${
                      isCrimeline
                        ? "bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"
                        : "bg-gradient-to-t from-[color:var(--white)] via-[color:var(--white)]/50 to-transparent"
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
                {/* Header Actions - positioned over image */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                  <ShareButton event={event} overImage />
                  <button
                    ref={closeButtonRef}
                    onClick={closeModal}
                    aria-label="Close modal"
                    className="p-2 rounded-lg transition-colors bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Date */}
                  <time
                    className={`text-sm font-medium ${
                      isCrimeline ? "text-purple-400" : "text-[color:var(--sage)]"
                    }`}
                  >
                    {formatDate(event.date)}
                  </time>
                  {!isCrimeline && <span className="pill-separator" aria-hidden="true" />}
                  <span
                    className={`text-sm ${
                      isCrimeline ? "text-gray-400" : "text-[color:var(--muted)]"
                    }`}
                  >
                    {(Array.isArray(event.category) ? event.category : [event.category]).join(" • ")}
                  </span>
                </div>

                {/* Title */}
                <h2
                  id="modal-title"
                  className={`mt-3 text-2xl font-bold font-display ${
                    isCrimeline ? "text-white" : "text-[color:var(--ink)]"
                  }`}
                >
                  {event.title}
                </h2>

                {/* Tags */}
                <div className="mt-4">
                  <TagPills tags={event.tags} />
                </div>

                {/* Summary */}
                <p
  id="modal-description"
  className={`mt-4 text-base leading-relaxed whitespace-pre-line ${
    isCrimeline ? "text-gray-300" : "text-[color:var(--muted)]"
  }`}
>
  {event.summary}
</p>

                {/* Crimeline Details */}
                {event.crimeline && (
                  <div className="mt-6 p-4 rounded-lg bg-purple-950/30 border-2 border-purple-900/40 shadow-[4px_4px_0_rgba(124,58,237,0.35)]">
                    <h3 className="text-sm font-semibold text-purple-400 mb-3">
                      Incident Details
                    </h3>

                    <div className="space-y-3">
                      {/* Type and Status */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 text-sm font-bold bg-purple-900/50 text-purple-300 rounded">
                          {event.crimeline.type}
                        </span>
                        {event.crimeline.status && (
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded ${
                              event.crimeline.status === "Funds recovered"
                                ? "bg-green-900/50 text-green-300"
                                : event.crimeline.status === "Partial recovery"
                                ? "bg-yellow-900/50 text-yellow-300"
                                : event.crimeline.status === "Total loss"
                                ? "bg-purple-900/50 text-purple-300"
                                : "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {event.crimeline.status}
                          </span>
                        )}
                      </div>

                      {/* Funds Lost */}
                      <div>
                        <p className="text-xs text-gray-400">Funds Lost</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {formatFundsLost(event.crimeline.funds_lost_usd)}
                        </p>
                      </div>

                      {/* Root Causes */}
                      {event.crimeline.root_cause && event.crimeline.root_cause.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Root Causes</p>
                          <div className="flex flex-wrap gap-2">
                            {event.crimeline.root_cause.map((cause, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-full"
                              >
                                {cause}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Aftermath */}
                      {event.crimeline.aftermath && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Aftermath</p>
                          <p className="text-sm text-gray-300">{event.crimeline.aftermath}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Links */}
                {event.links && event.links.length > 0 && (
                  <div className="mt-6">
                    <h3
                      className={`text-sm font-semibold mb-3 ${
                        isCrimeline ? "text-gray-300" : "text-[color:var(--ink)]"
                      }`}
                    >
                      Sources
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {event.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            isCrimeline
                              ? "bg-gray-800 text-purple-400 hover:bg-gray-700"
                              : "bg-[color:var(--white)] text-[color:var(--sage)] border border-[color:var(--clay)] hover:bg-[color:var(--oatmeal)]"
                          }`}
                        >
                          {link.label}
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Image Lightbox */}
          <AnimatePresence>
            {isImageExpanded && (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={prefersReducedMotion ? {} : { opacity: 1 }}
                exit={prefersReducedMotion ? {} : { opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 cursor-zoom-out"
                onClick={() => setIsImageExpanded(false)}
              >
                <button
                  onClick={() => setIsImageExpanded(false)}
                  aria-label="Close full image"
                  className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <motion.div
                  initial={prefersReducedMotion ? {} : { scale: 0.9 }}
                  animate={prefersReducedMotion ? {} : { scale: 1 }}
                  exit={prefersReducedMotion ? {} : { scale: 0.9 }}
                  className="relative max-w-[90vw] max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={event.image || (isCrimeline ? FALLBACK_IMAGE_CRIMELINE : FALLBACK_IMAGE_TIMELINE)}
                    alt={event.title}
                    width={1200}
                    height={800}
                    unoptimized
                    className="object-contain max-w-full max-h-[90vh] rounded-lg"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
