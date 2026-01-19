# Events Migration to Supabase - Guide

This guide documents the migration of events from `events.json` to Supabase and how to use the new API.

## Overview

The events data has been migrated from a static JSON file (`src/data/events.json`) to a Supabase PostgreSQL database. This provides:

- **Better scalability** - Handle larger datasets without bundle size concerns
- **Real-time updates** - Add/edit events without redeploying
- **API access** - Public API for third-party integrations
- **Advanced queries** - Full-text search, filtering, and complex queries
- **Security** - Row-level security (RLS) policies for data protection

## Migration Steps

### 1. Create the Database Table

Run the SQL migration in your Supabase dashboard:

```bash
# Option 1: Supabase Dashboard
1. Go to your Supabase project → SQL Editor
2. Copy contents of `scripts/supabase/events_schema.sql`
3. Paste and execute

# Option 2: Supabase CLI
supabase db push --file ./scripts/supabase/events_schema.sql

# Option 3: Direct psql
psql <connection-string> -f ./scripts/supabase/events_schema.sql
```

### 2. Migrate the Data

Run the migration script to populate the table from events.json:

```bash
# Make sure you have the required environment variables set
# in your .env.local file:
# - NEXT_PUBLIC_SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY

npx tsx scripts/migrate-events-to-supabase.ts
```

The script will:
- Validate environment configuration
- Check for existing events
- Migrate all 173 events in batches
- Verify the migration succeeded
- Run a sample query to test

### 3. Verify Migration

Check that the events were migrated successfully:

```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM events;
-- Should return 173

-- Test a query
SELECT id, date, title FROM events
WHERE date >= '2024-01-01'
ORDER BY date DESC
LIMIT 10;
```

## Database Schema

### Events Table

```sql
events (
  id TEXT PRIMARY KEY,              -- Event ID (e.g., "btc-genesis-2009-01-03")
  date DATE NOT NULL,               -- Historical event date
  title TEXT NOT NULL,              -- Event title
  summary TEXT NOT NULL,            -- Event summary/description
  category TEXT[] NOT NULL,         -- Categories (Bitcoin, Ethereum, DeFi, etc.)
  tags TEXT[] NOT NULL,             -- Tags (TECH, MILESTONE, HACK, etc.)
  mode TEXT[] NOT NULL,             -- Display modes (timeline, crimeline)
  image TEXT,                       -- Main image URL
  media JSONB,                      -- Array of media objects
  links JSONB,                      -- Array of reference links
  metrics JSONB,                    -- Flexible metrics data
  created_at TIMESTAMPTZ,           -- Record creation timestamp
  updated_at TIMESTAMPTZ            -- Last update timestamp
)
```

### Indexes

The table includes optimized indexes for:
- Date-based queries (most common)
- Month/day lookups ("on this day" feature)
- Category filtering (GIN index)
- Tag filtering (GIN index)
- Full-text search on title and summary
- JSONB metrics queries

### Security (RLS Policies)

- **Public Read**: Anyone can read events (for API access)
- **Service Role Write**: Only service role can insert/update/delete

## API Endpoints

All API endpoints are available at `/api/v1/events/*`:

### GET /api/v1/events

List all events with filtering and pagination.

**Query Parameters:**
- `limit` - Number of results (default: 50, max: 100)
- `offset` - Pagination offset (default: 0)
- `category` - Filter by categories (comma-separated)
- `tags` - Filter by tags (comma-separated)
- `mode` - Filter by mode (comma-separated: "timeline" or "crimeline")
- `orderBy` - Sort field ("date" or "title", default: "date")
- `orderDirection` - Sort direction ("asc" or "desc", default: "desc")

**Example:**
```bash
curl "https://chainofevents.xyz/api/v1/events?limit=10&category=Bitcoin&orderBy=date&orderDirection=desc"
```

