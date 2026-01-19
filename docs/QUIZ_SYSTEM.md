# Crypto History Quiz System

A weekly quiz game integrated as a Farcaster Frame, where users test their crypto history knowledge and compete for $EVENT tokens.

## 🎯 Overview

- **Weekly quizzes** with 7 questions each
- **Leaderboard** based on score and participation
- **Token rewards** for top 10 performers
- **Frame integration** for seamless Farcaster experience
- **Social sharing** with custom score cards

## 📁 Project Structure

```
src/
├── lib/
│   └── quiz/
│       ├── question-generator.ts  # Generate questions from events.json
│       ├── db.ts                  # Database operations
│       └── frame-helpers.ts       # Frame utilities
│
├── app/api/frames/
│   ├── quiz/route.ts             # Main Frame handler
│   └── images/
│       ├── home/route.tsx        # Home screen image
│       ├── question/route.tsx    # Question screen image
│       └── results/route.tsx     # Results/share card image
│
└── scripts/quiz/
    └── seed-questions.ts         # Question generation script

supabase/
└── quiz_schema.sql               # Database schema
```

## 🚀 Setup Instructions

### 1. Database Setup

Run the schema in your Supabase SQL editor:

```bash
# Run this SQL file in Supabase dashboard
scripts/supabase/quiz_schema.sql
```

This creates:
- `quiz_weeks` - Weekly quiz periods
- `quiz_questions` - Question bank
- `week_questions` - 7 questions per week
- `user_quiz_attempts` - User scores
- `reward_recipients` - Top 10 winners
- `frame_interactions` - Analytics

### 2. Generate Questions

```bash
# Generate and preview questions
npx tsx scripts/quiz/seed-questions.ts

# Review the output, then uncomment the DB insert code
# and run again to seed the database
```

### 3. Create Quiz Week

You can create weeks either:

**Option A: Using the script** (recommended)
- Modify `scripts/quiz/seed-questions.ts` to create multiple weeks
- Uncomment the database insert code
- Run the script

**Option B: Manual SQL**

```sql
-- Insert a quiz week
INSERT INTO quiz_weeks (week_number, start_date, end_date, status)
VALUES (1, '2026-01-20', '2026-01-26', 'active');

-- Get the week_id from the insert above, then insert questions
-- (See quiz_schema.sql for the full process)
```

### 4. Activate Week

Set the week status to `'active'` in Supabase:

```sql
UPDATE quiz_weeks
SET status = 'active'
WHERE week_number = 1;
```

### 5. Test the Frame

Access the Frame at: `https://yoursite.com/api/frames/quiz`

You can test it locally using a Farcaster Frame validator like:
- https://warpcast.com/~/developers/frames
- https://framesjs.org/

## 🎮 How It Works

### Frame Flow

```
┌──────────┐
│   Home   │  Shows today's event + quiz intro
│  Screen  │  Buttons: [Start] [Leaderboard] [Rules]
└────┬─────┘
     │ Click "Start Quiz"
     ↓
┌──────────┐
│ Question │  7 questions, 4 answers each
│  1 - 7   │  Buttons: [A] [B] [C] [D]
└────┬─────┘
     │ Answer all 7
     ↓
┌──────────┐
│ Results  │  Score, rank, streak
│  Screen  │  Buttons: [Share] [Leaderboard] [Home]
└──────────┘
```

### State Management

Quiz state is encoded in the Frame `state` parameter as base64 JSON:

```typescript
{
  week_id: string,
  question_index: number,  // 0-6
  answers: string[],       // User's answers so far
  started_at: string       // ISO timestamp
}
```

### Question Types

Questions are auto-generated from `events.json`:

1. **Date Questions**: "When did X happen?" (year or month+year)
2. **Amount Questions**: "How much was lost in X?" (for hacks)
3. **Category Questions**: "What category is X?"
4. **Type Questions**: "What type of incident was X?" (crimeline only)

### Difficulty Distribution

Each week has a balanced mix:
- 2 Easy questions (recent events, major milestones)
- 3 Medium questions (mid-range events)
- 2 Hard questions (older or obscure events)

## 📊 Leaderboard & Rewards

### Weekly Leaderboard

Ranked by:
1. **Score** (higher is better)
2. **Completion time** (faster is better, as tiebreaker)

Top 10 each week win $EVENT tokens.

### Global Leaderboard

Ranked by:
1. **Average score** (%)
2. **Weeks participated** (more is better)
3. **Last quiz date** (recency as tiebreaker)

### Streak System

Users build streaks by participating in consecutive weeks:
- 🔥 2+ weeks
- 🔥🔥 5+ weeks
- 🔥🔥🔥 10+ weeks

## 💰 Token Distribution

### Reward Tiers (Suggested)

