/**
 * Get Subscription Plans
 *
 * Server-side function to fetch subscription plans
 */

import { unstable_cache } from "next/cache";
import { supabase } from "@/app/lib/supabase";

async function _getPlansUncached() {
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

export const getPlans = unstable_cache(_getPlansUncached, ["plans"], {
  revalidate: 3600,
  tags: ["subscription-plans"],
});



