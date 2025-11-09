/**
 * Supabase Client Configuration
 *
 * This module provides Supabase client instances for both client and server components.
 * Uses environment variables for configuration.
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Read Supabase environment variables with sensible fallbacks.
 * Supports both public (NEXT_PUBLIC_) and server-only naming.
 */
function getSupabaseConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  if (!url || !anonKey) {
    const missing = [];
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)");
    if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)");

    throw new Error(
      `Supabase environment variables are not configured. Missing: ${missing.join(
        ", "
      )}`
    );
  }

  return { url, anonKey };
}

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

/**
 * Creates a Supabase client instance
 * @returns {Object} Supabase client
 */
export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // We're using custom auth with bcrypt
      autoRefreshToken: false,
    },
  });
}

/**
 * Singleton Supabase client instance
 */
export const supabase = createSupabaseClient();
