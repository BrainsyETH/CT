-- Events Month/Day View
-- Creates a helper view that exposes computed month/day columns for efficient
-- "on this day in history" queries without scanning/filtering in application code.
--
-- Usage (example):
--   SELECT id, date, title
--   FROM events_with_month_day
--   WHERE month = 1 AND day = 19
--   ORDER BY date DESC
--   LIMIT 5;
--
-- Notes:
-- - `events.date` is a DATE, so EXTRACT(MONTH/DAY) is stable and timezone-independent.
-- - This pairs with the existing index: idx_events_month_day

-- Ensure the `crimeline` column exists (migration script upserts it).
ALTER TABLE events
ADD COLUMN IF NOT EXISTS crimeline JSONB DEFAULT NULL;

COMMENT ON COLUMN events.crimeline IS
  'Crimeline-specific metadata (type, funds_lost_usd, victims_estimated, etc.)';

-- Create or replace the view with computed `month` and `day`
CREATE OR REPLACE VIEW events_with_month_day AS
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
  crimeline,
  EXTRACT(MONTH FROM date)::int AS month,
  EXTRACT(DAY FROM date)::int AS day,
  created_at,
  updated_at
FROM events;

COMMENT ON VIEW events_with_month_day IS
  'Events with computed month/day columns for efficient on-this-day queries.';

-- Grant read access to anon/authenticated roles (matches public read pattern used by other views)
GRANT SELECT ON events_with_month_day TO anon;
GRANT SELECT ON events_with_month_day TO authenticated;

