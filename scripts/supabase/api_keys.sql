-- API Keys and Rate Limit Tiers Schema
--
-- Provides tiered API access with different rate limits.

-- Create the API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'registered' CHECK (tier IN ('anonymous', 'registered', 'premium')),
  owner_email TEXT NOT NULL,
  description TEXT,
  rate_limit INTEGER NOT NULL DEFAULT 300, -- requests per minute
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  total_requests BIGINT DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_owner ON api_keys(owner_email);
CREATE INDEX IF NOT EXISTS idx_api_keys_tier ON api_keys(tier);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role full access"
  ON api_keys
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to validate and get API key info
CREATE OR REPLACE FUNCTION validate_api_key(p_key TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key_info RECORD;
BEGIN
  SELECT id, tier, rate_limit, owner_email, expires_at, is_active
  INTO v_key_info
  FROM api_keys
  WHERE key = p_key AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid API key');
  END IF;

  IF v_key_info.expires_at IS NOT NULL AND v_key_info.expires_at < now() THEN
    RETURN json_build_object('valid', false, 'error', 'API key expired');
  END IF;

  -- Update last used timestamp and increment counter
  UPDATE api_keys
  SET last_used_at = now(), total_requests = total_requests + 1
  WHERE id = v_key_info.id;

  RETURN json_build_object(
    'valid', true,
    'tier', v_key_info.tier,
    'rate_limit', v_key_info.rate_limit
  );
END;
$$;

-- Function to generate a new API key
CREATE OR REPLACE FUNCTION generate_api_key(
  p_owner_email TEXT,
  p_tier TEXT DEFAULT 'registered',
  p_description TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key TEXT;
  v_rate_limit INTEGER;
BEGIN
  -- Generate a unique API key
  v_key := 'coe_' || encode(gen_random_bytes(24), 'hex');

  -- Set rate limit based on tier
  v_rate_limit := CASE p_tier
    WHEN 'anonymous' THEN 120
    WHEN 'registered' THEN 300
    WHEN 'premium' THEN 1000
    ELSE 300
  END;

  INSERT INTO api_keys (key, tier, owner_email, description, rate_limit)
  VALUES (v_key, p_tier, p_owner_email, p_description, v_rate_limit);

  RETURN v_key;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION validate_api_key(TEXT) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION generate_api_key(TEXT, TEXT, TEXT) TO service_role;
