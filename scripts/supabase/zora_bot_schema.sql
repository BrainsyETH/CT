-- Zora Bot Posts Table
-- This table tracks all Zora Content Coins created by the bot to prevent duplicates
-- and maintain a complete history of posted events.

CREATE TABLE IF NOT EXISTS zora_bot_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Posting metadata (in America/Chicago timezone)
  post_date DATE NOT NULL,           -- The date this was posted (Chicago time)
  slot_index SMALLINT NOT NULL,      -- 0-4 (which daily slot)
  slot_hour SMALLINT NOT NULL,       -- 10, 13, 16, 19, or 22 (for debugging)

  -- Event information
  event_id TEXT NOT NULL,            -- The event ID from Supabase
  event_date DATE NOT NULL,          -- The historical date of the event

  -- Zora response data
  coin_address TEXT NOT NULL,        -- Deployed coin contract address on Base
  tx_hash TEXT NOT NULL,             -- Transaction hash on Base
  coin_symbol TEXT NOT NULL,         -- Coin ticker symbol (e.g., "FEB19A")
  coin_url TEXT,                     -- Full Zora coin URL for easy access

  -- Timestamps
  posted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate posts per slot per day
  CONSTRAINT unique_zora_post_per_slot UNIQUE(post_date, slot_index)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_zora_post_date
  ON zora_bot_posts(post_date DESC);

CREATE INDEX IF NOT EXISTS idx_zora_event_id
  ON zora_bot_posts(event_id);

CREATE INDEX IF NOT EXISTS idx_zora_coin_address
  ON zora_bot_posts(coin_address);

CREATE INDEX IF NOT EXISTS idx_zora_tx_hash
  ON zora_bot_posts(tx_hash);

CREATE INDEX IF NOT EXISTS idx_zora_posted_at
  ON zora_bot_posts(posted_at DESC);

-- Row Level Security (RLS)
ALTER TABLE zora_bot_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to view bot history
CREATE POLICY "Allow public read access to zora bot posts"
  ON zora_bot_posts
  FOR SELECT
  USING (true);

-- Only allow inserts from authenticated service role
-- (This will be enforced via service role key in the API)
CREATE POLICY "Allow service role to insert zora bot posts"
  ON zora_bot_posts
  FOR INSERT
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE zora_bot_posts IS
  'Tracks all Zora Content Coins created by the Chain of Events bot';

COMMENT ON COLUMN zora_bot_posts.post_date IS
  'The date this was posted (America/Chicago timezone)';

COMMENT ON COLUMN zora_bot_posts.slot_index IS
  'Daily posting slot (0-4 for 10am, 1pm, 4pm, 7pm, 10pm)';

COMMENT ON COLUMN zora_bot_posts.event_id IS
  'References the event ID from Supabase events table';

COMMENT ON COLUMN zora_bot_posts.coin_address IS
  'Deployed Content Coin contract address on Base';

COMMENT ON COLUMN zora_bot_posts.tx_hash IS
  'Base chain transaction hash for the coin creation';

COMMENT ON COLUMN zora_bot_posts.coin_symbol IS
  'Coin ticker symbol (date-based, e.g., FEB19A)';
