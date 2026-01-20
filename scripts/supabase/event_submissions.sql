-- Event Submission Moderation Queue Schema
--
-- This provides a formal moderation workflow for community-submitted events.

-- Create the event submissions table
CREATE TABLE IF NOT EXISTS event_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_review')),

  -- Submitter info
  submitted_by_email TEXT,
  submitted_by_twitter TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),

  -- Review info
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- The proposed event data (JSON matches Event interface)
  event_data JSONB NOT NULL,

  -- If approved, link to the created event
  created_event_id TEXT,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_event_submissions_status ON event_submissions(status);
CREATE INDEX IF NOT EXISTS idx_event_submissions_submitted_at ON event_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_submissions_email ON event_submissions(submitted_by_email);

-- Enable RLS
ALTER TABLE event_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role full access"
  ON event_submissions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Authenticated users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON event_submissions
  FOR SELECT
  USING (submitted_by_email = auth.email());

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_event_submissions_updated_at ON event_submissions;
CREATE TRIGGER trigger_event_submissions_updated_at
  BEFORE UPDATE ON event_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_event_submissions_updated_at();

-- ============================================================================
-- Event History / Audit Trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now(),
  changed_by TEXT,
  change_type TEXT NOT NULL CHECK (change_type IN ('create', 'update', 'delete')),
  previous_data JSONB,
  new_data JSONB,
  change_summary TEXT
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_event_history_event_id ON event_history(event_id);
CREATE INDEX IF NOT EXISTS idx_event_history_changed_at ON event_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_history_change_type ON event_history(change_type);

-- Enable RLS
ALTER TABLE event_history ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role full access"
  ON event_history
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Anyone can read history
CREATE POLICY "Public read access"
  ON event_history
  FOR SELECT
  USING (true);

-- Function to automatically record event changes
CREATE OR REPLACE FUNCTION record_event_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO event_history (event_id, change_type, new_data, change_summary)
    VALUES (NEW.id, 'create', to_jsonb(NEW), 'Event created');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO event_history (event_id, change_type, previous_data, new_data, change_summary)
    VALUES (NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW), 'Event updated');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO event_history (event_id, change_type, previous_data, change_summary)
    VALUES (OLD.id, 'delete', to_jsonb(OLD), 'Event deleted');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-record changes on events table
DROP TRIGGER IF EXISTS trigger_record_event_change ON events;
CREATE TRIGGER trigger_record_event_change
  AFTER INSERT OR UPDATE OR DELETE ON events
  FOR EACH ROW
  EXECUTE FUNCTION record_event_change();

-- Grant permissions
GRANT SELECT ON event_submissions TO authenticated, anon;
GRANT SELECT ON event_history TO authenticated, anon;
