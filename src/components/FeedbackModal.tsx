"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { MODES } from "@/lib/constants";
import { sanitizeFeedbackSubmission } from "@/lib/sanitize";
import { withRetry } from "@/lib/utils";
import {
  SuccessAnimation,
  ContactFields,
  EventFields,
  VideoFields,
  CrimelineFields,
} from "./feedback";
import type { Event, FeedbackType, FeedbackSubmission } from "@/lib/types";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: FeedbackType;
  event?: Event | null;
}

export function FeedbackModal({
  isOpen,
  onClose,
  initialType = "general",
  event,
}: FeedbackModalProps) {
  const { mode } = useModeStore();
  const isCrimeline = mode === MODES.CRIMELINE;
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [feedbackType, setFeedbackType] = useState<FeedbackType>(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Form fields
  const [email, setEmail] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventSummary, setEventSummary] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [eventTags, setEventTags] = useState<string[]>([]);
  const [eventMode, setEventMode] = useState<string>(MODES.TIMELINE);
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [eventSourceUrl, setEventSourceUrl] = useState("");
  const [eventVideoUrl, setEventVideoUrl] = useState("");
  const [eventVideoProvider, setEventVideoProvider] = useState("");
  const [eventVideoPosterUrl, setEventVideoPosterUrl] = useState("");
  const [eventVideoCaption, setEventVideoCaption] = useState("");
  const [eventVideoOrientation, setEventVideoOrientation] = useState("");
  const [crimelineType, setCrimelineType] = useState("");
  const [crimelineFundsLost, setCrimelineFundsLost] = useState("");
  const [crimelineStatus, setCrimelineStatus] = useState("");
  const [crimelineRootCause, setCrimelineRootCause] = useState("");
  const [crimelineAftermath, setCrimelineAftermath] = useState("");
  const [message, setMessage] = useState("");

  // Pre-fill form when editing an event
  useEffect(() => {
    if (event && initialType === "edit_event") {
      setEventTitle(event.title || "");
      setEventDate(event.date || "");
      setEventSummary(event.summary || "");
      setEventCategory(
        Array.isArray(event.category) ? event.category[0] : event.category || ""
      );
      setEventTags(event.tags || []);
      setEventMode(
        Array.isArray(event.mode) ? event.mode[0] : event.mode || MODES.TIMELINE
      );
      setEventImageUrl(event.image || "");
      setEventSourceUrl(event.links?.[0]?.url || "");
      if (event.video) {
        setEventVideoUrl(event.video.url || "");
        setEventVideoProvider(event.video.provider || "");
        setEventVideoPosterUrl(event.video.poster_url || "");
        setEventVideoCaption(event.video.caption || "");
        setEventVideoOrientation(event.video.orientation || "");
      }
      if (event.crimeline) {
        setCrimelineType(event.crimeline.type || "");
        setCrimelineFundsLost(event.crimeline.funds_lost_usd?.toString() || "");
        setCrimelineStatus(event.crimeline.status || "");
        setCrimelineRootCause(event.crimeline.root_cause?.join(", ") || "");
        setCrimelineAftermath(event.crimeline.aftermath || "");
      }
    }
  }, [event, initialType]);

  // Update feedback type when initialType changes
  useEffect(() => {
    setFeedbackType(initialType);
  }, [initialType]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const resetForm = useCallback(() => {
    setEmail("");
    setTwitterHandle("");
    setEventTitle("");
    setEventDate("");
    setEventSummary("");
    setEventCategory("");
    setEventTags([]);
    setEventMode(MODES.TIMELINE);
    setEventImageUrl("");
    setEventSourceUrl("");
    setEventVideoUrl("");
    setEventVideoProvider("");
    setEventVideoPosterUrl("");
    setEventVideoCaption("");
    setEventVideoOrientation("");
    setCrimelineType("");
    setCrimelineFundsLost("");
    setCrimelineStatus("");
    setCrimelineRootCause("");
    setCrimelineAftermath("");
    setMessage("");
    setSubmitStatus("idle");
    setErrorMessage("");
    setRetryCount(0);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    // Build submission object
    const rawSubmission: FeedbackSubmission = {
      type: feedbackType,
      email,
      twitter_handle: twitterHandle || undefined,
    };

    if (feedbackType === "new_event" || feedbackType === "edit_event") {
      rawSubmission.event_id = event?.id;
      rawSubmission.event_title = eventTitle;
      rawSubmission.event_date = eventDate;
      rawSubmission.event_summary = eventSummary;
      rawSubmission.event_category = eventCategory;
      rawSubmission.event_tags = eventTags.join(", ");
      rawSubmission.event_mode = eventMode;
      rawSubmission.event_image_url = eventImageUrl;
      rawSubmission.event_source_url = eventSourceUrl;
      rawSubmission.event_video_url = eventVideoUrl || undefined;
      rawSubmission.event_video_provider = eventVideoProvider || undefined;
      rawSubmission.event_video_poster_url = eventVideoPosterUrl || undefined;
      rawSubmission.event_video_caption = eventVideoCaption || undefined;
      rawSubmission.event_video_orientation = eventVideoOrientation || undefined;

      if (eventMode === MODES.CRIMELINE || eventMode === MODES.BOTH) {
        rawSubmission.crimeline_type = crimelineType;
        rawSubmission.crimeline_funds_lost = crimelineFundsLost;
        rawSubmission.crimeline_status = crimelineStatus;
        rawSubmission.crimeline_root_cause = crimelineRootCause;
        rawSubmission.crimeline_aftermath = crimelineAftermath;
      }
    }

    if (feedbackType === "general" || feedbackType === "edit_event") {
      rawSubmission.message = message;
    }

    // Sanitize all inputs before sending
    const submission = sanitizeFeedbackSubmission(rawSubmission);

    try {
      // Use retry logic for network resilience
      await withRetry(
        async () => {
          const response = await fetch("/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(submission),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to submit feedback");
          }

          return response;
        },
        {
          maxRetries: 3,
          baseDelayMs: 1000,
          onRetry: (attempt) => {
            setRetryCount(attempt);
          },
        }
      );

      setSubmitStatus("success");
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setEventTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

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

  const inputClassName = `w-full px-3 py-2 rounded-lg border transition-colors ${
    isCrimeline
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
  } outline-none`;

  const labelClassName = `block text-sm font-medium mb-1 ${
    isCrimeline ? "text-gray-300" : "text-gray-700"
  }`;

  const showCrimelineFields =
    eventMode === MODES.CRIMELINE || eventMode === MODES.BOTH;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            {...backdropAnimationProps}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            {...animationProps}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[85vh] overflow-y-auto z-50 rounded-xl shadow-[8px_8px_0_rgba(15,23,42,0.25)] touch-manipulation"
          >
            <div
              className={`${
                isCrimeline
                  ? "bg-gray-900 border-2 border-purple-900/50"
                  : "bg-white border-2 border-gray-200"
              }`}
            >
              {/* Header */}
              <div
                className={`sticky top-0 z-10 px-6 py-4 border-b ${
                  isCrimeline
                    ? "bg-gray-900 border-purple-900/50"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2
                    id="feedback-modal-title"
                    className={`text-xl font-bold ${
                      isCrimeline ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {feedbackType === "new_event"
                      ? "Submit New Event"
                      : feedbackType === "edit_event"
                      ? "Suggest Edit"
                      : "Send Feedback"}
                  </h2>
                  <button
                    ref={closeButtonRef}
                    onClick={handleClose}
                    aria-label="Close modal"
                    className={`p-2 rounded-lg transition-colors ${
                      isCrimeline
                        ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                        : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Type selector */}
                <div className="flex gap-2 mt-4">
                  {[
                    { value: "new_event", label: "New Event" },
                    { value: "edit_event", label: "Edit Event" },
                    { value: "general", label: "Feedback" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFeedbackType(type.value as FeedbackType)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        feedbackType === type.value
                          ? isCrimeline
                            ? "bg-purple-600 text-white"
                            : "bg-teal-600 text-white"
                          : isCrimeline
                          ? "bg-gray-800 text-gray-400 hover:text-white"
                          : "bg-gray-100 text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Contact Info */}
                <ContactFields
                  email={email}
                  twitterHandle={twitterHandle}
                  onEmailChange={setEmail}
                  onTwitterChange={setTwitterHandle}
                  inputClassName={inputClassName}
                  labelClassName={labelClassName}
                />

                {/* Event Fields */}
                {(feedbackType === "new_event" ||
                  feedbackType === "edit_event") && (
                  <>
                    <EventFields
                      eventTitle={eventTitle}
                      eventDate={eventDate}
                      eventSummary={eventSummary}
                      eventCategory={eventCategory}
                      eventTags={eventTags}
                      eventMode={eventMode}
                      eventImageUrl={eventImageUrl}
                      eventSourceUrl={eventSourceUrl}
                      onTitleChange={setEventTitle}
                      onDateChange={setEventDate}
                      onSummaryChange={setEventSummary}
                      onCategoryChange={setEventCategory}
                      onTagToggle={handleTagToggle}
                      onModeChange={setEventMode}
                      onImageUrlChange={setEventImageUrl}
                      onSourceUrlChange={setEventSourceUrl}
                      inputClassName={inputClassName}
                      labelClassName={labelClassName}
                      isCrimeline={isCrimeline}
                    />

                    {/* Video Fields */}
                    <VideoFields
                      videoUrl={eventVideoUrl}
                      videoProvider={eventVideoProvider}
                      videoPosterUrl={eventVideoPosterUrl}
                      videoCaption={eventVideoCaption}
                      videoOrientation={eventVideoOrientation}
                      onVideoUrlChange={setEventVideoUrl}
                      onProviderChange={setEventVideoProvider}
                      onPosterUrlChange={setEventVideoPosterUrl}
                      onCaptionChange={setEventVideoCaption}
                      onOrientationChange={setEventVideoOrientation}
                      inputClassName={inputClassName}
                      labelClassName={labelClassName}
                      isCrimeline={isCrimeline}
                    />

                    {/* Crimeline-specific fields */}
                    {showCrimelineFields && (
                      <CrimelineFields
                        crimelineType={crimelineType}
                        fundsLost={crimelineFundsLost}
                        status={crimelineStatus}
                        rootCause={crimelineRootCause}
                        aftermath={crimelineAftermath}
                        onTypeChange={setCrimelineType}
                        onFundsLostChange={setCrimelineFundsLost}
                        onStatusChange={setCrimelineStatus}
                        onRootCauseChange={setCrimelineRootCause}
                        onAftermathChange={setCrimelineAftermath}
                        inputClassName={inputClassName}
                        labelClassName={labelClassName}
                        isCrimeline={isCrimeline}
                      />
                    )}
                  </>
                )}

                {/* Message field for general feedback and edit suggestions */}
                {(feedbackType === "general" ||
                  feedbackType === "edit_event") && (
                  <div>
                    <label htmlFor="message" className={labelClassName}>
                      {feedbackType === "edit_event"
                        ? "Additional Notes / What needs to be changed"
                        : "Your Feedback"}{" "}
                      {feedbackType === "general" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <textarea
                      id="message"
                      required={feedbackType === "general"}
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        feedbackType === "edit_event"
                          ? "Describe what information is incorrect or needs updating..."
                          : "Share your thoughts, suggestions, or report bugs..."
                      }
                      className={inputClassName}
                    />
                  </div>
                )}

                {/* Status Messages */}
                <AnimatePresence mode="wait">
                  {submitStatus === "success" && (
                    <SuccessAnimation isCrimeline={isCrimeline} />
                  )}
                  {submitStatus === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-lg bg-red-100 text-red-800 border border-red-200"
                    >
                      {errorMessage || "An error occurred. Please try again."}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Retry indicator */}
                {isSubmitting && retryCount > 0 && (
                  <p
                    className={`text-sm ${
                      isCrimeline ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Retrying... (Attempt {retryCount + 1})
                  </p>
                )}

                {/* Submit Button */}
                {submitStatus !== "success" && (
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isCrimeline
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isCrimeline
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
