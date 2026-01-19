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

// Quiz types
export type QuizWeekStatus = "upcoming" | "active" | "completed" | "rewarded";
export type QuizDifficulty = "easy" | "medium" | "hard";
export type FrameInteractionType =
  | "view_home"
  | "start_quiz"
  | "answer_question"
  | "complete_quiz"
  | "view_leaderboard"
  | "share_score"
  | "view_rules";

export interface QuizWeek {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  status: QuizWeekStatus;
  total_reward_amount?: number;
  reward_distributed_at?: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
  event_id?: string;
  event_date?: string;
  difficulty?: QuizDifficulty;
  category?: string;
  tags?: string[];
  explanation?: string;
  image_url?: string;
  times_used?: number;
  times_correct?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WeekQuestion {
  id: string;
  week_id: string;
  question_id: string;
  question_order: number;
  created_at: string;
}

export interface QuizAnswer {
  question_id: string;
  user_answer: string;
  correct: boolean;
}

export interface UserQuizAttempt {
  id: string;
  fid: number;
  username?: string;
  week_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  started_at: string;
  completed_at: string;
  duration_seconds: number;
  answers: QuizAnswer[];
  created_at: string;
}

export interface RewardRecipient {
  id: string;
  week_id: string;
  attempt_id: string;
  fid: number;
  username?: string;
  final_rank: number;
  reward_amount: number;
  wallet_address?: string;
  distributed: boolean;
  distributed_at?: string;
  transaction_hash?: string;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  fid: number;
  username?: string;
  weeks_participated: number;
  average_score: number;
  total_correct: number;
  total_questions_answered: number;
  last_quiz_date: string;
  current_streak: number;
}

export interface WeekLeaderboardEntry {
  rank: number;
  fid: number;
  username?: string;
  score: number;
  percentage: number;
  completed_at: string;
}

export interface FrameInteraction {
  id?: string;
  fid: number;
  username?: string;
  interaction_type: FrameInteractionType;
  week_id?: string;
  question_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

// Frame state types
export interface QuizFrameState {
  week_id: string;
  question_index: number; // 0-6
  answers: string[]; // User's answers so far
  started_at: string;
}

export interface FrameButtonAction {
  index: number;
  label: string;
  action?: "post" | "post_redirect" | "link";
  target?: string;
}
