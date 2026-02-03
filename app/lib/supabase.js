/**
 * Supabase Client Configuration
 *
 * This module provides Supabase client instances for both client and server components.
 * Uses environment variables for configuration.
 */

import "server-only";
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

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    "";

  if (!url || (!anonKey && !serviceRoleKey)) {
    const missing = [];
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)");
    if (!anonKey && !serviceRoleKey) {
      missing.push(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY) or SUPABASE_SERVICE_ROLE_KEY"
      );
    }

    throw new Error(
      `Supabase environment variables are not configured. Missing: ${missing.join(
        ", "
      )}`
    );
  }

  return { url, anonKey, serviceRoleKey };
}

const { url: supabaseUrl, anonKey: supabaseAnonKey, serviceRoleKey } =
  getSupabaseConfig();

/**
 * Creates a Supabase client instance
 * @returns {Object} Supabase client
 */
export function createSupabaseClient() {
  const apiKey = serviceRoleKey || supabaseAnonKey;
  return createClient(supabaseUrl, apiKey, {
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
