/**
 * Zod validation schemas for runtime type checking.
 */

import { z } from "zod";
import {
  MODES,
  MODE_OPTIONS,
  EVENT_TAGS,
  CRIMELINE_TYPES,
  OUTCOME_STATUSES,
  VIDEO_PROVIDERS,
  VIDEO_ORIENTATIONS,
  FEEDBACK_TYPES,
  VALIDATION,
} from "./constants";

// ============================================================================
// Event Video Schema
// ============================================================================

export const EventVideoSchema = z.object({
  provider: z.enum(VIDEO_PROVIDERS),
  url: z.string().url(),
  embed_url: z.string().url().optional(),
  poster_url: z.string().url().optional(),
  duration_seconds: z.number().positive().optional(),
  caption: z.string().max(500).optional(),
  orientation: z.enum(VIDEO_ORIENTATIONS).optional(),
});

// ============================================================================
// Crimeline Details Schema
// ============================================================================

export const CrimelineDetailsSchema = z.object({
  type: z.enum(CRIMELINE_TYPES),
  funds_lost_usd: z.number().nonnegative().optional(),
  victims_estimated: z.string().optional(),
  root_cause: z.array(z.string()).optional(),
  aftermath: z.string().optional(),
  status: z.enum(OUTCOME_STATUSES).optional(),
});

// ============================================================================
// Event Metrics Schema
// ============================================================================

export const EventMetricsSchema = z.object({
  btc_price_usd: z.number().nonnegative().optional(),
  market_cap_usd: z.number().nonnegative().optional(),
  tvl_usd: z.number().nonnegative().optional(),
  volume_usd: z.number().nonnegative().optional(),
});

// ============================================================================
// Event Link Schema
// ============================================================================

export const EventLinkSchema = z.object({
  label: z.string().min(1).max(100),
  url: z.string().url(),
});

// ============================================================================
// Event Schema
// ============================================================================

export const EventSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  title: z.string().min(1).max(VALIDATION.MAX_TITLE_LENGTH),
  summary: z.string().min(1).max(VALIDATION.MAX_SUMMARY_LENGTH),
  category: z.array(z.string().min(1)),
  tags: z.array(z.enum(EVENT_TAGS)),
  mode: z.array(z.enum(MODE_OPTIONS)),
  image: z.string().url().optional(),
  video: EventVideoSchema.optional(),
  links: z.array(EventLinkSchema).optional(),
  metrics: EventMetricsSchema.optional(),
  crimeline: CrimelineDetailsSchema.optional(),
});

// ============================================================================
// Events Array Schema
// ============================================================================

export const EventsArraySchema = z.array(EventSchema);

// ============================================================================
// Feedback Submission Schema
// ============================================================================

export const FeedbackSubmissionSchema = z.object({
  type: z.enum(FEEDBACK_TYPES),
  email: z.string().email().max(VALIDATION.MAX_EMAIL_LENGTH),
  twitter_handle: z.string().max(VALIDATION.MAX_TWITTER_HANDLE_LENGTH).optional(),
  event_id: z.string().optional(),
  event_title: z.string().max(VALIDATION.MAX_TITLE_LENGTH).optional(),
  event_date: z.string().optional(),
  event_summary: z.string().max(VALIDATION.MAX_SUMMARY_LENGTH).optional(),
  event_category: z.string().optional(),
  event_tags: z.string().optional(),
  event_mode: z.string().optional(),
  event_image_url: z.string().url().max(VALIDATION.MAX_URL_LENGTH).optional().or(z.literal("")),
  event_source_url: z.string().url().max(VALIDATION.MAX_URL_LENGTH).optional().or(z.literal("")),
  event_video_url: z.string().url().max(VALIDATION.MAX_URL_LENGTH).optional().or(z.literal("")),
  event_video_provider: z.string().optional(),
  event_video_poster_url: z.string().url().max(VALIDATION.MAX_URL_LENGTH).optional().or(z.literal("")),
  event_video_caption: z.string().max(500).optional(),
  event_video_orientation: z.string().optional(),
  crimeline_type: z.string().optional(),
  crimeline_funds_lost: z.string().optional(),
  crimeline_status: z.string().optional(),
  crimeline_root_cause: z.string().optional(),
  crimeline_aftermath: z.string().max(VALIDATION.MAX_SUMMARY_LENGTH).optional(),
  message: z.string().max(VALIDATION.MAX_MESSAGE_LENGTH).optional(),
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates events data at runtime, returning validated events and any errors.
 */
export function validateEvents(data: unknown): {
  events: z.infer<typeof EventsArraySchema>;
  errors: z.ZodError | null;
} {
  const result = EventsArraySchema.safeParse(data);

  if (result.success) {
    return { events: result.data, errors: null };
  }

  // Log validation errors in development
  if (process.env.NODE_ENV === "development") {
    console.error("Event validation errors:", result.error.errors);
  }

  // Return empty array on error but log the issue
  return { events: [], errors: result.error };
}

/**
 * Validates a single event.
 */
export function validateEvent(data: unknown): {
  event: z.infer<typeof EventSchema> | null;
  errors: z.ZodError | null;
} {
  const result = EventSchema.safeParse(data);

  if (result.success) {
    return { event: result.data, errors: null };
  }

  return { event: null, errors: result.error };
}

/**
 * Validates feedback submission data.
 */
export function validateFeedbackSubmission(data: unknown): {
  submission: z.infer<typeof FeedbackSubmissionSchema> | null;
  errors: z.ZodError | null;
} {
  const result = FeedbackSubmissionSchema.safeParse(data);

  if (result.success) {
    return { submission: result.data, errors: null };
  }

  return { submission: null, errors: result.error };
}

// ============================================================================
// Type Exports
// ============================================================================

export type Event = z.infer<typeof EventSchema>;
export type EventVideo = z.infer<typeof EventVideoSchema>;
export type CrimelineDetails = z.infer<typeof CrimelineDetailsSchema>;
export type EventMetrics = z.infer<typeof EventMetricsSchema>;
export type EventLink = z.infer<typeof EventLinkSchema>;
export type FeedbackSubmission = z.infer<typeof FeedbackSubmissionSchema>;
