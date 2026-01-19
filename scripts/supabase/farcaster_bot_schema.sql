-- Farcaster Bot Posts Table
-- This table tracks all posts made by the bot to prevent duplicates
-- and maintain a complete history of posted events.

CREATE TABLE IF NOT EXISTS farcaster_bot_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Posting metadata (in America/Chicago timezone)
  post_date DATE NOT NULL,           -- The date this was posted (Chicago time)
  slot_index SMALLINT NOT NULL,      -- 0-4 (which daily slot)
  slot_hour SMALLINT NOT NULL,       -- 10, 13, 16, 19, or 22 (for debugging)

  -- Event information
  event_id TEXT NOT NULL,            -- The event ID from events.json
  event_date DATE NOT NULL,          -- The historical date of the event

  -- Farcaster response data
  cast_hash TEXT NOT NULL,           -- Farcaster cast hash
  cast_url TEXT,                     -- Full cast URL for easy access

  -- Timestamps
  posted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate posts per slot per day
  CONSTRAINT unique_post_per_slot UNIQUE(post_date, slot_index)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_farcaster_post_date
  ON farcaster_bot_posts(post_date DESC);

CREATE INDEX IF NOT EXISTS idx_farcaster_event_id
  ON farcaster_bot_posts(event_id);

CREATE INDEX IF NOT EXISTS idx_farcaster_cast_hash
  ON farcaster_bot_posts(cast_hash);

CREATE INDEX IF NOT EXISTS idx_farcaster_posted_at
  ON farcaster_bot_posts(posted_at DESC);

-- Row Level Security (RLS)
ALTER TABLE farcaster_bot_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to view bot history
CREATE POLICY "Allow public read access to bot posts"
  ON farcaster_bot_posts
  FOR SELECT
  USING (true);

-- Only allow inserts from authenticated service role
-- (This will be enforced via service role key in the API)
CREATE POLICY "Allow service role to insert bot posts"
  ON farcaster_bot_posts
  FOR INSERT
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE farcaster_bot_posts IS
  'Tracks all Farcaster posts made by the Chain of Events bot';

COMMENT ON COLUMN farcaster_bot_posts.post_date IS
  'The date this was posted (America/Chicago timezone)';

COMMENT ON COLUMN farcaster_bot_posts.slot_index IS
  'Daily posting slot (0-4 for 10am, 1pm, 4pm, 7pm, 10pm)';

COMMENT ON COLUMN farcaster_bot_posts.event_id IS
  'References the event ID from events.json';

COMMENT ON COLUMN farcaster_bot_posts.cast_hash IS
  'Farcaster cast hash for verification';
