/**
 * Admin Subscription Cancellation API
 *
 * Handles subscription cancellation and fallback to Free plan
 */

import { getCurrentUser, isAdminUser } from "@/app/lib/auth";
import { sendSubscriptionCanceledEmail } from "@/app/lib/email";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

/**
 * POST /api/admin/subscriptions/cancel
 * Cancel user subscription and fallback to Free plan
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

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

    const { data: currentSubscription, error: currentError } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        subscription_plans!left(id, name)
      `
      )
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

    const previousPlanName =
      currentSubscription.subscription_plans?.name || null;

    const { data: targetUser } = await supabase
      .from("users")
      .select("id, name, contact_email")
      .eq("id", userId)
      .single();

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

      if (targetUser?.contact_email) {
        await sendSubscriptionCanceledEmail(targetUser, {
          previousPlanName: "Free",
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          action: "canceled_free",
          subscription: canceledSubscription,
        },
      });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    try {
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

      if (targetUser?.contact_email) {
        await sendSubscriptionCanceledEmail(targetUser, {
          previousPlanName,
        });
      }

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
