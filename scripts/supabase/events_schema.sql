-- Events Table Schema
-- This table stores the complete history of cryptocurrency events
-- Previously stored in events.json, now migrated to Supabase for better scalability

CREATE TABLE IF NOT EXISTS events (
  -- Primary identifier
  id TEXT PRIMARY KEY,

  -- Core event data
  date DATE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,

  -- Classification (using arrays for flexibility)
  category TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  mode TEXT[] NOT NULL DEFAULT '{}',

  -- Media
  image TEXT,                     -- Main event image URL
  media JSONB DEFAULT '[]'::jsonb,  -- Array of media objects (video, twitter, images)
  links JSONB DEFAULT '[]'::jsonb,  -- Array of reference links

  -- Metrics (flexible JSON for various data points)
  metrics JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns

-- Date-based queries (most common - on this day in history)
CREATE INDEX IF NOT EXISTS idx_events_date
  ON events(date DESC);

-- Month/day queries for "on this day" feature
CREATE INDEX IF NOT EXISTS idx_events_month_day
  ON events((EXTRACT(MONTH FROM date)), (EXTRACT(DAY FROM date)));

-- Category filtering
CREATE INDEX IF NOT EXISTS idx_events_category
  ON events USING GIN(category);

-- Tag filtering
CREATE INDEX IF NOT EXISTS idx_events_tags
  ON events USING GIN(tags);

-- Mode filtering (timeline vs crimeline)
CREATE INDEX IF NOT EXISTS idx_events_mode
  ON events USING GIN(mode);

-- Full-text search on title and summary
CREATE INDEX IF NOT EXISTS idx_events_fulltext
  ON events USING GIN(to_tsvector('english', title || ' ' || summary));

-- JSONB indexes for metrics queries
CREATE INDEX IF NOT EXISTS idx_events_metrics
  ON events USING GIN(metrics);

-- Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for future API)
CREATE POLICY "Allow public read access to events"
  ON events
  FOR SELECT
  USING (true);

-- Only allow service role to insert/update/delete
-- This ensures data integrity and prevents unauthorized modifications
CREATE POLICY "Allow service role to insert events"
  ON events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to update events"
  ON events
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to delete events"
  ON events
  FOR DELETE
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on modifications
CREATE TRIGGER events_updated_at_trigger
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- Comments for documentation
COMMENT ON TABLE events IS
  'Complete history of cryptocurrency events - formerly stored in events.json';

COMMENT ON COLUMN events.id IS
  'Unique event identifier (e.g., btc-genesis-2009-01-03)';

COMMENT ON COLUMN events.date IS
  'Historical date when the event occurred';

COMMENT ON COLUMN events.category IS
  'Event categories (Bitcoin, Ethereum, DeFi, etc.)';

COMMENT ON COLUMN events.tags IS
  'Event tags (TECH, MILESTONE, HACK, CULTURAL, etc.)';

COMMENT ON COLUMN events.mode IS
  'Display mode (timeline, crimeline)';

COMMENT ON COLUMN events.media IS
  'Array of media objects with type-specific properties (video, twitter, image)';

COMMENT ON COLUMN events.links IS
  'Array of reference links with label and url';

COMMENT ON COLUMN events.metrics IS
  'Flexible metrics data (btc_price_usd, amounts, etc.)';

-- Create a view for easier querying with common filters
CREATE OR REPLACE VIEW events_timeline AS
SELECT
  id,
  date,
  title,
  summary,
  category,
  tags,
  mode,
  image,
  media,
  links,
  metrics,
  EXTRACT(YEAR FROM date) as year,
  EXTRACT(MONTH FROM date) as month,
  EXTRACT(DAY FROM date) as day,
  created_at,
  updated_at
FROM events
WHERE 'timeline' = ANY(mode)
ORDER BY date DESC;

CREATE OR REPLACE VIEW events_crimeline AS
SELECT
  id,
  date,
  title,
  summary,
  category,
  tags,
  mode,
  image,
  media,
  links,
  metrics,
  EXTRACT(YEAR FROM date) as year,
  EXTRACT(MONTH FROM date) as month,
  EXTRACT(DAY FROM date) as day,
  created_at,
  updated_at
FROM events
WHERE 'crimeline' = ANY(mode)
ORDER BY date DESC;

-- Grant SELECT on views to anon users (for public API access)
GRANT SELECT ON events_timeline TO anon;
GRANT SELECT ON events_crimeline TO anon;

COMMENT ON VIEW events_timeline IS
  'Timeline events only - filtered by mode array';

COMMENT ON VIEW events_crimeline IS
  'Crimeline events only - filtered by mode array';
