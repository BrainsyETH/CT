import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Validates that required environment variables are present.
 * Throws a descriptive error if any are missing.
 */
function validateEnvironment(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missingVars: string[] = [];

  if (!url) {
    missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!anonKey) {
    missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (missingVars.length > 0) {
    const errorMessage = `Missing required Supabase environment variables: ${missingVars.join(", ")}. ` +
      "Please check your .env.local file or deployment environment settings.";

    // Log error for debugging
    console.error(`[Supabase Config Error] ${errorMessage}`);

    // In development, throw to catch issues early
    // In production, we'll create a dummy client that will fail gracefully
    if (process.env.NODE_ENV === "development") {
      throw new Error(errorMessage);
    }
  }

  return {
    url: url || "",
    anonKey: anonKey || "",
  };
}

/**
 * Creates a Supabase client with validated environment variables.
 * Returns null if environment variables are missing in production.
 */
function createSupabaseClient(): SupabaseClient | null {
  try {
    const { url, anonKey } = validateEnvironment();

    if (!url || !anonKey) {
      return null;
    }

    return createClient(url, anonKey);
  } catch (error) {
    console.error("[Supabase] Failed to create client:", error);
    return null;
  }
}

// Create the singleton client
const supabaseClient = createSupabaseClient();

/**
 * Gets the Supabase client.
 * Throws an error if the client is not available.
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error(
      "Supabase client is not available. Please check your environment configuration."
    );
  }
  return supabaseClient;
}

/**
 * Checks if Supabase is properly configured.
 */
export function isSupabaseConfigured(): boolean {
  return supabaseClient !== null;
}

// Export the client for backwards compatibility
// Note: This may be null if environment variables are missing
export const supabase = supabaseClient;
