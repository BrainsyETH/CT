-- Distributed Rate Limiting Schema and Function for Chain of Events
--
-- This provides cross-instance rate limiting using Supabase/Postgres.
-- Run this migration to enable distributed rate limiting.

-- Create the rate limit buckets table
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  reset_at_ms BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for cleanup operations
CREATE INDEX IF NOT EXISTS idx_rate_limit_reset_at ON rate_limit_buckets(reset_at_ms);

-- Create the atomic rate limit check function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_ms BIGINT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_now BIGINT;
  v_reset_at_ms BIGINT;
  v_count INTEGER;
  v_remaining INTEGER;
  v_allowed BOOLEAN;
BEGIN
  -- Get current timestamp in milliseconds
  v_now := EXTRACT(EPOCH FROM now()) * 1000;

  -- Try to get existing bucket
  SELECT count, reset_at_ms INTO v_count, v_reset_at_ms
  FROM rate_limit_buckets
  WHERE key = p_key
  FOR UPDATE;

  IF NOT FOUND THEN
    -- No existing bucket, create new one
    v_reset_at_ms := v_now + p_window_ms;
    v_count := 1;
    v_remaining := p_limit - 1;
    v_allowed := TRUE;

    INSERT INTO rate_limit_buckets (key, count, reset_at_ms, updated_at)
    VALUES (p_key, v_count, v_reset_at_ms, now())
    ON CONFLICT (key) DO UPDATE SET
      count = EXCLUDED.count,
      reset_at_ms = EXCLUDED.reset_at_ms,
      updated_at = now();

  ELSIF v_now >= v_reset_at_ms THEN
    -- Window expired, reset bucket
    v_reset_at_ms := v_now + p_window_ms;
    v_count := 1;
    v_remaining := p_limit - 1;
    v_allowed := TRUE;

    UPDATE rate_limit_buckets
    SET count = v_count, reset_at_ms = v_reset_at_ms, updated_at = now()
    WHERE key = p_key;

  ELSIF v_count >= p_limit THEN
    -- Rate limit exceeded
    v_remaining := 0;
    v_allowed := FALSE;

  ELSE
    -- Increment counter
    v_count := v_count + 1;
    v_remaining := p_limit - v_count;
    v_allowed := TRUE;

    UPDATE rate_limit_buckets
    SET count = v_count, updated_at = now()
    WHERE key = p_key;
  END IF;

  RETURN json_build_object(
    'allowed', v_allowed,
    'remaining', GREATEST(0, v_remaining),
    'reset_at_ms', v_reset_at_ms
  );
END;
$$;

-- Create a cleanup function to remove expired buckets (run periodically)
CREATE OR REPLACE FUNCTION cleanup_rate_limit_buckets()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_now BIGINT;
  v_deleted INTEGER;
BEGIN
  v_now := EXTRACT(EPOCH FROM now()) * 1000;

  DELETE FROM rate_limit_buckets
  WHERE reset_at_ms < v_now;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- Grant execute permissions (adjust as needed for your RLS setup)
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INTEGER, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INTEGER, BIGINT) TO anon;
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INTEGER, BIGINT) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION check_rate_limit IS 'Atomic rate limit check with sliding window. Returns JSON with allowed, remaining, and reset_at_ms fields.';
