-- Weekly Crypto History Quiz Schema - DAILY QUESTION MODEL
-- This schema supports daily questions (1 per day, Monday-Sunday),
-- user participation tracking, leaderboards, and $EVENT token distribution on BASE

-- ============================================
-- 1. QUIZ WEEKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Week identification
  week_number INTEGER NOT NULL UNIQUE, -- Sequential week counter (1, 2, 3...)
  start_date DATE NOT NULL, -- Monday
  end_date DATE NOT NULL,   -- Sunday

  -- Quiz status
  status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'active', 'completed', 'rewarded')),

  -- Rewards tracking
  total_reward_amount DECIMAL(20, 6), -- Total $EVENT tokens for this week (BASE chain)
  reward_distributed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no overlapping weeks
  CONSTRAINT unique_week_dates UNIQUE(start_date, end_date)
);

-- ============================================
-- 2. QUIZ QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Question details
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answer_1 TEXT NOT NULL,
  wrong_answer_2 TEXT NOT NULL,
  wrong_answer_3 TEXT NOT NULL,

  -- Source event (optional - links to event in events.json)
  event_id TEXT, -- Reference to events.json
  event_date DATE,

  -- Difficulty and categorization
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT, -- DeFi, NFT, Hack, Milestone, etc.
  tags TEXT[], -- Array of tags

  -- Question metadata
  explanation TEXT, -- Explanation shown after answering
  image_url TEXT, -- Optional image for the question

  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. WEEK QUESTIONS (Junction Table)
-- ============================================
CREATE TABLE IF NOT EXISTS week_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  week_id UUID NOT NULL REFERENCES quiz_weeks(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,

  -- Day of week (1=Monday, 2=Tuesday, ..., 7=Sunday)
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),

  -- The specific date this question is for
  question_date DATE NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure each question appears only once per week
  CONSTRAINT unique_week_question UNIQUE(week_id, question_id),
  CONSTRAINT unique_week_day UNIQUE(week_id, day_of_week)
);

-- ============================================
-- 4. USER DAILY ANSWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_daily_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification (Farcaster FID)
  fid BIGINT NOT NULL, -- Farcaster ID
  username TEXT, -- Farcaster username (cached for display)

  -- Week and question reference
  week_id UUID NOT NULL REFERENCES quiz_weeks(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),

  -- Answer details
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,

  -- Timing
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one answer per user per question
  CONSTRAINT unique_user_day_answer UNIQUE(fid, week_id, day_of_week)
);

-- ============================================
-- 5. USER WEEK SUMMARY TABLE
-- ============================================
-- Tracks overall performance for a week (populated after Sunday)
CREATE TABLE IF NOT EXISTS user_week_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification
  fid BIGINT NOT NULL,
  username TEXT,

  -- Week reference
  week_id UUID NOT NULL REFERENCES quiz_weeks(id) ON DELETE CASCADE,

  -- Score tracking
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 7),
  total_questions INTEGER NOT NULL DEFAULT 7,
  percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    ROUND((score::DECIMAL / total_questions::DECIMAL) * 100, 2)
  ) STORED,

  -- Timing
  completed_at TIMESTAMPTZ NOT NULL, -- When they answered the last question

  -- Wallet for rewards (BASE chain)
  wallet_address TEXT, -- Verified Farcaster wallet
  wallet_verified_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one summary per user per week
  CONSTRAINT unique_user_week_summary UNIQUE(fid, week_id)
);

-- ============================================
-- 6. LEADERBOARD VIEW (Materialized for performance)
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard AS
SELECT
  fid,
  username,
  COUNT(*) as weeks_participated,
  AVG(percentage) as average_score,
  SUM(score) as total_correct,
  SUM(total_questions) as total_questions_answered,
  MAX(completed_at) as last_quiz_date,

  -- Streak calculation (will be calculated separately via function)
  0 as current_streak,

  -- Ranking
  ROW_NUMBER() OVER (
    ORDER BY
      AVG(percentage) DESC,
      COUNT(*) DESC,
      MAX(completed_at) DESC
  ) as rank
FROM user_week_summary
GROUP BY fid, username;

-- ============================================
-- 7. REWARD RECIPIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reward_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  week_id UUID NOT NULL REFERENCES quiz_weeks(id) ON DELETE CASCADE,
  summary_id UUID NOT NULL REFERENCES user_week_summary(id) ON DELETE CASCADE,

  -- User info
  fid BIGINT NOT NULL,
  username TEXT,

  -- Ranking and reward
  final_rank INTEGER NOT NULL CHECK (final_rank BETWEEN 1 AND 10),
  reward_amount DECIMAL(20, 6) NOT NULL,

  -- Distribution tracking (BASE chain)
  wallet_address TEXT NOT NULL, -- User's verified Farcaster wallet
  distributed BOOLEAN DEFAULT false,
  distributed_at TIMESTAMPTZ,
  transaction_hash TEXT, -- BASE chain tx hash

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_week_rank UNIQUE(week_id, final_rank),
  CONSTRAINT unique_week_recipient UNIQUE(week_id, summary_id)
);

