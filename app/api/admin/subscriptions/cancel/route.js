/**
 * Admin Subscription Cancellation API
 *
 * Handles subscription cancellation and fallback to Free plan
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "svoboda.zbynek@gmail.com";

/**
 * POST /api/admin/subscriptions/cancel
 * Cancel user subscription and fallback to Free plan
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    console.log("Admin subscription cancellation request:", { userId });

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    // Get the Free plan (ID = 1)
    const { data: freePlan, error: freePlanError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("name", "Free")
      .eq("is_active", true)
      .single();

    if (freePlanError || !freePlan) {
      console.error("Error fetching Free plan:", freePlanError);
      return NextResponse.json(
        { success: false, error: "Free plan not found" },
        { status: 500 }
      );
    }

    // Get current active subscription
    const { data: currentSubscription, error: currentError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (currentError && currentError.code !== "PGRST116") {
      console.error("Error fetching current subscription:", currentError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch current subscription" },
        { status: 500 }
      );
    }

    if (!currentSubscription) {
      return NextResponse.json(
        { success: false, error: "No active subscription found" },
        { status: 400 }
      );
    }

    // If user is already on Free plan, just cancel it
    if (currentSubscription.plan_id === freePlan.id) {
      const { data: canceledSubscription, error: cancelError } = await supabase
        .from("user_subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSubscription.id)
        .select()
        .single();

      if (cancelError) {
        console.error("Error canceling Free subscription:", cancelError);
        return NextResponse.json(
          { success: false, error: "Failed to cancel subscription" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          action: "canceled_free",
          subscription: canceledSubscription,
        },
      });
    }

    // For paid plans, cancel current subscription and create new Free subscription
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1); // Free plan is monthly

    // Start transaction-like operations
    try {
      // 1. Cancel current subscription
      const { data: canceledSubscription, error: cancelError } = await supabase
        .from("user_subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSubscription.id)
        .select()
        .single();

      if (cancelError) {
        console.error("Error canceling current subscription:", cancelError);
        return NextResponse.json(
          { success: false, error: "Failed to cancel current subscription" },
          { status: 500 }
        );
      }

      // 2. Create new Free subscription
      const { data: newFreeSubscription, error: createError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          plan_id: freePlan.id,
          billing_cycle: "monthly",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          status: "active",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating Free subscription:", createError);
        // Try to revert the cancellation
        await supabase
          .from("user_subscriptions")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentSubscription.id);

        return NextResponse.json(
          { success: false, error: "Failed to create Free subscription" },
          { status: 500 }
        );
      }

      console.log("Successfully canceled subscription and created Free plan:", {
        canceledId: canceledSubscription.id,
        newFreeId: newFreeSubscription.id,
      });

      return NextResponse.json({
        success: true,
        data: {
          action: "canceled_and_fallback",
          canceledSubscription,
          newFreeSubscription,
        },
      });
    } catch (transactionError) {
      console.error("Transaction error during cancellation:", transactionError);
      return NextResponse.json(
        { success: false, error: "Transaction failed during cancellation" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Admin subscription cancellation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