**Response:**
```json
{
  "events": [...],
  "pagination": {
    "total": 173,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET /api/v1/events/[id]

Get a specific event by ID.

**Example:**
```bash
curl "https://chainofevents.xyz/api/v1/events/btc-genesis-2009-01-03"
```

**Response:**
```json
{
  "id": "btc-genesis-2009-01-03",
  "date": "2009-01-03",
  "title": "Bitcoin Genesis Block",
  ...
}
```

### GET /api/v1/events/on-this-day

Get events that occurred on this day in history (any year).

**Query Parameters:**
- `date` - ISO date string (default: today)
- `limit` - Number of results (default: 5, max: 20)
- `mode` - Filter by mode (comma-separated)

**Example:**
```bash
curl "https://chainofevents.xyz/api/v1/events/on-this-day?date=2025-01-03"
```

**Response:**
```json
{
  "date": "2025-01-03",
  "events": [...]
}
```

### GET /api/v1/events/search

Search events by title or summary.

**Query Parameters:**
- `q` - Search query (required)
- `limit` - Number of results (default: 20, max: 100)
- `offset` - Pagination offset (default: 0)
- `mode` - Filter by mode (comma-separated)

**Example:**
```bash
curl "https://chainofevents.xyz/api/v1/events/search?q=Bitcoin&limit=10"
```

**Response:**
```json
{
  "query": "Bitcoin",
  "events": [...],
  "pagination": {
    "total": 42,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET /api/v1/events/categories

Get all distinct categories.

**Example:**
```bash
curl "https://chainofevents.xyz/api/v1/events/categories"
```

**Response:**
```json
{
  "categories": ["Bitcoin", "Ethereum", "DeFi", ...]
}
```

### GET /api/v1/events/tags

Get all distinct tags.

**Example:**
```bash
curl "https://chainofevents.xyz/api/v1/events/tags"
```

**Response:**
```json
{
  "tags": ["TECH", "MILESTONE", "HACK", ...]
}
```

## Caching

All API endpoints include appropriate caching headers:

- **Events list**: 1 hour cache (`s-maxage=3600`)
- **Single event**: 1 day cache (`s-maxage=86400`)
- **On this day**: 1 hour cache (`s-maxage=3600`)
- **Search**: 30 minutes cache (`s-maxage=1800`)
- **Categories/Tags**: 1 day cache (`s-maxage=86400`)

All endpoints use `stale-while-revalidate` for better performance.

## Application Code Updates

The following files were updated to use Supabase instead of events.json:

1. **`src/lib/farcaster/get-todays-events.ts`** - Now async, fetches from database
2. **`src/app/api/cron/farcaster-bot/route.ts`** - Updated to await event fetching
3. **`src/app/page.tsx`** - Fetches events from database on server-side
4. **`src/app/fc/[id]/page.tsx`** - Uses database for metadata generation
5. **`src/app/test-preview/page.tsx`** - Converted to server component, fetches from database

## Database Functions

New utility functions in `src/lib/events-db.ts`:

- `getAllEvents(options?)` - Get all events with filtering
- `getEventById(id)` - Get a single event
- `getEventsOnThisDay(date, options?)` - Get events on a specific day
- `getEventForSlot(date, slotIndex)` - Get event for Farcaster bot slot
- `searchEvents(query, options?)` - Full-text search
- `getEventsByDateRange(start, end, options?)` - Date range queries
- `getCategories()` - Get all unique categories
- `getTags()` - Get all unique tags

## Events.json Status

The `src/data/events.json` file is **kept as a static fallback** for:
- Build-time static exports (if needed)
- Backup/reference purposes
- Local development without Supabase

To update events going forward, you can either:
1. **Recommended**: Update directly in Supabase dashboard
2. **Alternative**: Update events.json and re-run migration script

## Rate Limiting (Future)

For production API use, consider adding rate limiting:

```typescript
// Example using Vercel's rate limiting
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 h"),
});
```

## Monitoring

Monitor your Supabase usage:
- Database size and growth
- API request patterns
- Most popular queries
- Cache hit rates

## Troubleshooting

### Migration script fails

```
Error: Missing required environment variables
```

**Solution**: Make sure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### API returns 500 error

Check Supabase connection:
```bash
# Test connection
curl "https://your-project.supabase.co/rest/v1/events?limit=1" \
  -H "apikey: your-anon-key"
```

### Events not showing up

Verify RLS policies are set correctly:
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'events';

-- Test read access
SELECT COUNT(*) FROM events;
```

## Next Steps

1. ✅ Run database migration
2. ✅ Run data migration script
3. ✅ Test API endpoints
4. ✅ Deploy to production
5. 🔲 Set up monitoring
6. 🔲 Add rate limiting (if public API)
7. 🔲 Document for third-party developers

## Support

For issues or questions:
- Check Supabase logs in the dashboard
- Review API endpoint documentation above
- Check database RLS policies
- Verify environment variables are set correctly
