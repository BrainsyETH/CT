/**
 * Migration Script: events.json → Supabase
 *
 * This script migrates all events from the JSON file to Supabase.
 * Run this once after creating the events table in Supabase.
 *
 * Usage:
 *   npx tsx scripts/migrate-events-to-supabase.ts
 *
 * Environment variables required:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (not the anon key!)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import eventsData from "../src/data/events.json";
import type { Event } from "../src/lib/types";

// Load environment variables from .env.local
function loadEnvFile(filename: string): Record<string, string> {
  const envPath = resolve(process.cwd(), filename);

  if (!existsSync(envPath)) {
    return {};
  }

  try {
    const envContent = readFileSync(envPath, "utf-8");
    const env: Record<string, string> = {};

    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith("#")) return;

      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        let value = valueParts.join("=").trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[key.trim()] = value;
      }
    });

    return env;
  } catch (error) {
    console.warn(`Warning: Could not read ${filename}:`, error);
    return {};
  }
}

// Load environment variables from .env.local, .env files
const envLocal = loadEnvFile(".env.local");
const envDefault = loadEnvFile(".env");

// Merge with priority: .env.local > .env > process.env
const envVars = { ...process.env, ...envDefault, ...envLocal };

// Validate environment
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  if (!supabaseUrl) console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseServiceKey) console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  console.error("\nPlease check your .env.local or .env file.");
  console.error("\nLooked for environment files in:");
  console.error(`   - ${resolve(process.cwd(), ".env.local")} ${existsSync(resolve(process.cwd(), ".env.local")) ? "✓" : "✗"}`);
  console.error(`   - ${resolve(process.cwd(), ".env")} ${existsSync(resolve(process.cwd(), ".env")) ? "✓" : "✗"}`);
  console.error("\nMake sure your .env.local contains:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co");
  console.error("   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DatabaseEvent {
  id: string;
  date: string;
  title: string;
  summary: string;
  category: string[];
  tags: string[];
  mode: string[];
  image: string | null;
  media: any;
  links: any;
  metrics: any;
}

/**
 * Transform event from JSON format to database format
 * Ensures all array fields are properly formatted
 */
function transformEvent(event: Event): DatabaseEvent {
  // Helper to ensure value is an array
  const ensureArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    // If it's a string, wrap it in an array
    if (typeof value === "string") return [value];
    return [];
  };

  return {
    id: event.id,
    date: event.date,
    title: event.title,
    summary: event.summary,
    category: ensureArray((event as any).category),
    tags: ensureArray((event as any).tags),
    mode: ensureArray((event as any).mode),
    image: event.image || null,
    media: event.media || [],
    links: event.links || [],
    metrics: event.metrics || {},
  };
}

/**
 * Main migration function
 */
async function migrateEvents() {
  console.log("🚀 Starting events migration to Supabase...\n");

  const events = eventsData as Event[];
  console.log(`📊 Total events to migrate: ${events.length}\n`);

  // Check if table is empty
  const { count: existingCount, error: countError } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("❌ Error checking existing events:", countError);
    console.error("\nMake sure you've run the events_schema.sql migration first:");
    console.error("   1. Go to Supabase Dashboard → SQL Editor");
    console.error("   2. Copy contents of scripts/supabase/events_schema.sql");
    console.error("   3. Execute the SQL");
    process.exit(1);
  }

  if (existingCount && existingCount > 0) {
    console.log(`⚠️  Warning: Found ${existingCount} existing events in database.`);
    console.log("This script will attempt to upsert (update existing, insert new).\n");
  }

  // Transform events for database
  const dbEvents = events.map(transformEvent);

  // Check for duplicate IDs and warn
  const idCounts = new Map<string, number>();
  dbEvents.forEach((event) => {
    idCounts.set(event.id, (idCounts.get(event.id) || 0) + 1);
  });

  const duplicates = Array.from(idCounts.entries()).filter(([_, count]) => count > 1);
  if (duplicates.length > 0) {
    console.log("⚠️  Warning: Found duplicate event IDs in events.json:");
    duplicates.forEach(([id, count]) => {
      console.log(`   - ${id} (appears ${count} times)`);
    });
    console.log("Only the last occurrence of each ID will be kept.\n");
  }

  // Deduplicate by ID (keep last occurrence)
  const uniqueEvents = Array.from(
    dbEvents.reduce((map, event) => {
      map.set(event.id, event);
      return map;
    }, new Map<string, DatabaseEvent>()).values()
  );

  // Batch insert with upsert (update on conflict)
  const BATCH_SIZE = 50;
  let successCount = 0;
  let errorCount = 0;

  console.log("📝 Migrating events in batches...\n");

  for (let i = 0; i < uniqueEvents.length; i += BATCH_SIZE) {
    const batch = uniqueEvents.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(uniqueEvents.length / BATCH_SIZE);

    process.stdout.write(
      `   Batch ${batchNumber}/${totalBatches} (${batch.length} events)... `
    );

    const { data, error } = await supabase
      .from("events")
      .upsert(batch, {
        onConflict: "id",
        ignoreDuplicates: false, // Update if exists
      })
      .select();

    if (error) {
      console.log("❌ Error");
      console.error(`   Details: ${error.message}`);
      errorCount += batch.length;
    } else {
      console.log(`✅ Success (${data?.length || batch.length} events)`);
      successCount += batch.length;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Migration Summary:");
  console.log("=".repeat(60));
  console.log(`✅ Successful: ${successCount} events`);
  console.log(`❌ Failed:     ${errorCount} events`);
  console.log(`📝 Total:      ${events.length} events`);
  console.log("=".repeat(60) + "\n");

  if (errorCount === 0) {
    console.log("🎉 Migration completed successfully!\n");

    // Verify final count
    const { count: finalCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });

    console.log(`✅ Verified: ${finalCount} events in database\n`);

    // Sample query: Get recent events
    const { data: recentEvents, error: queryError } = await supabase
      .from("events")
      .select("id, date, title")
      .order("date", { ascending: false })
      .limit(5);

    if (!queryError && recentEvents && recentEvents.length > 0) {
      console.log("📅 Sample query - Most recent events:");
      recentEvents.forEach((evt) => {
        console.log(`   • ${evt.date}: ${evt.title}`);
      });
      console.log("");
    }
  } else {
    console.log("⚠️  Migration completed with errors. Please review the output above.\n");
    process.exit(1);
  }
}

// Run migration
migrateEvents().catch((error) => {
  console.error("❌ Migration failed with error:", error);
  process.exit(1);
});
