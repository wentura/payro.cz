/**
 * Get User Profile
 *
 * Server-side function to fetch user profile data
 */

import { supabase } from "@/app/lib/supabase";
import { USER_PUBLIC_COLUMNS, sanitizeUser } from "@/app/lib/user-public";

export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(USER_PUBLIC_COLUMNS)
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return sanitizeUser(data);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}
