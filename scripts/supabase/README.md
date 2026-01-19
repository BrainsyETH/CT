# Supabase Database Setup

This directory contains SQL migrations for the Chain of Events Supabase database.

## Tables

### 1. Events Table

The main events table stores the complete history of cryptocurrency events (previously in events.json).

**Migration file**: `events_schema.sql`

**Features**:
- Complete event data with JSONB fields for flexible schema
- Optimized indexes for date queries, category/tag filtering, and full-text search
- Row-level security (RLS) for public read, service role write
- Automatic timestamp updates
- Helper views for timeline/crimeline filtering

**To set up**:

```bash
# Option 1: Supabase Dashboard
1. Go to SQL Editor in your Supabase project
2. Copy contents of events_schema.sql
3. Paste and execute

# Option 2: Supabase CLI
supabase db push --file ./scripts/supabase/events_schema.sql

# Option 3: Direct psql
psql <connection-string> -f ./scripts/supabase/events_schema.sql
```

**After creating the table**, run the migration script:

```bash
npx tsx scripts/migrate-events-to-supabase.ts
```

See `MIGRATION_GUIDE.md` in the root directory for complete documentation.

---

### 2. Farcaster Bot Posts Table

To set up the database table for the Farcaster bot, run the SQL migration:

### Option 1: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `farcaster_bot_schema.sql`
4. Paste and run the SQL

### Option 2: Supabase CLI

```bash
supabase db push --file ./scripts/supabase/farcaster_bot_schema.sql
```

### Option 3: Direct Connection

```bash
psql <your-connection-string> -f ./scripts/supabase/farcaster_bot_schema.sql
```

**Migration file**: `farcaster_bot_schema.sql`

**Features**:
- Tracks all posts made by the bot
- Prevents duplicate posts via unique constraint on (post_date, slot_index)
- Stores cast hash and URL for reference
- Public read access, service role write access

---

## Verification

After running the migration, verify the table exists:

```sql
SELECT * FROM farcaster_bot_posts LIMIT 5;
```

The table should be empty initially.
