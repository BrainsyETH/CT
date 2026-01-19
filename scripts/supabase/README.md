# Supabase Database Setup

## Farcaster Bot Table

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

## Table Schema

**`farcaster_bot_posts`**

- Tracks all posts made by the bot
- Prevents duplicate posts via unique constraint on (post_date, slot_index)
- Stores cast hash and URL for reference
- Public read access, service role write access

## Verification

After running the migration, verify the table exists:

```sql
SELECT * FROM farcaster_bot_posts LIMIT 5;
```

The table should be empty initially.
