-- Optimized Category and Tag Queries for Chain of Events
--
-- These functions efficiently retrieve distinct categories and tags
-- without fetching all event rows.

-- Function to get distinct categories
CREATE OR REPLACE FUNCTION get_distinct_categories()
RETURNS TABLE(category TEXT)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT unnest(events.category) AS category
  FROM events
  ORDER BY category;
$$;

-- Function to get distinct tags
CREATE OR REPLACE FUNCTION get_distinct_tags()
RETURNS TABLE(tag TEXT)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT unnest(events.tags) AS tag
  FROM events
  ORDER BY tag;
$$;

-- Function to get category counts (optional, for analytics)
CREATE OR REPLACE FUNCTION get_category_counts()
RETURNS TABLE(category TEXT, count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT cat AS category, COUNT(*) as count
  FROM events, unnest(events.category) AS cat
  GROUP BY cat
  ORDER BY count DESC;
$$;

-- Function to get tag counts (optional, for analytics)
CREATE OR REPLACE FUNCTION get_tag_counts()
RETURNS TABLE(tag TEXT, count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT t AS tag, COUNT(*) as count
  FROM events, unnest(events.tags) AS t
  GROUP BY t
  ORDER BY count DESC;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_distinct_categories() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_distinct_tags() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_category_counts() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_tag_counts() TO authenticated, anon, service_role;