```
Rank 1:  30% of weekly pool
Rank 2:  20%
Rank 3:  15%
Rank 4:  10%
Rank 5:  8%
Rank 6:  6%
Rank 7:  4%
Rank 8:  3%
Rank 9:  2%
Rank 10: 2%
```

### Distribution Process

1. Week ends (status changes to `'completed'`)
2. Top 10 are automatically identified
3. Insert records into `reward_recipients`
4. Users connect wallets (via Frame or website)
5. Distribute tokens (manual or automated)
6. Mark week as `'rewarded'`

## 🖼️ Frame Images

All images are generated dynamically using Next.js `ImageResponse`:

### Home Screen
- Today's crypto event (randomized if multiple)
- Quiz intro with week number and dates
- Prize information

### Question Screen
- Question number (1/7)
- Question text
- 4 color-coded answer options (A, B, C, D)

### Results Screen
Two versions:
1. **Regular**: Shown after completing quiz
2. **Share Card**: Optimized for social sharing

Share card includes:
- Score and percentage
- Rank (with emoji)
- Streak (if applicable)
- Username
- Branded footer

## 📈 Analytics

Track user engagement via `frame_interactions` table:

```sql
-- Most popular actions
SELECT interaction_type, COUNT(*) as count
FROM frame_interactions
GROUP BY interaction_type
ORDER BY count DESC;

-- Completion rate
SELECT
  (SELECT COUNT(DISTINCT fid) FROM frame_interactions WHERE interaction_type = 'complete_quiz') * 100.0 /
  (SELECT COUNT(DISTINCT fid) FROM frame_interactions WHERE interaction_type = 'start_quiz')
  as completion_rate;

-- Average score per week
SELECT
  week_id,
  AVG(percentage) as avg_score,
  COUNT(*) as participants
FROM user_quiz_attempts
GROUP BY week_id
ORDER BY week_id;
```

## 🔧 Customization

### Adding New Question Types

Edit `src/lib/quiz/question-generator.ts`:

1. Add template to `questionTemplates`
2. Create generator function (e.g., `generateSequenceQuestion`)
3. Add to `generateQuestionPool` rotation

### Changing Difficulty Distribution

Edit `selectWeeklyQuestions()` in `question-generator.ts`:

```typescript
// Current: 2 easy, 3 medium, 2 hard
selected.push(...easy.slice(0, 2));
selected.push(...medium.slice(0, 3));
selected.push(...hard.slice(0, 2));

// Custom: 3 easy, 2 medium, 2 hard
selected.push(...easy.slice(0, 3));
selected.push(...medium.slice(0, 2));
selected.push(...hard.slice(0, 2));
```

### Styling Frame Images

Edit image routes in `src/app/api/frames/images/`:
- Colors
- Fonts
- Layout
- Branding

## 🧪 Testing

### Local Testing

1. Run dev server: `npm run dev`
2. Access Frame: `http://localhost:3000/api/frames/quiz`
3. Use Farcaster Frame debugger

### Testing Checklist

- [ ] Home screen loads with today's event
- [ ] Start Quiz button works
- [ ] Questions display correctly
- [ ] Answers are shuffled (not always in same order)
- [ ] Score is calculated correctly
- [ ] Results screen shows accurate data
- [ ] Duplicate attempts are prevented
- [ ] Leaderboard updates correctly
- [ ] Share card renders properly

## 🚨 Troubleshooting

### "No active quiz" error
- Check `quiz_weeks.status` is set to `'active'`
- Verify `start_date` and `end_date` include today

### Questions not showing
- Verify `week_questions` table has 7 entries for the week
- Check `quiz_questions` has the corresponding question IDs

### User can't submit quiz
- Check Supabase RLS policies allow inserts on `user_quiz_attempts`
- Verify FID is being parsed correctly from Frame message

### Images not loading
- Check `NEXT_PUBLIC_BASE_URL` or `VERCEL_URL` is set correctly
- Verify image routes return 200 status

## 📝 TODO / Future Enhancements

- [ ] Implement Frame signature validation (production security)
- [ ] Add achievements/badges system
- [ ] Create leaderboard image generator
- [ ] Create rules image generator
- [ ] Add question preview/explanation after each answer
- [ ] Implement streak calculation function
- [ ] Build admin dashboard for question management
- [ ] Add A/B testing for question formats
- [ ] Integrate wallet connection for token distribution
- [ ] Automated weekly quiz creation
- [ ] Email notifications for winners
- [ ] Social media auto-posting (weekly highlights)

## 🔗 Related Documentation

- [Farcaster Frames Spec](https://docs.farcaster.xyz/reference/frames/spec)
- [Next.js ImageResponse](https://nextjs.org/docs/app/api-reference/functions/image-response)
- [Supabase Docs](https://supabase.com/docs)

## 📞 Support

For questions or issues:
1. Check the troubleshooting section above
2. Review the quiz_schema.sql for database structure
3. Check Frame logs in Vercel or your hosting platform
4. Open an issue in the repository
