# Farcaster Event Bot Documentation

The Chain of Events Farcaster bot automatically posts historical crypto events to Farcaster/Base on the anniversary of when they occurred.

## Overview

The bot posts **5 times daily** at scheduled intervals, sharing events that happened "on this day" in crypto history. It uses Neynar API for Farcaster integration and Supabase for tracking posted events.

### Posting Schedule (America/Chicago timezone)

| Slot | Time     | Slot Index |
|------|----------|------------|
| 0    | 10:00 AM | 0          |
| 1    | 1:00 PM  | 1          |
| 2    | 4:00 PM  | 2          |
| 3    | 7:00 PM  | 3          |
| 4    | 10:00 PM | 4          |

**Cron frequency**: Every 15 minutes (checks if current hour matches a posting slot)

## Setup

### 1. Install Dependencies

Already done if you've run `npm install`. The bot uses:
- `@neynar/nodejs-sdk` - Farcaster API integration
- `@supabase/supabase-js` - Database for tracking posts

### 2. Set Up Neynar Account

1. Go to [Neynar Developer Portal](https://dev.neynar.com/)
2. Create an account and get your **API Key**
3. Create a **Signer** for your Farcaster account
4. Copy the **Signer UUID**

### 3. Set Up Supabase Database

Run the SQL migration to create the bot's table:

```bash
# Navigate to Supabase dashboard > SQL Editor
# Copy and run: scripts/supabase/farcaster_bot_schema.sql
```

This creates the `farcaster_bot_posts` table which tracks:
- Post date and slot
- Event ID
- Farcaster cast hash and URL
- Prevents duplicate posts per slot

### 4. Configure Environment Variables

Add to your `.env.local` (see `.env.example` for reference):

```bash
# Required
NEYNAR_API_KEY=your-neynar-api-key
FARCASTER_SIGNER_UUID=your-signer-uuid
FARCASTER_USERNAME=chainofevents

# Already configured
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional - for security
CRON_SECRET=your-random-secret
FARCASTER_MANUAL_SECRET=your-manual-secret
```

### 5. Deploy to Vercel

The bot uses Vercel Cron for scheduling. When you deploy:

1. Push your code to GitHub
2. Deploy via Vercel
3. Add environment variables in Vercel dashboard
4. The cron job will automatically run every 15 minutes

**Note**: `vercel.json` configures the cron schedule. Vercel will handle the rest.

## How It Works

### Event Selection Logic

1. **Filter by date**: Finds events where month/day match today (ignoring year)
2. **Sort deterministically**: By year DESC (newer first), then by ID
3. **Take up to 5**: One for each daily posting slot
4. **Map to slots**: Slot 0 → Event 0, Slot 1 → Event 1, etc.

**Example**: On January 3rd, the bot finds all events from January 3rd (any year):
- Bitcoin Genesis Block (2009)
- Some other event from Jan 3, 2015
- Another event from Jan 3, 2021

These get posted at 10am, 1pm, 4pm respectively.

### Post Format

**Caption**: First sentence from the event's summary only (no hashtags)

**Embeds**: The event's canonical URL on chainofevents.xyz
- Example: `https://chainofevents.xyz/?event=btc-genesis-2009-01-03`
- Farcaster automatically unfurls your OG image

**Fallback**: If OG image fails to unfurl, the event's `image` field could be added (future enhancement)

### Idempotency

The bot checks the database before posting:
- Queries `farcaster_bot_posts` for `(post_date, slot_index)`
- If exists, skips posting
- If not, posts and saves the record

This prevents duplicate posts if the cron runs multiple times per hour.

## Testing

### 1. Preview Mode (No Posting)

View what would be posted without actually posting:

```bash
# Today's events
curl https://your-domain.vercel.app/api/cron/farcaster-test

# Specific date (e.g., Bitcoin Genesis Day)
curl https://your-domain.vercel.app/api/cron/farcaster-test?date=2009-01-03

# Specific slot
curl https://your-domain.vercel.app/api/cron/farcaster-test?date=2009-01-03&slot=0
```

**Response shows**:
- All events for the date
- What each slot would post
- Formatted post text and embeds

### 2. Manual Post (ACTUALLY Posts to Farcaster)

⚠️ **Warning**: This WILL post to Farcaster!

```bash
curl -X POST "https://your-domain.vercel.app/api/cron/farcaster-manual?date=2009-01-03&slot=0&secret=YOUR_SECRET"
```

**Parameters**:
- `date` - The date to check for events (YYYY-MM-DD)
- `slot` - Which slot index (0-4)
- `secret` - Must match `FARCASTER_MANUAL_SECRET` env var

**Note**: Manual posts are NOT saved to the database (to avoid conflicts with the main cron).

### 3. Local Testing

Run the development server and hit the test endpoint:

```bash
npm run dev

# Then visit:
# http://localhost:3000/api/cron/farcaster-test?date=2009-01-03
```

## API Endpoints

### `GET /api/cron/farcaster-bot`

**Main cron endpoint** - Called by Vercel Cron every 15 minutes

**Response**:
- `skipped` - Not a posting hour or already posted
- `success` - Posted successfully
- `error` - Failed to post

### `GET /api/cron/farcaster-test`

**Testing/preview endpoint** - Shows what would be posted

**Query params**:
- `date` (optional) - YYYY-MM-DD format
- `slot` (optional) - 0-4

### `POST /api/cron/farcaster-manual`

**Manual trigger** - Actually posts to Farcaster (use with caution!)

**Query params**:
- `date` (required) - YYYY-MM-DD format
- `slot` (required) - 0-4
- `secret` (required) - Must match env var

## Architecture

```
/src/lib/farcaster/
├── client.ts              # Neynar client initialization
├── get-todays-events.ts   # Event filtering by date
├── format-post.ts         # Post formatting logic
├── post-event.ts          # Farcaster posting
├── time-utils.ts          # Chicago timezone handling
└── index.ts               # Exports

/src/app/api/cron/
├── farcaster-bot/route.ts    # Main cron handler
├── farcaster-test/route.ts   # Testing endpoint
└── farcaster-manual/route.ts # Manual trigger

/scripts/supabase/
├── farcaster_bot_schema.sql  # Database schema
└── README.md                 # DB setup instructions
```

## Monitoring

### Check Post History

Query Supabase:

```sql
SELECT
  post_date,
  slot_index,
  event_id,
  cast_url,
  posted_at
FROM farcaster_bot_posts
ORDER BY posted_at DESC
LIMIT 20;
```

### View Cron Logs

In Vercel dashboard:
1. Go to your project
2. Click "Logs" tab
3. Filter by `/api/cron/farcaster-bot`

### Test Cron Locally

You can trigger the cron endpoint manually:

```bash
# With secret
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/farcaster-bot

# Without secret (if not configured)
curl https://your-domain.vercel.app/api/cron/farcaster-bot
```

## Troubleshooting

### Bot not posting

1. **Check environment variables** - All required vars set in Vercel?
2. **Check cron logs** - Any errors in Vercel logs?
3. **Check Supabase** - Is the table created?
4. **Check Neynar account** - Valid signer and API key?

### Posts duplicating

- Shouldn't happen due to unique constraint on `(post_date, slot_index)`
- Check database for constraint: `unique_post_per_slot`

### Wrong timezone

- All time logic uses `America/Chicago` via `Intl.DateTimeFormat`
- Handles CST/CDT automatically
- Verify with test endpoint

### No events for a date

- Not all dates have events
- Bot gracefully skips empty slots
- Check with: `/api/cron/farcaster-test?date=YYYY-MM-DD`

## Future Enhancements

Ideas for improvement:

1. **Explicit image embeds** - If OG unfurl fails, attach `event.image` directly
2. **Analytics tracking** - Track engagement metrics for posts
3. **Retry logic** - Retry failed posts with exponential backoff
4. **Admin dashboard** - View/manage post history via web UI
5. **Multiple accounts** - Support posting to multiple Farcaster accounts
6. **Custom captions** - Per-event custom captions vs auto-generated

## Security Notes

- **Service Role Key**: Only used server-side, never exposed to client
- **Cron Secret**: Optional but recommended for production
- **Manual Secret**: Prevents unauthorized manual posts
- **Vercel Cron**: Automatically authenticated by Vercel platform

## Support

- **Neynar Docs**: https://docs.neynar.com/
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Cron Docs**: https://vercel.com/docs/cron-jobs
