/**
 * Subscription Upgrade API
 *
 * Handles subscription plan upgrades with payment processing
 */

import { getCurrentUser } from "@/app/lib/auth";
import {
  getCurrentSubscription,
  handleFreeUpgrade,
  handlePaidUpgrade,
} from "@/app/lib/services/SubscriptionService";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

/**
 * POST /api/subscription/upgrade
 * Upgrade user subscription plan
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId, billingCycle } = body;

    if (!planId || !billingCycle) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the target plan
    const { data: targetPlan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (planError || !targetPlan) {
      return NextResponse.json(
        { success: false, error: "Invalid subscription plan" },
        { status: 400 }
      );
    }

    // Get current user subscription
    const currentSubscription = await getCurrentSubscription(user.id);

    // Check if user is already on this plan
    if (
      currentSubscription &&
      currentSubscription.plan_id === parseInt(planId) &&
      currentSubscription.billing_cycle === billingCycle
    ) {
      return NextResponse.json(
        { success: false, error: "Již máte aktivní předplatné tohoto plánu" },
        { status: 400 }
      );
    }

    // Calculate price
    const price =
      billingCycle === "yearly"
        ? targetPlan.price_yearly
        : targetPlan.price_monthly;
    const isFreeUpgrade = price === 0;

    if (isFreeUpgrade) {
      // Handle free upgrade (e.g., Free to another free plan)
      const result = await handleFreeUpgrade(
        user.id,
        planId,
        billingCycle,
        currentSubscription
      );

      if (result.success) {
        return NextResponse.json({
          success: true,
          ...result.data,
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: result.status || 500 }
        );
      }
    } else {
      // Handle paid upgrade - create payment session
      const result = await handlePaidUpgrade(
        user.id,
        planId,
        billingCycle,
        price,
        targetPlan,
        currentSubscription
      );

      if (result.success) {
        return NextResponse.json({
          success: true,
          ...result.data,
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: result.status || 500 }
        );
      }
    }
  } catch (error) {
    console.error("Subscription upgrade error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
