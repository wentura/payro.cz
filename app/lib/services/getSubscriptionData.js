/**
 * Get Subscription Data
 *
 * Server-side function to fetch subscription data
 * Used by server components instead of API calls
 */

import { supabase } from "@/app/lib/supabase";

export async function getSubscriptionData(userId) {
  try {
    const [planResult, usageResult] = await Promise.all([
      supabase.rpc("get_user_current_plan", { user_uuid: userId }),
      supabase.rpc("get_user_monthly_invoice_count", { user_uuid: userId }),
    ]);

    if (planResult.error) {
      console.error("Error fetching user plan:", planResult.error);
      return null;
    }

    if (usageResult.error) {
      console.error("Error fetching usage:", usageResult.error);
      return null;
    }

    // Default to free plan if no active subscription
    const currentPlan =
      planResult.data && planResult.data.length > 0
        ? planResult.data[0]
        : {
            plan_id: 1, // Free plan ID
            plan_name: "Free",
            invoice_limit_monthly: 4,
            features: {
              max_clients: 10,
              max_invoices_per_month: 4,
              basic_support: true,
            },
          };

    const currentUsage = usageResult.data || 0;
    const canCreateInvoice =
      currentPlan.invoice_limit_monthly === 0 ||
      currentUsage < currentPlan.invoice_limit_monthly;

    return {
      currentPlan,
      currentUsage,
      canCreateInvoice,
      usagePercentage:
        currentPlan.invoice_limit_monthly > 0
          ? Math.round(
              (currentUsage / currentPlan.invoice_limit_monthly) * 100
            )
          : 0,
    };
  } catch (error) {
    console.error("Error in getSubscriptionData:", error);
    return null;
  }
}

