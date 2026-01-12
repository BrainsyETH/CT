"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import type { Event, FeedbackType, FeedbackSubmission } from "@/lib/types";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: FeedbackType;
  event?: Event | null;
}

// Success animation component
function SuccessAnimation({ isCrimeline }: { isCrimeline: boolean }) {
  const checkmarkColor = isCrimeline ? "#a855f7" : "#14b8a6";
  const circleColor = isCrimeline ? "#7c3aed" : "#0d9488";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-8"
    >
      <div className="relative w-20 h-20">
        {/* Circle */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full"
        >
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={circleColor}
            strokeWidth="4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </motion.svg>

        {/* Checkmark */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
        >
          <motion.path
            d="M30 50 L45 65 L70 35"
            fill="none"
            stroke={checkmarkColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          />
        </motion.svg>

        {/* Burst particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: checkmarkColor,
              left: "50%",
              top: "50%",
            }}
            initial={{ scale: 0, x: "-50%", y: "-50%" }}
            animate={{
              scale: [0, 1, 0],
              x: `calc(-50% + ${Math.cos((i * Math.PI) / 4) * 50}px)`,
              y: `calc(-50% + ${Math.sin((i * Math.PI) / 4) * 50}px)`,
            }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`mt-4 text-lg font-semibold ${
          isCrimeline ? "text-purple-400" : "text-teal-600"
        }`}
      >
        Submitted Successfully!
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`mt-1 text-sm ${
          isCrimeline ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Thank you for your contribution
      </motion.p>
    </motion.div>
  );
}

const CATEGORIES = [
  "Bitcoin",
  "Ethereum",
  "DeFi",
  "NFT",
  "Stablecoin",
  "Centralized Exchange",
  "Layer 2",
  "Other",
];

const TAGS = [
  "TECH",
  "ECONOMIC",
  "REGULATORY",
  "CULTURAL",
  "SECURITY",
  "FAILURE",
  "MILESTONE",
  "ATH",
];

const MODES = ["timeline", "crimeline", "both"];

const CRIMELINE_TYPES = [
  "EXCHANGE HACK",
  "PROTOCOL EXPLOIT",
  "BRIDGE HACK",
  "ORACLE MANIPULATION",
  "RUG PULL",
  "FRAUD",
  "CUSTODY FAILURE",
  "LEVERAGE COLLAPSE",
  "GOVERNANCE ATTACK",
  "REGULATORY SEIZURE",
  "SOCIAL MEDIA HACK",
  "OTHER",
];

const OUTCOME_STATUSES = [
  "Funds recovered",
  "Partial recovery",
  "Total loss",
  "Ongoing",
  "Unknown",
];

export function FeedbackModal({ isOpen, onClose, initialType = "general", event }: FeedbackModalProps) {
  const { mode } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [feedbackType, setFeedbackType] = useState<FeedbackType>(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Form fields
  const [email, setEmail] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventSummary, setEventSummary] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [eventTags, setEventTags] = useState<string[]>([]);
  const [eventMode, setEventMode] = useState("timeline");
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [eventSourceUrl, setEventSourceUrl] = useState("");
  const [crimelineType, setCrimelineType] = useState("");
  const [crimelineFundsLost, setCrimelineFundsLost] = useState("");
  const [crimelineStatus, setCrimelineStatus] = useState("");
  const [crimelineRootCause, setCrimelineRootCause] = useState("");
  const [crimelineAftermath, setCrimelineAftermath] = useState("");
  const [message, setMessage] = useState("");

  // Pre-fill form when editing an event
  useEffect(() => {
    if (event && (initialType === "edit_event")) {
      setEventTitle(event.title || "");
      setEventDate(event.date || "");
      setEventSummary(event.summary || "");
      setEventCategory(Array.isArray(event.category) ? event.category[0] : event.category || "");
      setEventTags(event.tags || []);
      setEventMode(Array.isArray(event.mode) ? event.mode[0] : event.mode || "timeline");
      setEventImageUrl(event.image || "");
      setEventSourceUrl(event.links?.[0]?.url || "");
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
    setEventMode("timeline");
    setEventImageUrl("");
    setEventSourceUrl("");
    setCrimelineType("");
    setCrimelineFundsLost("");
    setCrimelineStatus("");
    setCrimelineRootCause("");
    setCrimelineAftermath("");
    setMessage("");
    setSubmitStatus("idle");
    setErrorMessage("");
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

    const submission: FeedbackSubmission = {
      type: feedbackType,
      email,
      twitter_handle: twitterHandle || undefined,
    };

    if (feedbackType === "new_event" || feedbackType === "edit_event") {
      submission.event_id = event?.id;
      submission.event_title = eventTitle;
      submission.event_date = eventDate;
      submission.event_summary = eventSummary;
      submission.event_category = eventCategory;
      submission.event_tags = eventTags.join(", ");
      submission.event_mode = eventMode;
      submission.event_image_url = eventImageUrl;
      submission.event_source_url = eventSourceUrl;

      if (eventMode === "crimeline" || eventMode === "both") {
        submission.crimeline_type = crimelineType;
        submission.crimeline_funds_lost = crimelineFundsLost;
        submission.crimeline_status = crimelineStatus;
        submission.crimeline_root_cause = crimelineRootCause;
        submission.crimeline_aftermath = crimelineAftermath;
      }
    }

    if (feedbackType === "general" || feedbackType === "edit_event") {
      submission.message = message;
    }

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit feedback");
      }

      setSubmitStatus("success");
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An error occurred");
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

  const showCrimelineFields = eventMode === "crimeline" || eventMode === "both";

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
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[85vh] overflow-y-auto z-50 rounded-xl shadow-[8px_8px_0_rgba(15,23,42,0.25)]"
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className={labelClassName}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor="twitter" className={labelClassName}>
                      X/Twitter Handle (optional)
                    </label>
                    <input
                      type="text"
                      id="twitter"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      placeholder="@handle"
                      className={inputClassName}
                    />
                  </div>
                </div>

                {/* Event Fields */}
                {(feedbackType === "new_event" || feedbackType === "edit_event") && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="eventTitle" className={labelClassName}>
                          Event Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="eventTitle"
                          required
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                          placeholder="e.g., Bitcoin Pizza Day"
                          className={inputClassName}
                        />
                      </div>
                      <div>
                        <label htmlFor="eventDate" className={labelClassName}>
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="eventDate"
                          required
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className={inputClassName}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="eventSummary" className={labelClassName}>
                        Summary <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="eventSummary"
                        required
                        rows={3}
                        value={eventSummary}
                        onChange={(e) => setEventSummary(e.target.value)}
                        placeholder="Describe the event..."
                        className={inputClassName}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="eventCategory" className={labelClassName}>
                          Category
                        </label>
                        <select
                          id="eventCategory"
                          value={eventCategory}
                          onChange={(e) => setEventCategory(e.target.value)}
                          className={inputClassName}
                        >
                          <option value="">Select category...</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="eventMode" className={labelClassName}>
                          Mode
                        </label>
                        <select
                          id="eventMode"
                          value={eventMode}
                          onChange={(e) => setEventMode(e.target.value)}
                          className={inputClassName}
                        >
                          {MODES.map((m) => (
                            <option key={m} value={m}>
                              {m.charAt(0).toUpperCase() + m.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelClassName}>Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {TAGS.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              eventTags.includes(tag)
                                ? isCrimeline
                                  ? "bg-purple-600 text-white"
                                  : "bg-teal-600 text-white"
                                : isCrimeline
                                ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="eventImageUrl" className={labelClassName}>
                          Image URL
                        </label>
                        <input
                          type="url"
                          id="eventImageUrl"
                          value={eventImageUrl}
                          onChange={(e) => setEventImageUrl(e.target.value)}
                          placeholder="https://..."
                          className={inputClassName}
                        />
                      </div>
                      <div>
                        <label htmlFor="eventSourceUrl" className={labelClassName}>
                          Source URL
                        </label>
                        <input
                          type="url"
                          id="eventSourceUrl"
                          value={eventSourceUrl}
                          onChange={(e) => setEventSourceUrl(e.target.value)}
                          placeholder="https://..."
                          className={inputClassName}
                        />
                      </div>
                    </div>

                    {/* Crimeline-specific fields */}
                    {showCrimelineFields && (
                      <div className={`p-4 rounded-lg ${isCrimeline ? "bg-purple-950/30 border border-purple-900/40" : "bg-red-50 border border-red-200"}`}>
                        <h3 className={`text-sm font-semibold mb-3 ${isCrimeline ? "text-purple-400" : "text-red-700"}`}>
                          Crimeline Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="crimelineType" className={labelClassName}>
                              Incident Type
                            </label>
                            <select
                              id="crimelineType"
                              value={crimelineType}
                              onChange={(e) => setCrimelineType(e.target.value)}
                              className={inputClassName}
                            >
                              <option value="">Select type...</option>
                              {CRIMELINE_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="crimelineFundsLost" className={labelClassName}>
                              Funds Lost (USD)
                            </label>
                            <input
                              type="text"
                              id="crimelineFundsLost"
                              value={crimelineFundsLost}
                              onChange={(e) => setCrimelineFundsLost(e.target.value)}
                              placeholder="e.g., 100000000"
                              className={inputClassName}
                            />
                          </div>
                          <div>
                            <label htmlFor="crimelineStatus" className={labelClassName}>
                              Outcome Status
                            </label>
                            <select
                              id="crimelineStatus"
                              value={crimelineStatus}
                              onChange={(e) => setCrimelineStatus(e.target.value)}
                              className={inputClassName}
                            >
                              <option value="">Select status...</option>
                              {OUTCOME_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="crimelineRootCause" className={labelClassName}>
                              Root Cause(s)
                            </label>
                            <input
                              type="text"
                              id="crimelineRootCause"
                              value={crimelineRootCause}
                              onChange={(e) => setCrimelineRootCause(e.target.value)}
                              placeholder="e.g., Smart contract bug, Poor security"
                              className={inputClassName}
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label htmlFor="crimelineAftermath" className={labelClassName}>
                            Aftermath
                          </label>
                          <textarea
                            id="crimelineAftermath"
                            rows={2}
                            value={crimelineAftermath}
                            onChange={(e) => setCrimelineAftermath(e.target.value)}
                            placeholder="What happened after the incident..."
                            className={inputClassName}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Message field for general feedback and edit suggestions */}
                {(feedbackType === "general" || feedbackType === "edit_event") && (
                  <div>
                    <label htmlFor="message" className={labelClassName}>
                      {feedbackType === "edit_event" ? "Additional Notes / What needs to be changed" : "Your Feedback"}{" "}
                      {feedbackType === "general" && <span className="text-red-500">*</span>}
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
