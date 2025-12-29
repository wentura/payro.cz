/**
 * Get Client
 *
 * Server-side function to fetch client data
 */

import { supabase } from "@/app/lib/supabase";

export async function getClient(clientId, userId) {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getClient:", error);
    return null;
  }
}

