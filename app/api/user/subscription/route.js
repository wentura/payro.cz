/**
 * User Subscription API
 *
 * Handles subscription status, limits, and usage information
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current subscription plan
    const { data: planData, error: planError } = await supabase.rpc(
      "get_user_current_plan",
      { user_uuid: user.id }
    );

    if (planError) {
      console.error("Error fetching user plan:", planError);
      return NextResponse.json(
        { error: "Failed to fetch subscription plan" },
        { status: 500 }
      );
    }

    // Get current month invoice count
    const { data: usageData, error: usageError } = await supabase.rpc(
      "get_user_monthly_invoice_count",
      { user_uuid: user.id }
    );

    if (usageError) {
      console.error("Error fetching usage:", usageError);
      return NextResponse.json(
        { error: "Failed to fetch usage data" },
        { status: 500 }
      );
    }

    // Get all available plans for upgrade options
    const { data: allPlans, error: plansError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price_monthly", { ascending: true });

    if (plansError) {
      console.error("Error fetching plans:", plansError);
      return NextResponse.json(
        { error: "Failed to fetch available plans" },
        { status: 500 }
      );
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

    return NextResponse.json({
      success: true,
      data: {
        currentPlan,
        currentUsage,
        canCreateInvoice,
        availablePlans: allPlans,
        usagePercentage:
          currentPlan.invoice_limit_monthly > 0
            ? Math.round(
                (currentUsage / currentPlan.invoice_limit_monthly) * 100
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("Subscription API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
