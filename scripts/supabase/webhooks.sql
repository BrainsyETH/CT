-- Webhook Notification System Schema
--
-- Allows users to subscribe to webhooks for new events.

-- Create the webhook subscriptions table
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  secret TEXT NOT NULL, -- Used for HMAC signature verification

  -- Subscription filters
  categories TEXT[], -- NULL = all categories
  tags TEXT[], -- NULL = all tags
  modes TEXT[], -- NULL = all modes ('timeline', 'crimeline')

  -- Event types to notify
  notify_on_create BOOLEAN DEFAULT true,
  notify_on_update BOOLEAN DEFAULT false,
  notify_on_delete BOOLEAN DEFAULT false,

  -- Status and tracking
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Owner info (for management)
  owner_email TEXT NOT NULL,
  description TEXT,

  -- Delivery stats
  last_triggered_at TIMESTAMPTZ,
  total_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_active ON webhook_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_owner ON webhook_subscriptions(owner_email);

-- Enable RLS
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role full access"
  ON webhook_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create the webhook delivery log table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'create', 'update', 'delete'
  delivered_at TIMESTAMPTZ DEFAULT now(),
  response_status INTEGER,
  response_body TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_subscription ON webhook_deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event ON webhook_deliveries(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_delivered_at ON webhook_deliveries(delivered_at DESC);

-- Enable RLS
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role full access"
  ON webhook_deliveries
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update subscription stats
CREATE OR REPLACE FUNCTION update_webhook_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE webhook_subscriptions
  SET
    last_triggered_at = NEW.delivered_at,
    total_deliveries = total_deliveries + 1,
    failed_deliveries = failed_deliveries + CASE WHEN NEW.success THEN 0 ELSE 1 END
  WHERE id = NEW.subscription_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats on delivery
DROP TRIGGER IF EXISTS trigger_update_webhook_stats ON webhook_deliveries;
CREATE TRIGGER trigger_update_webhook_stats
  AFTER INSERT ON webhook_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_stats();

-- Grant permissions
GRANT SELECT ON webhook_subscriptions TO service_role;
GRANT SELECT ON webhook_deliveries TO service_role;
