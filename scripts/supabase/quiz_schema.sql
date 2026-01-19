-- Weekly Crypto History Quiz Schema
-- This schema supports weekly quizzes, user participation tracking,
-- leaderboards, and $EVENT token distribution

-- ============================================
-- 1. QUIZ WEEKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Week identification
  week_number INTEGER NOT NULL UNIQUE, -- Sequential week counter (1, 2, 3...)
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Quiz status
  status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'active', 'completed', 'rewarded')),

  -- Rewards tracking
  total_reward_amount DECIMAL(20, 6), -- Total $EVENT tokens for this week
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
  question_order INTEGER NOT NULL, -- 1-7 (order in the quiz)

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure each question appears only once per week at a specific position
  CONSTRAINT unique_week_question UNIQUE(week_id, question_id),
  CONSTRAINT unique_week_order UNIQUE(week_id, question_order),
  CONSTRAINT valid_question_order CHECK (question_order BETWEEN 1 AND 7)
);

-- ============================================
-- 4. USER QUIZ ATTEMPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification (Farcaster FID)
  fid BIGINT NOT NULL, -- Farcaster ID
  username TEXT, -- Farcaster username (cached for display)

  -- Week reference
  week_id UUID NOT NULL REFERENCES quiz_weeks(id) ON DELETE CASCADE,

  -- Score tracking
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 7),
  total_questions INTEGER NOT NULL DEFAULT 7,
  percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    ROUND((score::DECIMAL / total_questions::DECIMAL) * 100, 2)
  ) STORED,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (completed_at - started_at))::INTEGER
  ) STORED,

  -- Answers (JSON array of question IDs and user answers)
  answers JSONB NOT NULL,
  -- Format: [{ "question_id": "uuid", "user_answer": "text", "correct": true }, ...]

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one attempt per user per week
  CONSTRAINT unique_user_week_attempt UNIQUE(fid, week_id)
);

-- ============================================
-- 5. LEADERBOARD VIEW (Materialized for performance)
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

  -- Streak calculation (consecutive weeks)
  -- This will be calculated separately via a function
  0 as current_streak,

  -- Ranking (will be calculated on query)
  ROW_NUMBER() OVER (
    ORDER BY
      AVG(percentage) DESC,
      COUNT(*) DESC,
      MAX(completed_at) DESC
  ) as rank
FROM user_quiz_attempts
GROUP BY fid, username;

-- ============================================
-- 6. REWARD RECIPIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reward_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  week_id UUID NOT NULL REFERENCES quiz_weeks(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES user_quiz_attempts(id) ON DELETE CASCADE,

  -- User info
  fid BIGINT NOT NULL,
  username TEXT,

  -- Ranking and reward
  final_rank INTEGER NOT NULL CHECK (final_rank BETWEEN 1 AND 10),
  reward_amount DECIMAL(20, 6) NOT NULL,

  -- Distribution tracking
  wallet_address TEXT, -- User's wallet for token distribution
  distributed BOOLEAN DEFAULT false,
  distributed_at TIMESTAMPTZ,
  transaction_hash TEXT, -- On-chain tx hash

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_week_rank UNIQUE(week_id, final_rank),
  CONSTRAINT unique_week_recipient UNIQUE(week_id, attempt_id)
);

-- ============================================
-- 7. FRAME INTERACTIONS TABLE (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS frame_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification
  fid BIGINT NOT NULL,
  username TEXT,

  -- Interaction details
  interaction_type TEXT NOT NULL
    CHECK (interaction_type IN (
      'view_home', 'start_quiz', 'answer_question',
      'complete_quiz', 'view_leaderboard', 'share_score', 'view_rules'
    )),

  -- Context
  week_id UUID REFERENCES quiz_weeks(id) ON DELETE SET NULL,
  question_id UUID REFERENCES quiz_questions(id) ON DELETE SET NULL,

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

-- User attempts
CREATE INDEX IF NOT EXISTS idx_user_attempts_fid
  ON user_quiz_attempts(fid);
CREATE INDEX IF NOT EXISTS idx_user_attempts_week
  ON user_quiz_attempts(week_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_score
  ON user_quiz_attempts(score DESC);
CREATE INDEX IF NOT EXISTS idx_user_attempts_completed
  ON user_quiz_attempts(completed_at DESC);

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
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_interactions ENABLE ROW LEVEL SECURITY;

-- Public read access for quiz data
CREATE POLICY "Allow public read quiz weeks"
  ON quiz_weeks FOR SELECT USING (true);

CREATE POLICY "Allow public read questions"
  ON quiz_questions FOR SELECT USING (true);

CREATE POLICY "Allow public read week questions"
  ON week_questions FOR SELECT USING (true);

CREATE POLICY "Allow public read leaderboard"
  ON user_quiz_attempts FOR SELECT USING (true);

CREATE POLICY "Allow public read rewards"
  ON reward_recipients FOR SELECT USING (true);

-- Users can insert their own quiz attempts
CREATE POLICY "Allow users to insert own attempts"
  ON user_quiz_attempts FOR INSERT WITH CHECK (true);

-- Users can insert their own frame interactions
CREATE POLICY "Allow users to insert interactions"
  ON frame_interactions FOR INSERT WITH CHECK (true);

-- Service role for admin operations (inserting questions, distributing rewards)
CREATE POLICY "Allow service role full access quiz_weeks"
  ON quiz_weeks FOR ALL USING (true);

CREATE POLICY "Allow service role full access questions"
  ON quiz_questions FOR ALL USING (true);

CREATE POLICY "Allow service role full access week_questions"
  ON week_questions FOR ALL USING (true);

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
  FROM user_quiz_attempts
  WHERE week_id = week_uuid
  ORDER BY percentage DESC, completed_at ASC
  LIMIT 10;
$$ LANGUAGE sql STABLE;

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
    FROM user_quiz_attempts uqa
    JOIN quiz_weeks qw ON uqa.week_id = qw.id
    WHERE uqa.fid = user_fid
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
  'Tracks weekly quiz periods and reward distribution status';

COMMENT ON TABLE quiz_questions IS
  'Pool of quiz questions that can be used in weekly quizzes';

COMMENT ON TABLE week_questions IS
  'Junction table linking 7 questions to each quiz week';

COMMENT ON TABLE user_quiz_attempts IS
  'User quiz attempts - one per user per week';

COMMENT ON TABLE reward_recipients IS
  'Top 10 winners per week for $EVENT token distribution';

COMMENT ON TABLE frame_interactions IS
  'Analytics tracking for Frame interactions';
