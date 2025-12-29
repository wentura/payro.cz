/**
 * Get Subscription Plans
 *
 * Server-side function to fetch subscription plans
 */

import { supabase } from "@/app/lib/supabase";

export async function getPlans() {
  try {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price_monthly", { ascending: true });

    if (error) {
      console.error("Error fetching subscription plans:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getPlans:", error);
    return [];
  }
}

