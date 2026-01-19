-- Twitter Bot Posts Table
-- Tracks all posts made by the Twitter bot for idempotency and analytics

CREATE TABLE IF NOT EXISTS twitter_bot_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Posting metadata (all in America/Chicago timezone)
  post_date DATE NOT NULL,           -- The date the post was made (Chicago TZ)
  slot_index SMALLINT NOT NULL,      -- 0-4 (corresponds to posting slots)
  slot_hour SMALLINT NOT NULL,       -- Hour of the slot (10, 13, 16, 19, or 22)

  -- Event information
  event_id TEXT NOT NULL,            -- References events table
  event_date DATE NOT NULL,          -- The historical date of the event

  -- Twitter response data
  tweet_id TEXT NOT NULL,            -- Twitter tweet ID
  tweet_url TEXT,                    -- Full URL to the tweet

  -- Timestamps
  posted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint to prevent posting same slot twice in one day
  CONSTRAINT unique_twitter_post_per_slot UNIQUE(post_date, slot_index)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_twitter_post_date ON twitter_bot_posts(post_date DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_event_id ON twitter_bot_posts(event_id);
CREATE INDEX IF NOT EXISTS idx_twitter_tweet_id ON twitter_bot_posts(tweet_id);

-- Enable Row Level Security
ALTER TABLE twitter_bot_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for displaying recent posts on site if needed)
CREATE POLICY "Allow public read access to twitter_bot_posts"
  ON twitter_bot_posts
  FOR SELECT
  USING (true);

-- Allow service role full access (for the bot to insert records)
CREATE POLICY "Allow service role full access to twitter_bot_posts"
  ON twitter_bot_posts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON twitter_bot_posts TO anon;
GRANT SELECT ON twitter_bot_posts TO authenticated;
GRANT ALL ON twitter_bot_posts TO service_role;
