/**
 * Centralized constants for the Chain of Events application.
 * This file contains all magic strings, form options, and configuration values.
 */

// ============================================================================
// Mode Constants
// ============================================================================

export const MODES = {
  TIMELINE: "timeline",
  CRIMELINE: "crimeline",
  BOTH: "both",
} as const;

export type Mode = (typeof MODES)[keyof typeof MODES];

export const MODE_OPTIONS = [MODES.TIMELINE, MODES.CRIMELINE, MODES.BOTH] as const;

// ============================================================================
// Event Categories
// ============================================================================

export const CATEGORIES = [
  "Bitcoin",
  "Ethereum",
  "DeFi",
  "NFT",
  "Stablecoin",
  "Centralized Exchange",
  "Layer 2",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Premium/Special categories with unique styling
export const PREMIUM_CATEGORIES = ["CT Lore", "ZachXBT"] as const;

// ============================================================================
// Event Tags
// ============================================================================

export const EVENT_TAGS = [
  "TECH",
  "ECONOMIC",
  "REGULATORY",
  "CULTURAL",
  "SECURITY",
  "FAILURE",
  "MILESTONE",
  "ATH",
] as const;

export type EventTag = (typeof EVENT_TAGS)[number];

// ============================================================================
// Crimeline Types
// ============================================================================

export const CRIMELINE_TYPES = [
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
] as const;

export type CrimelineType = (typeof CRIMELINE_TYPES)[number];

// ============================================================================
// Outcome Status
// ============================================================================

export const OUTCOME_STATUSES = [
  "Funds recovered",
  "Partial recovery",
  "Total loss",
  "Ongoing",
  "Unknown",
] as const;

export type OutcomeStatus = (typeof OUTCOME_STATUSES)[number];

// ============================================================================
// Video Constants
// ============================================================================

export const VIDEO_PROVIDERS = ["youtube", "vimeo", "mux", "self_hosted"] as const;
export type VideoProvider = (typeof VIDEO_PROVIDERS)[number];

export const VIDEO_ORIENTATIONS = ["landscape", "portrait", "square"] as const;
export type VideoOrientation = (typeof VIDEO_ORIENTATIONS)[number];

// ============================================================================
// Feedback Types
// ============================================================================

export const FEEDBACK_TYPES = ["new_event", "edit_event", "general"] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

// ============================================================================
// Fallback Images
// ============================================================================

export const FALLBACK_IMAGES = {
  TIMELINE: "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/chain_of_events_small.png",
  CRIMELINE: "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/CoE_Crimeline.png",
} as const;

// ============================================================================
// Rate Limiting
// ============================================================================

export const RATE_LIMIT = {
  MAX_SUBMISSIONS: 5,
  WINDOW_MS: 60 * 60 * 1000, // 1 hour in milliseconds
} as const;

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION = {
  MAX_TITLE_LENGTH: 200,
  MAX_SUMMARY_LENGTH: 5000,
  MAX_MESSAGE_LENGTH: 10000,
  MAX_EMAIL_LENGTH: 254,
  MAX_TWITTER_HANDLE_LENGTH: 50,
  MAX_URL_LENGTH: 2048,
} as const;

// ============================================================================
// Retry Configuration
// ============================================================================

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY_MS: 1000,
  MAX_DELAY_MS: 10000,
} as const;
