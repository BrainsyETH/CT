-- Supabase SQL Schema for Chain of Events Feedback System
-- Run this in your Supabase SQL Editor to create the feedback_submissions table

-- Create the feedback_submissions table
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Feedback type: new_event, edit_event, general
  type TEXT NOT NULL CHECK (type IN ('new_event', 'edit_event', 'general')),

  -- Contact info
  email TEXT NOT NULL,
  twitter_handle TEXT,

  -- Event fields (for new_event and edit_event types)
  event_id TEXT,  -- Reference to existing event ID (for edit_event)
  event_title TEXT,
  event_date TEXT,
  event_summary TEXT,
  event_category TEXT,
  event_tags TEXT,
  event_mode TEXT,
  event_image_url TEXT,
  event_source_url TEXT,

  -- Crimeline fields
  crimeline_type TEXT,
  crimeline_funds_lost TEXT,
  crimeline_status TEXT,
  crimeline_root_cause TEXT,
  crimeline_aftermath TEXT,

  -- General message (for general feedback and edit notes)
  message TEXT,

  -- Status for review workflow (optional, for future use)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT
);

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback_submissions(type);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback_submissions(created_at DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback_submissions(status);

-- Enable Row Level Security (RLS)
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for public submissions)
CREATE POLICY "Allow public inserts" ON feedback_submissions
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow only authenticated users to read (for admin dashboard)
-- Note: You may want to adjust this based on your authentication setup
CREATE POLICY "Allow authenticated reads" ON feedback_submissions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Optional: Grant usage on the table to the anon role for public inserts
GRANT INSERT ON feedback_submissions TO anon;

-- Optional: Grant all access to authenticated role (for admin)
GRANT ALL ON feedback_submissions TO authenticated;
