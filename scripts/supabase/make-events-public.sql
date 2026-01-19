-- Make events table publicly readable
-- Run this when you're ready to launch the public API

-- Enable public read access
CREATE POLICY IF NOT EXISTS "Allow public read access to events"
  ON events
  FOR SELECT
  USING (true);

-- Anyone can now read events via the API
-- Write operations still require the service role key
