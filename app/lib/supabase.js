/**
 * Supabase Client Configuration
 *
 * This module provides Supabase client instances for both client and server components.
 * Uses environment variables for configuration.
 */

import { createClient } from "@supabase/supabase-js";

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️  Supabase environment variables are not configured");
}

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
