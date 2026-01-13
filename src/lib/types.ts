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
  | "Wallet/Key Compromise"
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

export interface EventVideo {
  provider: VideoProvider;
  url: string; // canonical playback/watch URL
  embed_url?: string; // pre-built embed URL (for YouTube/Vimeo)
  poster_url?: string; // thumbnail for card/modal preview
  duration_seconds?: number;
  caption?: string;
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
  // For crimeline events
  crimeline_type?: string;
  crimeline_funds_lost?: string;
  crimeline_status?: string;
  crimeline_root_cause?: string;
  crimeline_aftermath?: string;
  // General feedback
  message?: string;
}
