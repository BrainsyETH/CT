-- Temporarily make events table private
-- Run this if you want to restrict public access until you're ready

-- Remove public read policy
DROP POLICY IF EXISTS "Allow public read access to events" ON events;

-- Now only service role can access the events table
-- Your Next.js app will still work because it uses the service role key

-- To make it public again later, run:
-- CREATE POLICY "Allow public read access to events"
--   ON events FOR SELECT
--   USING (true);