-- ============================================
-- 8. FRAME INTERACTIONS TABLE (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS frame_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification
  fid BIGINT NOT NULL,
  username TEXT,

  -- Interaction details
  interaction_type TEXT NOT NULL
    CHECK (interaction_type IN (
      'view_home', 'view_daily_question', 'answer_question',
      'view_week_results', 'view_leaderboard', 'share_score',
      'view_rules', 'connect_wallet'
    )),

  -- Context
  week_id UUID REFERENCES quiz_weeks(id) ON DELETE SET NULL,
  question_id UUID REFERENCES quiz_questions(id) ON DELETE SET NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),

  -- Additional data (JSON for flexibility)
  metadata JSONB,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Quiz weeks
CREATE INDEX IF NOT EXISTS idx_quiz_weeks_status
  ON quiz_weeks(status);
CREATE INDEX IF NOT EXISTS idx_quiz_weeks_dates
  ON quiz_weeks(start_date, end_date);

-- Questions
CREATE INDEX IF NOT EXISTS idx_quiz_questions_event
  ON quiz_questions(event_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty
  ON quiz_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category
  ON quiz_questions(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_tags
  ON quiz_questions USING gin(tags);

-- Week questions
CREATE INDEX IF NOT EXISTS idx_week_questions_week
  ON week_questions(week_id);
CREATE INDEX IF NOT EXISTS idx_week_questions_day
  ON week_questions(week_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_week_questions_date
  ON week_questions(question_date);

-- User daily answers
CREATE INDEX IF NOT EXISTS idx_user_daily_answers_fid
  ON user_daily_answers(fid);
CREATE INDEX IF NOT EXISTS idx_user_daily_answers_week
  ON user_daily_answers(week_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_answers_day
  ON user_daily_answers(week_id, day_of_week);

-- User week summary
CREATE INDEX IF NOT EXISTS idx_user_week_summary_fid
  ON user_week_summary(fid);
CREATE INDEX IF NOT EXISTS idx_user_week_summary_week
  ON user_week_summary(week_id);
CREATE INDEX IF NOT EXISTS idx_user_week_summary_score
  ON user_week_summary(score DESC);

-- Reward recipients
CREATE INDEX IF NOT EXISTS idx_reward_recipients_week
  ON reward_recipients(week_id);
CREATE INDEX IF NOT EXISTS idx_reward_recipients_fid
  ON reward_recipients(fid);
CREATE INDEX IF NOT EXISTS idx_reward_recipients_distributed
  ON reward_recipients(distributed);

-- Frame interactions
CREATE INDEX IF NOT EXISTS idx_frame_interactions_fid
  ON frame_interactions(fid);
CREATE INDEX IF NOT EXISTS idx_frame_interactions_type
  ON frame_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_frame_interactions_created
  ON frame_interactions(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE quiz_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_week_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_interactions ENABLE ROW LEVEL SECURITY;

-- Public read access for quiz data
CREATE POLICY "Allow public read quiz weeks"
  ON quiz_weeks FOR SELECT USING (true);

CREATE POLICY "Allow public read questions"
  ON quiz_questions FOR SELECT USING (true);

CREATE POLICY "Allow public read week questions"
  ON week_questions FOR SELECT USING (true);

CREATE POLICY "Allow public read summaries"
  ON user_week_summary FOR SELECT USING (true);

CREATE POLICY "Allow public read rewards"
  ON reward_recipients FOR SELECT USING (true);

-- Users can read their own answers
CREATE POLICY "Allow users to read own answers"
  ON user_daily_answers FOR SELECT USING (true);

-- Users can insert their own answers
CREATE POLICY "Allow users to insert own answers"
  ON user_daily_answers FOR INSERT WITH CHECK (true);

-- Users can insert their own frame interactions
CREATE POLICY "Allow users to insert interactions"
  ON frame_interactions FOR INSERT WITH CHECK (true);

-- Service role for admin operations
CREATE POLICY "Allow service role full access quiz_weeks"
  ON quiz_weeks FOR ALL USING (true);

CREATE POLICY "Allow service role full access questions"
  ON quiz_questions FOR ALL USING (true);

CREATE POLICY "Allow service role full access week_questions"
  ON week_questions FOR ALL USING (true);

CREATE POLICY "Allow service role full access summaries"
  ON user_week_summary FOR ALL USING (true);

CREATE POLICY "Allow service role full access rewards"
  ON reward_recipients FOR ALL USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get current active week
CREATE OR REPLACE FUNCTION get_current_week()
RETURNS quiz_weeks AS $$
  SELECT * FROM quiz_weeks
  WHERE status = 'active'
  AND CURRENT_DATE BETWEEN start_date AND end_date
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Function to get today's question for a week
CREATE OR REPLACE FUNCTION get_todays_question(week_uuid UUID)
RETURNS TABLE (
  question_id UUID,
  day_of_week INTEGER,
  question_date DATE
) AS $$
  SELECT wq.question_id, wq.day_of_week, wq.question_date
  FROM week_questions wq
  WHERE wq.week_id = week_uuid
  AND wq.question_date = CURRENT_DATE
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Function to check if user has answered today
CREATE OR REPLACE FUNCTION has_answered_today(user_fid BIGINT, week_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM user_daily_answers uda
    JOIN week_questions wq ON uda.question_id = wq.question_id
    WHERE uda.fid = user_fid
    AND uda.week_id = week_uuid
    AND wq.question_date = CURRENT_DATE
  );
$$ LANGUAGE sql STABLE;

-- Function to get user's score for current week
CREATE OR REPLACE FUNCTION get_user_week_score(user_fid BIGINT, week_uuid UUID)
RETURNS TABLE (
  answers_count INTEGER,
  correct_count INTEGER
) AS $$
  SELECT
    COUNT(*)::INTEGER as answers_count,
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::INTEGER as correct_count
  FROM user_daily_answers
  WHERE fid = user_fid
  AND week_id = week_uuid;
$$ LANGUAGE sql STABLE;

-- Function to get top 10 for a specific week
CREATE OR REPLACE FUNCTION get_week_top_10(week_uuid UUID)
RETURNS TABLE (
  rank BIGINT,
  fid BIGINT,
  username TEXT,
  score INTEGER,
  percentage DECIMAL(5,2),
  completed_at TIMESTAMPTZ
) AS $$
  SELECT
    ROW_NUMBER() OVER (
      ORDER BY percentage DESC, completed_at ASC
    ) as rank,
    fid,
    username,
    score,
    percentage,
    completed_at
  FROM user_week_summary
  WHERE week_id = week_uuid
  ORDER BY percentage DESC, completed_at ASC
  LIMIT 10;
$$ LANGUAGE sql STABLE;

-- Function to finalize user's week (called after Sunday)
CREATE OR REPLACE FUNCTION finalize_user_week(user_fid BIGINT, week_uuid UUID)
RETURNS UUID AS $$
DECLARE
  summary_id UUID;
  user_score INTEGER;
  user_name TEXT;
  last_answer_time TIMESTAMPTZ;
BEGIN
  -- Get user's answers
  SELECT
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::INTEGER,
    MAX(username),
    MAX(answered_at)
  INTO user_score, user_name, last_answer_time
  FROM user_daily_answers
  WHERE fid = user_fid
  AND week_id = week_uuid;

  -- Insert summary
  INSERT INTO user_week_summary (fid, username, week_id, score, completed_at)
  VALUES (user_fid, user_name, week_uuid, COALESCE(user_score, 0), last_answer_time)
  ON CONFLICT (fid, week_id) DO UPDATE
  SET score = EXCLUDED.score,
      completed_at = EXCLUDED.completed_at
  RETURNING id INTO summary_id;

  RETURN summary_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user streak
CREATE OR REPLACE FUNCTION calculate_user_streak(user_fid BIGINT)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  last_week INTEGER;
  current_week INTEGER;
BEGIN
  -- Get all weeks user participated in, ordered by week number descending
  FOR current_week IN
    SELECT qw.week_number
    FROM user_week_summary uws
    JOIN quiz_weeks qw ON uws.week_id = qw.id
    WHERE uws.fid = user_fid
    ORDER BY qw.week_number DESC
  LOOP
    IF last_week IS NULL THEN
      -- First iteration
      streak := 1;
      last_week := current_week;
    ELSIF last_week - current_week = 1 THEN
      -- Consecutive week
      streak := streak + 1;
      last_week := current_week;
    ELSE
      -- Streak broken
      EXIT;
    END IF;
  END LOOP;

  RETURN COALESCE(streak, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to refresh leaderboard materialized view
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW leaderboard;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE quiz_weeks IS
  'Tracks weekly quiz periods (Monday-Sunday) and reward distribution status';

COMMENT ON TABLE quiz_questions IS
  'Pool of quiz questions that can be used in weekly quizzes';

COMMENT ON TABLE week_questions IS
  'Maps 7 questions to each quiz week (one per day, Monday-Sunday)';

COMMENT ON TABLE user_daily_answers IS
  'Tracks user answers for each day of the week (one answer per day)';

COMMENT ON TABLE user_week_summary IS
  'Weekly summary of user performance (populated after Sunday)';

COMMENT ON TABLE reward_recipients IS
  'Top 10 winners per week for $EVENT token distribution on BASE chain';

COMMENT ON TABLE frame_interactions IS
  'Analytics tracking for Frame interactions';

COMMENT ON COLUMN week_questions.day_of_week IS
  '1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday';

COMMENT ON COLUMN reward_recipients.transaction_hash IS
  'BASE chain transaction hash for $EVENT token distribution';
