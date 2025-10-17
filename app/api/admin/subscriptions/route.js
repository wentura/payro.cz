/**
 * Admin Subscription Management API
 *
 * Handles subscription management for admin users
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "svoboda.zbynek@gmail.com";

/**
 * GET /api/admin/subscriptions
 * Get all subscriptions with user details
 */
export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all subscriptions with user and plan details
    const { data: subscriptions, error } = await supabase
      .from("user_subscriptions")
      .select(
        `
        id,
        user_id,
        plan_id,
        status,
        billing_cycle,
        current_period_start,
        current_period_end,
        created_at,
        updated_at,
        users!inner(
          id,
          name,
          contact_email,
          company_id
        ),
        subscription_plans!inner(
          id,
          name,
          price_monthly,
          price_yearly,
          invoice_limit_monthly,
          features
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch subscriptions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Admin subscriptions API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/subscriptions
 * Create or update user subscription
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.contact_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, planId, billingCycle, status = "active" } = body;

    console.log("Admin subscription update request:", {
      userId,
      planId,
      billingCycle,
      status,
    });

    if (!userId || planId === null || planId === undefined || !billingCycle) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: userId, planId, and billingCycle are required",
        },
        { status: 400 }
      );
    }

    // Check if this is a downgrade and if user can be downgraded
    const { data: currentSubscription } = await supabase
      .from("user_subscriptions")
      .select("plan_id, subscription_plans!inner(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (currentSubscription) {
      const currentPlanPrice =
        currentSubscription.subscription_plans.price_monthly;

      // Get target plan price
      const { data: targetPlan } = await supabase
        .from("subscription_plans")
        .select("price_monthly, invoice_limit_monthly, name")
        .eq("id", planId)
        .single();

      if (targetPlan && targetPlan.price_monthly < currentPlanPrice) {
        // This is a downgrade - check if user has exceeded target plan limits

        // Get current month's invoice usage
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const { data: usageData } = await supabase
          .from("invoice_usage")
          .select("invoices_created")
          .eq("user_id", userId)
          .eq("year", currentYear)
          .eq("month", currentMonth)
          .single();

        const currentUsage = usageData?.invoices_created || 0;

        // Check if target plan has limits and if user exceeds them
        if (
          targetPlan.invoice_limit_monthly > 0 &&
          currentUsage > targetPlan.invoice_limit_monthly
        ) {
          return NextResponse.json(
            {
              success: false,
              error: `Nelze převést na plán ${targetPlan.name}. Uživatel vytvořil ${currentUsage} faktur tento měsíc, ale plán ${targetPlan.name} umožňuje pouze ${targetPlan.invoice_limit_monthly} faktur měsíčně.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Calculate period dates
    const now = new Date();
    const periodStart = new Date(now);
    const periodEnd = new Date(now);

    if (billingCycle === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if (billingCycle === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Check if user already has any subscription (get the most recent one)
    const { data: existingSubscriptions } = await supabase
      .from("user_subscriptions")
      .select("id, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const existingSubscription = existingSubscriptions?.[0];

    console.log("Found existing subscriptions:", existingSubscriptions);
    console.log("Will update subscription:", existingSubscription);

    let result;

    if (existingSubscription) {
      // Update existing subscription
      const { data, error } = await supabase
        .from("user_subscriptions")
        .update({
          plan_id: planId,
          billing_cycle: billingCycle,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSubscription.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating subscription:", error);
        return NextResponse.json(
          { success: false, error: "Failed to update subscription" },
          { status: 500 }
        );
      }

      result = data;

      // Log status change to history (if status changed)
      if (existingSubscription.status !== status) {
        const { error: historyError } = await supabase
          .from("subscription_status_history")
          .insert({
            subscription_id: existingSubscription.id,
            old_status: existingSubscription.status,
            new_status: status,
            reason: "Admin manual update",
            created_by: user.id,
          });

        if (historyError) {
          console.error("Error logging status change:", historyError);
          // Don't fail the main operation if history logging fails
        }
      }
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          plan_id: planId,
          billing_cycle: billingCycle,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          status: status,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating subscription:", error);
        return NextResponse.json(
          { success: false, error: "Failed to create subscription" },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Admin subscription POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
