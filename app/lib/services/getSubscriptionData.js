/**
 * Get Subscription Data
 *
 * Server-side function to fetch subscription data
 * Used by server components instead of API calls
 */

import { supabase } from "@/app/lib/supabase";

export async function getSubscriptionData(userId) {
  try {
    // Get current subscription plan
    const { data: planData, error: planError } = await supabase.rpc(
      "get_user_current_plan",
      { user_uuid: userId }
    );

    if (planError) {
      console.error("Error fetching user plan:", planError);
      return null;
    }

    // Get current month invoice count
    const { data: usageData, error: usageError } = await supabase.rpc(
      "get_user_monthly_invoice_count",
      { user_uuid: userId }
    );

    if (usageError) {
      console.error("Error fetching usage:", usageError);
      return null;
    }

    // Default to free plan if no active subscription
    const currentPlan =
      planData && planData.length > 0
        ? planData[0]
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

    const currentUsage = usageData || 0;
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

