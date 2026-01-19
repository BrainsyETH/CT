# Events Migration - Quick Start

Follow these steps in order to migrate your events to Supabase.

## Prerequisites

Make sure you have these environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these in your Supabase Dashboard under Settings → API.

## Step 1: Create the Database Table

**WHERE:** Supabase Dashboard → SQL Editor
**WHAT:** Copy and paste the SQL schema

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `scripts/supabase/events_schema.sql`
6. Paste into the SQL Editor
7. Click **Run** or press Cmd/Ctrl + Enter

**Expected Result:** You should see a success message. The `events` table is now created.

### Verify Table Creation

Run this query in the SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'events';
```

You should see the `events` table listed.

## Step 2: Migrate the Data

**WHERE:** Your terminal (in the project directory)
**WHAT:** Run the TypeScript migration script

```bash
# Make sure you're in the project directory
cd /home/user/CT

# Run the migration script
npx tsx scripts/migrate-events-to-supabase.ts
```

**Expected Output:**

```
🚀 Starting events migration to Supabase...

📊 Total events to migrate: 173

📝 Migrating events in batches...

   Batch 1/4 (50 events)... ✅ Success (50 events)
   Batch 2/4 (50 events)... ✅ Success (50 events)
   Batch 3/4 (50 events)... ✅ Success (50 events)
   Batch 4/4 (23 events)... ✅ Success (23 events)

============================================================
📊 Migration Summary:
============================================================
✅ Successful: 173 events
❌ Failed:     0 events
📝 Total:      173 events
============================================================

🎉 Migration completed successfully!

✅ Verified: 173 events in database

📅 Sample query - Most recent events:
   • 2024-12-20: Event title...
   • 2024-11-15: Event title...
   ...
```

## Step 3: Verify Migration

Back in the Supabase SQL Editor, run:

```sql
-- Check total count
SELECT COUNT(*) FROM events;
-- Should return: 173

-- View recent events
SELECT id, date, title
FROM events
ORDER BY date DESC
LIMIT 5;

-- Test "on this day" query
SELECT id, date, title
FROM events
WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(DAY FROM date) = EXTRACT(DAY FROM CURRENT_DATE)
ORDER BY date DESC;
```

## Step 4: Test the API

Once migrated, test your API endpoints:

```bash
# Test locally (if running dev server)
curl http://localhost:3000/api/v1/events | jq

# Or test specific endpoints
curl http://localhost:3000/api/v1/events/btc-genesis-2009-01-03 | jq
curl http://localhost:3000/api/v1/events/on-this-day | jq
```

## Troubleshooting

### Error: "Missing required environment variables"

**Solution:** Check your `.env.local` file has all three variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (NOT the anon key!)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Error: "relation 'events' does not exist"

**Solution:** You forgot Step 1. Go back and create the table using the SQL schema.

### Error: "syntax error at or near {"

**Solution:** You tried to run the TypeScript file in the SQL Editor. Only run `events_schema.sql` in the SQL Editor. Run `migrate-events-to-supabase.ts` in your terminal.

### Migration succeeds but count is 0

**Solution:** Check your RLS policies:

```sql
-- Temporarily disable RLS to test
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- Check count again
SELECT COUNT(*) FROM events;

-- Re-enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
```

If this fixes it, your service role key might not be set correctly.

## What Files Go Where?

| File | Where to Run | Purpose |
|------|-------------|---------|
| `scripts/supabase/events_schema.sql` | Supabase SQL Editor | Creates table structure |
| `scripts/migrate-events-to-supabase.ts` | Terminal (local) | Populates data |
| `src/data/events.json` | Nowhere (reference) | Original data source |

## After Migration

Once successfully migrated:

1. ✅ Your app will use Supabase instead of events.json
2. ✅ API endpoints at `/api/v1/events/*` will be live
3. ✅ Farcaster bot will fetch from database
4. ✅ You can add/edit events in Supabase dashboard

events.json is kept as a backup/reference but is no longer used by the app.

## Need Help?

Check the full documentation in `MIGRATION_GUIDE.md` for detailed API docs and troubleshooting.
