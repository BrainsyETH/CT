export type Mode = "timeline" | "crimeline" | "both";

export type EventTag =
  | "TECH"
  | "ECONOMIC"
  | "REGULATORY"
  | "CULTURAL"
  | "SECURITY"
  | "FAILURE"
  | "MILESTONE"
  | "ATH";

export type CrimelineType =
  | "EXCHANGE HACK"
  | "PROTOCOL EXPLOIT"
  | "BRIDGE HACK"
  | "ORACLE MANIPULATION"
  | "RUG PULL"
  | "FRAUD"
  | "CUSTODY FAILURE"
  | "LEVERAGE COLLAPSE"
  | "GOVERNANCE ATTACK"
  | "REGULATORY SEIZURE"
  | "SOCIAL MEDIA HACK"
  | "OTHER";

export type CrimelineCategory =
  | "Centralized Exchange"
  | "DeFi Protocol"
  | "Bridge"
  | "Key Compromise"
  | "Stablecoin"
  | "Lending"
  | "Market Structure"
  | "Other";

export type OutcomeStatus =
  | "Funds recovered"
  | "Partial recovery"
  | "Total loss"
  | "Ongoing"
  | "Unknown";

export type VideoProvider = "youtube" | "vimeo" | "mux" | "self_hosted";
export type VideoOrientation = "landscape" | "portrait" | "square";

export interface EventVideo {
  provider: VideoProvider;
  url: string; // canonical playback/watch URL
  embed_url?: string; // pre-built embed URL (for YouTube/Vimeo)
  poster_url?: string; // thumbnail for card/modal preview
  duration_seconds?: number;
  caption?: string;
  orientation?: VideoOrientation; // defaults to landscape if not specified
}

export interface TwitterMedia {
  tweet_url?: string;
  account_handle?: string;
}

export interface ImageMedia {
  url: string;
  alt?: string;
  caption?: string;
}

export type MediaItem =
  | { type: "video"; video: EventVideo }
  | { type: "twitter"; twitter: TwitterMedia }
  | { type: "image"; image: ImageMedia };

export interface EventRelationship {
  event_id: string;
  relationship_type: "related" | "predecessor" | "successor" | "part_of_series";
  label?: string;
}

export interface Event {
  id: string;
  date: string;
  title: string;
  summary: string;
  category: string[];
  tags: EventTag[];
  mode: Mode[];
  image?: string;
  video?: EventVideo;
  media?: MediaItem[];
  links?: { label: string; url: string }[];
  metrics?: {
    btc_price_usd?: number;
    market_cap_usd?: number;
    tvl_usd?: number;
    volume_usd?: number;
  };
  crimeline?: {
    type: CrimelineType;
    funds_lost_usd?: number;
    victims_estimated?: string;
    root_cause?: string[];
    aftermath?: string;
    status?: OutcomeStatus;
  };
  // Event relationships for connected narratives
  related_events?: EventRelationship[];
}

// Feedback submission types
export type FeedbackType = "new_event" | "edit_event" | "general";

export interface FeedbackSubmission {
  type: FeedbackType;
  email: string;
  twitter_handle?: string;
  // For new_event and edit_event
  event_id?: string;
  event_title?: string;
  event_date?: string;
  event_summary?: string;
  event_category?: string;
  event_tags?: string;
  event_mode?: string;
  event_image_url?: string;
  event_source_url?: string;
  // For event video
  event_video_url?: string;
  event_video_provider?: string;
  event_video_poster_url?: string;
  event_video_caption?: string;
  event_video_orientation?: string;
  // For crimeline events
  crimeline_type?: string;
  crimeline_funds_lost?: string;
  crimeline_status?: string;
  crimeline_root_cause?: string;
  crimeline_aftermath?: string;
  // General feedback
  message?: string;
}

// Farcaster Bot types
export interface FarcasterBotPost {
  id: string;
  post_date: string; // ISO date string in America/Chicago
  slot_index: number; // 0-4
  slot_hour: number; // 10, 13, 16, 19, or 22
  event_id: string;
  event_date: string; // ISO date string
  cast_hash: string;
  cast_url: string | null;
  posted_at: string; // ISO timestamp
}

export interface PostingSlot {
  index: number;
  hour: number; // 10, 13, 16, 19, or 22
  label: string; // e.g., "10:00 AM"
}

export interface FarcasterPostPayload {
  text: string;
  embeds: { url: string }[];
}

// Twitter Bot types
export interface TwitterBotPost {
  id: string;
  post_date: string; // ISO date string in America/Chicago
  slot_index: number; // 0-4
  slot_hour: number; // 10, 13, 16, 19, or 22
  event_id: string;
  event_date: string; // ISO date string
  tweet_id: string;
  tweet_url: string | null;
  posted_at: string; // ISO timestamp
}

export interface TwitterPostPayload {
  text: string;
  eventUrl: string;
}

// API Rate Limit Tiers
export type ApiTier = "anonymous" | "registered" | "premium";

export interface ApiKeyInfo {
  key: string;
  tier: ApiTier;
  owner_email: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  rate_limit: number; // requests per minute
  description?: string;
}

export const API_TIER_LIMITS: Record<ApiTier, number> = {
  anonymous: 120,
  registered: 300,
  premium: 1000,
};

// Event Submission types
export type SubmissionStatus = "pending" | "approved" | "rejected" | "needs_review";

export interface EventSubmission {
  id: string;
  status: SubmissionStatus;
  submitted_by_email?: string;
  submitted_by_twitter?: string;
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  event_data: Partial<Event>;
  created_event_id?: string;
}

// Webhook types
export interface WebhookSubscription {
  id: string;
  url: string;
  categories?: string[];
  tags?: string[];
  modes?: string[];
  notify_on_create: boolean;
  notify_on_update: boolean;
  notify_on_delete: boolean;
  is_active: boolean;
  owner_email: string;
  description?: string;
}
