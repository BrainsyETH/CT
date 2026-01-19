-- Add crimeline column to events table
-- Run this to support crimeline metadata

-- Add the crimeline JSONB column
ALTER TABLE events
ADD COLUMN IF NOT EXISTS crimeline JSONB DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN events.crimeline IS
  'Crimeline-specific metadata (type, funds_lost_usd, victims_estimated, etc.)';

-- Create index for crimeline queries
CREATE INDEX IF NOT EXISTS idx_events_crimeline
  ON events USING GIN(crimeline)
  WHERE crimeline IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'events'
  AND column_name = 'crimeline';
